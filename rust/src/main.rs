use axum::{
    routing::{get, post},
    Router, Json, extract::State,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;

#[derive(Debug, Serialize, Deserialize)]
struct Item {
    name: String,
    price: f64,
    quantity: i32,
}

#[derive(Debug, Serialize)]
struct Response {
    item_name: String,
    total_price: f64,
    status: String,
}

#[derive(Debug, Serialize)]
struct Health {
    status: String,
}

#[derive(Debug, Serialize)]
struct SimpleResponse {
    message: String,
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/simple", get(simple_endpoint))
        .route("/complex", post(complex_endpoint))
        .layer(CorsLayer::permissive());

    let addr = SocketAddr::from(([0, 0, 0, 0], 8090));
    println!("Listening on {}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn health_check() -> Json<Health> {
    Json(Health {
        status: "healthy".to_string(),
    })
}

async fn simple_endpoint() -> Json<SimpleResponse> {
    Json(SimpleResponse {
        message: "Hello, World!".to_string(),
    })
}

async fn complex_endpoint(
    Json(item): Json<Item>,
) -> Json<Response> {
    Json(Response {
        item_name: item.name,
        total_price: item.price * item.quantity as f64,
        status: "processed".to_string(),
    })
}