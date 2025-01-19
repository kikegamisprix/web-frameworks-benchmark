// Expressフレームワークをインポート
const express = require("express");
const app = express();

// JSONボディパーサーミドルウェアを追加
// リクエストボディをJSONとして解析する
app.use(express.json());

// ヘルスチェックエンドポイント
// システムの稼働状態を確認するための単純なGETエンドポイント
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// シンプルなGETエンドポイント
// パフォーマンステスト用の最小限の処理を行うエンドポイント
app.get("/simple", (req, res) => {
  res.json({ message: "Hello, World!" });
});

// 複雑な処理を行うPOSTエンドポイント
// リクエストボディから必要なデータを分割代入で取得
app.post("/complex", (req, res) => {
  // リクエストボディから必要なフィールドを分割代入
  const { name, price, quantity } = req.body;
  res.json({
    item_name: name,
    total_price: price * quantity,
    status: "processed",
  });
});

// サーバーの設定とポート番号
const PORT = 3000;
// サーバーを起動し、指定されたポートでリッスン開始
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
