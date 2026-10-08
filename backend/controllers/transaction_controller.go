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

type CreateTransactionItemInput struct {
	ItemName      string  `json:"itemName" binding:"required"`
	CategoryID    string  `json:"categoryId"`
	CategoryName  string  `json:"categoryName" binding:"required"`
	Amount        float64 `json:"amount" binding:"required"`
	IsFriendOrder bool    `json:"isFriendOrder"`
	FriendName    string  `json:"friendName"`
	Rating        int     `json:"rating"`
}

type CreateTransactionInput struct {
	WalletID        string                       `json:"walletId" binding:"required"`
	Type            models.TransactionType       `json:"type" binding:"required"`
	Title           string                       `json:"title" binding:"required"`
	TotalAmount     float64                      `json:"totalAmount"`
	TransactionDate string                       `json:"transactionDate"` // YYYY-MM-DD
	LocationName    string                       `json:"locationName"`
	CityName        string                       `json:"cityName"`
	Note            string                       `json:"note"`
	Items           []CreateTransactionItemInput `json:"items"`
}

type UpdateTransactionInput struct {
	WalletID        string                       `json:"walletId"`
	Type            models.TransactionType       `json:"type"`
	Title           string                       `json:"title"`
	TotalAmount     float64                      `json:"totalAmount"`
	TransactionDate string                       `json:"transactionDate"`
	LocationName    string                       `json:"locationName"`
	CityName        string                       `json:"cityName"`
	Note            string                       `json:"note"`
	Items           []CreateTransactionItemInput `json:"items"`
}

type TransferInput struct {
	SourceWalletID      string  `json:"sourceWalletId" binding:"required"`
	DestinationWalletID string  `json:"destWalletId" binding:"required"`
	Amount              float64 `json:"amount" binding:"required"`
	AdminFee            float64 `json:"adminFee"`
	TransactionDate     string  `json:"transactionDate"`
	Note                string  `json:"note"`
}

// GetTransactions returns all transactions with their details
func GetTransactions(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	walletID := c.Query("walletId")
	txType := c.Query("type")
	category := c.Query("category")
	startDate := c.Query("startDate")
	endDate := c.Query("endDate")

	query := config.DB.Preload("Items").Where("user_id = ?", userID)

	if walletID != "" {
		query = query.Where("wallet_id = ?", walletID)
	}
	if txType != "" {
		query = query.Where("type = ?", txType)
	}
	if startDate != "" {
		query = query.Where("transaction_date >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("transaction_date <= ?", endDate)
	}

	var transactions []models.Transaction
	if err := query.Order("transaction_date desc, created_at desc").Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat daftar transaksi"})
		return
	}

	// Fetch wallet names map
	var wallets []models.Wallet
	config.DB.Where("user_id = ?", userID).Find(&wallets)
	walletMap := make(map[string]string)
	for _, w := range wallets {
		walletMap[w.ID] = w.Name
	}

	filtered := make([]models.Transaction, 0)
	for i := range transactions {
		transactions[i].WalletName = walletMap[transactions[i].WalletID]
		if transactions[i].WalletName == "" {
			transactions[i].WalletName = "Dompet Terhapus"
		}

		if category != "" {
			hasCat := false
			for _, item := range transactions[i].Items {
				if item.CategoryName == category {
					hasCat = true
					break
				}
			}
			if hasCat {
				filtered = append(filtered, transactions[i])
			}
		} else {
			filtered = append(filtered, transactions[i])
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    filtered,
	})
}

// GetTransactionByID returns a single transaction with items
func GetTransactionByID(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	id := c.Param("id")

	var tx models.Transaction
	if err := config.DB.Preload("Items").Where("id = ? AND user_id = ?", id, userID).First(&tx).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaksi tidak ditemukan"})
		return
	}

	var wallet models.Wallet
	if err := config.DB.Where("id = ?", tx.WalletID).First(&wallet).Error; err == nil {
		tx.WalletName = wallet.Name
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    tx,
	})
}

