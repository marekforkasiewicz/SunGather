# Health Check Endpoint Documentation

## Overview

SunGather now includes built-in health check endpoints for monitoring application status and enabling automatic restart/recovery in containerized environments.

## Endpoints

### 1. Basic Health Check

**Endpoint:** `GET /health`

**Purpose:** Simple health status check - returns HTTP 200 if healthy

**Response:**
```json
{
  "status": "healthy",
  "version": "0.5.0"
}
```

**Status Codes:**
- `200 OK` - Application is healthy
- `503 Service Unavailable` - Application is degraded or unhealthy

**Status Values:**
- `healthy` - Everything working normally
- `degraded` - Partial functionality (some issues)
- `unhealthy` - Critical issues

---

### 2. Detailed Health Check

**Endpoint:** `GET /health/detailed`

**Purpose:** Comprehensive health information with metrics

**Response:**
```json
{
  "status": "healthy",
  "version": "0.5.0",
  "uptime_seconds": 3665,
  "uptime_human": "1h 1m 5s",
  "last_scrape_time": "2026-01-06T14:48:23.456789",
  "last_scrape_success": true,
  "total_registers": 42,
  "inverter_connected": true,
  "timestamp": "2026-01-06T14:50:00.123456"
}
```

**Fields:**
- `status` - Current health status
- `version` - SunGather version
- `uptime_seconds` - Application uptime in seconds
- `uptime_human` - Human-readable uptime (e.g., "1d 2h 30m")
- `last_scrape_time` - ISO timestamp of last successful data scrape
- `last_scrape_success` - Boolean indicating if last scrape succeeded
- `total_registers` - Number of registers read from inverter
- `inverter_connected` - Connection status to inverter
- `timestamp` - Current server timestamp

---

## Docker Integration

### Docker Run

```bash
docker run -d --name sungather \
  --restart unless-stopped \
  -v $(pwd)/config.yaml:/config/config.yaml \
  -v $(pwd)/logs:/logs \
  -e TZ=Europe/Warsaw \
  -p 8080:8080 \
  sungather:latest
```

The Dockerfile includes a HEALTHCHECK:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl --fail http://localhost:8080/health || exit 1
```

**Check container health:**
```bash
docker ps
# Look for STATUS column: "healthy" or "unhealthy"

docker inspect --format='{{.State.Health.Status}}' sungather
```

---

### Docker Compose

```yaml
version: '3.8'

services:
  sungather:
    image: sungather:latest
    container_name: sungather
    restart: unless-stopped
    volumes:
      - ./config.yaml:/config/config.yaml
      - ./logs:/logs
    environment:
      - TZ=Europe/Warsaw
    ports:
      - "8080:8080"
    healthcheck:
      test: ["CMD", "curl", "--fail", "http://localhost:8080/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
```

---

## Kubernetes Integration

### Liveness Probe

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: sungather
spec:
  containers:
  - name: sungather
    image: sungather:latest
    ports:
    - containerPort: 8080
    livenessProbe:
      httpGet:
        path: /health
        port: 8080
      initialDelaySeconds: 40
      periodSeconds: 30
      timeoutSeconds: 3
      failureThreshold: 3
```

### Readiness Probe

```yaml
    readinessProbe:
      httpGet:
        path: /health/detailed
        port: 8080
      initialDelaySeconds: 20
      periodSeconds: 10
      timeoutSeconds: 2
      successThreshold: 1
      failureThreshold: 3
```

---

## Monitoring Integration

### Prometheus

Use blackbox_exporter to monitor health endpoint:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'sungather-health'
    metrics_path: /probe
    params:
      module: [http_2xx]
    static_configs:
      - targets:
        - http://sungather:8080/health
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115
```

### Grafana Alert

```yaml
alert: SunGatherDown
expr: up{job="sungather-health"} == 0
for: 5m
labels:
  severity: critical
annotations:
  summary: "SunGather is down"
  description: "SunGather has been down for more than 5 minutes"
```

---

## Testing

### Manual Test

```bash
# Basic health check
curl http://localhost:8080/health

# Detailed health check
curl http://localhost:8080/health/detailed | jq

# Check HTTP status
curl -I http://localhost:8080/health
```

### Automated Test Script

```bash
#!/bin/bash
# healthcheck.sh

HOST="localhost:8080"
MAX_RETRIES=3
RETRY_DELAY=5

for i in $(seq 1 $MAX_RETRIES); do
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://$HOST/health")
    
    if [ "$response" -eq 200 ]; then
        echo "✓ Health check passed"
        exit 0
    fi
    
    echo "✗ Attempt $i failed (HTTP $response)"
    
    if [ $i -lt $MAX_RETRIES ]; then
        sleep $RETRY_DELAY
    fi
done

echo "✗ Health check failed after $MAX_RETRIES attempts"
exit 1
```

---

## Use Cases

### 1. Automatic Container Restart

Docker automatically restarts unhealthy containers:
```bash
docker run --restart=on-failure:3 ...
```

### 2. Load Balancer Health Checks

Configure your load balancer (nginx, HAProxy) to check `/health`:

**nginx:**
```nginx
upstream sungather {
    server sungather1:8080 max_fails=3 fail_timeout=30s;
    server sungather2:8080 max_fails=3 fail_timeout=30s;
}

location / {
    proxy_pass http://sungather;
    proxy_next_upstream error timeout http_503;
}
```

### 3. CI/CD Integration

In your deployment pipeline:
```yaml
# .github/workflows/deploy.yml
- name: Wait for healthy status
  run: |
    timeout 60 bash -c 'until curl -f http://sungather:8080/health; do sleep 2; done'
```

### 4. Monitoring Dashboard

Query the detailed endpoint periodically and display metrics in your dashboard.

---

## Troubleshooting

### Health Check Fails

1. **Check webserver is enabled in config:**
   ```yaml
   exports:
     - name: webserver
       enabled: True
       port: 8080
   ```

2. **Verify port is accessible:**
   ```bash
   netstat -tuln | grep 8080
   ```

3. **Check container logs:**
   ```bash
   docker logs sungather
   ```

4. **Test from inside container:**
   ```bash
   docker exec sungather curl localhost:8080/health
   ```

### Common Issues

- **Port conflict:** Another service using port 8080
- **Webserver disabled:** Health check requires webserver export to be enabled
- **Network issues:** Container network misconfiguration
- **Permission issues:** User 'sungather' can't bind to port

---

## Best Practices

1. **Always enable webserver export** if using health checks
2. **Set appropriate intervals** - not too frequent to avoid overhead
3. **Use start-period** to allow application initialization time
4. **Monitor /health/detailed** for proactive issue detection
5. **Set up alerts** for when health status degrades
6. **Test health checks** in staging before production

---

## Future Enhancements

- [ ] Health check for MQTT connection status
- [ ] Health check for InfluxDB write success
- [ ] Configurable health check thresholds
- [ ] Health history endpoint
- [ ] Webhook notifications on health status change
