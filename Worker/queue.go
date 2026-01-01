package main

import (
	"log"

	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	RabbitMQURL = "amqp://guest:guest@localhost:5672/"
	QueueName   = "code_jobs"
)

// connectRabbitMQ creates connection and channel to RabbitMQ
func connectRabbitMQ() (*amqp.Connection, *amqp.Channel) {
	conn, err := amqp.Dial(RabbitMQURL)
	if err != nil {
		log.Fatal("Failed to connect to RabbitMQ:", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		log.Fatal("Failed to open channel:", err)
	}

	_, err = ch.QueueDeclare(
		QueueName, // queue name
		true,      // durable
		false,     // auto-delete
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	if err != nil {
		log.Fatal("Failed to declare queue:", err)
	}

	return conn, ch
}
