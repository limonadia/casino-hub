package handlers

import (
	"casino-hub/backend/database"
	"casino-hub/backend/models"
	"context"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"net/smtp"
	"os"
	"runtime/debug"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte("password") 

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

	if user.Username == "" || user.Email == "" || user.Password == "" {
		http.Error(w, "Username, email, and password are required", http.StatusBadRequest)
		return
	}

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

	hashed, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

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
	user.Password = "" 

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
	userID, ok := GetUserID(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var user models.User
	var name sql.NullString
	var lastActive, createdAt, lastFreeCoins sql.NullTime
	
	var lastCashClaim, lastWheelSpin time.Time
	var freeGamesSQL sql.NullString

	err := database.DB.QueryRow(`
		SELECT 
			id, username, email, name, balance, score, level, experience, freeSpins, 
			lastActive, created_at, last_free_coins, last_cash_claim, last_wheel_spin, free_games
		FROM users WHERE id = ?`, userID).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&name,
		&user.Balance,
		&user.Score,
		&user.Level,
		&user.Experience,
		&user.FreeSpins,
		&lastActive,
		&createdAt,
		&lastFreeCoins,
		&lastCashClaim,
		&lastWheelSpin,
		&freeGamesSQL,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			log.Println("Database error:", err)
			http.Error(w, "Database error", http.StatusInternalServerError)
		}
		return
	}

	if name.Valid {
		user.Name = name.String
	}
	if lastActive.Valid {
		user.LastActive = lastActive.Time
	}
	if createdAt.Valid {
		user.CreatedAt = createdAt.Time
	}
	if lastFreeCoins.Valid {
		user.LastFreeCoins = lastFreeCoins.Time
	}

	user.LastCashClaim = lastCashClaim
	user.LastWheelSpin = lastWheelSpin


	rows, err := database.DB.Query(
		`SELECT game_name FROM user_favourites WHERE user_id = ?`,
		userID,
	)
	if err != nil {
		log.Println("Error querying favourites:", err)
		user.Favourites = []string{}
	} else {
		defer rows.Close()

		var favourites []string
		for rows.Next() {
			var gameName string
			if err := rows.Scan(&gameName); err == nil {
				favourites = append(favourites, gameName)
			}
		}

		if favourites == nil {
			favourites = []string{}
		}
		user.Favourites = favourites
	}

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

func RecoverMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("Recovered from panic: %v\n%s", err, debug.Stack())
				http.Error(w, "Internal server error", http.StatusInternalServerError)
			}
		}()
		next.ServeHTTP(w, r)
	})
}

// UpdateProfile godoc
// @Summary Update current user profile
// @Description Allows logged-in users to update their profile information
// @Tags users
// @Accept json
// @Produce json
// @Param user body models.User true "Updated user profile"
// @Success 200 {object} models.User
// @Failure 400 {string} string "Invalid request"
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Database error"
// @Router /api/users/profile [put]
func UpdateProfile(w http.ResponseWriter, r *http.Request) {
    userID, ok := GetUserID(r.Context())
    if !ok {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    var updates struct {
        Username string `json:"username"`
        Name     string `json:"name"`
        Email    string `json:"email"`
        Password string `json:"password,omitempty"`
    }

    if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }

    var hashedPassword string
    if updates.Password != "" {
        hash, err := bcrypt.GenerateFromPassword([]byte(updates.Password), bcrypt.DefaultCost)
        if err != nil {
            http.Error(w, "Error hashing password", http.StatusInternalServerError)
            return
        }
        hashedPassword = string(hash)
    }

    query := "UPDATE users SET username=?, name=?, email=?"
    args := []interface{}{updates.Username, updates.Name, updates.Email}

    if hashedPassword != "" {
        query += ", password=?"
        args = append(args, hashedPassword)
    }
    query += " WHERE id=?"
    args = append(args, userID)

    _, err := database.DB.Exec(query, args...)
    if err != nil {
        log.Println("Update error:", err)
        http.Error(w, "Database error", http.StatusInternalServerError)
        return
    }

    GetProfile(w, r)
}


