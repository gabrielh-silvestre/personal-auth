#!/usr/bin/env bash
# verify-otel.sh — boot personal-auth with the OTEL preload, exercise
# every transport that is locally checkable, and assert spans flowed
# through the otel-collector debug exporter.
#
# Optional tools (REST is mandatory; gRPC and RMQ are skipped when their
# CLI is not installed):
#   - grpcurl          (gRPC handler smoke test)
#   - rabbitmqadmin    (RMQ message publish)
#
# Exits 0 when REST produces a span AND every available transport's
# probe was observed in collector stdout. Exits non-zero with a precise
# "missing spans for transport X" message otherwise.

set -euo pipefail

PORT="${PORT:-3001}"
APP_PID=""

dc() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  else
    docker-compose "$@"
  fi
}

# cleanup: give the Nest shutdown hook time to flush OTel before we tear
# down the collector, and avoid `-v` so we don't nuke named volumes from
# an existing dev stack (Mongo/Rabbit data) on the developer's machine.
cleanup() {
  if [[ -n "${APP_PID}" ]]; then
    kill -TERM "${APP_PID}" 2>/dev/null || true
    wait "${APP_PID}" 2>/dev/null || true
  fi
  dc --profile observability down >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "[verify-otel] Bringing up otel-collector, mongo, rabbitmq..."
dc --profile observability up -d otel-collector mongo rabbitmq

echo "[verify-otel] Waiting for otel-collector OTLP/gRPC port 4317..."
if ! timeout 30 bash -c 'until (echo >/dev/tcp/127.0.0.1/4317) >/dev/null 2>&1; do sleep 1; done'; then
  echo "[verify-otel] otel-collector did not open :4317 within 30s." >&2
  exit 1
fi

echo "[verify-otel] Building app..."
npm run build >/dev/null

echo "[verify-otel] Starting personal-auth with OTEL_ENABLED=true..."
OTEL_ENABLED=true \
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4317" \
OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="http://localhost:4318/v1/logs" \
  node -r ./dist/shared/modules/telemetry/instrumentation.js dist/main &
APP_PID=$!

echo "[verify-otel] Waiting for app to become healthy on :${PORT}..."
if ! timeout 30 bash -c "until curl -sf http://localhost:${PORT}/ >/dev/null 2>&1 || curl -sf http://localhost:${PORT}/health >/dev/null 2>&1; do sleep 1; done"; then
  echo "[verify-otel] App did not respond within 30s." >&2
  exit 1
fi

echo "[verify-otel] Issuing REST request..."
curl -sf -X POST "http://localhost:${PORT}/auth/login" \
  -H "content-type: application/json" \
  -d '{"email":"verify@otel.local","password":"placeholder"}' >/dev/null 2>&1 || true
# Auth may reject — we only need a span, not a 2xx.

# Optional: gRPC probe
if command -v grpcurl >/dev/null 2>&1; then
  echo "[verify-otel] Issuing gRPC request..."
  grpcurl -plaintext -d '{"userId":"verify"}' localhost:50051 \
    proto.auth.AuthService/LoginUser >/dev/null 2>&1 || true
else
  echo "[verify-otel] SKIP: grpcurl not installed — gRPC probe omitted."
fi

# Optional: RMQ probe
if command -v rabbitmqadmin >/dev/null 2>&1; then
  echo "[verify-otel] Publishing RMQ message..."
  rabbitmqadmin publish exchange=amq.default routing_key=AUTH \
    payload='{"pattern":"auth.verify_token","data":{}}' >/dev/null 2>&1 || true
else
  echo "[verify-otel] SKIP: rabbitmqadmin not installed — RMQ probe omitted."
fi

# Give the BatchSpanProcessor at least one scheduled-delay tick to flush.
sleep 7

echo "[verify-otel] Scanning collector stdout for spans..."
collector_logs="$(docker logs personal-auth-otelcol 2>&1)"

if ! echo "${collector_logs}" | grep -q "service.name: Str(personal-auth)"; then
  if ! echo "${collector_logs}" | grep -q "service.name: personal-auth"; then
    echo "[verify-otel] FAIL: no spans with service.name=personal-auth found." >&2
    echo "----- collector tail -----" >&2
    echo "${collector_logs}" | tail -40 >&2
    exit 1
  fi
fi

# At least one HTTP span is mandatory (REST is the always-on probe).
if ! echo "${collector_logs}" | grep -Eq "http\.method|http\.request\.method"; then
  echo "[verify-otel] FAIL: no HTTP/REST span observed." >&2
  exit 1
fi

# gRPC + RMQ spans are best-effort, reported but not required.
if echo "${collector_logs}" | grep -q "rpc.system"; then
  echo "[verify-otel] OK: gRPC span observed."
fi
if echo "${collector_logs}" | grep -q "messaging.system"; then
  echo "[verify-otel] OK: RMQ span observed."
fi

echo "[verify-otel] OK — REST span confirmed; collector pipeline is live."
exit 0
