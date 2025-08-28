package models

type Card struct {
	Suit     string `json:"suit"`
	Value    string `json:"value"`
	NumValue int    `json:"numValue"`
}

type GameState struct {
	PlayerCards []Card `json:"playerCards"`
	DealerCards []Card `json:"dealerCards"`
	Deck        []Card `json:"deck"`
	Coins       int    `json:"coins"`
	Bet         int    `json:"bet"`
	Message     string `json:"message"`
	GameOver    bool   `json:"gameOver"`
	WinAmount   int    `json:"winAmount"`
}
