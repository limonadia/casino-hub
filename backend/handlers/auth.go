package handlers

import (
	"casino-hub/backend/database"
	"casino-hub/backend/models"
	"context"
	"encoding/json"
	"log"
	"net/http"
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
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Debug logs for password
	log.Println("Login attempt for:", creds.Email)
	log.Println("Password from frontend:", creds.Password)
	log.Println("Hashed password from DB:", user.Password)

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
		tokenStr := r.Header.Get("Authorization")
		if tokenStr == "" {
			http.Error(w, "Missing token", http.StatusUnauthorized)
			return
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), userIDKey, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func GetUserID(ctx context.Context) (int, bool) {
	id, ok := ctx.Value(userIDKey).(int)
	return id, ok
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
