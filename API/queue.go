package main

import (
	"log"

	amqp "github.com/rabbitmq/amqp091-go"
)

var channel *amqp.Channel

func initQueue() {
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		log.Fatal("Failed to connect to RabbitMQ")
	}

	ch, err := conn.Channel()
	if err != nil {
		log.Fatal("Failed to open channel")
	}

	_, err = ch.QueueDeclare(
		"code_jobs",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatal("Failed to declare queue")
	}

	channel = ch
}

func sendToQueue(message []byte) error {
	return channel.Publish(
		"",
		"code_jobs",
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        message,
		},
	)
}