// CreateTransaction creates a new transaction along with granular items
func CreateTransaction(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)

	var input CreateTransactionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data input transaksi tidak valid"})
		return
	}

	// Verify wallet ownership
	var wallet models.Wallet
	if err := config.DB.Where("id = ? AND user_id = ?", input.WalletID, userID).First(&wallet).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dompet yang dipilih tidak valid"})
		return
	}

	txDate := input.TransactionDate
	if txDate == "" {
		txDate = time.Now().Format("2006-01-02")
	}

	txID := fmt.Sprintf("tx-%d-%d", userID, time.Now().UnixNano()/1e6)

	var calculatedTotal float64 = 0
	var dbItems []models.TransactionItem

	if len(input.Items) > 0 {
		for i, item := range input.Items {
			calculatedTotal += item.Amount
			rating := item.Rating
			if rating <= 0 {
				rating = 5
			}
			dbItems = append(dbItems, models.TransactionItem{
				ID:            fmt.Sprintf("item-%s-%d", txID, i+1),
				TransactionID: txID,
				ItemName:      item.ItemName,
				CategoryID:    item.CategoryID,
				CategoryName:  item.CategoryName,
				Amount:        item.Amount,
				IsFriendOrder: item.IsFriendOrder,
				FriendName:    item.FriendName,
				Rating:        rating,
			})
		}
	} else {
		calculatedTotal = input.TotalAmount
		catName := "Lainnya"
		if input.Type == models.TxIn {
			catName = "Gaji"
		}
		dbItems = append(dbItems, models.TransactionItem{
			ID:            fmt.Sprintf("item-%s-1", txID),
			TransactionID: txID,
			ItemName:      input.Title,
			CategoryID:    "cat-auto",
			CategoryName:  catName,
			Amount:        calculatedTotal,
			Rating:        5,
		})
	}

	if input.TotalAmount > 0 && len(input.Items) > 0 {
		calculatedTotal = input.TotalAmount
	}

	newTx := models.Transaction{
		ID:              txID,
		UserID:          userID,
		WalletID:        input.WalletID,
		Type:            input.Type,
		TotalAmount:     calculatedTotal,
		TransactionDate: txDate,
		LocationName:    input.LocationName,
		CityName:        input.CityName,
		Title:           input.Title,
		Note:            input.Note,
		Items:           dbItems,
	}

	dbTx := config.DB.Begin()
	if err := dbTx.Create(&newTx).Error; err != nil {
		dbTx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan transaksi"})
		return
	}
	dbTx.Commit()

	newTx.WalletName = wallet.Name

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Transaksi berhasil dicatat",
		"data":    newTx,
	})
}

// UpdateTransaction updates an existing transaction
func UpdateTransaction(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	id := c.Param("id")

	var tx models.Transaction
	if err := config.DB.Preload("Items").Where("id = ? AND user_id = ?", id, userID).First(&tx).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaksi tidak ditemukan"})
		return
	}

	var input UpdateTransactionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data input pembaruan transaksi tidak valid"})
		return
	}

	dbTx := config.DB.Begin()

	if input.WalletID != "" {
		var wallet models.Wallet
		if err := dbTx.Where("id = ? AND user_id = ?", input.WalletID, userID).First(&wallet).Error; err != nil {
			dbTx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dompet tidak valid"})
			return
		}
		tx.WalletID = input.WalletID
	}
	if input.Type != "" {
		tx.Type = input.Type
	}
	if input.Title != "" {
		tx.Title = input.Title
	}
	if input.TransactionDate != "" {
		tx.TransactionDate = input.TransactionDate
	}
	if input.LocationName != "" {
		tx.LocationName = input.LocationName
	}
	if input.CityName != "" {
		tx.CityName = input.CityName
	}
	if input.Note != "" {
		tx.Note = input.Note
	}

	if len(input.Items) > 0 {
		// Delete old items
		if err := dbTx.Where("transaction_id = ?", tx.ID).Delete(&models.TransactionItem{}).Error; err != nil {
			dbTx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui item transaksi"})
			return
		}

		var calculatedTotal float64 = 0
		var newItems []models.TransactionItem
		for i, item := range input.Items {
			calculatedTotal += item.Amount
			rating := item.Rating
			if rating <= 0 {
				rating = 5
			}
			newItems = append(newItems, models.TransactionItem{
				ID:            fmt.Sprintf("item-%s-%d-%d", tx.ID, time.Now().UnixNano()/1e6, i+1),
				TransactionID: tx.ID,
				ItemName:      item.ItemName,
				CategoryID:    item.CategoryID,
				CategoryName:  item.CategoryName,
				Amount:        item.Amount,
				IsFriendOrder: item.IsFriendOrder,
				FriendName:    item.FriendName,
				Rating:        rating,
			})
		}
		if err := dbTx.Create(&newItems).Error; err != nil {
			dbTx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan rincian item transaksi"})
			return
		}
		tx.TotalAmount = calculatedTotal
		tx.Items = newItems
	} else if input.TotalAmount > 0 {
		tx.TotalAmount = input.TotalAmount
	}

	if err := dbTx.Save(&tx).Error; err != nil {
		dbTx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui data transaksi"})
		return
	}

	dbTx.Commit()

	var wallet models.Wallet
	if err := config.DB.Where("id = ?", tx.WalletID).First(&wallet).Error; err == nil {
		tx.WalletName = wallet.Name
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Transaksi berhasil diperbarui",
		"data":    tx,
	})
}

// DeleteTransaction removes a transaction and its items
func DeleteTransaction(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	id := c.Param("id")

	var tx models.Transaction
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&tx).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaksi tidak ditemukan"})
		return
	}

	dbTx := config.DB.Begin()
	if err := dbTx.Where("transaction_id = ?", tx.ID).Delete(&models.TransactionItem{}).Error; err != nil {
		dbTx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus rincian item"})
		return
	}

	if err := dbTx.Delete(&tx).Error; err != nil {
		dbTx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus transaksi"})
		return
	}
	dbTx.Commit()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Transaksi berhasil dihapus",
	})
}

