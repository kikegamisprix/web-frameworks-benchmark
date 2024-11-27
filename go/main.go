package main

import (
	"encoding/json"
	"net/http"
)

type Item struct {
    Name     string  `json:"name"`
    Price    float64 `json:"price"`
    Quantity int     `json:"quantity"`
}

type Response struct {
    ItemName   string  `json:"item_name"`
    TotalPrice float64 `json:"total_price"`
    Status     string  `json:"status"`
}

func main() {
    http.HandleFunc("/health", healthCheck)
    http.HandleFunc("/simple", simpleEndpoint)
    http.HandleFunc("/complex", complexEndpoint)
    http.ListenAndServe(":8080", nil)
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
}

func simpleEndpoint(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(map[string]string{"message": "Hello, World!"})
}

func complexEndpoint(w http.ResponseWriter, r *http.Request) {
    var item Item
    json.NewDecoder(r.Body).Decode(&item)
    
    response := Response{
        ItemName:   item.Name,
        TotalPrice: item.Price * float64(item.Quantity),
        Status:     "processed",
    }
    
    json.NewEncoder(w).Encode(response)
}

