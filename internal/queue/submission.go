package queue

import (
	"encoding/json"

	"Code-Execution-Engine/internal/models"
)

func SaveSubmission(sub models.Submission) error {
	data, _ := json.Marshal(sub)
	return RDB.Set(Ctx, "submission:"+sub.ID, data, 0).Err()
}

func GetSubmission(id string) (models.Submission, error) {
	var sub models.Submission
	data, err := RDB.Get(Ctx, "submission:"+id).Result()
	if err != nil {
		return sub, err
	}
	json.Unmarshal([]byte(data), &sub)
	return sub, nil
}

func EnqueueSubmission(id string) error {
	return RDB.LPush(Ctx, "queue:submissions", id).Err()
}
