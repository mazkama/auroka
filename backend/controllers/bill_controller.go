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

type CreateBillInput struct {
	Name     string  `json:"name" binding:"required"`
	Category string  `json:"category" binding:"required"`
	Amount   float64 `json:"amount" binding:"required"`
	DueDay   int     `json:"dueDay" binding:"required"` // 1 - 31
	Cycle    string  `json:"cycle"`                     // MONTHLY, YEARLY
	WalletID string  `json:"walletId"`
	Status   string  `json:"status"` // PENDING, PAID
}

type UpdateBillInput struct {
	Name     string  `json:"name"`
	Category string  `json:"category"`
	Amount   float64 `json:"amount"`
	DueDay   int     `json:"dueDay"`
	Cycle    string  `json:"cycle"`
	WalletID string  `json:"walletId"`
	Status   string  `json:"status"`
}

// GetBills returns all bills for the authenticated user
func GetBills(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	status := c.Query("status")
	category := c.Query("category")

	query := config.DB.Where("user_id = ?", userID)
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if category != "" {
		query = query.Where("category = ?", category)
	}

	var bills []models.Bill
	if err := query.Order("due_day asc, created_at asc").Find(&bills).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat daftar tagihan"})
		return
	}

	// Attach wallet name for each bill
	var wallets []models.Wallet
	config.DB.Where("user_id = ?", userID).Find(&wallets)
	walletMap := make(map[string]string)
	for _, w := range wallets {
		walletMap[w.ID] = w.Name
	}

	for i := range bills {
		if bills[i].WalletID != "" {
			bills[i].WalletName = walletMap[bills[i].WalletID]
			if bills[i].WalletName == "" {
				bills[i].WalletName = "Dompet Tidak Ditemukan"
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    bills,
	})
}

// CreateBill creates a new subscription / bill item
func CreateBill(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)

	var input CreateBillInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data input tagihan tidak valid"})
		return
	}

	if input.DueDay < 1 || input.DueDay > 31 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tanggal jatuh tempo harus antara 1 sampai 31"})
		return
	}

	cycle := input.Cycle
	if cycle == "" {
		cycle = "MONTHLY"
	}

	status := input.Status
	if status == "" {
		status = "PENDING"
	}

	// Verify wallet if provided
	if input.WalletID != "" {
		var wallet models.Wallet
		if err := config.DB.Where("id = ? AND user_id = ?", input.WalletID, userID).First(&wallet).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dompet yang dipilih tidak valid"})
			return
		}
	}

	bill := models.Bill{
		UserID:   userID,
		Name:     input.Name,
		Category: input.Category,
		Amount:   input.Amount,
		DueDay:   input.DueDay,
		Cycle:    cycle,
		WalletID: input.WalletID,
		Status:   status,
	}

	if err := config.DB.Create(&bill).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan tagihan"})
		return
	}

	if bill.WalletID != "" {
		var wallet models.Wallet
		if err := config.DB.Where("id = ?", bill.WalletID).First(&wallet).Error; err == nil {
			bill.WalletName = wallet.Name
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Tagihan berhasil ditambahkan",
		"data":    bill,
	})
}

// UpdateBill updates an existing bill
func UpdateBill(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	id := c.Param("id")

	var bill models.Bill
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&bill).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tagihan tidak ditemukan"})
		return
	}

	var input UpdateBillInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data input pembaruan tagihan tidak valid"})
		return
	}

	if input.Name != "" {
		bill.Name = input.Name
	}
	if input.Category != "" {
		bill.Category = input.Category
	}
	if input.Amount > 0 {
		bill.Amount = input.Amount
	}
	if input.DueDay >= 1 && input.DueDay <= 31 {
		bill.DueDay = input.DueDay
	}
	if input.Cycle != "" {
		bill.Cycle = input.Cycle
	}
	if input.WalletID != "" {
		var wallet models.Wallet
		if err := config.DB.Where("id = ? AND user_id = ?", input.WalletID, userID).First(&wallet).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dompet tidak valid"})
			return
		}
		bill.WalletID = input.WalletID
	}
	if input.Status != "" {
		bill.Status = input.Status
	}

	if err := config.DB.Save(&bill).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui tagihan"})
		return
	}

	if bill.WalletID != "" {
		var wallet models.Wallet
		if err := config.DB.Where("id = ?", bill.WalletID).First(&wallet).Error; err == nil {
			bill.WalletName = wallet.Name
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Tagihan berhasil diperbarui",
		"data":    bill,
	})
}

// DeleteBill removes a bill
func DeleteBill(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	id := c.Param("id")

	var bill models.Bill
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&bill).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tagihan tidak ditemukan"})
		return
	}

	if err := config.DB.Delete(&bill).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus tagihan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Tagihan berhasil dihapus",
	})
}

// PayBill marks a bill as PAID, updates LastPaidAt to now, and creates an OUT transaction
func PayBill(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	id := c.Param("id")

	var bill models.Bill
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&bill).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tagihan tidak ditemukan"})
		return
	}

	// Ensure wallet is available
	targetWalletID := bill.WalletID
	if targetWalletID == "" {
		// Use first user wallet if not explicitly set
		var firstWallet models.Wallet
		if err := config.DB.Where("user_id = ?", userID).Order("created_at asc").First(&firstWallet).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Tidak ditemukan dompet untuk melakukan pembayaran tagihan"})
			return
		}
		targetWalletID = firstWallet.ID
		bill.WalletID = firstWallet.ID
	}

	now := time.Now()
	nowDate := now.Format("2006-01-02")
	txID := fmt.Sprintf("tx-bill-%d-%d", userID, now.UnixNano()/1e6)

	dbTx := config.DB.Begin()

	// 1. Update bill status and lastPaidAt
	bill.Status = "PAID"
	bill.LastPaidAt = &now

	if err := dbTx.Save(&bill).Error; err != nil {
		dbTx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui status tagihan"})
		return
	}

	// 2. Create OUT transaction in the associated wallet
	newTx := models.Transaction{
		ID:              txID,
		UserID:          userID,
		WalletID:        targetWalletID,
		Type:            models.TxOut,
		TotalAmount:     bill.Amount,
		TransactionDate: nowDate,
		Title:           "Pembayaran " + bill.Name,
		Note:            fmt.Sprintf("Pembayaran otomatis tagihan & langganan (%s)", bill.Cycle),
		Items: []models.TransactionItem{
			{
				ID:           fmt.Sprintf("item-%s-1", txID),
				TransactionID: txID,
				ItemName:     bill.Name,
				CategoryID:   "cat-bills",
				CategoryName: "Tagihan & Langganan",
				Amount:       bill.Amount,
				Rating:       5,
			},
		},
	}

	if err := dbTx.Create(&newTx).Error; err != nil {
		dbTx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencatat transaksi pembayaran tagihan"})
		return
	}

	dbTx.Commit()

	var wallet models.Wallet
	if err := config.DB.Where("id = ?", bill.WalletID).First(&wallet).Error; err == nil {
		bill.WalletName = wallet.Name
	}

	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"message":     fmt.Sprintf("Tagihan '%s' berhasil dibayar dan dicatat ke histori transaksi", bill.Name),
		"data":        bill,
		"transaction": newTx,
	})
}
