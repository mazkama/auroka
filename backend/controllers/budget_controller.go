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

type CreateBudgetInput struct {
	Category    string  `json:"category" binding:"required"`
	LimitAmount float64 `json:"limitAmount" binding:"required"`
	Month       string  `json:"month" binding:"required"` // YYYY-MM
}

type UpdateBudgetInput struct {
	Category    string  `json:"category"`
	LimitAmount float64 `json:"limitAmount"`
	Month       string  `json:"month"`
}

// GetBudgets returns all budgets for a given month with dynamically calculated spentAmount
func GetBudgets(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	month := c.Query("month")
	if month == "" {
		month = time.Now().Format("2006-01")
	}

	var budgets []models.Budget
	if err := config.DB.Where("user_id = ? AND month = ?", userID, month).Find(&budgets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat anggaran"})
		return
	}

	// Calculate spentAmount for each category in that month
	for i := range budgets {
		var spent float64
		config.DB.Table("transaction_items").
			Joins("JOIN transactions ON transactions.id = transaction_items.transaction_id").
			Where("transactions.user_id = ? AND transactions.type = 'OUT' AND transaction_items.category_name = ? AND transactions.transaction_date LIKE ?",
				userID, budgets[i].Category, month+"%").
			Select("COALESCE(SUM(transaction_items.amount), 0)").
			Scan(&spent)

		budgets[i].SpentAmount = spent
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    budgets,
	})
}

// CreateBudget creates a new monthly category budget
func CreateBudget(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)

	var input CreateBudgetInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data input anggaran tidak valid"})
		return
	}

	// Check if budget for same category & month already exists
	var existing models.Budget
	if err := config.DB.Where("user_id = ? AND category = ? AND month = ?", userID, input.Category, input.Month).First(&existing).Error; err == nil {
		// Update existing limit
		existing.LimitAmount = input.LimitAmount
		config.DB.Save(&existing)

		// Calculate spent
		var spent float64
		config.DB.Table("transaction_items").
			Joins("JOIN transactions ON transactions.id = transaction_items.transaction_id").
			Where("transactions.user_id = ? AND transactions.type = 'OUT' AND transaction_items.category_name = ? AND transactions.transaction_date LIKE ?",
				userID, existing.Category, existing.Month+"%").
			Select("COALESCE(SUM(transaction_items.amount), 0)").
			Scan(&spent)
		existing.SpentAmount = spent

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Anggaran kategori berhasil diperbarui",
			"data":    existing,
		})
		return
	}

	budgetID := fmt.Sprintf("b-%d-%d", userID, time.Now().UnixNano()/1e6)
	budget := models.Budget{
		ID:          budgetID,
		UserID:      userID,
		Category:    input.Category,
		LimitAmount: input.LimitAmount,
		Month:       input.Month,
	}

	if err := config.DB.Create(&budget).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat anggaran"})
		return
	}

	var spent float64
	config.DB.Table("transaction_items").
		Joins("JOIN transactions ON transactions.id = transaction_items.transaction_id").
		Where("transactions.user_id = ? AND transactions.type = 'OUT' AND transaction_items.category_name = ? AND transactions.transaction_date LIKE ?",
			userID, budget.Category, budget.Month+"%").
		Select("COALESCE(SUM(transaction_items.amount), 0)").
		Scan(&spent)
	budget.SpentAmount = spent

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Anggaran berhasil ditetapkan",
		"data":    budget,
	})
}

// UpdateBudget updates limit or category of a budget
func UpdateBudget(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	id := c.Param("id")

	var budget models.Budget
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&budget).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Anggaran tidak ditemukan"})
		return
	}

	var input UpdateBudgetInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data update anggaran tidak valid"})
		return
	}

	if input.Category != "" {
		budget.Category = input.Category
	}
	if input.LimitAmount > 0 {
		budget.LimitAmount = input.LimitAmount
	}
	if input.Month != "" {
		budget.Month = input.Month
	}

	if err := config.DB.Save(&budget).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui anggaran"})
		return
	}

	var spent float64
	config.DB.Table("transaction_items").
		Joins("JOIN transactions ON transactions.id = transaction_items.transaction_id").
		Where("transactions.user_id = ? AND transactions.type = 'OUT' AND transaction_items.category_name = ? AND transactions.transaction_date LIKE ?",
			userID, budget.Category, budget.Month+"%").
		Select("COALESCE(SUM(transaction_items.amount), 0)").
		Scan(&spent)
	budget.SpentAmount = spent

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Anggaran berhasil diperbarui",
		"data":    budget,
	})
}

// DeleteBudget removes a budget
func DeleteBudget(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	id := c.Param("id")

	var budget models.Budget
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&budget).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Anggaran tidak ditemukan"})
		return
	}

	if err := config.DB.Delete(&budget).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus anggaran"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Anggaran berhasil dihapus",
	})
}
