package models

type Submission struct {
	ID       string `json:"id"`
	Language string `json:"language"`
	Code     string `json:"code"`
	Input    string `json:"input"`
	TimeMs   int    `json:"time_ms"`
	MemoryMB int    `json:"memory_mb"`
}

type Result struct {
	Stdout string `json:"stdout"`
	Stderr string `json:"stderr"`
	Status string `json:"status"`
}
