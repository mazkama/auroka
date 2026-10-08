package models

import (
	"time"

	"gorm.io/gorm"
)

type Budget struct {
	ID          string         `gorm:"primaryKey;type:varchar(64)" json:"id"`
	UserID      uint           `gorm:"index;not null" json:"userId"`
	Category    string         `gorm:"not null" json:"category"`
	LimitAmount float64        `gorm:"not null" json:"limitAmount"`
	SpentAmount float64        `gorm:"-" json:"spentAmount"` // Calculated dynamically from monthly expense
	Month       string         `gorm:"type:varchar(16);not null" json:"month"` // YYYY-MM
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
