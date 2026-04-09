package main

import (
	"fmt"
	"time"

	"Code-Execution-Engine/internal/db"
	"Code-Execution-Engine/internal/executor"
	"Code-Execution-Engine/internal/models"
	"Code-Execution-Engine/internal/queue"
)

func main() {
	fmt.Println("Worker started")
	db.Init()

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
			// Try DB if redis missing
			var dbSub models.Submission
			if er := db.DB.First(&dbSub, "id = ?", id).Error; er == nil {
				sub = dbSub
			} else {
				continue
			}
		}

		// 3️⃣ Status update (optional but good)
		sub.Status = "running"
		queue.SaveSubmission(sub)
		db.DB.Model(&models.Submission{}).Where("id = ?", sub.ID).Update("status", "running")

		// 4️⃣ Code execute karo
		result := executor.Execute(sub)
		result.ID = sub.ID
		result.Status = "completed"

		// 5️⃣ Result Redis me save karo
		queue.SaveResult(result)

		// 6️⃣ Result DB me save karo
		db.DB.Model(&models.Submission{}).Where("id = ?", sub.ID).Updates(models.Submission{
			Status:  result.Status,
			Verdict: result.Verdict,
		})
	}
}
