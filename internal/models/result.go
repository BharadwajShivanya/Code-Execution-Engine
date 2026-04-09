package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

type TestResult struct {
	Input    string `json:"input"`
	Expected string `json:"expected"`
	Output   string `json:"output"`
	Passed   bool   `json:"passed"`
	Verdict  string `json:"verdict"`
	Stdout   string `json:"stdout"`
	Stderr   string `json:"stderr"`
}

type TestResults []TestResult

func (tr *TestResults) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(bytes, &tr)
}

func (tr TestResults) Value() (driver.Value, error) {
	return json.Marshal(tr)
}

type Result struct {
	ID          string      `json:"id" gorm:"primaryKey;type:varchar(255)"`
	Status      string      `json:"status"`
	Verdict     string      `json:"verdict"`
	Stdout      string      `json:"stdout" gorm:"type:text"`
	Stderr      string      `json:"stderr" gorm:"type:text"`
	TestResults TestResults `json:"test_results,omitempty" gorm:"type:text"`
}
