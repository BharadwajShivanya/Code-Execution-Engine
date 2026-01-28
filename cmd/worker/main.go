package main

import (
	"fmt"
	"time"

	"Code-Execution-Engine/internal/executor"
	"Code-Execution-Engine/internal/models"
	"Code-Execution-Engine/internal/queue"
)

func main() {
	fmt.Println("Worker started")

	for {
		// 1️⃣ Queue se submission ID uthao
		id, err := queue.RDB.RPop(queue.Ctx, "queue:submissions").Result()
		if err != nil {
			time.Sleep(1 * time.Second)
			continue
		}

		// 2️⃣ Submission data lao
		sub, err := queue.GetSubmission(id)
		if err != nil {
			continue
		}

		// 3️⃣ Status update (optional but good)
		sub.Status = "running"
		queue.SaveSubmission(sub)

		// 4️⃣ Code execute karo
		result := executor.Execute(sub)

		// 5️⃣ Result Redis me save karo
		queue.SaveResult(models.Result{
			ID:      sub.ID,
			Status:  "completed",
			Verdict: result.Status,
			Stdout:  result.Stdout,
			Stderr:  result.Stderr,
		})
	}
}
