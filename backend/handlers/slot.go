package handlers

import (
	"casino-hub/backend/database"
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

	userID, ok := GetUserID(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	
	var balance int64
	err := database.DB.QueryRow("SELECT balance FROM users WHERE id = ?", userID).Scan(&balance)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	
	if balance < req.BetAmount {
		http.Error(w, "Insufficient balance", http.StatusBadRequest)
		return
	}
	
	results := GenerateSymbols()
	winAmount, winType, multiplier := CalculateWin(results, req.BetAmount)
	
	newBalance := balance - req.BetAmount + winAmount
	_, err = database.DB.Exec("UPDATE users SET balance = ? WHERE id = ?", newBalance, userID)
	if err != nil {
		http.Error(w, "Could not update balance", http.StatusInternalServerError)
		return
	}
	
	res := models.SpinResult{
		Success:    true,
		Symbols:    results,
		WinAmount:  winAmount,
		NewBalance: newBalance,
		WinType:    winType,
		JackpotWin: false,
		Multiplier: multiplier,
		Message:    "Spin completed",
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
	
}


var symbols = []models.Symbol{
    {ID: 1, Name: "Cherry", Emoji: "🍒", Multiplier: 2, Rarity: 0.25},
    {ID: 2, Name: "Lemon", Emoji: "🍋", Multiplier: 3, Rarity: 0.20},
    {ID: 3, Name: "Orange", Emoji: "🍊", Multiplier: 4, Rarity: 0.15},
    {ID: 4, Name: "Grapes", Emoji: "🍇", Multiplier: 6, Rarity: 0.12},
    {ID: 5, Name: "Bell", Emoji: "🔔", Multiplier: 8, Rarity: 0.10},
    {ID: 6, Name: "Star", Emoji: "⭐", Multiplier: 12, Rarity: 0.08},
    {ID: 7, Name: "Diamond", Emoji: "💎", Multiplier: 20, Rarity: 0.05},
    {ID: 8, Name: "Lucky 7", Emoji: "7️⃣", Multiplier: 50, Rarity: 0.03},
    {ID: 9, Name: "Crown", Emoji: "👑", Multiplier: 100, Rarity: 0.02},
}

func Init() {
	rand.Seed(time.Now().UnixNano())
}

// func getRandomSymbol() int {
//     r := rand.Float64()
//     cumulative := 0.0
//     for i, s := range symbols {
//         cumulative += s.Rarity
//         if r < cumulative {
//             return i
//         }
//     }
//     return len(symbols) - 1
// }


func GenerateSymbols() []int {
    result := make([]int, 3)

    if rand.Float64() < 0.08 {
        idx := rand.Intn(len(symbols))
        for i := range result {
            result[i] = idx
        }
        return result
    }

    for i := range result {
        result[i] = rand.Intn(len(symbols))
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
