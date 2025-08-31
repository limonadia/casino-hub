package models

import (
	"time"
)

type User struct {
	ID         int       `json:"id"`
	Username   string    `json:"username"`
	Email      string    `json:"email"`
	Name       string    `json:"name"`
	Score      int       `json:"score"`
	Password   string    `json:"password"`
	Balance    int64     `json:"balance"`
	Level      int       `json:"level"`
	Experience int       `json:"experience"`
	FreeSpins  int       `json:"freeSpins"`
	LastActive  time.Time `json:"lastActive"`
    LastFreeCoins time.Time `json:"lastFreeCoins"`  
	CreatedAt time.Time `json:"createdAt"`
	Favourites []string `json:"favourites"`
}
