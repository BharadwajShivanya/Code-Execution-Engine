package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"Code-Execution-Engine/internal/models"
	"Code-Execution-Engine/internal/queue"
)

// POST /api/v1/submissions
func submitHandler(c *gin.Context) {
	var sub models.Submission

	// 1️⃣ Request body read
	if err := c.ShouldBindJSON(&sub); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// 2️⃣ Generate ID and status
	sub.ID = uuid.NewString()
	sub.Status = "queued"

	// 3️⃣ Save submission metadata in Redis
	if err := queue.SaveSubmission(sub); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to save submission",
		})
		return
	}

	// 4️⃣ Push submission ID to queue
	if err := queue.EnqueueSubmission(sub.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to enqueue submission",
		})
		return
	}

	// 5️⃣ Return response
	c.JSON(http.StatusAccepted, gin.H{
		"id":     sub.ID,
		"status": "queued",
	})
}

// GET /api/v1/submissions/:id
func getResultHandler(c *gin.Context) {
	id := c.Param("id")

	// 1️⃣ Check if result exists
	if res, err := queue.GetResult(id); err == nil {
		c.JSON(http.StatusOK, res)
		return
	}

	// 2️⃣ Check submission status
	sub, err := queue.GetSubmission(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "submission not found",
		})
		return
	}

	// 3️⃣ Still queued or running
	c.JSON(http.StatusOK, gin.H{
		"id":     sub.ID,
		"status": sub.Status,
	})
}
