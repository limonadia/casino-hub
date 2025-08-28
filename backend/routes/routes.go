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
    user := api.PathPrefix("/users").Subrouter()
    user.Use(handlers.AuthMiddleWare)
    user.HandleFunc("/profile", handlers.GetProfile).Methods("GET")

	// slot
	slot := api.PathPrefix("/slot").Subrouter()
	slot.Use(handlers.AuthMiddleWare)
	slot.HandleFunc("/spin", handlers.SpinSlot).Methods("POST")

	//blackJack
	blackjack := api.PathPrefix("/blackjack").Subrouter()
	blackjack.Use(handlers.AuthMiddleWare)
	blackjack.HandleFunc("/start", handlers.StartGameHandler).Methods("POST")
	blackjack.HandleFunc("/hit", handlers.HitHandler).Methods("POST")
	blackjack.HandleFunc("/stand", handlers.StandHandler).Methods("POST")
}
