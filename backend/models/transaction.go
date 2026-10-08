package models

import (
	"time"

	"gorm.io/gorm"
)

type TransactionType string

const (
	TxIn             TransactionType = "IN"
	TxOut            TransactionType = "OUT"
	TxTransfer       TransactionType = "TRANSFER"
	TxAdjustment     TransactionType = "ADJUSTMENT"
	TxInitialBalance TransactionType = "INITIAL_BALANCE"
)

type TransactionItem struct {
	ID            string         `gorm:"primaryKey;type:varchar(64)" json:"id"`
	TransactionID string         `gorm:"index;type:varchar(64);not null" json:"transactionId"`
	ItemName      string         `gorm:"not null" json:"itemName"`
	CategoryID    string         `json:"categoryId"`
	CategoryName  string         `gorm:"not null" json:"categoryName"`
	Amount        float64        `gorm:"not null" json:"amount"`
	IsFriendOrder bool           `gorm:"default:false" json:"isFriendOrder"`
	FriendName    string         `json:"friendName,omitempty"`
	Rating        int            `gorm:"default:5" json:"rating,omitempty"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

type Transaction struct {
	ID              string            `gorm:"primaryKey;type:varchar(64)" json:"id"`
	UserID          uint              `gorm:"index;not null" json:"userId"`
	WalletID        string            `gorm:"index;type:varchar(64);not null" json:"walletId"`
	WalletName      string            `gorm:"-" json:"walletName"`
	Type            TransactionType   `gorm:"type:varchar(32);not null" json:"type"`
	TotalAmount     float64           `gorm:"not null" json:"totalAmount"`
	TransactionDate string            `gorm:"type:varchar(32);not null" json:"transactionDate"` // YYYY-MM-DD
	LocationName    string            `json:"locationName,omitempty"`
	CityName        string            `json:"cityName,omitempty"`
	Title           string            `gorm:"not null" json:"title"`
	Note            string            `json:"note,omitempty"`
	Items           []TransactionItem `gorm:"foreignKey:TransactionID;constraint:OnDelete:CASCADE" json:"items"`
	CreatedAt       time.Time         `json:"createdAt"`
	UpdatedAt       time.Time         `json:"updatedAt"`
	DeletedAt       gorm.DeletedAt    `gorm:"index" json:"-"`
}
