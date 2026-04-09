package main

import (
	"github.com/gin-gonic/gin"

	"Code-Execution-Engine/internal/db"
	"Code-Execution-Engine/internal/middleware"
)

func main() {
	db.Init()
	r := gin.Default()

	// Enable CORS for local frontend development
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := r.Group("/api/v1")
	{
		api.GET("/problems", listProblemsHandler)
		api.POST("/submissions", middleware.OptionalAuthMiddleware(), submitHandler)
		api.GET("/submissions/:id", getResultHandler)

		auth := api.Group("/auth")
		{
			auth.POST("/register", registerHandler)
			auth.POST("/login", loginHandler)
		}

		users := api.Group("/users")
		users.Use(middleware.AuthMiddleware())
		{
			users.GET("/me/submissions", mySubmissionsHandler)
		}
	}

	r.Run(":8090")
}
