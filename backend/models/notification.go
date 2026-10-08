package models

import (
	"time"

	"gorm.io/gorm"
)

type NotificationCategory string
type NotificationPriority string

const (
	NotificationCategorySystem   NotificationCategory = "SYSTEM"
	NotificationCategoryBill     NotificationCategory = "BILL"
	NotificationCategoryBudget   NotificationCategory = "BUDGET"
	NotificationCategorySecurity NotificationCategory = "SECURITY"
	NotificationCategoryWallet   NotificationCategory = "WALLET"

	NotificationPriorityLow    NotificationPriority = "LOW"
	NotificationPriorityMedium NotificationPriority = "MEDIUM"
	NotificationPriorityHigh   NotificationPriority = "HIGH"
)

type Notification struct {
	ID         uint                 `gorm:"primaryKey" json:"id"`
	UserID     uint                 `gorm:"index;not null" json:"user_id"`
	User       User                 `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE;" json:"-"`
	Title      string               `gorm:"size:255;not null" json:"title"`
	Message    string               `gorm:"type:text;not null" json:"message"`
	Category   NotificationCategory `gorm:"size:50;not null;default:'SYSTEM'" json:"category"`
	Priority   NotificationPriority `gorm:"size:20;not null;default:'MEDIUM'" json:"priority"`
	ActionURL  string               `gorm:"size:255" json:"action_url,omitempty"`
	ActionText string               `gorm:"size:100" json:"action_text,omitempty"`
	IsRead     bool                 `gorm:"default:false;index" json:"is_read"`
	ReadAt     *time.Time           `json:"read_at,omitempty"`
	Metadata   string               `gorm:"type:text" json:"metadata,omitempty"` // Optional JSON metadata
	CreatedAt  time.Time            `json:"created_at"`
	UpdatedAt  time.Time            `json:"updated_at"`
	DeletedAt  gorm.DeletedAt       `gorm:"index" json:"-"`
}

type PreferredChannel string

const (
	PreferredChannelWhatsApp PreferredChannel = "WHATSAPP"
	PreferredChannelEmail    PreferredChannel = "EMAIL"
	PreferredChannelInApp    PreferredChannel = "IN_APP"
)

type UserNotificationSettings struct {
	ID                 uint             `gorm:"primaryKey" json:"id"`
	UserID             uint             `gorm:"uniqueIndex;not null" json:"user_id"`
	User               User             `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE;" json:"-"`
	WhatsAppEnabled    bool             `gorm:"default:false" json:"whatsapp_enabled"`
	EmailEnabled       bool             `gorm:"default:true" json:"email_enabled"`
	InAppEnabled       bool             `gorm:"default:true" json:"in_app_enabled"`
	PreferredChannel   PreferredChannel `gorm:"size:20;default:'IN_APP'" json:"preferred_channel"`
	PhoneNumber        string           `gorm:"size:32" json:"phone_number"`
	IsPhoneVerified    bool             `gorm:"default:false" json:"is_phone_verified"`
	PhoneVerifiedAt    *time.Time       `json:"phone_verified_at,omitempty"`
	BillReminders      bool             `gorm:"default:true" json:"bill_reminders"`
	BudgetAlerts       bool             `gorm:"default:true" json:"budget_alerts"`
	LowBalanceAlerts   bool             `gorm:"default:true" json:"low_balance_alerts"`
	SecurityAlerts     bool             `gorm:"default:true" json:"security_alerts"`
	BudgetThresholdPct int              `gorm:"default:80" json:"budget_threshold_pct"` // e.g. 80%
	CreatedAt          time.Time        `json:"created_at"`
	UpdatedAt          time.Time        `json:"updated_at"`
	DeletedAt          gorm.DeletedAt   `gorm:"index" json:"-"`
}

type NotificationDeliveryLog struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	UserID       uint           `gorm:"index;not null" json:"user_id"`
	Channel      string         `gorm:"size:20;not null" json:"channel"` // WHATSAPP, EMAIL, IN_APP
	NotificationType string     `gorm:"size:50;not null;index" json:"notification_type"` // BILL_REMINDER, BUDGET_WARNING, etc.
	ReferenceKey string         `gorm:"size:100;index" json:"reference_key"` // e.g. bill-12-2026-10-05 or budget-5-2026-10
	Recipient    string         `gorm:"size:100" json:"recipient"` // phone number or email
	Status       string         `gorm:"size:30;default:'SENT'" json:"status"` // SENT, FAILED, SKIPPED
	ResponseData string         `gorm:"type:text" json:"response_data,omitempty"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}
