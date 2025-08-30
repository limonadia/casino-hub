package models 

type RouletteBet struct {
	Kind  string      `json:"kind"`  // number, color, parity, dozen, column
	Value interface{} `json:"value"` // number (0-36) or string/int depending on kind
}

type RouletteRequest struct {
	Bet   RouletteBet `json:"bet"`
	Stake int         `json:"stake"`
}

type RouletteResponse struct {
	WinningNumber int     `json:"winningNumber"`
	Payout        int     `json:"payout"`
	NewBalance    float64 `json:"newBalance"`
	Message       string  `json:"message"`
}

// POCKETS - European roulette pockets 0-36 with colors
var POCKETS = []struct {
	N     int
	Color string
}{
	{0, "green"}, {32, "red"}, {15, "black"}, {19, "red"}, {4, "black"}, {21, "red"},
	{2, "black"}, {25, "red"}, {17, "black"}, {34, "red"}, {6, "black"}, {27, "red"},
	{13, "black"}, {36, "red"}, {11, "black"}, {30, "red"}, {8, "black"}, {23, "red"},
	{10, "black"}, {5, "red"}, {24, "black"}, {16, "red"}, {33, "black"}, {1, "red"},
	{20, "black"}, {14, "red"}, {31, "black"}, {9, "red"}, {22, "black"}, {18, "red"},
	{29, "black"}, {7, "red"}, {28, "black"}, {12, "red"}, {35, "black"}, {3, "red"}, {26, "black"},
}