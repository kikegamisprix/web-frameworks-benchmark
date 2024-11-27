import http from "k6/http";
import { check, sleep, group } from "k6";
import { Trend, Rate } from "k6/metrics";

// カスタムメトリクスの定義
const trends = {
  fastapi: new Trend("fastapi_duration"),
  node: new Trend("node_duration"),
  go: new Trend("go_duration"),
  rust: new Trend("rust_duration"),
};

const errorRates = {
  fastapi: new Rate("fastapi_errors"),
  node: new Rate("node_errors"),
  go: new Rate("go_errors"),
  rust: new Rate("rust_errors"),
};

export const options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "1m", target: 20 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    fastapi_duration: ["p(95)<500"],
    node_duration: ["p(95)<500"],
    go_duration: ["p(95)<500"],
    rust_duration: ["p(95)<500"],
    fastapi_errors: ["rate<0.01"],
    node_errors: ["rate<0.01"],
    go_errors: ["rate<0.01"],
    rust_errors: ["rate<0.01"],
  },
};

const BASE_URLS = {
  fastapi: "http://fastapi-app:8000",
  node: "http://node-app:3000",
  go: "http://go-app:8080",
  rust: "http://rust-app:8090",
};

export default function () {
  for (const [service, baseUrl] of Object.entries(BASE_URLS)) {
    group(`${service} tests`, function () {
      group("simple endpoint", function () {
        const simpleRes = http.get(`${baseUrl}/simple`);
        trends[service].add(simpleRes.timings.duration);

        const simpleCheck = check(simpleRes, {
          "status is 200": (r) => r.status === 200,
          "duration < 500ms": (r) => r.timings.duration < 500,
        });

        if (!simpleCheck) {
          errorRates[service].add(1);
        }
      });

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
  sleep(1);
}

export function handleSummary(data) {
  const summary = {
    fastapi: {
      avg_duration: data.metrics.fastapi_duration.values.avg,
      p90_duration: data.metrics.fastapi_duration.values["p(90)"],
      p95_duration: data.metrics.fastapi_duration.values["p(95)"],
      error_rate: data.metrics.fastapi_errors.values.rate,
      requests: data.metrics.fastapi_duration.values.count,
    },
    node: {
      avg_duration: data.metrics.node_duration.values.avg,
      p90_duration: data.metrics.node_duration.values["p(90)"],
      p95_duration: data.metrics.node_duration.values["p(95)"],
      error_rate: data.metrics.node_errors.values.rate,
      requests: data.metrics.node_duration.values.count,
    },
    go: {
      avg_duration: data.metrics.go_duration.values.avg,
      p90_duration: data.metrics.go_duration.values["p(90)"],
      p95_duration: data.metrics.go_duration.values["p(95)"],
      error_rate: data.metrics.go_errors.values.rate,
      requests: data.metrics.go_duration.values.count,
    },
    rust: {
      avg_duration: data.metrics.rust_duration.values.avg,
      p90_duration: data.metrics.rust_duration.values["p(90)"],
      p95_duration: data.metrics.rust_duration.values["p(95)"],
      error_rate: data.metrics.rust_errors.values.rate,
      requests: data.metrics.rust_duration.values.count,
    },
  };

  return {
    stdout: JSON.stringify(summary, null, 2),
  };
}
