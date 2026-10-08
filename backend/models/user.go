package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID                 uint           `gorm:"primaryKey" json:"id"`
	Email              string         `gorm:"uniqueIndex;not null" json:"email"`
	Password           string         `gorm:"size:255" json:"-"`
	Name               string         `json:"name"`
	Phone              string         `gorm:"size:32" json:"phone"`
	Bio                string         `gorm:"type:text" json:"bio"`
	GoogleID           *string        `gorm:"uniqueIndex" json:"google_id,omitempty"`
	AvatarURL          string         `json:"avatar_url"`
	CurrencyPreference string         `gorm:"size:10;default:'IDR'" json:"currency_preference"`
	LanguagePreference string         `gorm:"size:10;default:'id'" json:"language_preference"`
	Role               string         `gorm:"default:'PRO_MEMBER'" json:"role"`
	IsVerified         bool           `gorm:"default:false" json:"is_verified"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
}