// ForgotPassword godoc
// @Summary Request password reset
// @Description Sends a reset link to user's email (or logs it to console if no mail service).
// @Tags auth
// @Accept json
// @Produce json
// @Param request body object true "Email"
// @Success 200 {object} map[string]string "message"
// @Failure 400 {string} string "Invalid request"
// @Failure 404 {string} string "User not found"
// @Router /api/v1/forgot-password [post]
func ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Email == "" {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// check if user exists
	var userID int
	err := database.DB.QueryRow("SELECT id FROM users WHERE email = ?", body.Email).Scan(&userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// generate reset token (for simplicity we use timestamp + userID + random hash)
	resetToken := generateRandomToken(32)
	expiry := time.Now().Add(15 * time.Minute)

	_, err = database.DB.Exec("UPDATE users SET reset_token=?, reset_token_expiry=? WHERE id=?", resetToken, expiry, userID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	resetLink := "https://your-frontend-url/reset-password?token=" + resetToken
	log.Println("Password reset link:", resetLink)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Password reset link sent. Please check your email.",
	})
}

// ResetPassword godoc
// @Summary Reset user password
// @Description Resets the user's password using a valid token.
// @Tags auth
// @Accept json
// @Produce json
// @Param request body object true "Token and new password"
// @Success 200 {object} map[string]string "message"
// @Failure 400 {string} string "Invalid request"
// @Failure 404 {string} string "Invalid or expired token"
// @Router /api/v1/reset-password [post]
func ResetPassword(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Token       string `json:"token"`
		NewPassword string `json:"newPassword"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Token == "" || body.NewPassword == "" {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var userID int
	var expiry time.Time
	err := database.DB.QueryRow("SELECT id, reset_token_expiry FROM users WHERE reset_token=?", body.Token).Scan(&userID, &expiry)
	if err != nil {
		http.Error(w, "Invalid token", http.StatusNotFound)
		return
	}

	if time.Now().After(expiry) {
		http.Error(w, "Token expired", http.StatusBadRequest)
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(body.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	_, err = database.DB.Exec("UPDATE users SET password=?, reset_token=NULL, reset_token_expiry=NULL WHERE id=?", string(hashed), userID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Password reset successful.",
	})
}

func generateRandomToken(length int) string {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		log.Println("Error generating random token:", err)
		return ""
	}
	return hex.EncodeToString(bytes)
}

type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

func ForgotPasswordHandler(w http.ResponseWriter, r *http.Request) {
	var req ForgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Check if user exists
	var userID int
	err := database.DB.QueryRow("SELECT id FROM users WHERE email = ?", req.Email).Scan(&userID)
	if err != nil {
		http.Error(w, "Email not found", http.StatusNotFound)
		return
	}

	// Generate secure reset token
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}
	resetToken := hex.EncodeToString(tokenBytes)

	// Optionally save token + expiration time in DB (for validation later)
	_, err = database.DB.Exec(
		"UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
		resetToken, time.Now().Add(1*time.Hour), userID,
	)
	
	if err != nil {
		http.Error(w, "Failed to store reset token", http.StatusInternalServerError)
		return
	}

	// Build reset link
	resetLink := "https://your-frontend-url/reset-password?token=" + resetToken
	fmt.Println("Password reset link:", resetLink)

	// Send email (same style as your ContactHandler)
	from := os.Getenv("SMTP_EMAIL")
	password := os.Getenv("SMTP_PASS")
	to := req.Email
	subject := "Password Reset Request"
	body := fmt.Sprintf("You requested to reset your password.\n\nClick the link below:\n%s\n\nThis link will expire in 1 hour.", resetLink)

	message := []byte("Subject: " + subject + "\r\n" +
		"From: " + from + "\r\n" +
		"To: " + to + "\r\n\r\n" +
		body)

	smtpHost := "smtp.gmail.com"
	smtpPort := "587"
	auth := smtp.PlainAuth("", from, password, smtpHost)

	if err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, message); err != nil {
		fmt.Println("Email error:", err)
		http.Error(w, "Failed to send email", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Password reset link sent successfully"})
}
