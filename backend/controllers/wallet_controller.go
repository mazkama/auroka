package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mazkama/auroka/backend/config"
	"github.com/mazkama/auroka/backend/middleware"
	"github.com/mazkama/auroka/backend/models"
)

type CreateWalletInput struct {
	Name          string             `json:"name" binding:"required"`
	Type          models.AccountType `json:"type" binding:"required"`
	InitialAmount float64            `json:"initialBalance"`
	AccountNumber string             `json:"accountNumber"`
	IconName      string             `json:"iconName"`
	Color         string             `json:"color"`
}

type UpdateWalletInput struct {
	Name          string             `json:"name"`
	Type          models.AccountType `json:"type"`
	AccountNumber string             `json:"accountNumber"`
	IconName      string             `json:"iconName"`
	Color         string             `json:"color"`
}

// GetWallets returns all wallets belonging to the authenticated user with ledger balance
func GetWallets(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)

	var wallets []models.Wallet
	if err := config.DB.Where("user_id = ?", userID).Order("created_at asc").Find(&wallets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat data dompet"})
		return
	}

	for i := range wallets {
		wallets[i].Balance = config.CalculateWalletBalance(config.DB, wallets[i].ID)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    wallets,
	})
}

// GetWalletByID returns details of a single wallet
func GetWalletByID(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	walletID := c.Param("id")

	var wallet models.Wallet
	if err := config.DB.Where("id = ? AND user_id = ?", walletID, userID).First(&wallet).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dompet tidak ditemukan"})
		return
	}

	wallet.Balance = config.CalculateWalletBalance(config.DB, wallet.ID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    wallet,
	})
}

// CreateWallet creates a new wallet and an optional initial balance transaction
func CreateWallet(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)

	var input CreateWalletInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data input dompet tidak valid"})
		return
	}

	walletID := fmt.Sprintf("w-%d-%d", userID, time.Now().UnixNano()/1e6)
	if input.IconName == "" {
		input.IconName = "BuildingLibrary"
	}
	if input.Color == "" {
		input.Color = "#005caa"
	}

	wallet := models.Wallet{
		ID:            walletID,
		UserID:        userID,
		Name:          input.Name,
		Type:          input.Type,
		AccountNumber: input.AccountNumber,
		IconName:      input.IconName,
		Color:         input.Color,
	}

	tx := config.DB.Begin()
	if err := tx.Create(&wallet).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan dompet"})
		return
	}

	// If initial amount > 0, create an INITIAL_BALANCE ledger transaction
	if input.InitialAmount > 0 {
		initialTx := models.Transaction{
			ID:              fmt.Sprintf("tx-init-%s", walletID),
			UserID:          userID,
			WalletID:        walletID,
			Type:            models.TxInitialBalance,
			TotalAmount:     input.InitialAmount,
			TransactionDate: time.Now().Format("2006-01-02"),
			Title:           fmt.Sprintf("Saldo Awal %s", input.Name),
			Note:            "Pembukuan saldo awal dompet",
			Items: []models.TransactionItem{
				{
					ID:           fmt.Sprintf("item-init-%s", walletID),
					ItemName:     "Saldo Awal",
					CategoryID:   "cat-income",
					CategoryName: "Gaji",
					Amount:       input.InitialAmount,
				},
			},
		}
		if err := tx.Create(&initialTx).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencatat saldo awal dompet"})
			return
		}
	}

	tx.Commit()

	wallet.Balance = config.CalculateWalletBalance(config.DB, wallet.ID)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Dompet berhasil dibuat",
		"data":    wallet,
	})
}

// UpdateWallet updates wallet metadata
func UpdateWallet(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	walletID := c.Param("id")

	var wallet models.Wallet
	if err := config.DB.Where("id = ? AND user_id = ?", walletID, userID).First(&wallet).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dompet tidak ditemukan"})
		return
	}

	var input UpdateWalletInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data update dompet tidak valid"})
		return
	}

	if input.Name != "" {
		wallet.Name = input.Name
	}
	if input.Type != "" {
		wallet.Type = input.Type
	}
	if input.AccountNumber != "" {
		wallet.AccountNumber = input.AccountNumber
	}
	if input.IconName != "" {
		wallet.IconName = input.IconName
	}
	if input.Color != "" {
		wallet.Color = input.Color
	}

	if err := config.DB.Save(&wallet).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui dompet"})
		return
	}

	wallet.Balance = config.CalculateWalletBalance(config.DB, wallet.ID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Dompet berhasil diperbarui",
		"data":    wallet,
	})
}

// DeleteWallet deletes a wallet and its associated ledger transactions
func DeleteWallet(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	walletID := c.Param("id")

	var wallet models.Wallet
	if err := config.DB.Where("id = ? AND user_id = ?", walletID, userID).First(&wallet).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dompet tidak ditemukan"})
		return
	}

	tx := config.DB.Begin()
	// Delete associated transactions & items
	if err := tx.Where("wallet_id = ?", walletID).Delete(&models.Transaction{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus riwayat transaksi dompet"})
		return
	}

	if err := tx.Delete(&wallet).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus dompet"})
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Dompet dan mutasi terkait berhasil dihapus",
	})
}
