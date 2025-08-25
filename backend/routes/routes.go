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

	// Player
	api.HandleFunc("/user", handlers.RegisterUser).Methods("POST")
	// api.HandleFunc("/player/{id}", handlers.GetPlayer).Methods("GET")
	// api.HandleFunc("/player/{id}/funds/{amount}", handlers.AddFunds).Methods("POST")
	// api.HandleFunc("/player/{id}/daily-bonus", handlers.GetDailyBonus).Methods("POST")

	// Game
	api.HandleFunc("/spin", handlers.SpinSlot).Methods("POST")
	// api.HandleFunc("/bonus-game", handlers.PlayBonusGame).Methods("POST")
	// api.HandleFunc("/symbols", handlers.GetSymbols).Methods("GET")

	// Stats
	// api.HandleFunc("/jackpot", handlers.GetJackpot).Methods("GET")
	// api.HandleFunc("/stats", handlers.GetGameStats).Methods("GET")
	// api.HandleFunc("/leaderboard", handlers.GetLeaderboard).Methods("GET")
	// api.HandleFunc("/tournament", handlers.GetTournament).Methods("GET")

	// Legacy
	api.HandleFunc("/balance", handlers.GetBalance).Methods("GET")
	// api.HandleFunc("/reset", handlers.ResetBalance).Methods("POST")
	// api.HandleFunc("/slot", handlers.PlaySlot).Methods("POST")
}