// TransferFunds transfers funds between two wallets belonging to the authenticated user
func TransferFunds(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)

	var input TransferInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data transfer tidak valid"})
		return
	}

	if input.SourceWalletID == input.DestinationWalletID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dompet asal dan tujuan tidak boleh sama"})
		return
	}

	if input.Amount <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nominal transfer harus lebih dari 0"})
		return
	}

	txDate := input.TransactionDate
	if txDate == "" {
		txDate = time.Now().Format("2006-01-02")
	}

	dbTx := config.DB.Begin()

	// Verify both wallets belong to userID
	var sourceWallet models.Wallet
	if err := dbTx.Where("id = ? AND user_id = ?", input.SourceWalletID, userID).First(&sourceWallet).Error; err != nil {
		dbTx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dompet asal tidak ditemukan atau bukan milik Anda"})
		return
	}

	var destWallet models.Wallet
	if err := dbTx.Where("id = ? AND user_id = ?", input.DestinationWalletID, userID).First(&destWallet).Error; err != nil {
		dbTx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dompet tujuan tidak ditemukan atau bukan milik Anda"})
		return
	}

	nowNano := time.Now().UnixNano() / 1e6
	outTxID := fmt.Sprintf("tx-tf-out-%d-%d", userID, nowNano)
	inTxID := fmt.Sprintf("tx-tf-in-%d-%d", userID, nowNano)

	// Create OUT transaction on SourceWalletID (Title: 'Transfer ke ' + targetWallet.Name, Type: models.TxTransfer, TotalAmount: Amount, with Item 'Transfer Keluar')
	outTx := models.Transaction{
		ID:              outTxID,
		UserID:          userID,
		WalletID:        input.SourceWalletID,
		Type:            models.TxTransfer,
		TotalAmount:     input.Amount,
		TransactionDate: txDate,
		Title:           "Transfer ke " + destWallet.Name,
		Note:            input.Note,
		Items: []models.TransactionItem{
			{
				ID:            fmt.Sprintf("item-%s-1", outTxID),
				TransactionID: outTxID,
				ItemName:      "Transfer Keluar",
				CategoryID:    "cat-transfer",
				CategoryName:  "Lainnya",
				Amount:        input.Amount,
				Rating:        5,
			},
		},
	}

	if err := dbTx.Create(&outTx).Error; err != nil {
		dbTx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencatat transaksi transfer keluar"})
		return
	}

	// Create IN transaction on DestinationWalletID (Title: 'Transfer dari ' + sourceWallet.Name, Type: models.TxTransfer, TotalAmount: Amount, with Item 'Transfer Masuk')
	inTx := models.Transaction{
		ID:              inTxID,
		UserID:          userID,
		WalletID:        input.DestinationWalletID,
		Type:            models.TxTransfer,
		TotalAmount:     input.Amount,
		TransactionDate: txDate,
		Title:           "Transfer dari " + sourceWallet.Name,
		Note:            input.Note,
		Items: []models.TransactionItem{
			{
				ID:            fmt.Sprintf("item-%s-1", inTxID),
				TransactionID: inTxID,
				ItemName:      "Transfer Masuk",
				CategoryID:    "cat-transfer",
				CategoryName:  "Lainnya",
				Amount:        input.Amount,
				Rating:        5,
			},
		},
	}

	if err := dbTx.Create(&inTx).Error; err != nil {
		dbTx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencatat transaksi transfer masuk"})
		return
	}

	// If AdminFee > 0, create OUT transaction on SourceWalletID (Title: 'Biaya Admin Transfer', Type: models.TxOut, TotalAmount: AdminFee, Category: 'Biaya & Tagihan' / 'Lainnya')
	if input.AdminFee > 0 {
		feeTxID := fmt.Sprintf("tx-tf-fee-%d-%d", userID, nowNano)
		feeTx := models.Transaction{
			ID:              feeTxID,
			UserID:          userID,
			WalletID:        input.SourceWalletID,
			Type:            models.TxOut,
			TotalAmount:     input.AdminFee,
			TransactionDate: txDate,
			Title:           "Biaya Admin Transfer",
			Note:            "Biaya admin transfer ke " + destWallet.Name,
			Items: []models.TransactionItem{
				{
					ID:            fmt.Sprintf("item-%s-1", feeTxID),
					TransactionID: feeTxID,
					ItemName:      "Biaya Admin Transfer",
					CategoryID:    "cat-fee",
					CategoryName:  "Biaya & Tagihan",
					Amount:        input.AdminFee,
					Rating:        5,
				},
			},
		}

		if err := dbTx.Create(&feeTx).Error; err != nil {
			dbTx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencatat biaya admin transfer"})
			return
		}
	}

	dbTx.Commit()

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Transfer antar dompet berhasil diproses",
		"data": gin.H{
			"sourceTransactionId": outTxID,
			"destTransactionId":   inTxID,
			"amount":              input.Amount,
			"adminFee":            input.AdminFee,
		},
	})
}
