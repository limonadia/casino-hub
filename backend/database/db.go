package database

import (
    "database/sql"
    "fmt"
    "log"
    "net/url"
    _ "github.com/lib/pq"
    "os"
)

var DB *sql.DB

func InitDB() {
    dbURL := os.Getenv("DATABASE_URL")
    if dbURL == "" {
        log.Fatal("DATABASE_URL environment variable not set")
    }

    // Parse DATABASE_URL to extract connection info
    u, err := url.Parse(dbURL)
    if err != nil {
        log.Fatalf("Invalid DATABASE_URL: %v", err)
    }

    user := u.User.Username()
    password, _ := u.User.Password()
    host := u.Hostname()
    port := u.Port()
    dbname := u.Path[1:] // remove leading "/"

    connStr := fmt.Sprintf(
        "host=%s port=%s user=%s password=%s dbname=%s sslmode=require",
        host, port, user, password, dbname,
    )

    DB, err = sql.Open("postgres", connStr)
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }

    // Test connection
    if err := DB.Ping(); err != nil {
        log.Fatalf("Failed to ping database: %v", err)
    }

    log.Println("✅ Connected to PostgreSQL (Supabase)")
}
