// package executor

// import (
// 	"os"
// 	"path/filepath"

// 	"Code-Execution-Engine/internal/docker"
// 	"Code-Execution-Engine/internal/models"
// )

// func Execute(sub models.Submission) models.Result {
// 	dir, _ := os.MkdirTemp("", "exec-*")
// 	defer os.RemoveAll(dir)

// 	os.WriteFile(filepath.Join(dir, "main.py"), []byte(sub.Code), 0644)

// 	stdout, stderr, err := docker.RunPython(dir, sub.TimeMs, sub.MemoryMB)

// 	if err != nil && err.Error() == "context deadline exceeded" {
// 		return models.Result{Status: "Time Limit Exceeded"}
// 	}

// 	if stderr != "" {
// 		return models.Result{Status: "Runtime Error", Stdout: stdout, Stderr: stderr}
// 	}

// 	return models.Result{Status: "Accepted", Stdout: stdout}
// }

package executor

import (
	"bytes"
	"context"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"Code-Execution-Engine/internal/models"
)

func Execute(sub models.Submission) models.Result {

	// 1️⃣ TEMP FOLDER BAN RAHA HAI (HOST MACHINE)
	dir, _ := os.MkdirTemp("", "exec-*")
	defer os.RemoveAll(dir)

	// 2️⃣ PYTHON FILE BAN RAHI HAI
	codePath := filepath.Join(dir, "main.py")
	os.WriteFile(codePath, []byte(sub.Code), 0644)

	// 3️⃣ TIME LIMIT SET
	ctx, cancel := context.WithTimeout(
		context.Background(),
		time.Duration(sub.TimeMs)*time.Millisecond,
	)
	defer cancel()

	// 4️⃣ 👉👉 YAHIN CONTAINER BAN RAHA HAI 👈👈
	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "--rm",
		"--network", "none",
		"-m", "256m",
		"-v", dir+":/code",
		"python:3.11-alpine",
		"python", "/code/main.py",
	)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	// 5️⃣ RESULT DECISION

	// ⏰ TIME LIMIT
	if err != nil && ctx.Err() == context.DeadlineExceeded {
		return models.Result{Status: "Time Limit Exceeded"}
	}

	// 💥 PYTHON ERROR
	if stderr.String() != "" {
		return models.Result{
			Status: "Runtime Error",
			Stdout: stdout.String(),
			Stderr: stderr.String(),
		}
	}

	// ✅ SUCCESS
	return models.Result{
		Status: "Accepted",
		Stdout: stdout.String(),
	}
}
