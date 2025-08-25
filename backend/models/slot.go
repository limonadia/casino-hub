package models

import "time"

type Symbol struct {
	ID         int     `json:"id"`
	Name       string  `json:"name"`
	Emoji      string  `json:"emoji"`
	Multiplier int     `json:"multiplier"`
	Rarity     float64 `json:"rarity"`
}

type SpinRequest struct {
	PlayerID  string `json:"playerId"`
	BetAmount int64  `json:"betAmount"`
}

type SpinResult struct {
	Success    bool    `json:"success"`
	Symbols    []int   `json:"symbols"`
	WinAmount  int64   `json:"winAmount"`
	NewBalance int64    `json:"newBalance"`
	WinType    string  `json:"winType"`
	JackpotWin bool    `json:"jackpotWin"`
	Message    string  `json:"message"`
	Multiplier float64 `json:"multiplier"`
}

type JackpotInfo struct {
	Amount      int64     `json:"amount"`
	LastWinner  string    `json:"lastWinner"`
	LastwinTime time.Time `json:"lastWinTime"`
}
