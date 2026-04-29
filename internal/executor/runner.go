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

// normalizeOutput applies Judge0-style normalization before comparing:
//  1. Trim leading/trailing whitespace from the whole string
//  2. Trim each line individually
//  3. Normalize spaces around commas, brackets and braces
//     so that Python's "[0, 1]" matches expected "[0,1]", etc.
func normalizeOutput(s string) string {
	s = strings.TrimSpace(s)

	// Trim each line
	lines := strings.Split(s, "\n")
	for i, line := range lines {
		lines[i] = strings.TrimSpace(line)
	}
	// Remove empty trailing lines
	for len(lines) > 0 && lines[len(lines)-1] == "" {
		lines = lines[:len(lines)-1]
	}
	s = strings.Join(lines, "\n")

	// Normalize spaces around commas  →  "0, 1" → "0,1"
	for strings.Contains(s, ", ") {
		s = strings.ReplaceAll(s, ", ", ",")
	}
	// Normalize spaces inside brackets  →  "[ 0" → "[0",  "1 ]" → "1]"
	for strings.Contains(s, "[ ") {
		s = strings.ReplaceAll(s, "[ ", "[")
	}
	for strings.Contains(s, " ]") {
		s = strings.ReplaceAll(s, " ]", "]")
	}
	// Normalize spaces inside braces
	for strings.Contains(s, "{ ") {
		s = strings.ReplaceAll(s, "{ ", "{")
	}
	for strings.Contains(s, " }") {
		s = strings.ReplaceAll(s, " }", "}")
	}
	return s
}

func Execute(sub models.Submission) models.Result {

	// 1️⃣ Create temp directory on host
	dir, _ := os.MkdirTemp("", "exec-*")
	os.Chmod(dir, 0777) // Allow docker non-root user to write compilation outputs
	defer os.RemoveAll(dir)

	// Language-specific config
	var image, filename string
	var compileCmd []string
	var runCmd []string
	switch strings.ToLower(sub.Language) {
	case "python":
		image = "judge-python"
		filename = "main.py"
		compileCmd = nil
		runCmd = []string{"python", "/code/main.py"}
	case "javascript":
		image = "judge-node"
		filename = "main.js"
		compileCmd = nil
		runCmd = []string{"node", "/code/main.js"}
	case "typescript":
		image = "judge-node"
		filename = "main.ts"
		compileCmd = []string{"sh", "-c", "npm install -g typescript > /dev/null 2>&1 && tsc /code/main.ts"}
		runCmd = []string{"node", "/code/main.js"}
	case "cpp":
		image = "judge-cpp"
		filename = "main.cpp"
		compileCmd = []string{"sh", "-c", "g++ /code/main.cpp -o /code/main"}
		runCmd = []string{"/code/main"}
	case "c":
		image = "judge-cpp"
		filename = "main.c"
		compileCmd = []string{"sh", "-c", "gcc /code/main.c -o /code/main"}
		runCmd = []string{"/code/main"}
	case "java":
		image = "judge-java"
		filename = "Main.java"
		compileCmd = []string{"sh", "-c", "javac /code/Main.java"}
		runCmd = []string{"java", "-cp", "/code", "Main"}
	case "go":
		image = "judge-go"
		filename = "main.go"
		compileCmd = []string{"sh", "-c", "cd /code && go build -o main main.go"}
		runCmd = []string{"/code/main"}
	case "rust":
		image = "judge-rust"
		filename = "main.rs"
		compileCmd = []string{"sh", "-c", "rustc /code/main.rs -o /code/main"}
		runCmd = []string{"/code/main"}
	default:
		image = "judge-python"
		filename = "main.py"
		compileCmd = nil
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

	// 2️⃣ Compilation Stage (The First Gate)
	if len(compileCmd) > 0 {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		cmd := exec.CommandContext(
			ctx,
			"docker", "run", "-i", "--rm",
			"--network", "none",
			"-v", dir+":/code",
			image,
		)
		cmd.Args = append(cmd.Args, compileCmd...)

		var stdout, stderr bytes.Buffer
		cmd.Stdout = &stdout
		cmd.Stderr = &stderr

		err := cmd.Run()

		if err != nil || stderr.Len() > 0 {
			// Capture the compilation error output
			compileOutput := stderr.String()
			if compileOutput == "" {
				compileOutput = stdout.String()
			}
			if compileOutput == "" && err != nil {
				if ctx.Err() == context.DeadlineExceeded {
					compileOutput = "Compilation Time Limit Exceeded"
				} else {
					compileOutput = err.Error()
				}
			}

			// Compilation Error
			return models.Result{
				Status:  "completed",
				Verdict: "Compilation Error",
				Stderr:  compileOutput,
			}
		}
	}

	// 3️⃣ Build testcase list (fallback chain)
	tests := sub.Tests
	if len(tests) == 0 && sub.Input != "" {
		tests = []models.TestCase{{Input: sub.Input, Expected: ""}}
	}
	if len(tests) == 0 {
		tests = []models.TestCase{{Input: "", Expected: ""}}
	}

	var results []models.TestResult
	overallVerdict := "Accepted"

	for _, tc := range tests {
		// 4️⃣ Execution Stage (The Sandbox Gate)
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
		cancel() // must be called before checking ctx.Err()

		verdict := "Accepted"
		passed := true
		output := stdout.String()

		// ── Error detection (order matters) ──────────────────────────────────
		// 1. Timeout
		if ctx.Err() == context.DeadlineExceeded {
			verdict = "Time Limit Exceeded"
			passed = false
		} else if err != nil {
			verdict = "Runtime Error"
			passed = false
			if exitErr, ok := err.(*exec.ExitError); ok {
				// Exit code 137 (SIGKILL) or 139 (SIGSEGV) frequently indicate out-of-memory in Docker when constrained.
				// For strict Memory Limit Exceeded, 137 is the standard docker OOM exit code.
				if exitErr.ExitCode() == 137 || exitErr.ExitCode() == 139 {
					verdict = "Memory Limit Exceeded"
				}
			}
		}

		// ── Verdict when no expected value (Run / custom testcase) ────────────
		// Don't mark as "Accepted" — the user just wants to see output.
		// Use "Executed" to distinguish from a real correctness check.
		if verdict == "Accepted" && tc.Expected == "" {
			verdict = "Executed"
		}

		// ── Wrong Answer check (Submit / tests with expected values) ─────────
		// 5️⃣ Verification Stage (The Grading Gate)
		if verdict == "Accepted" && tc.Expected != "" {
			gotNorm := normalizeOutput(output)
			wantNorm := normalizeOutput(tc.Expected)
			if gotNorm != wantNorm {
				fmt.Printf("MISMATCH! gotNorm=%q wantNorm=%q\n", gotNorm, wantNorm)
				verdict = "Wrong Answer"
				passed = false
			}
		}

		// Track first non-Accepted overall verdict
		if overallVerdict == "Accepted" && verdict != "Accepted" && verdict != "Executed" {
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

	// If all tests were custom runs (Executed), overall verdict = "Executed"
	allExecuted := true
	for _, r := range results {
		if r.Verdict != "Executed" {
			allExecuted = false
			break
		}
	}
	if allExecuted {
		overallVerdict = "Executed"
	}

	return models.Result{
		Status:      "completed",
		Verdict:     overallVerdict,
		TestResults: results,
	}
}
