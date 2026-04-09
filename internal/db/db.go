package db

import (
	"log"
	"os"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"Code-Execution-Engine/internal/models"
)

var DB *gorm.DB

func Init() {
	dbPath := "gorm.db"
	
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			LogLevel: logger.Info,
			Colorful: true,
		},
	)

	var err error
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	// Migrate the schema
	err = DB.AutoMigrate(
		&models.User{},
		&models.Problem{},
		&models.Submission{},
	)
	if err != nil {
		log.Fatalf("failed to run migrations: %v", err)
	}

	SeedProblems()
}

func SeedProblems() {
	var count int64
	DB.Model(&models.Problem{}).Count(&count)
	if count == 0 {
		problems := []models.Problem{
			{
				ID:          "two-sum",
				Title:       "Two Sum",
				Difficulty:  "Easy",
				Description: "Given an array of integers and a target, return indices of two numbers such that they add up to the target.",
				Examples: models.ProblemExamples{
					{Input: "2 7 11 15\n9", Output: "[0,1]", Explanation: "Because nums[0] + nums[1] == 9."},
					{Input: "3 2 4\n6", Output: "[1,2]", Explanation: "Because nums[1] + nums[2] == 6."},
					{Input: "3 3\n6", Output: "[0,1]", Explanation: "Because nums[0] + nums[1] == 6."},
				},
				Tests: models.TestCases{
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
				Examples: models.ProblemExamples{
					{Input: "121", Output: "true", Explanation: "121 reads as 121 from left to right and from right to left."},
					{Input: "-121", Output: "false", Explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome."},
				},
				Tests: models.TestCases{
					{Input: "121", Expected: "true"},
					{Input: "-121", Expected: "false"},
					{Input: "10", Expected: "false"},
				},
			},
		}

		for _, p := range problems {
			DB.Create(&p)
		}
		log.Println("Seeded problems database.")
	}
}
