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
func UpdateBalance (w http.ResponseWriter, r *http.Request){
    userIDStr := r.Header.Get("userID")
    userID, _ := strconv.Atoi(userIDStr)

    var req struct {
        Amount int `json:"amount"`
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }

    _, err := database.DB.Exec("UPDATE users SET balance = balance + ? WHERE id = ?", req.Amount, userID)
    if err != nil {
        http.Error(w, "Could not update balance", http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{"message": "Balance updated"})
}

