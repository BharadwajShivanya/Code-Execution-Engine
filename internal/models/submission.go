package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

type TestCase struct {
	Input    string `json:"input"`
	Expected string `json:"expected"`
}

type TestCases []TestCase

func (tc *TestCases) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(bytes, &tc)
}

func (tc TestCases) Value() (driver.Value, error) {
	return json.Marshal(tc)
}

type Submission struct {
	ID        string    `json:"id" gorm:"primaryKey;type:varchar(255)"`
	UserID    *string   `json:"user_id" gorm:"type:varchar(255);index"`
	Language  string    `json:"language"`
	Code      string    `json:"code" gorm:"type:text"`
	Input     string    `json:"input" gorm:"type:text"`
	Tests     TestCases `json:"tests,omitempty" gorm:"type:text"`
	TimeMs    int       `json:"time_ms"`
	MemoryMB  int       `json:"memory_mb"`
	Status    string    `json:"status"`
	Verdict   string    `json:"verdict"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
}
