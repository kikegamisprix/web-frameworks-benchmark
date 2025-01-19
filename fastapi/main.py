# FastAPIフレームワークとPydanticのBaseModelをインポート
# FastAPIは非同期処理とOpenAPI(Swagger)ドキュメントの自動生成が特徴
from fastapi import FastAPI
from pydantic import BaseModel

# FastAPIアプリケーションのインスタンスを作成
app = FastAPI()

# リクエストボディのバリデーション用Pydanticモデル
# Pydanticによって型チェックと自動バリデーションが行われる
class Item(BaseModel):
    name: str   # 商品名
    price: float  # 価格
    quantity: int  # 数量

# ヘルスチェックエンドポイント
# システムの稼働状態を確認するための単純なGETエンドポイント
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# シンプルなGETエンドポイント
# パフォーマンステスト用の最小限の処理を行うエンドポイント
@app.get("/simple")
async def simple_endpoint():
    return {"message": "Hello, World!"}

# 複雑な処理を行うPOSTエンドポイント
# リクエストボディとしてItemモデルを受け取り、計算処理を実行
@app.post("/complex")
async def complex_endpoint(item: Item):
    # 価格と数量から合計金額を計算
    total = item.price * item.quantity
    return {
        "item_name": item.name,
        "total_price": total,
        "status": "processed"
    }
