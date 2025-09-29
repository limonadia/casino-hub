package routes

import (
	"casino-hub/backend/handlers"
	"net/http"

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
	user.HandleFunc("/profile", handlers.UpdateProfile).Methods("PUT")

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

	//baccarat
	baccarat := api.PathPrefix("/baccarat").Subrouter()
	baccarat.Use(handlers.AuthMiddleWare)
	baccarat.HandleFunc("/play", handlers.PlayBaccarat).Methods("POST")

	//progressiveSlot
	progressiveSlot := api.PathPrefix("/progressiveSlot").Subrouter()
	progressiveSlot.Use(handlers.AuthMiddleWare)
	progressiveSlot.HandleFunc("/play", handlers.ProgressiveSlotHandler).Methods("POST")
	http.Handle("/api/progressiveSlot", handlers.RecoverMiddleware(http.HandlerFunc(handlers.ProgressiveSlotHandler)))

	//keno
	keno := api.PathPrefix("/keno").Subrouter()
	keno.Use(handlers.AuthMiddleWare)
	keno.HandleFunc("/play", handlers.PlayKeno).Methods("POST")

	//hilo
	hilo := api.PathPrefix("/hilo").Subrouter()
	hilo.Use(handlers.AuthMiddleWare)
	hilo.HandleFunc("/play", handlers.PlayHiLo).Methods("POST")

	//roulette
	roulette := api.PathPrefix("/roulette").Subrouter()
	roulette.Use(handlers.AuthMiddleWare)
	roulette.HandleFunc("/spin", handlers.SpinRoulette).Methods("POST")

	//favourites
	favourites := api.PathPrefix("/favourites").Subrouter()
	favourites.Use(handlers.AuthMiddleWare)
	favourites.HandleFunc("/toggle", handlers.ToggleFavourite).Methods("POST")

	//recent
	recent := api.PathPrefix("/recent").Subrouter()
	recent.Use(handlers.AuthMiddleWare)
	recent.HandleFunc("/games", handlers.GetRecentGames).Methods("GET")

	// promotions
	promotions := api.PathPrefix("/promotions").Subrouter()
	promotions.Use(handlers.AuthMiddleWare)
	promotions.HandleFunc("/daily-cash", handlers.ClaimDailyCash).Methods("POST")
	promotions.HandleFunc("/spin-wheel", handlers.SpinWheel).Methods("POST")

}
