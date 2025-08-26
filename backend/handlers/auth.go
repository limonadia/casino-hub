package handlers

import (
	"casino-hub/backend/database"
	"casino-hub/backend/models"
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte("password") //replace with env variable in production

type Claims struct {
	UserID int `json:"userId"`
	jwt.RegisteredClaims
}

// Signup godoc
// @Summary Register a new user
// @Description Creates a new user account with username, email, and password. Initial balance is 5000.
// @Tags auth
// @Accept json
// @Produce json
// @Param user body models.User true "User signup details"
// @Success 200 {object} models.User
// @Failure 400 {string} string "Invalid request"
// @Failure 500 {string} string "Database error"
// @Router /api/auth/signup [post]
func Signup(w http.ResponseWriter, r *http.Request) {
    var user models.User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }

    // Validate required fields
    if user.Username == "" || user.Email == "" || user.Password == "" {
        http.Error(w, "Username, email, and password are required", http.StatusBadRequest)
        return
    }

    // Check duplicates
    var exists int
    err := database.DB.QueryRow("SELECT COUNT(*) FROM users WHERE username=? OR email=?", user.Username, user.Email).Scan(&exists)
    if err != nil {
        http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
        return
    }
    if exists > 0 {
        http.Error(w, "Username or email already exists", http.StatusBadRequest)
        return
    }

    // Hash password
    hashed, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
    if err != nil {
        http.Error(w, "Error hashing password", http.StatusInternalServerError)
        return
    }

    // Insert user
    res, err := database.DB.Exec(
        "INSERT INTO users (username, email, password, balance, score, level, experience, freeSpins) VALUES (?, ?, ?, 5000, 0, 1, 0, 0)",
        user.Username, user.Email, string(hashed),
    )
    if err != nil {
        http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
        return
    }

    id, _ := res.LastInsertId()
    user.ID = int(id)
    user.Password = "" // never return password

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}




// Login godoc
// @Summary Authenticate user
// @Description Logs in a user with email and password, returns a JWT token.
// @Tags auth
// @Accept json
// @Produce json
// @Param credentials body object true "Login credentials"
// @Success 200 {object} map[string]string "token"
// @Failure 400 {string} string "Invalid request"
// @Failure 401 {string} string "Invalid credentials"
// @Failure 500 {string} string "Could not create token"
// @Router /api/auth/login [post]
func Login(w http.ResponseWriter, r *http.Request) {
	var creds struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var user models.User
	row := database.DB.QueryRow("SELECT id, password FROM users WHERE email = ?", creds.Email)
	if err := row.Scan(&user.ID, &user.Password); err != nil {
		log.Println("Login failed: user not found for email:", creds.Email)
		http.Error(w, "Email does not exist", http.StatusNotFound)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(creds.Password)); err != nil {
		log.Println("Password comparison failed:", err)
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	expiration := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID: user.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiration),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		http.Error(w, "Could not create token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"token": tokenString,
	})
}

type contextKey string

const userIDKey contextKey = "userID"

func AuthMiddleWare(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing token", http.StatusUnauthorized)
			return
		}
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Invalid token format", http.StatusUnauthorized)
			return
		}
		tokenStr := parts[1]

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Save userID in request context
		ctx := context.WithValue(r.Context(), userIDKey, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func GetUserID(ctx context.Context) (int, bool) {
	id, ok := ctx.Value(userIDKey).(int)
	return id, ok
}

// GetProfile godoc
// @Summary Get current user profile
// @Description Returns the logged-in user's profile info
// @Tags users
// @Produce json
// @Success 200 {object} models.User
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Database error"
// @Router /api/users/profile [get]
func GetProfile(w http.ResponseWriter, r *http.Request) {
	// Extract the UserID from the request context provided by AuthMiddleWare
	userID, ok := GetUserID(r.Context())
	if !ok {
		// This should not happen if AuthMiddleWare is used, but it's a good practice to handle it.
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var user models.User
	// Use nullable types for database fields that can be NULL
	var name sql.NullString
	var lastActive, createdAt, lastFreeCoins sql.NullTime

	// Query all the necessary fields from the database
	err := database.DB.QueryRow(`
		SELECT id, username, email, name, balance, score, level, experience, freeSpins, lastActive, created_at, last_free_coins
		FROM users WHERE id = ?`, userID).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Name,
		&user.Balance,
		&user.Score,
		&user.Level,
		&user.Experience,
		&user.FreeSpins,
		&lastActive,
		&createdAt,
		&lastFreeCoins,
	)

	if lastActive.Valid {
		user.LastActive = lastActive.Time
	}
	if createdAt.Valid {
		user.CreatedAt = createdAt.Time
	}
	if lastFreeCoins.Valid {
		user.LastFreeCoins = lastFreeCoins.Time
	}
	
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			log.Println("Database error:", err)
			http.Error(w, "Database error", http.StatusInternalServerError)
		}
		return
	}

	// Check if the nullable fields are valid and set them
	if name.Valid {
		user.Name = name.String
	}
	if lastActive.Valid {
		user.LastActive = lastActive.Time
	}
	if lastFreeCoins.Valid {
		user.LastFreeCoins = lastFreeCoins.Time
	}

	// Do not return the password, even if the model has the field
	user.Password = ""

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// Logout godoc
// @Summary Logout user
// @Description Logs out a user (client should just discard the token).
// @Tags auth
// @Produce json
// @Success 200 {object} map[string]string "message"
// @Router /api/auth/logout [post]
func Logout(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
}
