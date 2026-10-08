package models

import (
	"time"

	"gorm.io/gorm"
)

type OTPType string
type OTPChannel string

const (
	OTPTypeEmailVerification OTPType = "EMAIL_VERIFICATION"
	OTPTypePasswordReset     OTPType = "PASSWORD_RESET"
	OTPTypePhoneVerification OTPType = "PHONE_VERIFY"

	OTPChannelEmail    OTPChannel = "EMAIL"
	OTPChannelWhatsApp OTPChannel = "WHATSAPP"
)

type OTP struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Email     string         `gorm:"index" json:"email"`
	Phone     string         `gorm:"index;size:32" json:"phone"`
	Code      string         `gorm:"size:10;not null" json:"code"`
	Type      OTPType        `gorm:"size:50;not null;default:'EMAIL_VERIFICATION'" json:"type"`
	Channel   OTPChannel     `gorm:"size:20;not null;default:'EMAIL'" json:"channel"`
	IsUsed    bool           `gorm:"default:false" json:"is_used"`
	ExpiresAt time.Time      `json:"expires_at"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
