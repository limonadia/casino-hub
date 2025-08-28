package handlers

import (
	"casino-hub/backend/database"
	"encoding/json"
	"net/http"
	"strconv"
)

// GetBalance godoc
// @Summary Get user balance
// @Description Returns the current balance of the logged-in user
// @Tags balance
// @Produce json
// @Success 200 {object} map[string]int
// @Failure 401 {string} string "Unauthorized"
// @Router /api/balance [get]
func GetBalance (w http.ResponseWriter, r *http.Request){
    userIDStr := r.Header.Get("userID")
    userID, _ := strconv.Atoi(userIDStr)

    var balance int 
    err := database.DB.QueryRow("SELECT balance FROM users WHERE id = ?", userID).Scan(&balance)
    if err != nil {
        http.Error(w, "User not found", http.StatusNotFound)
        return
    }

    json.NewEncoder(w).Encode(map[string]int{"balance": balance})
}


// UpdateBalance godoc
// @Summary Update balance
// @Description Add or subtract coins from the user's balance
// @Tags balance
// @Accept json
// @Produce json
// @Param data body map[string]int true "Amount (+/-)"
// @Success 200 {object} map[string]string
// @Failure 400 {string} string "Invalid request"
// @Failure 401 {string} string "Unauthorized"
// @Router /api/balance [put]
func UpdateBalance(w http.ResponseWriter, r *http.Request) {
    // Get the logged-in user ID from context
    userID, ok := GetUserID(r.Context())
    if !ok || userID <= 0 {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    // Parse request body
    var req struct {
        Amount int `json:"amount"`
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }

    // Safely update balance in DB (no negative balances)
    _, err := database.DB.Exec(
        "UPDATE users SET balance = GREATEST(balance + ?, 0) WHERE id = ?",
        req.Amount, userID,
    )
    if err != nil {
        http.Error(w, "Could not update balance", http.StatusInternalServerError)
        return
    }

    // Fetch the updated balance
    var newBalance int
    err = database.DB.QueryRow("SELECT balance FROM users WHERE id = ?", userID).Scan(&newBalance)
    if err != nil {
        http.Error(w, "Could not fetch updated balance", http.StatusInternalServerError)
        return
    }

    // Return the updated balance
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]int{"balance": newBalance})
}



