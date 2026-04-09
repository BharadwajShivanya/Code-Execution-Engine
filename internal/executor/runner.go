package executor

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"Code-Execution-Engine/internal/models"
)

func Execute(sub models.Submission) models.Result {

	// 1️⃣ TEMP FOLDER BAN RAHA HAI (HOST MACHINE)
	dir, _ := os.MkdirTemp("", "exec-*")
	defer os.RemoveAll(dir)

	// Language-specific config
	var image, filename string
	var runCmd []string
	switch strings.ToLower(sub.Language) {
	case "python":
		image = "python:3.11-alpine"
		filename = "main.py"
		runCmd = []string{"python", "/code/main.py"}
	case "javascript":
		image = "node:18-alpine"
		filename = "main.js"
		runCmd = []string{"node", "/code/main.js"}
	case "typescript":
		image = "node:18-alpine"
		filename = "main.ts"
		runCmd = []string{"sh", "-c", "npm install -g typescript && tsc /code/main.ts && node /code/main.js"}
	case "cpp":
		image = "gcc:latest"
		filename = "main.cpp"
		runCmd = []string{"sh", "-c", "g++ /code/main.cpp -o /code/main && /code/main"}
	case "c":
		image = "gcc:latest"
		filename = "main.c"
		runCmd = []string{"sh", "-c", "gcc /code/main.c -o /code/main && /code/main"}
	case "java":
		image = "openjdk:17-alpine"
		filename = "Main.java"
		runCmd = []string{"sh", "-c", "javac /code/Main.java && java -cp /code Main"}
	case "go":
		image = "golang:1.21-alpine"
		filename = "main.go"
		runCmd = []string{"sh", "-c", "cd /code && go run main.go"}
	case "rust":
		image = "rust:1.70-alpine"
		filename = "main.rs"
		runCmd = []string{"sh", "-c", "rustc /code/main.rs -o /code/main 2>&1 && /code/main"}
	default:
		// Fallback to Python
		image = "python:3.11-alpine"
		filename = "main.py"
		runCmd = []string{"python", "/code/main.py"}
	}

	codePath := filepath.Join(dir, filename)
	os.WriteFile(codePath, []byte(sub.Code), 0644)

	// Create go.mod for Go submissions
	if strings.ToLower(sub.Language) == "go" {
		goModContent := `module code

go 1.21
`
		os.WriteFile(filepath.Join(dir, "go.mod"), []byte(goModContent), 0644)
	}

	// 3️⃣ Build the list of testcases (fallback to `Input` for backward compat)
	tests := sub.Tests
	if len(tests) == 0 && sub.Input != "" {
		tests = []models.TestCase{{Input: sub.Input, Expected: ""}}
	}

	var results []models.TestResult
	overallVerdict := "Accepted"

	for _, tc := range tests {
		ctx, cancel := context.WithTimeout(
			context.Background(),
			time.Duration(sub.TimeMs)*time.Millisecond,
		)

		cmd := exec.CommandContext(
			ctx,
			"docker", "run", "-i", "--rm",
			"--network", "none",
			"-m", fmt.Sprintf("%dm", sub.MemoryMB),
			"-v", dir+":/code",
			image,
		)
		cmd.Args = append(cmd.Args, runCmd...)

		var stdout, stderr bytes.Buffer
		cmd.Stdout = &stdout
		cmd.Stderr = &stderr
		cmd.Stdin = bytes.NewBufferString(tc.Input)

		err := cmd.Run()
		cancel()

		verdict := "Accepted"
		passed := true
		output := stdout.String()

		// Timeout
		if err != nil && ctx.Err() == context.DeadlineExceeded {
			verdict = "Time Limit Exceeded"
			passed = false
		}

		// Runtime error
		if verdict == "Accepted" && stderr.Len() > 0 {
			verdict = "Runtime Error"
			passed = false
		}

		// Wrong answer (only if expected is provided)
		if verdict == "Accepted" && tc.Expected != "" {
			if strings.TrimSpace(output) != strings.TrimSpace(tc.Expected) {
				verdict = "Wrong Answer"
				passed = false
			}
		}

		// keep the first non-Accepted verdict as overall
		if overallVerdict == "Accepted" && verdict != "Accepted" {
			overallVerdict = verdict
		}

		results = append(results, models.TestResult{
			Input:    tc.Input,
			Expected: tc.Expected,
			Output:   output,
			Passed:   passed,
			Verdict:  verdict,
			Stdout:   output,
			Stderr:   stderr.String(),
		})
	}

	return models.Result{
		Status:      "completed",
		Verdict:     overallVerdict,
		TestResults: results,
	}
}
