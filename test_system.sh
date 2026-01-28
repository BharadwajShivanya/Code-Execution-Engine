#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Code Execution Engine - Automated Test Suite       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Test 1: Check prerequisites
echo -e "${BLUE}📋 Step 1: Checking Prerequisites${NC}"
echo "────────────────────────────────────────────"

go version > /dev/null 2>&1
print_status $? "Go is installed"

docker --version > /dev/null 2>&1
print_status $? "Docker is installed"

redis-cli ping > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status 0 "Redis is running"
else
    print_info "Redis not running - starting it..."
    docker run -d -p 6379:6379 redis > /dev/null 2>&1
    sleep 2
    redis-cli ping > /dev/null 2>&1
    print_status $? "Redis started successfully"
fi

echo ""

# Test 2: Build Go code
echo -e "${BLUE}🔧 Step 2: Building Go Code${NC}"
echo "────────────────────────────────────────────"

print_info "Compiling Go packages..."
go build ./... > /tmp/go_build.log 2>&1
print_status $? "All packages compiled successfully"

echo ""

# Test 3: Build Docker image
echo -e "${BLUE}🐳 Step 3: Building Docker Sandbox Image${NC}"
echo "────────────────────────────────────────────"

print_info "Building judge-python Docker image..."
docker build -t judge-python dockerfiles/python/ > /tmp/docker_build.log 2>&1
print_status $? "Docker image built successfully"

echo ""

# Test 4: Start services
echo -e "${BLUE}🚀 Step 4: Starting Services${NC}"
echo "────────────────────────────────────────────"

print_info "Starting API server in background..."
go run cmd/api/main.go > /tmp/api.log 2>&1 &
API_PID=$!
sleep 2

print_info "Starting Worker in background..."
go run cmd/worker/main.go > /tmp/worker.log 2>&1 &
WORKER_PID=$!
sleep 2

# Check if services are running
if ps -p $API_PID > /dev/null 2>&1; then
    print_status 0 "API server is running (PID: $API_PID)"
else
    print_status 1 "API server failed to start"
fi

if ps -p $WORKER_PID > /dev/null 2>&1; then
    print_status 0 "Worker is running (PID: $WORKER_PID)"
else
    print_status 1 "Worker failed to start"
fi

echo ""

# Test 5: Integration tests
echo -e "${BLUE}🧪 Step 5: Running Integration Tests${NC}"
echo "────────────────────────────────────────────"

# Test 1: Simple print statement
print_info "Test 1: Simple Python program (should be Accepted)"
RESPONSE=$(curl -s -X POST http://localhost:8090/submit \
  -H "Content-Type: application/json" \
  -d '{"language":"python","code":"print(\"Hello World\")","time_ms":2000,"memory_mb":128}')

if echo "$RESPONSE" | grep -q '"id"'; then
    print_status 0 "API accepted submission"
else
    print_status 1 "API submission failed: $RESPONSE"
fi

sleep 1

# Check worker output
if grep -q "Result: Accepted" /tmp/worker.log; then
    print_status 0 "Test 1 passed: Code executed successfully"
    # Clean up the log for next test
    sed -i '' '/Result: Accepted/d' /tmp/worker.log
else
    print_status 1 "Test 1 failed: Expected 'Accepted' status"
fi

# Test 2: Runtime error
print_info "Test 2: Runtime error (should be Runtime Error)"
RESPONSE=$(curl -s -X POST http://localhost:8090/submit \
  -H "Content-Type: application/json" \
  -d '{"language":"python","code":"print(undefined_var)","time_ms":2000,"memory_mb":128}')

sleep 1

if grep -q "Result: Runtime Error" /tmp/worker.log; then
    print_status 0 "Test 2 passed: Runtime error detected correctly"
    sed -i '' '/Result: Runtime Error/d' /tmp/worker.log
else
    print_status 1 "Test 2 failed: Expected 'Runtime Error' status"
fi

# Test 3: Time limit exceeded
print_info "Test 3: Time limit exceeded (should be Time Limit Exceeded)"
RESPONSE=$(curl -s -X POST http://localhost:8090/submit \
  -H "Content-Type: application/json" \
  -d '{"language":"python","code":"import time; time.sleep(5)","time_ms":1000,"memory_mb":128}')

sleep 2

if grep -q "Result: Time Limit Exceeded" /tmp/worker.log; then
    print_status 0 "Test 3 passed: Time limit enforced correctly"
    sed -i '' '/Result: Time Limit Exceeded/d' /tmp/worker.log
else
    print_status 1 "Test 3 failed: Expected 'Time Limit Exceeded' status"
fi

echo ""

# Cleanup
echo -e "${BLUE}🧹 Step 6: Cleanup${NC}"
echo "────────────────────────────────────────────"

kill $API_PID $WORKER_PID 2>/dev/null
print_status 0 "Services stopped"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  ALL TESTS PASSED! 🎉                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📝 Summary:${NC}"
echo "  • Go code compiles: ✅"
echo "  • Docker image builds: ✅"
echo "  • Redis queue works: ✅"
echo "  • API server responds: ✅"
echo "  • Worker processes jobs: ✅"
echo "  • Code execution works: ✅"
echo "  • Error detection works: ✅"
echo "  • Time limits enforced: ✅"
echo ""
echo -e "${YELLOW}📂 Check these files for details:${NC}"
echo "  • /tmp/go_build.log - Go compilation output"
echo "  • /tmp/docker_build.log - Docker build output"
echo "  • /tmp/api.log - API server logs"
echo "  • /tmp/worker.log - Worker execution logs"
echo ""

