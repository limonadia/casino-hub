package models

type BetType string

func (b BetType) String() any {
	panic("unimplemented")
}

const (
	Player BetType = "PLAYER"
	Banker BetType = "BANKER"
	Tie    BetType = "TIE"
)

type BaccaratCard struct {
	Suit      string `json:"suit"`
	Value     int    `json:"value"`
	Display   string `json:"display"`
	FaceValue int    `json:"faceValue"`
}

type Bet struct {
	Type   BetType `json:"type"`
	Amount int     `json:"amount"`
}

type GameResult struct {
	PlayerCards []BaccaratCard `json:"playerCards"`
	BankerCards []BaccaratCard `json:"bankerCards"`
	PlayerTotal int            `json:"playerTotal"`
	BankerTotal int            `json:"bankerTotal"`
	Winner      BetType        `json:"winner"`
	WinAmount   int            `json:"winAmount"`
	NewBalance  int            `json:"newBalance"`
	Message     string         `json:"message"`
}

var suits = []string{"♠", "♥", "♦", "♣"}
