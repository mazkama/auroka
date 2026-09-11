package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Email     string         `gorm:"uniqueIndex;not null" json:"email"`
	Password  string         `gorm:"size:255" json:"-"`
	Name      string         `json:"name"`
	GoogleID  *string        `gorm:"uniqueIndex" json:"google_id,omitempty"`
	AvatarURL string         `json:"avatar_url"`
	Role      string         `gorm:"default:'PRO_MEMBER'" json:"role"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
