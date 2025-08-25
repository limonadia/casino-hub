package handlers

import (
    "net/http"
    "encoding/json"
)

func GetBalance(w http.ResponseWriter, r *http.Request) {
    response := map[string]interface{}{
        "balance": 1000, // placeholder
    }
    json.NewEncoder(w).Encode(response)
}

