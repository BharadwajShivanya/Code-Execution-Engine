package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

type ProblemExample struct {
	Input       string `json:"input"`
	Output      string `json:"output"`
	Explanation string `json:"explanation,omitempty"`
}

type ProblemExamples []ProblemExample

func (pe *ProblemExamples) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(bytes, &pe)
}

func (pe ProblemExamples) Value() (driver.Value, error) {
	return json.Marshal(pe)
}

type Problem struct {
	ID          string          `json:"id" gorm:"primaryKey;type:varchar(255)"`
	Title       string          `json:"title"`
	Difficulty  string          `json:"difficulty"`
	Description string          `json:"description" gorm:"type:text"`
	Examples    ProblemExamples `json:"examples" gorm:"type:text"`
	Tests       TestCases       `json:"tests" gorm:"type:text"`
}
