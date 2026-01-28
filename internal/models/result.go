package models

type Result struct {
	ID      string `json:"id"`
	Status  string `json:"status"`
	Verdict string `json:"verdict"`
	Stdout  string `json:"stdout"`
	Stderr  string `json:"stderr"`
}
