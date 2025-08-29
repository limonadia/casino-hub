package handlers

import (
	"casino-hub/backend/database"
	"casino-hub/backend/models"
	"encoding/json"
	"math/rand"
	"net/http"
	"time"
)

func PlayKeno(w http.ResponseWriter, r *http.Request){
	userID, ok := GetUserID(r.Context())
	if !ok || userID <= 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req models.KenoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if len(req.SelectedNumbers) == 0 || len(req.SelectedNumbers) > 10 {
		http.Error(w, "Select 1-10 numbers", http.StatusBadRequest)
		return
	}

	var balance int 
	err := database.DB.QueryRow("SELECT balance FROm users WHERE id = ?", userID).Scan(&balance)
	if err != nil{
		http.Error(w, "Could not fetch balance", http.StatusInternalServerError)
		return
	}
	if balance < req.Bet {
		http.Error(w, "Insufficient balance", http.StatusBadRequest)
		return
	}

	_, err = database.DB.Exec("UPDATE users SET balance = balance - ? WHERE id=?", req.Bet, userID)
	if err != nil {
		http.Error(w, "Could not deduct bet", http.StatusInternalServerError)
		return
	}

	totalNumbers := 80
	available := make([]int, totalNumbers)
	for i := 0; i < totalNumbers; i++ {
		available[i] = i + 1
	}
	rand.Seed(time.Now().UnixNano())
	drawn := make([]int, 0, 20)
	for i := 0; i< 20; i++ {
		idx := rand.Intn(len(available))
		drawn = append(drawn, available[idx])
		available = append(available[:idx], available[idx+1:]...)
	}

	hits := 0
	for _, num := range req.SelectedNumbers {
		for _, d := range drawn {
			if num == d{
				hits++
				break
			}
		}
	}

	payout := 0
	if table, ok := models.PayoutTable[len(req.SelectedNumbers)]; ok {
		if hits < len(table){
			payout = req.Bet * table[hits]
		}
	}

	jackpotWon := false 
	if len(req.SelectedNumbers) == 10 && hits == 10 {
		payout += models.JackpotBase
		models.JackpotBase = 50000
		jackpotWon = true
	}

	_, err = database.DB.Exec("UPDATE users SET balance = balance + ? WHERE id=?", payout, userID)
	if err != nil {
		http.Error(w, "Could not update balance", http.StatusInternalServerError)
		return
	}

	err = database.DB.QueryRow("SELECT balance FROM users WHERE id=?", userID).Scan(&balance)
	if err != nil {
		http.Error(w, "Could not fetch balance", http.StatusInternalServerError)
		return
	}

	resp := models.KenoResponse{
		DrawnNumbers: drawn,
		Hits:         hits,
		Payout:       payout,
		JackpotWon:   jackpotWon,
		NewBalance:   balance,
		Message:      "Keno round completed",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)

}