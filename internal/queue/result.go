package queue

import (
	"encoding/json"

	"Code-Execution-Engine/internal/models"
)

func SaveResult(res models.Result) error {
	data, _ := json.Marshal(res)
	return RDB.Set(Ctx, "result:"+res.ID, data, 0).Err()
}

func GetResult(id string) (models.Result, error) {
	var res models.Result
	data, err := RDB.Get(Ctx, "result:"+id).Result()
	if err != nil {
		return res, err
	}
	json.Unmarshal([]byte(data), &res)
	return res, nil
}
