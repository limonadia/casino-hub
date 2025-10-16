package database

import (
    "database/sql"
    "log"
    "os"
    _ "github.com/lib/pq"
    "strings"
)

var DB *sql.DB

func InitDB() {
    dbURL := os.Getenv("DATABASE_URL")
    if dbURL == "" {
        log.Fatal("DATABASE_URL environment variable not set")
    }

    if !strings.Contains(dbURL, "sslmode=") {
        dbURL += "?sslmode=require"
    }

    var err error
    DB, err = sql.Open("postgres", dbURL)
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }

    if err := DB.Ping(); err != nil {
        log.Fatalf("Failed to ping database: %v", err)
    }

    log.Println("✅ Connected to PostgreSQL (Supabase)")
}
