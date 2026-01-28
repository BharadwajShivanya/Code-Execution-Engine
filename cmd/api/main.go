package main

import "github.com/gin-gonic/gin"

func main() {
	r := gin.Default()

	api := r.Group("/api/v1")
	{
		api.POST("/submissions", submitHandler)
		api.GET("/submissions/:id", getResultHandler)
	}

	r.Run(":8090")
}
