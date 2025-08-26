package routes

import (
	"casino-hub/backend/handlers"

	"github.com/gorilla/mux"
)

func RegisterRoutes(r *mux.Router) {
	api := r.PathPrefix("/api/v1").Subrouter()

	//Auth
	api.HandleFunc("/signup", handlers.Signup).Methods("POST")
	api.HandleFunc("/login", handlers.Login).Methods("POST")
	api.HandleFunc("/logout", handlers.Logout).Methods("POST")

	//Balance
	balance := r.PathPrefix("/api/v1").Subrouter()
	balance.Use(handlers.AuthMiddleWare)
	balance.HandleFunc("/balance", handlers.GetBalance).Methods("GET")
	balance.HandleFunc("/balance", handlers.UpdateBalance).Methods("PUT")


    // protected user routes
    userRoutes := r.PathPrefix("/api/v1/users").Subrouter()
    userRoutes.Use(handlers.AuthMiddleWare)
    userRoutes.HandleFunc("/profile", handlers.GetProfile).Methods("GET")

	// Game
	api.HandleFunc("/spin", handlers.SpinSlot).Methods("POST")

	// Legacy
	api.HandleFunc("/balance", handlers.GetBalance).Methods("GET")
}
