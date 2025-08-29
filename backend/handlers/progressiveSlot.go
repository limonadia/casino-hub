package handlers

import (
	"casino-hub/backend/database"
	"casino-hub/backend/models"
	"encoding/json"
	"math/rand"
	"net/http"
	"time"
)

func ProgressiveSlotHandler(w http.ResponseWriter, r *http.Request){
	userID, ok := GetUserID(r.Context())
	if !ok || userID <=0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req models.SpinSlotRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var balance int 
	if err := database.DB.QueryRow("SELECT balance FROM users WHERE id = ?", userID).Scan(&balance); err != nil {
		http.Error(w, "Invalid bet amount", http.StatusBadRequest)
		return
	} 

	if req.Bet <= 0 || req.Bet > balance {
		http.Error(w, "Invalid bet amount", http.StatusBadRequest)
		return
	}

	balance -= req.Bet
	_, err := database.DB.Exec("UPDATE users SET balance = ? WHERE id = ?", balance, userID)
	if err != nil {
		http.Error(w, "Could not update balance", http.StatusInternalServerError)
		return
	}

	rand.Seed(time.Now().UnixNano())

	reelResults := make([]int, 5)
	for i := 0; i< 5; i++ {
		r := rand.Float64()
		cumulative := 0.0
		for j, s := range models.SYMBOLS {
			cumulative += s.Rarity
			if r <= cumulative {
				reelResults[i] = j
				break
			}
		}
	}

	symbolCounts := make(map[int]int)
	for _, idx := range reelResults {
		symbolCounts[models.SYMBOLS[idx].ID]++
	}

	winAmount := 0
	winType := "normal"

	for id, count := range symbolCounts {
		if count >= 3 {
			var symbol *struct {
				ID int 
				Emoji string
				Name string
				Multiplier int
				Rarity float64
			}

			for _, s := range models.SYMBOLS {
				if s.ID == id {
					symbol = &s 
					break
				}
			}
			if symbol == nil {
				continue
			}
			baseWin := req.Bet * symbol.Multiplier
			multiplier := 1
			if count == 4 {
				multiplier = 3
			} else if count == 5 {
				multiplier = 10
			}
			winAmount += baseWin * multiplier
		}
	}

	if winAmount > 0 {
		if winAmount > req.Bet*20{
			winType = "big"
		}
		if rand.Float64() < 0.001 {
			winAmount += 500000
			winType = "jackpot"
		}
	}

	balance += winAmount
	_, err = database.DB.Exec("UPDATE users SET balance = ? WHERE id = ?", balance, userID)
	if err != nil {
		http.Error(w, "Could not update balance", http.StatusInternalServerError)
		return
	}

	resp := models.SpinSlotResponse {
		ReelResults: reelResults,
		WinAmount:   winAmount,
		NewBalance:  balance,
		WinType:     winType,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}