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

## Kubernetes

### Sentry Self-Hosted

`helm-sentry-hosted/` Sentry 배포용 Helm 차트 설정이 있음

설치 방법은 [helm-sentry-hosted/INSTALL.md](helm-sentry-hosted/INSTALL.md) 참조




## 주의사항

민감 정보는(credentials, secrets 등) `.gitignore`를 통해 제외됨
- `*.env` 파일
- `*.pem` 파일
- 각 서비스별 데이터/백업 디렉토리