package queue

import (
	"context"
	"encoding/json"

	"Code-Execution-Engine/internal/models"
	"github.com/go-redis/redis/v8"
)

var ctx = context.Background()

type RedisQueue struct {
	client *redis.Client
}

func NewQueue(addr string) *RedisQueue {
	rdb := redis.NewClient(&redis.Options{Addr: addr})
	return &RedisQueue{client: rdb}
}

func (q *RedisQueue) Enqueue(sub models.Submission) error {
	b, _ := json.Marshal(sub)
	return q.client.LPush(ctx, "jobs", b).Err()
}

func (q *RedisQueue) Dequeue() (*models.Submission, error) {
	item, err := q.client.RPop(ctx, "jobs").Bytes()
	if err != nil {
		return nil, err
	}
	var sub models.Submission
	json.Unmarshal(item, &sub)
	return &sub, nil
}
