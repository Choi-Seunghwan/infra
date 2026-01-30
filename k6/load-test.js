import http from "k6/http";
import { check } from "k6";
import { Rate } from "k6/metrics";

// 필수 환경 변수 체크
if (!__ENV.BASE_URL) {
  throw new Error("BASE_URL 환경 변수가 필요합니다.");
}
if (!__ENV.ENDPOINT) {
  throw new Error("ENDPOINT 환경 변수가 필요합니다.");
}
if (!__ENV.DATA_FILE) {
  throw new Error("DATA_FILE 환경 변수가 필요합니다. (JSON 파일 경로)");
}

// 환경 변수 설정
const BASE_URL = __ENV.BASE_URL;
const ENDPOINT = __ENV.ENDPOINT;
const RATE = parseInt(__ENV.RATE) || 550; // 분당 요청 수
const DURATION = __ENV.DURATION || "1m";
const VUS = parseInt(__ENV.VUS) || 50;
const MAX_VUS = parseInt(__ENV.MAX_VUS) || 100;
const TIMEOUT = __ENV.TIMEOUT || "30s";
const AUTH_TOKEN = __ENV.AUTH_TOKEN || "";

// 외부 JSON 파일에서 데이터 로드
const payloadData = JSON.parse(open(__ENV.DATA_FILE));

// 커스텀 메트릭 (check 실패율 추적)
const errorRate = new Rate("errors");

// 테스트 설정
export const options = {
  scenarios: {
    load_test: {
      executor: "constant-arrival-rate",
      rate: RATE,
      timeUnit: "1m",
      duration: DURATION,
      preAllocatedVUs: VUS,
      maxVUs: MAX_VUS,
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<5000"], // 95%가 5초 이내
    errors: ["rate<0.01"], // 에러율 1% 미만
  },
};

const HEADERS = {
  "Content-Type": "application/json",
  ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
};

export default function () {
  // 배열이면 랜덤 선택, 단일 객체면 그대로 사용
  const data = Array.isArray(payloadData)
    ? payloadData[Math.floor(Math.random() * payloadData.length)]
    : payloadData;

  const payload = JSON.stringify(data);

  const res = http.post(`${BASE_URL}${ENDPOINT}`, payload, {
    headers: HEADERS,
    timeout: TIMEOUT,
  });

  // 응답 체크
  const success = check(res, {
    "응답 200": (r) => r.status === 200,
    "5초 이내": (r) => r.timings.duration < 5000,
  });

  // 에러율 기록
  errorRate.add(!success);
}

// 테스트 종료 후 요약
export function handleSummary(data) {
  console.log("========== 테스트 결과 요약 ==========");
  console.log(`총 요청 수: ${data.metrics.http_reqs.values.count}`);
  console.log(
    `평균 응답 시간: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms`,
  );
  console.log(
    `최대 응답 시간: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms`,
  );
  console.log(
    `95퍼센타일: ${data.metrics.http_req_duration.values["p(95)"].toFixed(2)}ms`,
  );

  return {
    stdout: JSON.stringify(data, null, 2),
  };
}
