package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func InitDB() {
	var err error

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?parseTime=true",
		os.Getenv("MYSQLUSER"),             
		os.Getenv("MYSQL_ROOT_PASSWORD"),   
		os.Getenv("MYSQLHOST"),            
		os.Getenv("MYSQLPORT"),           
		os.Getenv("MYSQL_DATABASE"),     
	)

	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}

	log.Println("✅ Connected to MySQL")
}
