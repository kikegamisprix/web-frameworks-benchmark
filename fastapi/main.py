from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    quantity: int

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/simple")
async def simple_endpoint():
    return {"message": "Hello, World!"}

@app.post("/complex")
async def complex_endpoint(item: Item):
    total = item.price * item.quantity
    return {
        "item_name": item.name,
        "total_price": total,
        "status": "processed"
    }
