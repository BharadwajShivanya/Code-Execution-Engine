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
		{
			ID:          "climbing-stairs",
			Title:       "Climbing Stairs",
			Difficulty:  "Easy",
			Description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
			Examples: []models.ProblemExample{
				{Input: "2", Output: "2", Explanation: "There are two ways to climb to the top: 1 step + 1 step, or 2 steps."},
				{Input: "3", Output: "3", Explanation: "There are three ways to climb to the top: 1+1+1, 1+2, or 2+1."},
			},
			Tests: []models.TestCase{
				{Input: "2", Expected: "2"},
				{Input: "3", Expected: "3"},
				{Input: "5", Expected: "8"},
			},
		},
		{
			ID:          "longest-substring-without-repeating-characters",
			Title:       "Longest Substring Without Repeating Characters",
			Difficulty:  "Medium",
			Description: "Given a string s, find the length of the longest substring without repeating characters.",
			Examples: []models.ProblemExample{
				{Input: "abcabcbb", Output: "3", Explanation: "The answer is 'abc', with the length of 3."},
				{Input: "bbbbb", Output: "1", Explanation: "The answer is 'b', with the length of 1."},
				{Input: "pwwkew", Output: "3", Explanation: "The answer is 'wke', with the length of 3."},
			},
			Tests: []models.TestCase{
				{Input: "abcabcbb", Expected: "3"},
				{Input: "bbbbb", Expected: "1"},
				{Input: "pwwkew", Expected: "3"},
			},
		},
		{
			ID:          "median-of-two-sorted-arrays",
			Title:       "Median of Two Sorted Arrays",
			Difficulty:  "Hard",
			Description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
			Examples: []models.ProblemExample{
				{Input: "1 3\n2", Output: "2.00000", Explanation: "merged array = [1,2,3] and median is 2."},
			},
			Tests: []models.TestCase{
				{Input: "1 3\n2", Expected: "2.00000"},
				{Input: "1 2\n3 4", Expected: "2.50000"},
			},
		},
		{
			ID:          "trapping-rain-water",
			Title:       "Trapping Rain Water",
			Difficulty:  "Hard",
			Description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
			Examples: []models.ProblemExample{
				{Input: "0 1 0 2 1 0 1 3 2 1 2 1", Output: "6", Explanation: "The elevation map traps 6 units of rain water."},
			},
			Tests: []models.TestCase{
				{Input: "0 1 0 2 1 0 1 3 2 1 2 1", Expected: "6"},
				{Input: "4 2 0 3 2 5", Expected: "9"},
			},
		},
		{
			ID:          "first-missing-positive",
			Title:       "First Missing Positive",
			Difficulty:  "Hard",
			Description: "Given an unsorted integer array nums, return the smallest missing positive integer.",
			Examples: []models.ProblemExample{
				{Input: "1 2 0", Output: "3"},
				{Input: "3 4 -1 1", Output: "2"},
			},
			Tests: []models.TestCase{
				{Input: "1 2 0", Expected: "3"},
				{Input: "3 4 -1 1", Expected: "2"},
			},
		},
		{
			ID:          "edit-distance",
			Title:       "Edit Distance",
			Difficulty:  "Hard",
			Description: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.",
			Examples: []models.ProblemExample{
				{Input: "horse\nros", Output: "3"},
			},
			Tests: []models.TestCase{
				{Input: "horse\nros", Expected: "3"},
				{Input: "intention\nexecution", Expected: "5"},
			},
		},
		{
			ID:          "longest-valid-parentheses",
			Title:       "Longest Valid Parentheses",
			Difficulty:  "Hard",
			Description: "Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.",
			Examples: []models.ProblemExample{
				{Input: "(()", Output: "2"},
				{Input: ")()())", Output: "4"},
			},
			Tests: []models.TestCase{
				{Input: "(()", Expected: "2"},
				{Input: ")()())", Expected: "4"},
			},
		},
		{
			ID:          "container-with-most-water",
			Title:       "Container With Most Water",
			Difficulty:  "Medium",
			Description: "You are given an integer array height of length n. Return the maximum amount of water a container can store.",
			Examples: []models.ProblemExample{
				{Input: "1 8 6 2 5 4 8 3 7", Output: "49"},
			},
			Tests: []models.TestCase{
				{Input: "1 8 6 2 5 4 8 3 7", Expected: "49"},
				{Input: "1 1", Expected: "1"},
			},
		},
		{
			ID:          "maximum-subarray",
			Title:       "Maximum Subarray",
			Difficulty:  "Medium",
			Description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
			Examples: []models.ProblemExample{
				{Input: "-2 1 -3 4 -1 2 1 -5 4", Output: "6"},
			},
			Tests: []models.TestCase{
				{Input: "-2 1 -3 4 -1 2 1 -5 4", Expected: "6"},
				{Input: "1", Expected: "1"},
			},
		},
		{
			ID:          "search-in-rotated-sorted-array",
			Title:       "Search in Rotated Sorted Array",
			Difficulty:  "Medium",
			Description: "Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.",
			Examples: []models.ProblemExample{
				{Input: "4 5 6 7 0 1 2\n0", Output: "4"},
			},
			Tests: []models.TestCase{
				{Input: "4 5 6 7 0 1 2\n0", Expected: "4"},
				{Input: "4 5 6 7 0 1 2\n3", Expected: "-1"},
			},
		},
		{
			ID:          "longest-palindromic-substring",
			Title:       "Longest Palindromic Substring",
			Difficulty:  "Medium",
			Description: "Given a string s, return the longest palindromic substring in s.",
			Examples: []models.ProblemExample{
				{Input: "babad", Output: "bab"},
			},
			Tests: []models.TestCase{
				{Input: "babad", Expected: "bab"},
				{Input: "cbbd", Expected: "bb"},
			},
		},
		{
			ID:          "jump-game",
			Title:       "Jump Game",
			Difficulty:  "Medium",
			Description: "You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise.",
			Examples: []models.ProblemExample{
				{Input: "2 3 1 1 4", Output: "true"},
				{Input: "3 2 1 0 4", Output: "false"},
			},
			Tests: []models.TestCase{
				{Input: "2 3 1 1 4", Expected: "true"},
				{Input: "3 2 1 0 4", Expected: "false"},
			},
		},
		{
			ID:          "single-number",
			Title:       "Single Number",
			Difficulty:  "Easy",
			Description: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.",
			Examples: []models.ProblemExample{
				{Input: "2 2 1", Output: "1"},
			},
			Tests: []models.TestCase{
				{Input: "2 2 1", Expected: "1"},
				{Input: "4 1 2 1 2", Expected: "4"},
			},
		},
		{
			ID:          "missing-number",
			Title:       "Missing Number",
			Difficulty:  "Easy",
			Description: "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.",
			Examples: []models.ProblemExample{
				{Input: "3 0 1", Output: "2"},
			},
			Tests: []models.TestCase{
				{Input: "3 0 1", Expected: "2"},
				{Input: "0 1", Expected: "2"},
			},
		},
		{
			ID:          "majority-element",
			Title:       "Majority Element",
			Difficulty:  "Easy",
			Description: "Given an array nums of size n, return the majority element.",
			Examples: []models.ProblemExample{
				{Input: "3 2 3", Output: "3"},
			},
			Tests: []models.TestCase{
				{Input: "3 2 3", Expected: "3"},
				{Input: "2 2 1 1 1 2 2", Expected: "2"},
			},
		},

	}

	c.JSON(http.StatusOK, problems)
}
