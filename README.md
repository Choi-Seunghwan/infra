# Infra

개발 업무에 필요한 인프라 설정들을 관리하는 저장소입니다.

- Terraform 설정
- AWS 인프라 설정
- 로컬 인프라 설정
- 기타 클라우드 리소스 관리

## 로컬 데이터베이스

### PostgreSQL

```bash
cd postgresql
docker compose up -d
```
- 포트: 5432
- 버전: PostgreSQL 14

### MongoDB

```bash
cd mongodb
docker compose up -d
```
- 포트: 27017
- 버전: MongoDB latest

### Redis

```bash
cd redis
docker compose up -d
```
- 포트: 6379
- 버전: Redis 7 (Alpine)

## 부하 테스트 (k6)

Docker 기반 k6 부하 테스트 환경 (Grafana 대시보드 포함)

```bash
cd k6

# 환경변수 설정
cp .env.example .env

# 서비스 시작 및 테스트 실행
docker compose up -d influxdb grafana
docker compose run --rm k6 run --out influxdb=http://influxdb:8086/k6 load-test.js
```

- Grafana 대시보드: http://localhost:3001
- 상세 설정: [k6/README.md](k6/README.md)

## Kubernetes

### Sentry Self-Hosted

`helm-sentry-hosted/` Sentry 배포용 Helm 차트 설정이 있음

설치 방법은 [helm-sentry-hosted/INSTALL.md](helm-sentry-hosted/INSTALL.md) 참조




## 주의사항

민감 정보는(credentials, secrets 등) `.gitignore`를 통해 제외됨
- `*.env` 파일
- `*.pem` 파일
- 각 서비스별 데이터/백업 디렉토리