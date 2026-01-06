#!/bin/bash

################################################################################
# SunGather - Automated Installation Script
# 
# This script will:
# 1. Check system requirements
# 2. Install Docker & Docker Compose if needed
# 3. Clone SunGather repository
# 4. Create configuration files
# 5. Build and start the stack
#
# Usage: curl -fsSL https://raw.githubusercontent.com/marekforkasiewicz/SunGather/main/install.sh | bash
################################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/marekforkasiewicz/SunGather.git"
INSTALL_DIR="$HOME/SunGather"
BRANCH="main"

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║         SunGather Installation Script                 ║
║         Solar Monitoring Dashboard                    ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

################################################################################
# Check if running as root
################################################################################
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Please do not run this script as root${NC}"
    exit 1
fi

################################################################################
# Check System Requirements
################################################################################
echo -e "${YELLOW}>>> Checking system requirements...${NC}"

# Check OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo -e "${GREEN}✓ OS: Linux${NC}"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${GREEN}✓ OS: macOS${NC}"
else
    echo -e "${RED}✗ Unsupported OS: $OSTYPE${NC}"
    exit 1
fi

# Check available disk space (minimum 2GB)
AVAILABLE_SPACE=$(df -BG "$HOME" | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$AVAILABLE_SPACE" -lt 2 ]; then
    echo -e "${RED}✗ Insufficient disk space. Need at least 2GB, have ${AVAILABLE_SPACE}GB${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Disk space: ${AVAILABLE_SPACE}GB available${NC}"

################################################################################
# Check/Install Docker
################################################################################
echo -e "${YELLOW}>>> Checking Docker...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Installing...${NC}"
    
    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    echo -e "${GREEN}✓ Docker installed${NC}"
    echo -e "${YELLOW}Note: You may need to log out and back in for Docker permissions${NC}"
else
    DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
    echo -e "${GREEN}✓ Docker found: v${DOCKER_VERSION}${NC}"
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}Docker Compose not found. Installing...${NC}"
    
    # Docker Compose v2 (plugin)
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
    
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✓ Docker Compose found${NC}"
fi

################################################################################
# Clone Repository
################################################################################
echo -e "${YELLOW}>>> Cloning SunGather repository...${NC}"

if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}Directory $INSTALL_DIR already exists${NC}"
    read -p "Remove and re-clone? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$INSTALL_DIR"
    else
        echo -e "${YELLOW}Using existing directory${NC}"
        cd "$INSTALL_DIR"
        git pull origin "$BRANCH"
    fi
fi

if [ ! -d "$INSTALL_DIR" ]; then
    git clone -b "$BRANCH" "$REPO_URL" "$INSTALL_DIR"
    echo -e "${GREEN}✓ Repository cloned${NC}"
fi

cd "$INSTALL_DIR"

################################################################################
# Create Configuration
################################################################################
echo -e "${YELLOW}>>> Creating configuration files...${NC}"

# Copy .env.example if .env doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env from template${NC}"
    else
        echo -e "${YELLOW}Warning: .env.example not found${NC}"
    fi
fi

# Create config.yaml if doesn't exist
if [ ! -f "config.yaml" ]; then
    if [ -f "SunGather/config-example.yaml" ]; then
        cp SunGather/config-example.yaml config.yaml
        echo -e "${GREEN}✓ Created config.yaml from template${NC}"
        echo -e "${YELLOW}⚠ Please edit config.yaml with your inverter details${NC}"
    fi
fi

# Create logs directory
mkdir -p logs

################################################################################
# Configure Inverter Settings
################################################################################
echo -e "${YELLOW}>>> Inverter Configuration${NC}"
echo -e "${BLUE}Please provide your inverter details:${NC}"

read -p "Inverter IP address (default: 192.168.1.100): " INVERTER_IP
INVERTER_IP=${INVERTER_IP:-192.168.1.100}

read -p "Connection type (modbus/http/sungrow, default: modbus): " CONNECTION_TYPE
CONNECTION_TYPE=${CONNECTION_TYPE:-modbus}

# Update config.yaml
sed -i "s/host: .*/host: $INVERTER_IP/" config.yaml
sed -i "s/connection: .*/connection: $CONNECTION_TYPE/" config.yaml

echo -e "${GREEN}✓ Configuration updated${NC}"

################################################################################
# Build and Start
################################################################################
echo -e "${YELLOW}>>> Building Docker images...${NC}"
docker compose build

echo -e "${YELLOW}>>> Starting services...${NC}"
docker compose up -d

echo -e "${YELLOW}>>> Waiting for services to start...${NC}"
sleep 10

################################################################################
# Health Check
################################################################################
echo -e "${YELLOW}>>> Checking service health...${NC}"

# Check SunGather health
if curl -f http://localhost:8080/health &> /dev/null; then
    echo -e "${GREEN}✓ SunGather health check: OK${NC}"
else
    echo -e "${YELLOW}⚠ SunGather health check: WAITING...${NC}"
fi

# Check API health
if curl -f http://localhost:8000/api/v1/status &> /dev/null; then
    echo -e "${GREEN}✓ API health check: OK${NC}"
else
    echo -e "${YELLOW}⚠ API health check: WAITING...${NC}"
fi

# Check Dashboard
if curl -f http://localhost:3000 &> /dev/null; then
    echo -e "${GREEN}✓ Dashboard health check: OK${NC}"
else
    echo -e "${YELLOW}⚠ Dashboard health check: WAITING...${NC}"
fi

################################################################################
# Display Status
################################################################################
echo -e "${YELLOW}>>> Container Status:${NC}"
docker compose ps

################################################################################
# Success Message
################################################################################
echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║         Installation Complete! 🎉                     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

IP_ADDRESS=$(hostname -I | awk '{print $1}')

echo -e "${BLUE}Access your SunGather installation at:${NC}"
echo -e "${GREEN}  • Modern Dashboard: http://${IP_ADDRESS}:3000${NC}"
echo -e "${GREEN}  • API Documentation: http://${IP_ADDRESS}:8000/api/docs${NC}"
echo -e "${GREEN}  • Legacy Webserver: http://${IP_ADDRESS}:8080${NC}"
echo -e "${GREEN}  • Health Check: http://${IP_ADDRESS}:8080/health${NC}"
echo ""

echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  • View logs: ${YELLOW}cd $INSTALL_DIR && docker compose logs -f${NC}"
echo -e "  • Restart: ${YELLOW}cd $INSTALL_DIR && docker compose restart${NC}"
echo -e "  • Stop: ${YELLOW}cd $INSTALL_DIR && docker compose down${NC}"
echo -e "  • Update: ${YELLOW}cd $INSTALL_DIR && ./deploy.sh${NC}"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Edit config.yaml if needed: ${BLUE}nano $INSTALL_DIR/config.yaml${NC}"
echo -e "  2. Check logs for any errors: ${BLUE}docker compose logs -f${NC}"
echo -e "  3. Wait ~30s for first data scrape${NC}"
echo -e "  4. Open dashboard in browser${NC}"
echo ""

echo -e "${BLUE}Documentation:${NC}"
echo -e "  • Health Check: https://github.com/marekforkasiewicz/SunGather/blob/main/docs/HEALTHCHECK.md"
echo -e "  • Dashboard: https://github.com/marekforkasiewicz/SunGather/blob/main/docs/DASHBOARD.md"
echo -e "  • Changelog: https://github.com/marekforkasiewicz/SunGather/blob/main/CHANGELOG.md"
echo ""

echo -e "${GREEN}Happy Monitoring! ☀️${NC}"
