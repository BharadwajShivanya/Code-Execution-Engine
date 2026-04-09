package main

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"Code-Execution-Engine/internal/db"
	"Code-Execution-Engine/internal/models"
	"Code-Execution-Engine/internal/queue"
)

// POST /api/v1/submissions
func submitHandler(c *gin.Context) {
	var sub models.Submission

	if err := c.ShouldBindJSON(&sub); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	validLanguages := map[string]bool{
		"python": true, "javascript": true, "java": true, "cpp": true,
		"c": true, "go": true, "rust": true, "typescript": true,
	}
	if !validLanguages[strings.ToLower(sub.Language)] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid language"})
		return
	}
	if len(sub.Code) > 10000 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "code too long"})
		return
	}

	sub.ID = uuid.NewString()
	sub.Status = "queued"
	
	// Read UserID if JWT was attached!
	if uid, exists := c.Get("user_id"); exists {
		parsedUID := uid.(string)
		sub.UserID = &parsedUID
	}

	if sub.TimeMs == 0 {
		sub.TimeMs = 5000
	}
	if sub.MemoryMB == 0 {
		sub.MemoryMB = 256
	}

	// 1️⃣ Save to DB
	if err := db.DB.Create(&sub).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save submission to db"})
		return
	}

	// 2️⃣ Save submission metadata in Redis
	if err := queue.SaveSubmission(sub); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save submission"})
		return
	}

	// 3️⃣ Push submission ID to queue
	if err := queue.EnqueueSubmission(sub.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to enqueue submission"})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{
		"id":     sub.ID,
		"status": "queued",
	})
}

// GET /api/v1/submissions/:id
func getResultHandler(c *gin.Context) {
	id := c.Param("id")

	// 1️⃣ Try Redis first for full detailed test results
	if res, err := queue.GetResult(id); err == nil {
		c.JSON(http.StatusOK, res)
		return
	}

	// 2️⃣ If not in Redis, check DB
	var sub models.Submission
	if err := db.DB.First(&sub, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "submission not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":      sub.ID,
		"status":  sub.Status,
		"verdict": sub.Verdict,
	})
}

// GET /api/v1/problems
func listProblemsHandler(c *gin.Context) {
	var problems []models.Problem
	if err := db.DB.Find(&problems).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch problems"})
		return
	}
	c.JSON(http.StatusOK, problems)
}
