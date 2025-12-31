package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/google/uuid"
)

type RunRequest struct {
	Code     string `json:"code"`
	Language string `json:"language"`
}

type Job struct {
	SubmissionID string `json:"submission_id"`
	Code         string `json:"code"`
	Language     string `json:"language"`
}

func runHandler(w http.ResponseWriter, r *http.Request) {
	var req RunRequest
	json.NewDecoder(r.Body).Decode(&req)

	job := Job{
		SubmissionID: uuid.New().String(),
		Code:         req.Code,
		Language:     req.Language,
	}

	body, _ := json.Marshal(job)
	sendToQueue(body)

	response := map[string]string{
		"submission_id": job.SubmissionID,
		"status":        "QUEUED",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	initQueue()

	http.HandleFunc("/run", runHandler)

	log.Println("API running on :8080")
	http.ListenAndServe(":8080", nil)
}
