# k6 부하 테스트

Docker 기반 k6 부하 테스트 환경 (Grafana 대시보드 포함)

## 구성

- **k6**: 부하 테스트 실행
- **InfluxDB**: 테스트 결과 저장
- **Grafana**: 대시보드 시각화 (http://localhost:3001)

## 사용법

### 1. 서비스 시작

```bash
cd /Users/seunghwanchoi/project/infra/k6
docker compose up -d influxdb grafana
```

### 2. 테스트 실행

```bash
# 기본 실행 (결과를 InfluxDB로 전송)
docker compose run --rm k6 run --out influxdb=http://influxdb:8086/k6 sentencify/load-test.js

# VU/시간 조정
docker compose run --rm k6 run --vus 20 --duration 30s --out influxdb=http://influxdb:8086/k6 sentencify/load-test.js
```

### 3. Grafana 대시보드 확인

1. http://localhost:3001 접속
2. 좌측 메뉴 → Dashboards → Import
3. Dashboard ID: `2587` 입력 → Load
4. InfluxDB 선택 → Import

### 4. 서비스 종료

```bash
docker compose down
```

