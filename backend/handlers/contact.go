package handlers

import (
	"casino-hub/backend/database"
	"encoding/json"
	"fmt"
	"net/http"
	"net/smtp"
	"os"
)

type ContactRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Phone       string `json:"phone"`
}

func ContactHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := GetUserID(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get user email from DB
	var userEmail string
	err := database.DB.QueryRow("SELECT email FROM users WHERE id = ?", userID).Scan(&userEmail)
	if err != nil {
		http.Error(w, "Failed to get user email", http.StatusInternalServerError)
		return
	}

	var req ContactRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	to := "nadiamezini@gmail.com"
	subject := req.Title
	body := fmt.Sprintf("From: %s\n\nDescription:\n%s\n\nPhone: %s", userEmail, req.Description, req.Phone)

	from := os.Getenv("SMTP_EMAIL")
	password := os.Getenv("SMTP_PASS")
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	message := []byte("Subject: " + subject + "\r\n" +
		"From: " + from + "\r\n" +
		"To: " + to + "\r\n\r\n" +
		body)

	auth := smtp.PlainAuth("", from, password, smtpHost)
	err = smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, message)
	if err != nil {
		http.Error(w, "Failed to send email", http.StatusInternalServerError)
		fmt.Println("Email error:", err)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Email sent successfully"})
}
