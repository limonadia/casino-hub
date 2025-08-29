package models 

type KenoRequest struct {
	SelectedNumbers []int `json:"selectedNumbers"` // user picks 1-10 numbers
	Bet             int   `json:"bet"`
}

type KenoResponse struct {
	DrawnNumbers []int `json:"drawnNumbers"`
	Hits         int   `json:"hits"`
	Payout       int   `json:"payout"`
	JackpotWon   bool  `json:"jackpotWon"`
	NewBalance   int   `json:"newBalance"`
	Message      string `json:"message"`
}

var PayoutTable = map[int][]int{
	1:  {0, 3},
	2:  {0, 2, 12},
	3:  {0, 1, 3, 46},
	4:  {0, 1, 2, 5, 91},
	5:  {0, 0, 2, 4, 21, 387},
	6:  {0, 0, 1, 3, 7, 40, 1500},
	7:  {0, 0, 1, 2, 4, 20, 100, 7500},
	8:  {0, 0, 0, 2, 3, 9, 44, 335, 25000},
	9:  {0, 0, 0, 1, 2, 5, 25, 142, 1000, 40000},
	10: {0, 0, 0, 0, 2, 4, 17, 70, 400, 1800, 100000},
}

var JackpotBase = 50000