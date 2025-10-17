package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"casino-hub/backend/database"
	"casino-hub/backend/routes"

	httpSwagger "github.com/swaggo/http-swagger"
	_ "casino-hub/backend/docs"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// @title Casino Hub API
// @version 1.0
// @description Simple casino games backend in Go with PostgreSQL
// @host localhost:8080
// @BasePath /
func main() {
	// Initialize DB with retry (handles temporary connection issues)
	database.InitDBWithRetry(5, 3)

	// Router
	r := mux.NewRouter()
	api := r.PathPrefix("/api/v1").Subrouter()
	routes.RegisterRoutes(api)
	
	// Swagger
	r.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)

	// CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{
			"https://*.vercel.app",
			"https://casino-hub.vercel.app",
			"http://localhost:3000",
			"http://localhost:5173",
		},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})
	

	handler := c.Handler(r)

	// Render provides the PORT dynamically
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("🎰 Casino API Server running on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
