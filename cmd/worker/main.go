package main

import (
	"fmt"
	"time"

	"Code-Execution-Engine/internal/executor"
	"Code-Execution-Engine/internal/queue"
)

func main() {
	q := queue.NewQueue("localhost:6379")
	fmt.Println("Worker started")

	for {
		sub, err := q.Dequeue()
		if err != nil {
			time.Sleep(500 * time.Millisecond)
			continue
		}

		res := executor.Execute(*sub)
		fmt.Println("Result:", res.Status)
	}
}
