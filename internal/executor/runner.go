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

package runner

import (
	"errors"

	"Code-Execution-Engine/internal/docker"
	"Code-Execution-Engine/internal/models"
)

// Run is the single entry point for code execution.
// Worker layer will ONLY call this function.
func Run(sub models.Submission) models.Result {

	// Language routing (Phase 2: only Python supported)
	switch sub.Language {

	case "python":
		return runPython(sub)

	default:
		return models.Result{
			Status: "Unsupported Language",
		}
	}
}

// --------------------
// Python runner
// --------------------
func runPython(sub models.Submission) models.Result {

	stdout, stderr, err := docker.RunPython(
		sub.WorkDir,
		sub.TimeMs,
		sub.MemoryMB,
	)

	// Time Limit Exceeded
	if err != nil && errors.Is(err, docker.ErrTimeLimitExceeded) {
		return models.Result{
			Status: "Time Limit Exceeded",
		}
	}

	// Runtime Error
	if stderr != "" {
		return models.Result{
			Status:  "Runtime Error",
			Stdout:  stdout,
			Stderr:  stderr,
		}
	}

	// Successful execution
	return models.Result{
		Status: "Accepted",
		Stdout: stdout,
	}
}
