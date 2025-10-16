package database

import (
	"database/sql"
	"log"
	"os"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

var DB *sql.DB

// InitDBWithRetry tries to connect to the database with retries
func InitDBWithRetry(retries int, delaySeconds int) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable not set")
	}

	// Append SSL if missing
	if !strings.Contains(dbURL, "sslmode=") {
		dbURL += "?sslmode=require"
	}

	var err error
	for i := 0; i < retries; i++ {
		DB, err = sql.Open("postgres", dbURL)
		if err != nil {
			log.Printf("Failed to open DB connection: %v", err)
		} else if err = DB.Ping(); err != nil {
			log.Printf("Failed to ping DB: %v", err)
		} else {
			log.Println("✅ Connected to PostgreSQL (Supabase)")
			return
		}

		log.Printf("Retrying in %d seconds... (%d/%d)", delaySeconds, i+1, retries)
		time.Sleep(time.Duration(delaySeconds) * time.Second)
	}

	log.Fatalf("Could not connect to database after %d retries: %v", retries, err)
}
