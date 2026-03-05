# OpenTelemetry Local Stack (Tempo + Grafana)

로컬에서 OpenLLMetry / OpenTelemetry 트레이싱을 테스트하기 위한 설정입니다.

## 구성

- **Tempo**: 트레이스 저장/조회 백엔드
- **Grafana**: 시각화 대시보드

## 실행

```bash
cd ~/project/infra/otel
docker-compose up -d
```

## 접속

- **Grafana**: http://localhost:3000 (로그인 불필요)
- **Tempo API**: http://localhost:3200

## 앱 연동

환경변수 설정 후 앱 실행:

```bash
TRACELOOP_BASE_URL=http://localhost:4318 \
uv run fastapi run src/sentencify_backend/main.py --reload
```

## 트레이스 확인

1. Grafana (http://localhost:3000) 접속
2. 좌측 메뉴 → Explore
3. 데이터소스: Tempo 선택
4. Search 탭에서 트레이스 검색

## 종료

```bash
docker-compose down
```

## 데이터 완전 삭제

```bash
docker-compose down -v
```
