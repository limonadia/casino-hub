package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"casino-hub/backend/database"
	"casino-hub/backend/routes"

	"github.com/joho/godotenv"

	_ "casino-hub/backend/docs"

	httpSwagger "github.com/swaggo/http-swagger"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// @title Casino Hub API
// @version 1.0
// @description Simple casino games backend in Go with MySQL
// @host localhost:8080
// @BasePath /
func main() {
	err := godotenv.Load()
    if err != nil {
        log.Println("Error loading .env file")
    }
	// Init DB
	database.InitDB()
	defer database.DB.Close()

	// Router
	r := mux.NewRouter()
	routes.RegisterRoutes(r)

	// Swagger
	r.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)

	// CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	// Start server
	handler := c.Handler(r)
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" 
	}


	fmt.Printf("🎰 Casino API Server running on %s\n", port)
	log.Fatal(http.ListenAndServe(port, handler))
}
