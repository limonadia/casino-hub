package handlers

import (
    "casino-hub/backend/database"
    "encoding/json"
    "net/http"
)

type FavouriteRequest struct {
    GameName string `json:"gameName"`
}

type FavouriteResponse struct {
    GameName string `json:"gameName"`
    Status   string `json:"status"` // "added" or "removed"
}

func ToggleFavourite(w http.ResponseWriter, r *http.Request) {
    userID, ok := GetUserID(r.Context())
    if !ok {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    var req FavouriteRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }

    // Check if already in favourites
    var exists bool
    err := database.DB.QueryRow(
        `SELECT EXISTS(
            SELECT 1 FROM user_favourites WHERE user_id = ? AND game_name = ?
        )`, userID, req.GameName).Scan(&exists)

    if err != nil {
        http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
        return
    }

    status := ""
    if exists {
        // Remove it
        _, err = database.DB.Exec(
            `DELETE FROM user_favourites WHERE user_id = ? AND game_name = ?`,
            userID, req.GameName,
        )
        status = "removed"
    } else {
        // Add it
        _, err = database.DB.Exec(
            `INSERT INTO user_favourites (user_id, game_name) VALUES (?, ?)`,
            userID, req.GameName,
        )
        status = "added"
    }

    if err != nil {
        http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
        return
    }

    // Return only the toggled game
    json.NewEncoder(w).Encode(FavouriteResponse{
        GameName: req.GameName,
        Status:   status,
    })
}

