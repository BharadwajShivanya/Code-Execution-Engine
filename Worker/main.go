package main

import (
	"encoding/json"
	"log"
)

// Job represents the message structure coming from API
type Job struct {
	SubmissionID string `json:"submission_id"`
	Language     string `json:"language"`
	Code         string `json:"code"`
	Stdin        string `json:"stdin"`
}

func main() {
	// Connect to RabbitMQ
	conn, ch := connectRabbitMQ()
	defer conn.Close()
	defer ch.Close()

	// Start consuming messages
	msgs, err := ch.Consume(
		QueueName, // queue name
		"",        // consumer tag
		false,     // auto-ack disabled
		false,     // exclusive
		false,     // no-local
		false,     // no-wait
		nil,       // args
	)
	if err != nil {
		log.Fatal("Failed to consume messages:", err)
	}

	log.Println("🚀 Go Worker started. Waiting for jobs...")

	// Keep the worker running
	forever := make(chan bool)

	go func() {
		for msg := range msgs {
			var job Job

			// Decode job message
			err := json.Unmarshal(msg.Body, &job)
			if err != nil {
				log.Println("Invalid job format:", err)
				msg.Nack(false, false)
				continue
			}

			// Phase 1: just print job details
			log.Println("📥 Job Received")
			log.Println("Submission ID:", job.SubmissionID)
			log.Println("Language:", job.Language)
			log.Println("Code:", job.Code)
			log.Println("-----------------------------")

			// Acknowledge message
			msg.Ack(false)
			log.Println("✅ Job acknowledged")
		}
	}()

	<-forever
}
