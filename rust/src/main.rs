// 必要なモジュールをインポート
use axum::{
    routing::{get, post},
    Router, Json, extract::State,
};
use serde::{Deserialize, Serialize}; // JSONシリアライズ/デシリアライズ用
use std::net::SocketAddr;
use tower_http::cors::CorsLayer; // CORS設定用

// リクエストボディの構造体定義
// Debug: デバッグ出力用, Serialize: JSON化用, Deserialize: JSONパース用
#[derive(Debug, Serialize, Deserialize)]
struct Item {
    name: String,
    price: f64,
    quantity: i32,
}

// レスポンス用の構造体定義
#[derive(Debug, Serialize)]
struct Response {
    item_name: String,
    total_price: f64,
    status: String,
}

// ヘルスチェック用のレスポンス構造体
#[derive(Debug, Serialize)]
struct Health {
    status: String,
}

// シンプルエンドポイント用のレスポンス構造体
#[derive(Debug, Serialize)]
struct SimpleResponse {
    message: String,
}

// メイン関数：非同期ランタイムを初期化し、サーバーを起動
#[tokio::main]
async fn main() {
    // ルーターの設定
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/simple", get(simple_endpoint))
        .route("/complex", post(complex_endpoint))
        .layer(CorsLayer::permissive()); // すべてのオリジンからのアクセスを許可

    // サーバーのアドレス設定（すべてのインターフェースで8090ポートをリッスン）
    let addr = SocketAddr::from(([0, 0, 0, 0], 8090));
    println!("Listening on {}", addr);

    // サーバーの起動
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

// ヘルスチェックエンドポイント
// システムの稼働状態を確認するための単純なGETエンドポイント
async fn health_check() -> Json<Health> {
    Json(Health {
        status: "healthy".to_string(),
    })
}

// シンプルなGETエンドポイント
// パフォーマンステスト用の最小限の処理を行うエンドポイント
async fn simple_endpoint() -> Json<SimpleResponse> {
    Json(SimpleResponse {
        message: "Hello, World!".to_string(),
    })
}

// 複雑な処理を行うPOSTエンドポイント
// JSONリクエストを受け取り、計算処理を実行
async fn complex_endpoint(
    Json(item): Json<Item>,
) -> Json<Response> {
    Json(Response {
        item_name: item.name,
        total_price: item.price * item.quantity as f64,
        status: "processed".to_string(),
    })
}