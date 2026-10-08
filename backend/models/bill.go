package models

import (
	"time"

	"gorm.io/gorm"
)

type Bill struct {
	ID         uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID     uint           `gorm:"index;not null" json:"userId"`
	Name       string         `gorm:"not null" json:"name"`
	Category   string         `gorm:"not null" json:"category"`
	Amount     float64        `gorm:"not null" json:"amount"`
	DueDay     int            `gorm:"not null" json:"dueDay"` // 1 - 31
	Cycle      string         `gorm:"type:varchar(32);default:'MONTHLY'" json:"cycle"` // MONTHLY, YEARLY
	WalletID   string         `gorm:"type:varchar(64)" json:"walletId"`
	WalletName string         `gorm:"-" json:"walletName"`
	Status     string         `gorm:"type:varchar(32);default:'PENDING'" json:"status"` // PENDING, PAID
	LastPaidAt *time.Time     `json:"lastPaidAt"`
	CreatedAt  time.Time      `json:"createdAt"`
	UpdatedAt  time.Time      `json:"updatedAt"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}
