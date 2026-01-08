package docker

import (
	"bytes"
	"context"
	"fmt"
	"os/exec"
	"time"
)

func RunPython(dir string, timeLimitMs int, memoryMB int) (string, string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeLimitMs)*time.Millisecond)
	defer cancel()

	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "--rm",
		"--network", "none",
		fmt.Sprintf("--memory=%dm", memoryMB),
		"--cpus=0.5",
		"-v", fmt.Sprintf("%s:/home/runner", dir),
		"judge-python",
	)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	if ctx.Err() == context.DeadlineExceeded {
		return stdout.String(), stderr.String(), ctx.Err()
	}

	return stdout.String(), stderr.String(), err
}
