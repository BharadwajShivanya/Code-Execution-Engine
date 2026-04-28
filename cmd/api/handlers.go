package main

import (
	"net/http"
	"strings"

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

	// 2️⃣ Validate input
	validLanguages := map[string]bool{
		"python": true, "javascript": true, "java": true, "cpp": true,
		"c": true, "go": true, "rust": true, "typescript": true,
	}
	if !validLanguages[strings.ToLower(sub.Language)] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid language",
		})
		return
	}
	if len(sub.Code) > 10000 { // 10KB limit
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "code too long",
		})
		return
	}

	// 3️⃣ Generate ID and status
	sub.ID = uuid.NewString()
	sub.Status = "queued"

	// Set defaults
	if sub.TimeMs == 0 {
		sub.TimeMs = 5000 // 5 seconds
	}
	if sub.MemoryMB == 0 {
		sub.MemoryMB = 256 // 256 MB
	}

	// 4️⃣ Save submission metadata in Redis
	if err := queue.SaveSubmission(sub); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to save submission",
		})
		return
	}

	// 5️⃣ Push submission ID to queue
	if err := queue.EnqueueSubmission(sub.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to enqueue submission",
		})
		return
	}

	// 6️⃣ Return response
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

// GET /api/v1/problems
func listProblemsHandler(c *gin.Context) {
	problems := []models.Problem{
		{
			ID:          "two-sum",
			Title:       "Two Sum",
			Difficulty:  "Easy",
			Description: "Given an array of integers and a target, return indices of two numbers such that they add up to the target.",
			Examples: []models.ProblemExample{
				{Input: "2 7 11 15\n9", Output: "[0,1]", Explanation: "Because nums[0] + nums[1] == 9."},
				{Input: "3 2 4\n6", Output: "[1,2]", Explanation: "Because nums[1] + nums[2] == 6."},
				{Input: "3 3\n6", Output: "[0,1]", Explanation: "Because nums[0] + nums[1] == 6."},
			},
			Tests: []models.TestCase{
				{Input: "2 7 11 15\n9", Expected: "[0,1]"},
				{Input: "3 2 4\n6", Expected: "[1,2]"},
				{Input: "3 3\n6", Expected: "[0,1]"},
			},
		},
		{
			ID:          "palindrome-number",
			Title:       "Palindrome Number",
			Difficulty:  "Easy",
			Description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
			Examples: []models.ProblemExample{
				{Input: "121", Output: "true", Explanation: "121 reads as 121 from left to right and from right to left."},
				{Input: "-121", Output: "false", Explanation: "From left to right, it reads -121. From right to left, it becomes 121-."},
				{Input: "10", Output: "false", Explanation: "Reads 01 from right to left. Therefore it is not a palindrome."},
			},
			Tests: []models.TestCase{
				{Input: "121", Expected: "true"},
				{Input: "-121", Expected: "false"},
				{Input: "10", Expected: "false"},
			},
		},
		{
			ID:          "fizz-buzz",
			Title:       "Fizz Buzz",
			Difficulty:  "Easy",
			Description: "Given an integer n, return a string array answer (1-indexed) where: answer[i] == 'FizzBuzz' if i is divisible by 3 and 5, 'Fizz' if divisible by 3, 'Buzz' if divisible by 5, and i (as a string) if none of the above.",
			Examples: []models.ProblemExample{
				{Input: "3", Output: "[\"1\",\"2\",\"Fizz\"]"},
				{Input: "5", Output: "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"]"},
			},
			Tests: []models.TestCase{
				{Input: "3", Expected: "[\"1\",\"2\",\"Fizz\"]"},
				{Input: "5", Expected: "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"]"},
			},
		},
		{
			ID:          "valid-parentheses",
			Title:       "Valid Parentheses",
			Difficulty:  "Easy",
			Description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
			Examples: []models.ProblemExample{
				{Input: "()", Output: "true"},
				{Input: "()[]{}", Output: "true"},
				{Input: "(]", Output: "false"},
			},
			Tests: []models.TestCase{
				{Input: "()", Expected: "true"},
				{Input: "()[]{}", Expected: "true"},
				{Input: "(]", Expected: "false"},
			},
		},
		{
			ID:          "reverse-integer",
			Title:       "Reverse Integer",
			Difficulty:  "Medium",
			Description: "Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range, then return 0.",
			Examples: []models.ProblemExample{
				{Input: "123", Output: "321"},
				{Input: "-123", Output: "-321"},
				{Input: "120", Output: "21"},
			},
			Tests: []models.TestCase{
				{Input: "123", Expected: "321"},
				{Input: "-123", Expected: "-321"},
				{Input: "120", Expected: "21"},
			},
		},
	}

	c.JSON(http.StatusOK, problems)
}
