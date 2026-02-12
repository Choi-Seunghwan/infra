import http from "k6/http";
import { check } from "k6";
import { Rate } from "k6/metrics";

// 커스텀 메트릭 (check 실패율 추적)
const errorRate = new Rate("errors");

// 테스트 설정 - 500 RPM 시나리오
export const options = {
  scenarios: {
    load_test: {
      executor: "constant-arrival-rate",
      rate: 500, // 분당 500 요청
      timeUnit: "1m",
      duration: "1m", // 1분간 테스트
      preAllocatedVUs: 50, // 사전 할당 VU
      maxVUs: 100, // 최대 VU (응답 느리면 자동 증가)
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<5000"], // 95%가 5초 이내
    errors: ["rate<0.10"], // 에러율 10% 미만
  },
};

const BASE_URL = __ENV.BASE_URL || "https://stg-api.sentencify.ai";

const HEADERS = {
  "Content-Type": "application/json",
  // 'Authorization': 'Bearer YOUR_TOKEN',  // 필요시
};

// 테스트용 예제 문장 (15자 이내)
const sampleSentences = [
  "안녕하세요 반갑습니당",
  "오늘 날씨가 조아요",
  "맛있는거 먹고싶다",
  "회의일정 알려주세요",
  "감사합니당 수고하세요",
  "이메일 보내 주세요",
  "내일 뭐해요?",
  "보고서 검토부탁드려요",
  "저녁 뭐먹을까요",
  "수고 하셨습니다",
];

export default function () {
  // 랜덤 문장 선택
  const randomSentence =
    sampleSentences[Math.floor(Math.random() * sampleSentences.length)];

  const payload = JSON.stringify({
    sentence_request: {
      input_sentence: randomSentence,
      field: "none",
      language: "Korean",
      maintenance: "standard",
    },
  });

  const res = http.post(`${BASE_URL}/sentence/operation/v2`, payload, {
    headers: HEADERS,
    timeout: "30s", // SSE 스트리밍 응답 대기
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
  const totalRequests = data.metrics.http_reqs.values.count;
  const avgDuration = data.metrics.http_req_duration.values.avg;
  const p95Duration = data.metrics.http_req_duration.values["p(95)"];
  const successRate = (1 - data.metrics.errors.values.rate) * 100;

  console.log("");
  console.log("╔════════════════════════════════════════╗");
  console.log("║     응답 속도 테스트 결과 (P95)        ║");
  console.log("╠════════════════════════════════════════╣");
  console.log(`║  총 요청 수     : ${totalRequests}건`.padEnd(41) + "║");
  console.log(
    `║  평균 응답 시간 : ${avgDuration.toFixed(0)}ms`.padEnd(41) + "║",
  );
  console.log(
    `║  P95 응답 시간  : ${p95Duration.toFixed(0)}ms`.padEnd(41) + "║",
  );
  console.log("╠════════════════════════════════════════╣");
  console.log(
    `║  5초 이내 응답  : ${successRate.toFixed(1)}%`.padEnd(41) + "║",
  );
  console.log("╠════════════════════════════════════════╣");

  // P95 < 5초 목표 달성 여부 표시
  const goalMet = p95Duration < 5000;
  const goalStatus = goalMet ? "✓ 달성" : "✗ 미달";
  console.log(`║  P95 < 5초 목표 : ${goalStatus}`.padEnd(41) + "║");
  console.log("╚════════════════════════════════════════╝");
  console.log("");

  return {
    stdout: JSON.stringify(data, null, 2),
  };
}
