package models

type Stats struct {
    UserID           int     `json:"userId"`          
    TotalSpins       int     `json:"totalSpins"`      
    TotalWins        int     `json:"totalWins"`       
    TotalLosses      int     `json:"totalLosses"`     
    TotalBetAmount   int64   `json:"totalBetAmount"`   
    TotalWinAmount   int64   `json:"totalWinAmount"`  
    MaxWinAmount     int64   `json:"maxWinAmount"` 
    AverageWinAmount float64 `json:"averageWinAmount"` 
    JackpotWins      int     `json:"jackpotWins"`  
}
