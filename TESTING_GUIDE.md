# 🧪 Complete Testing Guide for Code Execution Engine

This guide provides step-by-step instructions to verify that your entire codebase is working correctly.

---

## 📋 Prerequisites Checklist

Before testing, ensure all dependencies are installed:

```bash
# Check Go installation
go version

# Check Docker installation
docker --version

# Check Redis installation
redis-cli ping
```

Expected outputs:
- Go: `go version go1.23.0 darwin/arm64` (or similar)
- Docker: `Docker version 24.0.6, build ed223bc` (or similar)
- Redis: Should return `PONG`

---

## 🔧 Step 1: Test Go Code Compilation

First, verify that all Go code compiles without errors:

```bash
# Navigate to project directory
cd /Users/shivanyabharadwaj/Downloads/Code-Execution-Engine

# Build all packages
go build ./...

# Build API server
go build -o bin/api ./cmd/api/

# Build Worker
go build -o bin/worker ./cmd/worker/

echo "✅ Go compilation successful!"
```

**What this tests:**
- ✅ All imports are correct
- ✅ No syntax errors
- ✅ Dependencies are properly resolved
- ✅ Package structure is valid

---

## 🐳 Step 2: Build Docker Sandbox Image

Build the Python sandbox image used for secure code execution:

```bash
# Build the Docker image
docker build -t judge-python dockerfiles/python/

# Verify image was created
docker images | grep judge-python
```

Expected output:
```
REPOSITORY      TAG       IMAGE ID       CREATED         SIZE
judge-python    latest    abc123def456   2 minutes ago   125MB
```

**What this tests:**
- ✅ Dockerfile is valid
- ✅ Docker is working correctly
- ✅ Python environment is properly set up

---

## 🗄️ Step 3: Start Redis (Required)

Redis is used as the job queue for asynchronous processing:

```bash
# Start Redis in detached mode
docker run -d -p 6379:6379 redis

# Verify Redis is running
redis-cli ping
```

Expected output: `PONG`

**What this tests:**
- ✅ Redis container is running
- ✅ Redis is accepting connections on port 6379

---

## 👷 Step 4: Start the Worker

The worker listens for jobs and executes code in Docker containers:

```bash
# Terminal 1: Start Worker
go run cmd/worker/main.go
```

Expected output:
```
Worker started
```

**What this tests:**
- ✅ Worker connects to Redis successfully
- ✅ Worker is ready to receive jobs
- ✅ Queue package is working correctly

---

## 🌐 Step 5: Start the API Server

The API server accepts code submissions:

```bash
# Terminal 2: Start API Server
go run cmd/api/main.go
```

Expected output:
```
Listening and serving HTTP on :8090
```

**What this tests:**
- ✅ API server starts correctly
- ✅ Gin framework is working
- ✅ Routes are properly configured

---

## 🧪 Step 6: Test Full System Integration

Now test the complete workflow by submitting code through the API:

### Test 1: Simple Python Program (Should Pass)

```bash
curl -X POST http://localhost:8090/submit \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "print(\"Hello from my Judge\")",
    "time_ms": 2000,
    "memory_mb": 128
  }'
```

**Expected API Response:**
```json
{"id":"some-uuid-string"}
```

**Worker Terminal Should Print:**
```
Result: Accepted
```

### Test 2: Program with Runtime Error

```bash
curl -X POST http://localhost:8090/submit \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "print(undefined_variable)",
    "time_ms": 2000,
    "memory_mb": 128
  }'
```

**Worker Terminal Should Print:**
```
Result: Runtime Error
```

### Test 3: Program with Time Limit Exceeded

```bash
curl -X POST http://localhost:8090/submit \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "import time; time.sleep(10)",
    "time_ms": 1000,
    "memory_mb": 128
  }'
```

**Worker Terminal Should Print:**
```
Result: Time Limit Exceeded
```

---

## 🔐 Security Tests

Verify that the sandbox is properly isolated:

```bash
# Test 1: No network access (Should fail silently)
curl -X POST http://localhost:8090/submit \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "import urllib.request; print(urllib.request.urlopen(\"http://google.com\").read())",
    "time_ms": 2000,
    "memory_mb": 128
  }'
```

---

## 📊 Expected Results Summary

| Test Case | Code | Expected Status |
|-----------|------|-----------------|
| Simple print | `print("Hello")` | ✅ Accepted |
| Runtime error | `print(undefined)` | 💥 Runtime Error |
| Time limit | `sleep(10)` with 1s limit | ⏰ Time Limit Exceeded |
| No network | `urllib.request` | ❌ No output (network blocked) |

---

## 🚨 Troubleshooting

### Issue: Redis connection refused
```bash
# Check if Redis is running
docker ps

# Restart Redis
docker run -d -p 6379:6379 redis
```

### Issue: Docker permission denied
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Or run with sudo
sudo go run cmd/api/main.go
```

### Issue: Port already in use
```bash
# Find process using port 8090
lsof -ti:8090

# Kill the process
kill -9 $(lsof -ti:8090)
```

### Issue: Docker container fails to start
```bash
# Check Docker logs
docker logs <container_id>

# Rebuild the image
docker build -t judge-python dockerfiles/python/
```

---

## ✅ Final Checklist

After completing all tests, verify:

- [ ] Go code compiles without errors
- [ ] Docker image builds successfully
- [ ] Redis is running and responding
- [ ] Worker starts and connects to Redis
- [ ] API server starts and listens on :8090
- [ ] Submit endpoint accepts requests
- [ ] Worker receives and processes jobs
- [ ] Results are printed correctly
- [ ] Security features (network isolation) are working

---

## 🎯 Quick Test Command

Run this single command to test the entire system:

```bash
# Terminal 1: Start Redis
docker run -d -p 6379:6379 redis > /dev/null 2>&1

# Terminal 2: Start Worker
go run cmd/worker/main.go > /tmp/worker.log 2>&1 &

# Terminal 3: Start API
go run cmd/api/main.go > /tmp/api.log 2>&1 &

# Wait for services to start
sleep 2

# Submit test code
curl -s -X POST http://localhost:8090/submit \
  -H "Content-Type: application/json" \
  -d '{"language":"python","code":"print(\"System test passed!\")","time_ms":2000,"memory_mb":128}'

# Check worker output
sleep 1
tail -n 5 /tmp/worker.log
```

Expected output:
```
Worker started
Result: Accepted
```

---

## 📝 Notes

- The system uses **Docker's `--network none`** flag to completely isolate the execution environment
- Memory limit is set to **256MB** by default
- Time limit is configurable per submission
- All temporary files are automatically cleaned up after execution

---

**🎉 Your Code Execution Engine is fully functional when all tests pass!**

