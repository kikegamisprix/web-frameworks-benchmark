package main

import (
	"encoding/json"
	"net/http"
)

// Item はリクエストボディの構造を定義
// json タグを使用してJSONとの相互変換を制御
type Item struct {
    Name     string  `json:"name"`
    Price    float64 `json:"price"`
    Quantity int     `json:"quantity"`
}

// Response はレスポンスの構造を定義
// json タグを使用してJSONとの相互変換を制御
type Response struct {
    ItemName   string  `json:"item_name"`
    TotalPrice float64 `json:"total_price"`
    Status     string  `json:"status"`
}

// メイン関数：HTTPサーバーの設定と起動を行う
func main() {
    // 各エンドポイントのルーティングを設定
    http.HandleFunc("/health", healthCheck)
    http.HandleFunc("/simple", simpleEndpoint)
    http.HandleFunc("/complex", complexEndpoint)
    // 8080ポートでサーバーを起動
    http.ListenAndServe(":8080", nil)
}

// ヘルスチェックエンドポイント
// システムの稼働状態を確認するための単純なGETエンドポイント
func healthCheck(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
}

// シンプルなGETエンドポイント
// パフォーマンステスト用の最小限の処理を行うエンドポイント
func simpleEndpoint(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(map[string]string{"message": "Hello, World!"})
}

// 複雑な処理を行うPOSTエンドポイント
// JSONリクエストを受け取り、計算処理を実行して結果を返す
func complexEndpoint(w http.ResponseWriter, r *http.Request) {
    // リクエストボディをItem構造体にデコード
    var item Item
    json.NewDecoder(r.Body).Decode(&item)
    
    // レスポンス構造体を作成し、計算結果を格納
    response := Response{
        ItemName:   item.Name,
        TotalPrice: item.Price * float64(item.Quantity),
        Status:     "processed",
    }
    
    // レスポンスをJSONとしてエンコード
    json.NewEncoder(w).Encode(response)
}

