package models

var SYMBOLS = []struct {
	ID        int
	Emoji     string
	Name      string
	Multiplier int
	Rarity    float64
}{
	{1, "🍒", "Cherry", 2, 0.3},
	{2, "🍋", "Lemon", 3, 0.25},
	{3, "🔔", "Bell", 5, 0.2},
	{4, "💎", "Diamond", 10, 0.15},
	{5, "⭐", "Star", 15, 0.08},
	{6, "👑", "Crown", 25, 0.02},
}

type SpinSlotRequest struct {
	Bet int `json:"bet"`
}

type SpinSlotResponse struct {
	ReelResults []int `json:"reelResults"`
	WinAmount   int   `json:"winAmount"`
	NewBalance  int   `json:"newBalance"`
	WinType     string `json:"winType"`
}