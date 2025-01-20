// カスタムメトリクスの定義
import http from "k6/http";
import { check, sleep, group } from "k6";
import { Trend, Rate } from "k6/metrics";

// 各フレームワークのレスポンス時間を計測するためのカスタムメトリクス
const trends = {
  fastapi: new Trend("fastapi_duration"),
  node: new Trend("node_duration"),
  go: new Trend("go_duration"),
  rust: new Trend("rust_duration"),
};

// 各フレームワークのエラー率を計測するためのカスタムメトリクス
const errorRates = {
  fastapi: new Rate("fastapi_errors"),
  node: new Rate("node_errors"),
  go: new Rate("go_errors"),
  rust: new Rate("rust_errors"),
};

// テストの全体設定
export const options = {
  // 負荷テストのステージ設定
  stages: [
    { duration: "30s", target: 20 }, // 0→20ユーザーまで30秒かけて増加
    { duration: "1m", target: 20 }, // 1分間で20人のユーザーがアクセス
    { duration: "30s", target: 0 }, // 20→0ユーザーまで30秒かけて減少
  ],
  // メトリクスの閾値設定
  thresholds: {
    // 各フレームワークのリクエストの95パーセンタイルが500ms未満であることを期待
    fastapi_duration: ["p(95)<500"],
    node_duration: ["p(95)<500"],
    go_duration: ["p(95)<500"],
    rust_duration: ["p(95)<500"],
    // エラー率が1%未満であることを期待
    fastapi_errors: ["rate<0.01"],
    node_errors: ["rate<0.01"],
    go_errors: ["rate<0.01"],
    rust_errors: ["rate<0.01"],
  },
};

// テスト対象のエンドポイント定義
const BASE_URLS = {
  fastapi: "http://fastapi-app:8000",
  node: "http://node-app:3000",
  go: "http://go-app:8080",
  rust: "http://rust-app:8090",
};

// メインのテスト関数
export default function () {
  // 各フレームワークに対してテストを実行
  for (const [service, baseUrl] of Object.entries(BASE_URLS)) {
    // フレームワークごとにグループ化してテストを実行
    group(`${service} tests`, function () {
      // シンプルなGETリクエストのテスト
      group("simple endpoint", function () {
        const simpleRes = http.get(`${baseUrl}/simple`);
        // レスポンス時間を記録
        trends[service].add(simpleRes.timings.duration);

        // レスポンスのチェック
        const simpleCheck = check(simpleRes, {
          "status is 200": (r) => r.status === 200,
          "duration < 500ms": (r) => r.timings.duration < 500,
        });

        // チェックが失敗した場合、エラーとしてカウント
        if (!simpleCheck) {
          errorRates[service].add(1);
        }
      });

      // 複雑なPOSTリクエストのテスト
      group("complex endpoint", function () {
        const payload = JSON.stringify({
          name: "test item",
          price: 10.99,
          quantity: 5,
        });

        const params = {
          headers: {
            "Content-Type": "application/json",
          },
        };

        const complexRes = http.post(`${baseUrl}/complex`, payload, params);
        trends[service].add(complexRes.timings.duration);

        const complexCheck = check(complexRes, {
          "status is 200": (r) => r.status === 200,
          "duration < 500ms": (r) => r.timings.duration < 500,
        });

        if (!complexCheck) {
          errorRates[service].add(1);
        }
      });
    });
  }
  // 次のイテレーションまで1秒待機
  sleep(1);
}

/**
 * テスト実行後のサマリーレポートを生成する関数
 * @param {Object} data - k6が収集した全メトリクスデータ
 * @returns {Object} - 標準出力用にフォーマットされたサマリーレポート
 */
export function handleSummary(data) {
  // 各フレームワークのパフォーマンスメトリクスを集計
  const summary = {
    // FastAPIのメトリクス
    fastapi: {
      avg_duration: data.metrics.fastapi_duration.values.avg, // 平均応答時間
      p90_duration: data.metrics.fastapi_duration.values["p(90)"], // 90パーセンタイルの応答時間
      p95_duration: data.metrics.fastapi_duration.values["p(95)"], // 95パーセンタイルの応答時間
      error_rate: data.metrics.fastapi_errors.values.rate, // エラー発生率
    },
    // Node.jsのメトリクス
    node: {
      avg_duration: data.metrics.node_duration.values.avg, // 平均応答時間
      p90_duration: data.metrics.node_duration.values["p(90)"], // 90パーセンタイルの応答時間
      p95_duration: data.metrics.node_duration.values["p(95)"], // 95パーセンタイルの応答時間
      error_rate: data.metrics.node_errors.values.rate, // エラー発生率
    },
    // Goのメトリクス
    go: {
      avg_duration: data.metrics.go_duration.values.avg, // 平均応答時間
      p90_duration: data.metrics.go_duration.values["p(90)"], // 90パーセンタイルの応答時間
      p95_duration: data.metrics.go_duration.values["p(95)"], // 95パーセンタイルの応答時間
      error_rate: data.metrics.go_errors.values.rate, // エラー発生率
    },
    // Rustのメトリクス
    rust: {
      avg_duration: data.metrics.rust_duration.values.avg, // 平均応答時間
      p90_duration: data.metrics.rust_duration.values["p(90)"], // 90パーセンタイルの応答時間
      p95_duration: data.metrics.rust_duration.values["p(95)"], // 95パーセンタイルの応答時間
      error_rate: data.metrics.rust_errors.values.rate, // エラー発生率
    },
  };

  // 結果を見やすい形式（インデント付きJSON）で標準出力に返す
  return {
    stdout: JSON.stringify(summary, null, 2),
  };
}
