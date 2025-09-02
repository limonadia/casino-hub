package handlers

import (
	"casino-hub/backend/database"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

func GetRecentGames(w http.ResponseWriter, r *http.Request) {
    userID, ok := GetUserID(r.Context())
    if !ok || userID <= 0 {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    rows, err := database.DB.Query(`
        SELECT g.title, gp.played_at
        FROM game_plays gp
        JOIN games g ON g.id = gp.game_id
        WHERE gp.user_id = ?
        AND gp.played_at = (
            SELECT MAX(played_at) 
            FROM game_plays 
            WHERE user_id = gp.user_id AND game_id = gp.game_id
        )
        ORDER BY gp.played_at DESC
        LIMIT 5
    `, userID)
    if err != nil {
        fmt.Println("GetRecentGames query error:", err)
        http.Error(w, "Failed to fetch recent games", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    type RecentGame struct {
        Title    string    `json:"title"`
        PlayedAt time.Time `json:"playedAt"`
    }

    var recentGames []RecentGame
    for rows.Next() {
        var rg RecentGame
        if err := rows.Scan(&rg.Title, &rg.PlayedAt); err != nil {
            fmt.Println("GetRecentGames scan error:", err)
            http.Error(w, "Failed to scan result", http.StatusInternalServerError)
            return
        }
        recentGames = append(recentGames, rg)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(recentGames)
}


