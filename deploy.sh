#!/bin/bash

################################################################################
# SunGather - Deployment/Update Script
# 
# This script will:
# 1. Pull latest changes from GitHub
# 2. Stop current containers
# 3. Rebuild and restart with new code
# 4. Show status and logs
#
# Usage: ./deploy.sh
################################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════╗
║        SunGather Deployment Script                    ║
╚═══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

################################################################################
# Step 1: Pull Latest Changes
################################################################################
echo -e "${YELLOW}>>> 1. Pulling latest changes from GitHub...${NC}"

# Stash any local changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠ Found local changes, stashing...${NC}"
    git stash
fi

git pull origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Git pull successful${NC}"
else
    echo -e "${RED}✗ Git pull failed. Check connection or conflicts${NC}"
    exit 1
fi

################################################################################
# Step 2: Stop Containers
################################################################################
echo -e "${YELLOW}>>> 2. Stopping containers and cleaning up...${NC}"

# Stop and remove containers, remove orphans
docker compose down --remove-orphans

echo -e "${GREEN}✓ Containers stopped${NC}"

################################################################################
# Step 3: Build and Start
################################################################################
echo -e "${YELLOW}>>> 3. Building and starting new version...${NC}"

# Build with no cache to ensure latest code
docker compose build --no-cache

# Start in detached mode
docker compose up -d

echo -e "${GREEN}✓ New version started${NC}"

################################################################################
# Step 4: Wait for Services
################################################################################
echo -e "${YELLOW}>>> 4. Waiting for services to be healthy...${NC}"

MAX_WAIT=60
WAITED=0

while [ $WAITED -lt $MAX_WAIT ]; do
    if docker compose ps | grep -q "(healthy)"; then
        echo -e "${GREEN}✓ Services are healthy${NC}"
        break
    fi
    echo -n "."
    sleep 2
    WAITED=$((WAITED + 2))
done

if [ $WAITED -ge $MAX_WAIT ]; then
    echo -e "${YELLOW}⚠ Health check timeout, but services may still be starting${NC}"
fi

echo ""

################################################################################
# Step 5: Show Status
################################################################################
echo -e "${YELLOW}>>> 5. Service Status:${NC}"
docker compose ps

echo ""

################################################################################
# Step 6: Quick Health Checks
################################################################################
echo -e "${YELLOW}>>> 6. Running health checks...${NC}"

# SunGather Health
if curl -sf http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ SunGather: Healthy${NC}"
else
    echo -e "${YELLOW}⚠ SunGather: Not responding yet${NC}"
fi

# API Health
if curl -sf http://localhost:8000/api/v1/status > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API: Healthy${NC}"
else
    echo -e "${YELLOW}⚠ API: Not responding yet${NC}"
fi

# Dashboard Health
if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Dashboard: Healthy${NC}"
else
    echo -e "${YELLOW}⚠ Dashboard: Not responding yet${NC}"
fi

echo ""

################################################################################
# Success Message
################################################################################
echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════╗
║         Deployment Complete! 🚀                       ║
╚═══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

IP_ADDRESS=$(hostname -I | awk '{print $1}')

echo -e "${BLUE}Your SunGather is now running:${NC}"
echo -e "${GREEN}  • Dashboard: http://${IP_ADDRESS}:3000${NC}"
echo -e "${GREEN}  • API Docs: http://${IP_ADDRESS}:8000/api/docs${NC}"
echo -e "${GREEN}  • Legacy UI: http://${IP_ADDRESS}:8080${NC}"
echo ""

echo -e "${BLUE}View logs:${NC}"
echo -e "  ${YELLOW}docker compose logs -f${NC}"
echo ""

echo -e "${BLUE}View specific service:${NC}"
echo -e "  ${YELLOW}docker compose logs -f sungather${NC}"
echo -e "  ${YELLOW}docker compose logs -f dashboard${NC}"
echo ""

echo -e "${GREEN}Happy Monitoring! ☀️${NC}"
