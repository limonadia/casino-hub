package handlers

import (
	"casino-hub/backend/database"
	"casino-hub/backend/models"
	"database/sql"
	"encoding/json"
	"math/rand"
	"net/http"
	"strconv"
	"time"
)

func SpinRoulette(w http.ResponseWriter, r *http.Request){
	userID, ok := GetUserID(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req models.RouletteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil{
		http.Error(w, "Invalid Request", http.StatusBadRequest)
		return
	}
	if req.Stake <= 0 {
		http.Error(w, "Invalid stake", http.StatusBadRequest)
		return
	}

	var balance float64 
	err := database.DB.QueryRow("SELECT balance FROM users WHERE id = ?", userID).Scan(&balance)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		}
		return
	}

	if float64(req.Stake) > balance {
		http.Error(w, "Insufficient value", http.StatusBadRequest)
		return
	}

	balance -= float64(req.Stake)

	rand.Seed(time.Now().UnixNano())
	winning := models.POCKETS[rand.Intn(len(models.POCKETS))]

	payout := evaluateRouletteBet(req.Bet, winning.N, winning.Color, req.Stake)
	if payout > 0 {
		balance += float64(payout + req.Stake)
	}

	_, err = database.DB.Exec("UPDATE users SET balance = ? WHERE id = ?", balance, userID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	
	resp := models.RouletteResponse{
		WinningNumber: winning.N,
		Payout:        payout,
		NewBalance:    balance,
		Message:       buildMessage(payout, winning.N),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func evaluateRouletteBet(bet models.RouletteBet, winningNumber int, winningColor string, stake int) int {
	switch bet.Kind {
	case "number":
		val, ok := bet.Value.(float64)
		if ok && int(val) == winningNumber {
			return stake * 35
		}
	case "color":
		val, ok := bet.Value.(string)
		if ok && val == winningColor {
			return stake * 1
		} 
	case "parity":
		val, ok := bet.Value.(string)
		if ok && winningNumber != 0 {
			if (winningNumber % 2 == 0 && val == "even") || (winningNumber%2 == 1 && val == "odd"){
				return stake * 1
			}
		}
	case "dozen":
		val, ok := bet.Value.(float64)
		if ok && winningNumber > 0 {
			dozen := (winningNumber-1)/12 + 1
			if int(val) == dozen {
				return stake * 2
			}
		}
	case "column":
		val, ok := bet.Value.(float64)
		if ok && winningNumber > 0 {
			col := ((winningNumber-1)%3)+1
			if int(val) == col {
				return stake * 2
			}
		}
	}
	return 0
}

func buildMessage(payout int, winningNumber int) string {
	if payout > 0 {
		return "You won! Number "+ strconv.Itoa(winningNumber)
	}
	return "You lost. Number "+ strconv.Itoa(winningNumber)
}

