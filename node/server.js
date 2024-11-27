const express = require("express");
const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

app.get("/simple", (req, res) => {
  res.json({ message: "Hello, World!" });
});

app.post("/complex", (req, res) => {
  const { name, price, quantity } = req.body;
  res.json({
    item_name: name,
    total_price: price * quantity,
    status: "processed",
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
