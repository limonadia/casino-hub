package models

type HiLoCard struct {
	Value int    `json:"value"` // 1-13
	Suit  string `json:"suit"`  // "♠", "♥", "♦", "♣"
	Color string `json:"color"` // "red" or "black"
}

type HiLoRequest struct {
	Guess string `json:"guess"` // "higher" or "lower"
	Bet   int    `json:"bet"`
}

type HiLoResponse struct {
	CardFrom     HiLoCard   `json:"cardFrom"`
	CardTo       HiLoCard   `json:"cardTo"`
	Guess        string `json:"guess"`
	Won          bool   `json:"won"`
	Payout       int    `json:"payout"`
	Balance      int    `json:"balance"`
	Streak       int    `json:"streak"`
	Message      string `json:"message"`
}

var HiLoSuits = []struct {
	Symbol string
	Color  string
}{
	{"♠", "black"},
	{"♥", "red"},
	{"♦", "red"},
	{"♣", "black"},
}

var Balance = 50000
var Streak = 0