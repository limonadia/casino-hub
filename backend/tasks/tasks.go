package tasks

import (
	"casino-hub/backend/database"
	"log"
	"time"
)

func AddDailyFreeCoins() {
	ticker := time.NewTicker(1 * time.Hour)
	for range ticker.C {
		res, err := database.DB.Exec(`UPDATE users 
		SET balance = balance + 1500, last_free_coins = NOW() 
		WHERE last_free_coins IS NULL OR last_free_coins < DATE_SUB(NOW(), INTERVAL 24 HOUR)`)

		if err != nil {
			log.Println("❌ Error updating free coins:", err)
		} else {
			rows, _ := res.RowsAffected()
			log.Printf("✅ Daily coins added to %d users\n", rows)
		}
	}
}
