# k6 부하 테스트

Docker 기반 k6 부하 테스트 환경 (Grafana 대시보드 포함)

## 구성

- **k6**: 부하 테스트 실행
- **InfluxDB**: 테스트 결과 저장
- **Grafana**: 대시보드 시각화 (http://localhost:3001)

## 파일 구조

```
k6/
├── docker-compose.yml    # Docker 설정
├── load-test.js          # 범용 부하 테스트 스크립트
├── .env.example          # 환경변수 예시
├── .env                  # 환경변수 (직접 생성)
├── example-data.json     # 데이터 파일 예시
└── {서비스명}/           # 서비스별 설정
    └── data.json         # 서비스별 데이터 파일
```

## 환경 변수

| 변수 | 설명 | 예시 |
|------|------|------|
| `BASE_URL` | API 기본 URL | `https://api.example.com` |
| `ENDPOINT` | API 엔드포인트 | `/v1/users` |
| `DATA_FILE` | JSON 데이터 파일 경로 | `./my-service/data.json` |

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `RATE` | 분당 요청 수 | `550` |
| `DURATION` | 테스트 지속 시간 | `1m` |
| `VUS` | 사전 할당 VU 수 | `50` |
| `MAX_VUS` | 최대 VU 수 | `100` |
| `TIMEOUT` | 요청 타임아웃 | `30s` |
| `AUTH_TOKEN` | Bearer 토큰 | - |

## 사용법

### 1. 환경 설정

```bash
# .env 파일 생성
cp .env.example .env

# .env 파일 수정
vi .env
```

### 2. 데이터 파일 준비

JSON 파일에 요청 body를 정의합니다.

**배열 형태** (랜덤 선택):
```json
[
  { "key": "value1" },
  { "key": "value2" }
]
```

**단일 객체** (동일 요청):
```json
{ "key": "value" }
```

### 3. 서비스 시작

```bash
docker compose up -d influxdb grafana
```

### 4. 테스트 실행

```bash
# 기본 실행 (결과를 InfluxDB로 전송)
docker compose run --rm k6 run --out influxdb=http://influxdb:8086/k6 load-test.js

# VU/시간 직접 조정 (환경변수 덮어쓰기)
docker compose run --rm -e RATE=1000 -e DURATION=5m k6 run --out influxdb=http://influxdb:8086/k6 load-test.js
```

### 5. Grafana 대시보드 확인

1. http://localhost:3001 접속
2. 좌측 메뉴 → Dashboards → Import
3. Dashboard ID: `2587` 입력 → Load
4. InfluxDB 선택 → Import

### 6. 종료

```bash
docker compose down
```
