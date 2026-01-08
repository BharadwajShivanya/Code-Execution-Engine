package executor

import (
	"os"
	"path/filepath"

	"Code-Execution-Engine/internal/docker"
	"Code-Execution-Engine/internal/models"
)

func Execute(sub models.Submission) models.Result {
	dir, _ := os.MkdirTemp("", "exec-*")
	defer os.RemoveAll(dir)

	os.WriteFile(filepath.Join(dir, "main.py"), []byte(sub.Code), 0644)

	stdout, stderr, err := docker.RunPython(dir, sub.TimeMs, sub.MemoryMB)

	if err != nil && err.Error() == "context deadline exceeded" {
		return models.Result{Status: "Time Limit Exceeded"}
	}

	if stderr != "" {
		return models.Result{Status: "Runtime Error", Stdout: stdout, Stderr: stderr}
	}

	return models.Result{Status: "Accepted", Stdout: stdout}
}
