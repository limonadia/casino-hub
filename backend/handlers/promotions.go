package handlers

import (
	"casino-hub/backend/database"
	"database/sql"
	"encoding/json"
	"math/rand"
	"net/http"
	"time"
)

func parseFreeGames(jsonStr string) []string {
	if jsonStr == "" {
		return []string{}
	}
	var games []string
	json.Unmarshal([]byte(jsonStr), &games)
	return games
}

func toJSON(data []string) string {
	b, err := json.Marshal(data)
	if err != nil {
		return "[]"
	}
	return string(b)
}

type UserProfile struct {
	ID            int64     `json:"id"`
	Balance       float64   `json:"balance"`
	LastCashClaim time.Time `json:"lastCashClaim"`
	LastWheelSpin time.Time `json:"lastWheelSpin"`
	FreeGames     []string  `json:"freeGames"`
}

func ClaimDailyCash(w http.ResponseWriter, r *http.Request) {
	userID, ok := GetUserID(r.Context())
	if !ok || userID <= 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	var lastClaim time.Time
	var balance float64

	err := database.DB.QueryRow(`
		SELECT last_cash_claim, balance
		FROM users
		WHERE id = ?
	`, userID).Scan(&lastClaim, &balance)
	if err != nil {
		http.Error(w, "Failed to fetch user", http.StatusInternalServerError)
		return
	}

	if !lastClaim.IsZero() && time.Since(lastClaim) < 24*time.Hour {
		http.Error(w, "Already claimed today", http.StatusBadRequest)
		return
	}

	newBalance := balance + 100 
	now := time.Now()
	_, err = database.DB.Exec(`
		UPDATE users
		SET balance = ?, last_cash_claim = ?
		WHERE id = ?
	`, newBalance, now, userID)
	if err != nil {
		http.Error(w, "Failed to update user", http.StatusInternalServerError)
		return
	}

	resp := map[string]interface{}{
		"balance":       newBalance,
		"lastCashClaim": now.Format(time.RFC3339),
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func SpinWheel(w http.ResponseWriter, r *http.Request) {
	userID, ok := GetUserID(r.Context())
	if !ok || userID <= 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var lastSpin time.Time
	var balance float64
	var freeGamesSQL sql.NullString
	err := database.DB.QueryRow(`
		SELECT last_wheel_spin, balance, free_games
		FROM users
		WHERE id = ?
	`, userID).Scan(&lastSpin, &balance, &freeGamesSQL)

	freeGamesJSON := ""
	if freeGamesSQL.Valid {
		freeGamesJSON = freeGamesSQL.String
	}

	if err != nil {
		http.Error(w, "Failed to fetch user", http.StatusInternalServerError)
		return
	}

	if !lastSpin.IsZero() && time.Since(lastSpin) < 24*time.Hour {
		http.Error(w, "Already spun today", http.StatusBadRequest)
		return
	}

	// Updated prizes with higher values - matches frontend PRIZES array order
	type Prize struct {
		Type  string
		Value int
		Text  string
	}
	prizes := []Prize{
		{"money", 50, "$50"},    // Sector 0
		{"money", 100, "$100"},  // Sector 1
		{"money", 200, "$200"},  // Sector 2
		{"money", 75, "$75"},    // Sector 3
		{"money", 150, "$150"},  // Sector 4
		{"money", 125, "$125"},  // Sector 5
		{"money", 300, "$300"},  // Sector 6
		{"money", 100, "$100"},  // Sector 7
	}

	rand.Seed(time.Now().UnixNano())
	winning := prizes[rand.Intn(len(prizes))]

	var message string
	newBalance := balance
	newFreeGames := parseFreeGames(freeGamesJSON)

	switch winning.Type {
	case "money":
		newBalance += float64(winning.Value)
		message = "You won " + winning.Text + "!"
	case "bonus":
		message = "Bonus spin! Spin again now!"
	}

	var spinTime time.Time
	if winning.Type == "bonus" {
		spinTime = time.Now().Add(-25 * time.Hour)
	} else {
		spinTime = time.Now()
	}

	_, err = database.DB.Exec(`
		UPDATE users
		SET balance = ?, last_wheel_spin = ?, free_games = ?
		WHERE id = ?
	`, newBalance, spinTime, toJSON(newFreeGames), userID)

	if err != nil {
		http.Error(w, "Failed to update user", http.StatusInternalServerError)
		return
	}

	resp := map[string]interface{}{
		"reward":        winning.Text,
		"balance":       newBalance,
		"freeGames":     newFreeGames,
		"lastWheelSpin": spinTime.Format(time.RFC3339),
		"message":       message,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}