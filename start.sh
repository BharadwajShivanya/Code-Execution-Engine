#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Code Execution Engine...${NC}"

# 1. Start Redis
echo -e "${YELLOW}Starting Redis...${NC}"
# Check if redis is already running
if nc -z localhost 6379 > /dev/null 2>&1; then
    echo -e "${GREEN}Redis is already running.${NC}"
else
    docker run -d -p 6379:6379 redis
    echo -e "${GREEN}Redis started.${NC}"
fi

# 2. Build Python Docker Sandbox Image (just in case)
echo -e "${YELLOW}Ensuring Python Docker Sandbox Image exists...${NC}"
docker build -t judge-python dockerfiles/python/ -q

# 3. Start API Server
echo -e "${YELLOW}Starting Go API Server (Port 8090)...${NC}"
go run ./cmd/api > api.log 2>&1 &
API_PID=$!
echo -e "${GREEN}API Server started (PID: $API_PID) - logs in api.log${NC}"

# 4. Start Worker
echo -e "${YELLOW}Starting Go Worker...${NC}"
go run cmd/worker/main.go > worker.log 2>&1 &
WORKER_PID=$!
echo -e "${GREEN}Worker started (PID: $WORKER_PID) - logs in worker.log${NC}"

# 5. Start Frontend
echo -e "${YELLOW}Starting Frontend (Judge Companion)...${NC}"
cd judge-companion/judge-companion

# Use bun if available, otherwise npm
if command -v bun &> /dev/null; then
    bun install
    bun dev > ../../frontend.log 2>&1 &
    FRONTEND_PID=$!
else
    npm install
    npm run dev > ../../frontend.log 2>&1 &
    FRONTEND_PID=$!
fi
echo -e "${GREEN}Frontend started (PID: $FRONTEND_PID) - logs in frontend.log${NC}"

# Setup Cleanup on exit
function cleanup() {
    echo -e "\n${RED}Stopping all services...${NC}"
    kill $API_PID $WORKER_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}

trap cleanup EXIT INT TERM

echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}🚀 All services are up and running!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo -e "API Server: http://localhost:8090"
echo -e "Frontend:   http://localhost:8080 (Check frontend.log for exact port, usually 5173 or 8080)"
echo -e "\nPress ${RED}Ctrl+C${NC} to stop all services."

# Wait indefinitely so the trap catches Ctrl+C
wait $FRONTEND_PID
