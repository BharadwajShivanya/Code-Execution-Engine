package main

import (
	"net/http"

	"Code-Execution-Engine/internal/models"
	"Code-Execution-Engine/internal/queue"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var q = queue.NewQueue("localhost:6379")

func main() {
	r := gin.Default()

	r.POST("/submit", func(c *gin.Context) {
		var sub models.Submission
		if err := c.BindJSON(&sub); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		sub.ID = uuid.NewString()
		q.Enqueue(sub)
		c.JSON(http.StatusOK, gin.H{"id": sub.ID})
	})

	r.Run(":8090")
}
