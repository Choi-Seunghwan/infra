# Sentry 설치 가이드 (ARM64 / t4g.large)

## 0. 전제조건

- EKS 클러스터 준비
- nodegroup 생성 (t4g.large, ARM64, min=2)

## 1. 설치

```bash
helm install sentry ./helm-charts/sentry -n sentry --create-namespace -f ./helm-charts/sentry/values.yaml --timeout 20m
```

설치 상태 확인:
```bash
kubectl get pods -n sentry -w
```


## 2. 접속

**도메인**: https://sentry.domain.com
**로컬**: `kubectl port-forward -n sentry svc/sentry-nginx 9000:80` 후 http://localhost:9000

기본 계정 (values.yaml에서 설정):
- Email:
- Password:

## 3. 업그레이드

```bash
helm upgrade sentry ./helm-charts/sentry -n sentry -f ./helm-charts/sentry/values.yaml --timeout 20m
```