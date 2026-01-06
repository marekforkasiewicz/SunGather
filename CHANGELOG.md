# Changelog

All notable changes to SunGather will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Health check endpoint `/health` for basic application status monitoring
- Detailed health check endpoint `/health/detailed` with comprehensive metrics
- Docker HEALTHCHECK support in Dockerfile
- Health check documentation in `docs/HEALTHCHECK.md`
- Uptime tracking in webserver
- Last scrape time and status tracking
- Human-readable uptime formatting

### Changed
- Webserver now tracks application health status
- Added curl to Docker image for health checks

### Technical Details

**Health Check Features:**
- HTTP 200/503 status codes based on application health
- Tracks uptime, last scrape time, register count, inverter connection
- Compatible with Docker, Kubernetes, and monitoring systems
- Configurable health check intervals and timeouts

**Docker Integration:**
- HEALTHCHECK runs every 30 seconds
- 40 second start period for initialization
- 3 retry attempts before marking unhealthy
- Automatic container restart on health check failure

**Monitoring Integration:**
- Compatible with Prometheus blackbox_exporter
- Kubernetes liveness and readiness probes
- Load balancer health checks
- CI/CD pipeline integration

### Documentation
- Complete health check documentation with examples
- Docker, Docker Compose, and Kubernetes integration guides
- Troubleshooting section
- Best practices and use cases

---

## Previous Versions

For changes in versions before this fork, see:
- [bohdan-s/SunGather](https://github.com/bohdan-s/SunGather)
- [michbeck100/SunGather](https://github.com/michbeck100/SunGather)
