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

var suits = []string{"♠", "♥", "♦", "♣"}
var values = []struct {
	Value    string
	NumValue int
}{
	{"A", 11}, {"2", 2}, {"3", 3}, {"4", 4}, {"5", 5}, {"6", 6}, {"7", 7},
	{"8", 8}, {"9", 9}, {"10", 10}, {"J", 10}, {"Q", 10}, {"K", 10},
}

func CreateDeck() []models.Card {
	deck := []models.Card{}
	for _, suit := range suits {
		for _, val := range values {
			deck = append(deck, models.Card{
				Suit:     suit,
				Value:    val.Value,
				NumValue: val.NumValue,
			})
		}
	}
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(deck), func(i, j int) {
		deck[i], deck[j] = deck[j], deck[i]
	})
	return deck
}

func CalculateScore(cards []models.Card) int {
	score := 0
	aces := 0

	for _, c := range cards {
		if c.Value == "A" {
			aces++
			score += 11
		} else {
			score += c.NumValue
		}
	}

	for score > 21 && aces > 0 {
		score -= 10
		aces--
	}

	return score
}

func IsBlackjack(cards []models.Card) bool {
	return len(cards) == 2 && CalculateScore(cards) == 21
}

// ------------------- Handlers -------------------

func StartGameHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := GetUserID(r.Context())
	if !ok || userID <= 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	type Req struct { Bet int `json:"bet"` }
	var req Req
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var userBalance int
	err := database.DB.QueryRow("SELECT balance FROM users WHERE id = ?", userID).Scan(&userBalance)
	if err != nil {
		http.Error(w, "Could not fetch user balance", http.StatusInternalServerError)
		return
	}

	if req.Bet <= 0 || req.Bet > userBalance {
		http.Error(w, "Invalid bet amount", http.StatusBadRequest)
		return
	}

	// DEDUCT THE BET AT GAME START
	newBalance := userBalance - req.Bet
	if err := UpdateUserBalanceAbsolute(userID, newBalance); err != nil {
		http.Error(w, "Could not update balance", http.StatusInternalServerError)
		return
	}

	deck := CreateDeck()
	playerCards := []models.Card{deck[0], deck[2]}
	dealerCards := []models.Card{deck[1], deck[3]}
	deck = deck[4:]

	state := models.GameState{
		PlayerCards: playerCards,
		DealerCards: dealerCards,
		Deck:        deck,
		Coins:       newBalance, // Updated balance after bet deduction
		Bet:         req.Bet,
		Message:     "Hit or Stand?",
		GameOver:    false,
		WinAmount:   0,
	}

	// Immediate blackjack check
	if IsBlackjack(playerCards) {
		if IsBlackjack(dealerCards) {
			// Push - return the bet
			state.Message = "Both Blackjack! Push!"
			state.GameOver = true
			state.WinAmount = req.Bet // Return the bet
			state.Coins = newBalance + req.Bet // Add back the bet
		} else {
			// Player blackjack wins - 3:2 payout plus original bet
			blackjackWin := int(float64(req.Bet) * 1.5) // 3:2 payout
			totalWin := req.Bet + blackjackWin // Original bet + winnings
			state.WinAmount = totalWin
			state.Message = "BLACKJACK! You win!"
			state.GameOver = true
			state.Coins = newBalance + totalWin
		}
	} else if IsBlackjack(dealerCards) {
		// Dealer blackjack - player loses (bet already deducted)
		state.Message = "Dealer Blackjack! You lose."
		state.GameOver = true
		state.WinAmount = 0 // No winnings, bet already taken
		// Coins already reflects the loss
	}

	// Update balance in DB if there are winnings
	if state.GameOver && state.WinAmount > 0 {
		if err := UpdateUserBalanceAbsolute(userID, state.Coins); err != nil {
			http.Error(w, "Could not update balance", http.StatusInternalServerError)
			return
		}
	}

	if state.GameOver {
		if err := RecordGamePlay(userID, "Blackjack"); err != nil {
			fmt.Println("RecordGamePlay error:", err)
			http.Error(w, "Failed to record game play", http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(state)
}

func HitHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := GetUserID(r.Context())
	if !ok || userID <= 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	type Req struct {
		Deck        []models.Card `json:"deck"`
		PlayerCards []models.Card `json:"playerCards"`
		Coins       int           `json:"coins"`
		Bet         int           `json:"bet"`
		DealerCards []models.Card `json:"dealerCards"`
	}
	var req Req
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if len(req.Deck) == 0 {
		http.Error(w, "No cards left in deck", http.StatusBadRequest)
		return
	}

	card := req.Deck[0]
	req.Deck = req.Deck[1:]
	req.PlayerCards = append(req.PlayerCards, card)

	score := CalculateScore(req.PlayerCards)

	state := models.GameState{
		PlayerCards: req.PlayerCards,
		DealerCards: req.DealerCards,
		Deck:        req.Deck,
		Coins:       req.Coins,
		Bet:         req.Bet,
		GameOver:    false,
		Message:     "Hit or Stand?",
		WinAmount:   0,
	}

	if score > 21 {
		state.GameOver = true
		state.Message = "BUST! You lose."
		state.WinAmount = 0 
	} else if score == 21 {
		state = StandLogic(req.Deck, req.PlayerCards, req.DealerCards, req.Coins, req.Bet)
		if state.WinAmount > 0 {
			if err := UpdateUserBalanceAbsolute(userID, state.Coins); err != nil {
				http.Error(w, "Could not update balance", http.StatusInternalServerError)
				return
			}
		}

		if state.GameOver {
			if err := RecordGamePlay(userID, "Blackjack"); err != nil {
				fmt.Println("RecordGamePlay error:", err)
				http.Error(w, "Failed to record game play", http.StatusInternalServerError)
				return
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(state)
}

func StandHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := GetUserID(r.Context())
	if !ok || userID <= 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	type Req struct {
		Deck        []models.Card `json:"deck"`
		PlayerCards []models.Card `json:"playerCards"`
		DealerCards []models.Card `json:"dealerCards"`
		Coins       int           `json:"coins"`
		Bet         int           `json:"bet"`
	}
	var req Req
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	state := StandLogic(req.Deck, req.PlayerCards, req.DealerCards, req.Coins, req.Bet)

	// Update balance if there are winnings
	if state.WinAmount > 0 {
		if err := UpdateUserBalanceAbsolute(userID, state.Coins); err != nil {
			http.Error(w, "Could not update balance", http.StatusInternalServerError)
			return
		}
	}

	if err := RecordGamePlay(userID, "Blackjack"); err != nil {
		fmt.Println("RecordGamePlay error:", err)
		http.Error(w, "Failed to record game play", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(state)
}

// ------------------- Game Logic -------------------

func StandLogic(deck []models.Card, playerCards []models.Card, dealerCards []models.Card, coins int, bet int) models.GameState {
	playerScore := CalculateScore(playerCards)
	dealerScore := CalculateScore(dealerCards)

	// Dealer hits until 17 or higher
	for dealerScore < 17 && len(deck) > 0 {
		card := deck[0]
		deck = deck[1:]
		dealerCards = append(dealerCards, card)
		dealerScore = CalculateScore(dealerCards)
	}

	var message string
	var winAmount int
	var finalCoins int

	if dealerScore > 21 {
		message = "Dealer busts! You win!"
		winAmount = bet * 2 
		finalCoins = coins + winAmount
	} else if playerScore > dealerScore {
		message = "You win!"
		winAmount = bet * 2 
		finalCoins = coins + winAmount
	} else if playerScore == dealerScore {
		message = "Push! It's a tie."
		winAmount = bet 
		finalCoins = coins + winAmount
	} else {
		message = "Dealer wins!"
		winAmount = 0 
		finalCoins = coins
	}

	return models.GameState{
		PlayerCards: playerCards,
		DealerCards: dealerCards,
		Deck:        deck,
		Coins:       finalCoins,
		Bet:         bet,
		Message:     message,
		GameOver:    true,
		WinAmount:   winAmount,
	}
}

// ------------------- DB Update -------------------

func UpdateUserBalance(userID int, amount int) error {
	_, err := database.DB.Exec(
		"UPDATE users SET balance = GREATEST(balance + ?, 0) WHERE id = ?",
		amount, userID,
	)
	return err
}

// New function to set balance to absolute value
func UpdateUserBalanceAbsolute(userID int, newBalance int) error {
	_, err := database.DB.Exec(
		"UPDATE users SET balance = GREATEST(?, 0) WHERE id = ?",
		newBalance, userID,
	)
	return err
}