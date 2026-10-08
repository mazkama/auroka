package models

import (
	"time"

	"gorm.io/gorm"
)

type AccountType string

const (
	TypeBank    AccountType = "BANK"
	TypeEWallet AccountType = "E_WALLET"
	TypeCrypto  AccountType = "CRYPTO"
	TypeCash    AccountType = "CASH"
)

type Wallet struct {
	ID            string         `gorm:"primaryKey;type:varchar(64)" json:"id"`
	UserID        uint           `gorm:"index;not null" json:"userId"`
	Name          string         `gorm:"not null" json:"name"`
	Type          AccountType    `gorm:"type:varchar(32);not null" json:"type"`
	Balance       float64        `gorm:"-" json:"balance"` // Calculated via Ledger
	AccountNumber string         `json:"accountNumber,omitempty"`
	IconName      string         `gorm:"default:'BuildingLibrary'" json:"iconName"`
	Color         string         `gorm:"default:'#005caa'" json:"color"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}
