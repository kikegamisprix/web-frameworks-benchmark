# 🚀 Web フレームワーク パフォーマンス比較

FastAPI、Node.js、Go、Rust のパフォーマンスを比較するベンチマークツール

## 🎯 動作環境

AWS EC2 インスタンス（t3.medium 以上推奨）

## 🛠 セットアップ

```bash
# パッケージのインストール
sudo yum update -y
sudo yum install -y docker git
sudo service docker start
sudo usermod -a -G docker ec2-user

# Docker Composeのインストール
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 📊 ベンチマーク実行

```bash
# リポジトリのクローンと移動
git clone https://github.com/kikegamisprix/web-frameworks-benchmark.git
cd web-frameworks-benchmark.git

# コンテナの起動
docker compose up -d

# ベンチマークの実行
docker compose run benchmark run /scripts/test.js
```

## 📈 結果の確認

Grafana ダッシュボード: `http://[EC2-IP]:3001`
