package models

import (
	"time"
)

type User struct {
	ID           string    `json:"id" gorm:"primaryKey;type:varchar(255)"`
	Username     string    `json:"username" gorm:"unique;not null"`
	Email        string    `json:"email" gorm:"unique;not null"`
	PasswordHash string    `json:"-" gorm:"not null"` // Hidden from JSON
	CreatedAt    time.Time `json:"created_at"`
}
