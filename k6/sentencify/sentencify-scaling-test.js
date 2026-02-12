import http from "k6/http";
import { check } from "k6";

// 환경변수로 RPM 조절 가능 (기본값: 1000)
const TARGET_RPM = parseInt(__ENV.RATE) || 1000;

// 확장성 테스트 설정 - Pod별 처리량 측정
export const options = {
  scenarios: {
    scaling_test: {
      executor: "constant-arrival-rate",
      rate: TARGET_RPM,
      timeUnit: "1m",
      duration: "1m",
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
  },
};

const BASE_URL = __ENV.BASE_URL || "https://stg-api.sentencify.ai";

const HEADERS = {
  "Content-Type": "application/json",
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
    timeout: "30s",
  });

  check(res, {
    "응답 200": (r) => r.status === 200,
  });
}

// 테스트 종료 후 요약
export function handleSummary(data) {
  const totalRequests = data.metrics.http_reqs.values.count;
  const avgDuration = data.metrics.http_req_duration.values.avg;
  const p95Duration = data.metrics.http_req_duration.values["p(95)"];

  console.log("");
  console.log("╔════════════════════════════════════════╗");
  console.log("║       확장성 테스트 결과 (RPM)         ║");
  console.log("╠════════════════════════════════════════╣");
  console.log(`║  테스트 목표    : ${TARGET_RPM} RPM`.padEnd(41) + "║");
  console.log(`║  실제 처리량    : ${totalRequests} RPM`.padEnd(41) + "║");
  console.log("╠════════════════════════════════════════╣");
  console.log(
    `║  평균 응답 시간 : ${avgDuration.toFixed(0)}ms`.padEnd(41) + "║",
  );
  console.log(
    `║  P95 응답 시간  : ${p95Duration.toFixed(0)}ms`.padEnd(41) + "║",
  );
  console.log("╠════════════════════════════════════════╣");

  // 500 RPM 목표 달성 여부 표시
  const goalMet = totalRequests >= 500;
  const goalStatus = goalMet ? "✓ 달성" : "✗ 미달";
  console.log(`║  500+ RPM 목표  : ${goalStatus}`.padEnd(41) + "║");
  console.log("╚════════════════════════════════════════╝");
  console.log("");

  return {
    stdout: JSON.stringify(data, null, 2),
  };
}
