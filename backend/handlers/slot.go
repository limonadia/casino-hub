package handlers

import (
	"casino-hub/backend/models"
	"encoding/json"
	"math/rand"
	"net/http"
	"time"
)

// SpinSlot godoc
// @Summary Spin slot machine
// @Description Spins slot with bet amount
// @Tags slot
// @Accept json
// @Produce json
// @Param request body models.SpinRequest true "Spin Request"
// @Success 200 {object} models.SpinResult
// @Router /api/slot/spin [post]
func SpinSlot(w http.ResponseWriter, r *http.Request) {
	var req models.SpinRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	results := GenerateSymbols()
	winAmount, winType, multiplier := CalculateWin(results, req.BetAmount)

	res := models.SpinResult{
		Success:    true,
		Symbols:    results,
		WinAmount:  winAmount,
		NewBalance: 10000 - req.BetAmount + winAmount, // TODO: fetch/update DB
		WinType:    winType,
		Multiplier: multiplier,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

var symbols = []models.Symbol{
	{ID: 1, Name: "Cherry", Emoji: "🍒", Multiplier: 2, Rarity: 0.30},
	{ID: 2, Name: "Lemon", Emoji: "🍋", Multiplier: 3, Rarity: 0.25},
	{ID: 3, Name: "Bell", Emoji: "🔔", Multiplier: 5, Rarity: 0.20},
	{ID: 4, Name: "Diamond", Emoji: "💎", Multiplier: 10, Rarity: 0.15},
	{ID: 5, Name: "Star", Emoji: "⭐", Multiplier: 15, Rarity: 0.08},
	{ID: 6, Name: "Crown", Emoji: "👑", Multiplier: 25, Rarity: 0.02},
}

func Init() {
	rand.Seed(time.Now().UnixNano())
}

func GenerateSymbols() []int {
	result := make([]int, 3)
	for i := 0; i < 3; i++ {
		random := rand.Float64()
		cumulative := 0.0
		for j, s := range symbols {
			cumulative += s.Rarity
			if random <= cumulative {
				result[i] = j
				break
			}
		}
	}
	return result
}

func CalculateWin(results []int, bet int64) (int64, string, float64) {
	symbolCounts := make(map[int]int)

	for _, symbolIndex := range results {
		symbolID := symbols[symbolIndex].ID
		symbolCounts[symbolID]++
	}

	var totalWin int64 = 0
	winType := "none"
	multiplier := 1.0

	for symbolID, count := range symbolCounts {
		if count >= 3 {
			symbol := symbols[symbolID-1]
			baseWin := bet * int64(symbol.Multiplier)

			switch count {
			case 3:
				multiplier = 1.0
			case 4:
				multiplier = 3.0
				winType = "big"
			case 5:
				multiplier = 10.0
				winType = "mega"
			}

			totalWin += int64(float64(baseWin) * multiplier)
		}
	}

	if totalWin > 0 {
		if totalWin >= bet*50 {
			winType = "mega"
		} else if totalWin >= bet*10 {
			winType = "big"
		} else {
			winType = "normal"
		}
	}

	return totalWin, winType, multiplier
}
