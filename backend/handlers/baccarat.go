package handlers

import (
	"casino-hub/backend/database"
	"casino-hub/backend/models"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"time"
)

func getCardValue(val int) int{
	if val > 9 {
		return 0
	}
	return val
}

func getCardDisplay(val int, suit string) string{
	switch val {
	case 1:
		return "A" + suit
	case 11:
		return "J" + suit
	case 12:
		return "Q" + suit
	case 13:
		return "K" + suit
	default:
		return string(rune('0'+val)) + suit
	}
}

func drawCard() models.BaccaratCard {
	faceValue := rand.Intn(13)+1
	suit := suits[rand.Intn(len(suits))]
	return models.BaccaratCard {
		Suit: suit,
		Value: getCardValue(faceValue),
		Display: getCardDisplay(faceValue, suit),
		FaceValue: faceValue,
	}
}

func calculateTotal(cards []models.BaccaratCard) int{
	sum := 0
	for _, c := range cards {
		sum += c.Value
	}
	return sum % 10
}

func PlayBaccarat(w http.ResponseWriter, r *http.Request) {
	rand.Seed(time.Now().UnixNano())

	var bet models.Bet
	if err := json.NewDecoder(r.Body).Decode(&bet); err != nil {
		http.Error(w, "Invalid bet", http.StatusBadRequest)
		return
	}

	userID, ok := GetUserID(r.Context())
	if !ok || userID <= 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var userBalance int
	if err := database.DB.QueryRow("SELECT balance FROM users WHERE id = ?", userID).Scan(&userBalance); err != nil {
		http.Error(w, "Could not fetch user balance", http.StatusInternalServerError)
		return
	}

	if userBalance < bet.Amount {
		http.Error(w, "Insufficient balance", http.StatusBadRequest)
		return
	}

	userBalance -= bet.Amount

	playerCards := []models.BaccaratCard{drawCard(), drawCard()}
	bankerCards := []models.BaccaratCard{drawCard(), drawCard()}

	playerTotal := calculateTotal(playerCards)
	bankerTotal := calculateTotal(bankerCards)

	if playerTotal < 8 && bankerTotal < 8 {
		if playerTotal <= 5 {
			third := drawCard()
			playerCards = append(playerCards, third)
			playerTotal = calculateTotal(playerCards)

			ptc := third.Value
			if (bankerTotal <= 2) ||
				(bankerTotal == 3 && ptc != 8) ||
				(bankerTotal == 4 && ptc >= 2 && ptc <= 7) ||
				(bankerTotal == 5 && ptc >= 4 && ptc <= 7) ||
				(bankerTotal == 6 && (ptc == 6 || ptc == 7)) {
				thirdB := drawCard()
				bankerCards = append(bankerCards, thirdB)
				bankerTotal = calculateTotal(bankerCards)
			}
		} else if bankerTotal <= 5 {
			thirdB := drawCard()
			bankerCards = append(bankerCards, thirdB)
			bankerTotal = calculateTotal(bankerCards)
		}
	}

	var winner models.BetType
	if playerTotal > bankerTotal {
		winner = models.Player
	} else if bankerTotal > playerTotal {
		winner = models.Banker
	} else {
		winner = models.Tie
	}

	winAmount := 0
	message := ""

	if bet.Type == winner {
		switch winner {
		case models.Player:
			winAmount = bet.Amount * 2
		case models.Banker:
			winAmount = int(float64(bet.Amount) * 1.95) 
		case models.Tie:
			winAmount = bet.Amount * 9
		}

		userBalance += winAmount
		message = fmt.Sprintf("🎉 %s wins! You won %d", winner, winAmount-bet.Amount)
	} else {
		message = fmt.Sprintf("%s wins. Better luck next round!", winner)
	}

	if err := UpdateUserBalanceAbsolute(userID, userBalance); err != nil {
		http.Error(w, "Could not update balance", http.StatusInternalServerError)
		return
	}

	result := models.GameResult{
		PlayerCards: playerCards,
		BankerCards: bankerCards,
		PlayerTotal: playerTotal,
		BankerTotal: bankerTotal,
		Winner:      winner,
		WinAmount:   winAmount - bet.Amount, 
		NewBalance:  userBalance,
		Message:     message,
	}

	if err := RecordGamePlay(userID, "Baccarat"); err != nil {
		fmt.Println("RecordGamePlay error:", err)
		http.Error(w, "Failed to record game play", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
