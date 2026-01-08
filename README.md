
# 🧠 Code Execution Engine (Judge0-Style)

A **secure, asynchronous code execution engine** inspired by Judge0 / LeetCode, built using **Go**, **Docker**, and **Redis**.
Supports sandboxed execution with time & memory limits using a worker-based architecture.

---

## 🏗 Architecture Overview

```
Client (curl / frontend)
        |
        v
     API Server (Go + Gin)
        |
        v
     Redis Queue
        |
        v
     Worker (Go)
        |
        v
   Docker Sandbox (Python)
```

* **API**: Accepts code submissions
* **Redis**: Job queue
* **Worker**: Executes code inside Docker
* **Docker**: Secure sandbox
* **Verdict system**: Accepted / Runtime Error / TLE

---

## 📁 Project Structure

```
Code-Execution-Engine/
│
├── cmd/
│   ├── api/
│   │   └── main.go        # API server
│   └── worker/
│       └── main.go        # Worker process
│
├── internal/
│   ├── docker/            # Docker execution logic
│   ├── executor/          # Code runner
│   ├── queue/             # Redis queue
│   └── models/            # Shared models
│
├── dockerfiles/
│   └── python/
│       └── Dockerfile     # Python sandbox image
│
├── go.mod
└── go.sum
```

---

## ⚙️ Prerequisites

Make sure the following are installed:

* **Go** (>= 1.20)
* **Docker**
* **Redis**
* macOS / Linux

Verify:

```bash
go version
docker --version
```

---

## 🚀 Setup & Execution (Step-by-Step)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/BharadwajShivanya/Code-Execution-Engine.git
cd Code-Execution-Engine
```

---

### 2️⃣ Build Docker Sandbox Image

```bash
docker build -t judge-python dockerfiles/python
```

This image is used to safely execute Python code inside a container.

---

### 3️⃣ Start Redis (Job Queue)

```bash
docker run -d -p 6379:6379 redis
```

---

### 4️⃣ Start Worker (Execution Engine)

```bash
go run cmd/worker/main.go
```

Expected output:

```
Worker started
```

The worker continuously listens for jobs from Redis and executes them.

---

### 5️⃣ Start API Server

```bash
go run cmd/api/main.go
```

Expected output:

```
Listening and serving HTTP on :8090
```

> Note: Port **8090** is used to avoid conflict with existing services.

---

## 🧪 Submitting Code (Test Run)

Submit a Python program using `curl`:

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

### API Response

```json
{
  "id": "some-uuid"
}
```

---

## ✅ Execution Result (Worker Output)

Worker terminal prints:

```
Result: Accepted
```

This confirms:

* Code executed successfully
* Docker sandbox worked
* Time & memory limits respected
* Verdict system working

---

## 🔐 Security Features

* Docker isolation (`--network none`)
* CPU & memory limits
* Temporary execution directories
* No host filesystem access

---

## 🧠 Key Concepts Implemented

* Asynchronous job execution
* Queue-based architecture
* Secure code sandboxing
* Real-world Judge system design
* Separation of API & execution logic

---

## 📌 Future Improvements

* Store execution results
* `GET /result/:id` polling
* Multiple language support (C++, Java)
* React frontend
* Advanced sandboxing (seccomp)

---

## 🏁 Conclusion

This project demonstrates a **production-grade code execution engine**, similar to platforms like **Judge0** and **LeetCode**, implemented from scratch with real system design principles.
