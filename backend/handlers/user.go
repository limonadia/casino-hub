package handlers

import (
    "encoding/json"
    "net/http"
    "casino-hub/backend/database"
    "casino-hub/backend/models"
)

func RegisterUser (w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error( w, "Invalid Input", http.StatusBadRequest)
		return
	}

	_, err := database.DB.Exec("INSERT INTO users (username, password, balance) VALUES (?, ?, ?)", user.Username, user.Password, user.Balance)
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}