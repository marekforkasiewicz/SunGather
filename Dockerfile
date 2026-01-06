FROM python:3 as builder

RUN python3 -m venv /opt/virtualenv \
 && apt-get update \
 && apt-get install build-essential

COPY requirements.txt ./
RUN /opt/virtualenv/bin/pip3 install --no-cache-dir -r requirements.txt

FROM python:3-slim

RUN useradd -r -m sungather

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/virtualenv /opt/virtualenv

WORKDIR /opt/sungather

COPY SunGather/ .

VOLUME /logs
VOLUME /config
COPY SunGather/config-example.yaml /config/config.yaml

USER sungather

# Health check endpoint
# Checks if webserver is responding on /health endpoint
#Interval: check every 30 seconds
# Timeout: wait 3 seconds for response
# Start period: give container 40 seconds to start
# Retries: mark unhealthy after 3 consecutive failures
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl --fail http://localhost:8080/health || exit 1

CMD [ "/opt/virtualenv/bin/python", "sungather.py", "-c", "/config/config.yaml", "-l", "/logs/" ]
