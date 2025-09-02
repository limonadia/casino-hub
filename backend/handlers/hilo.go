package handlers

import (
	"casino-hub/backend/database"
	"casino-hub/backend/models"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
)


var currentCard = getRandomCard()

func getRandomCard() models.HiLoCard {
	suit := models.HiLoSuits[rand.Intn(len(suits))]
	return models.HiLoCard{
		Value: rand.Intn(13) + 1,
		Suit:  suit.Symbol,
		Color: suit.Color,
	} 
}

func calculatePayout(bet int, currentCard models.HiLoCard, guess string, streak int) int {
	var odds float64
	if guess == "higher"{
		cardsHigher := 13 - currentCard.Value
		odds = float64(cardsHigher) / 12.0
	} else {
		cardsLower := currentCard.Value - 1
		odds = float64(cardsLower) / 12.0
	}

	baseOdds := 1.0
	if odds > 0 && odds < 0.5{
		baseOdds = (1 / odds) - 1
	}
	multiplier := 1 + float64(streak)*0.1
	if multiplier > 5 {
		multiplier = 5
	}

	return int(float64(bet) * baseOdds * multiplier)
}

func PlayHiLo(w http.ResponseWriter, r *http.Request) {
	userID, ok := GetUserID(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req models.HiLoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var balance, streak int
	err := database.DB.QueryRow("SELECT balance FROM users WHERE id = ?", userID).Scan(&balance)
	if err != nil {
		http.Error(w, "Failed to fetch user", http.StatusInternalServerError)
		return
	}

	if req.Bet <= 0 || req.Bet > balance {
		http.Error(w, "Invalid bet", http.StatusBadRequest)
		return
	}

	balance -= req.Bet

	nextCard := getRandomCard()
	won := false
	var payout int

	switch req.Guess {
	case "higher":
		if nextCard.Value > currentCard.Value {
			won = true
			payout = calculatePayout(req.Bet, currentCard, req.Guess, streak)
		}
	case "lower":
		if nextCard.Value < currentCard.Value {
			won = true
			payout = calculatePayout(req.Bet, currentCard, req.Guess, streak)
		}
	case "tie":
		if nextCard.Value == currentCard.Value {
			won = true
			payout = req.Bet * 10
		}
	default:
		http.Error(w, "Invalid guess type", http.StatusBadRequest)
		return
	}

	if won {
		balance += req.Bet + payout
		streak++
	} else {
		payout = -req.Bet
		streak = 0
	}

	_, err = database.DB.Exec("UPDATE users SET balance = ? WHERE id = ?", balance, userID)
	if err != nil {
		http.Error(w, "Failed to update balance", http.StatusInternalServerError)
		return
	}

	if err := RecordGamePlay(userID, "HiLo"); err != nil {
		fmt.Println("RecordGamePlay error:", err)
		http.Error(w, "Failed to record game play", http.StatusInternalServerError)
		return
	}

	resp := models.HiLoResponse{
		CardFrom: currentCard,
		CardTo:   nextCard,
		Guess:    req.Guess,
		Won:      won,
		Payout:   payout,
		Balance:  balance,
		Streak:   streak,
		Message:  getMessage(won, nextCard, req.Guess, payout, streak),
	}

	currentCard = nextCard

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func getMessage(won bool, next models.HiLoCard, guess string, payout int, streak int) string {
	if won {
		if payout >= 3 {
			return "🔥 BIG WIN!"
		}
		return "✅ Winner!"
	}
	if next.Value == currentCard.Value {
		return "❌ Tie, you lose!"
	}
	return "❌ Wrong guess!"
}

