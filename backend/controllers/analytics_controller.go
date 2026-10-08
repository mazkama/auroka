package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mazkama/auroka/backend/config"
	"github.com/mazkama/auroka/backend/middleware"
	"github.com/mazkama/auroka/backend/models"
)

type FinancialSummaryResponse struct {
	TotalBalance   float64 `json:"totalBalance"`
	MonthlyIncome  float64 `json:"monthlyIncome"`
	MonthlyExpense float64 `json:"monthlyExpense"`
	SavingsRate    float64 `json:"savingsRate"`
	NetCashFlow    float64 `json:"netCashFlow"`
}

type CashFlowTrendItem struct {
	Month   string  `json:"month"` // MMM or YYYY-MM
	Income  float64 `json:"income"`
	Expense float64 `json:"expense"`
	Net     float64 `json:"net"`
}

type CategoryBreakdownItem struct {
	Category   string  `json:"category"`
	Amount     float64 `json:"amount"`
	Percentage float64 `json:"percentage"`
	Color      string  `json:"color"`
}

// GetFinancialSummary calculates Total Net Worth, Monthly Cash Flow, and Savings Rate
func GetFinancialSummary(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	thisMonth := time.Now().Format("2006-01")

	// 1. Total Balance across all wallets
	var wallets []models.Wallet
	config.DB.Where("user_id = ?", userID).Find(&wallets)
	var totalBalance float64 = 0
	for _, w := range wallets {
		totalBalance += config.CalculateWalletBalance(config.DB, w.ID)
	}

	// 2. Monthly Income (IN + INITIAL_BALANCE) for current month
	var monthlyIncome float64
	config.DB.Model(&models.Transaction{}).
		Where("user_id = ? AND type IN ('IN', 'INITIAL_BALANCE') AND transaction_date LIKE ?", userID, thisMonth+"%").
		Select("COALESCE(SUM(total_amount), 0)").
		Scan(&monthlyIncome)

	// 3. Monthly Expense (OUT) for current month
	var monthlyExpense float64
	config.DB.Model(&models.Transaction{}).
		Where("user_id = ? AND type = 'OUT' AND transaction_date LIKE ?", userID, thisMonth+"%").
		Select("COALESCE(SUM(total_amount), 0)").
		Scan(&monthlyExpense)

	// 4. Net Cash Flow & Savings Rate
	netCashFlow := monthlyIncome - monthlyExpense
	var savingsRate float64 = 0
	if monthlyIncome > 0 {
		savingsRate = (netCashFlow / monthlyIncome) * 100
		if savingsRate < 0 {
			savingsRate = 0
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": FinancialSummaryResponse{
			TotalBalance:   totalBalance,
			MonthlyIncome:  monthlyIncome,
			MonthlyExpense: monthlyExpense,
			SavingsRate:    savingsRate,
			NetCashFlow:    netCashFlow,
		},
	})
}

// GetCashFlowTrend returns 6-month historical income vs expense trend
func GetCashFlowTrend(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)

	now := time.Now()
	var trends []CashFlowTrendItem

	for i := 5; i >= 0; i-- {
		monthDate := now.AddDate(0, -i, 0)
		monthPrefix := monthDate.Format("2006-01")
		monthLabel := monthDate.Format("Jan")

		var income float64
		config.DB.Model(&models.Transaction{}).
			Where("user_id = ? AND type IN ('IN', 'INITIAL_BALANCE') AND transaction_date LIKE ?", userID, monthPrefix+"%").
			Select("COALESCE(SUM(total_amount), 0)").
			Scan(&income)

		var expense float64
		config.DB.Model(&models.Transaction{}).
			Where("user_id = ? AND type = 'OUT' AND transaction_date LIKE ?", userID, monthPrefix+"%").
			Select("COALESCE(SUM(total_amount), 0)").
			Scan(&expense)

		trends = append(trends, CashFlowTrendItem{
			Month:   monthLabel,
			Income:  income,
			Expense: expense,
			Net:     income - expense,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    trends,
	})
}

// GetCategoryBreakdown returns spending breakdown by category for current month
func GetCategoryBreakdown(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	month := c.Query("month")
	if month == "" {
		month = time.Now().Format("2006-01")
	}

	type Result struct {
		Category string  `json:"category"`
		Total    float64 `json:"total"`
	}

	var results []Result
	config.DB.Table("transaction_items").
		Joins("JOIN transactions ON transactions.id = transaction_items.transaction_id").
		Where("transactions.user_id = ? AND transactions.type = 'OUT' AND transactions.transaction_date LIKE ?", userID, month+"%").
		Select("transaction_items.category_name as category, SUM(transaction_items.amount) as total").
		Group("transaction_items.category_name").
		Order("total desc").
		Scan(&results)

	var grandTotal float64 = 0
	for _, r := range results {
		grandTotal += r.Total
	}

	colorMap := map[string]string{
		"Makan & Minum":   "#004ac6",
		"Belanja":         "#00aa13",
		"Transportasi":    "#e11d48",
		"Listrik & Air":   "#d97706",
		"Hiburan":         "#9333ea",
		"Kesehatan":       "#06b6d4",
		"Investasi":       "#3b82f6",
		"Gaji":            "#10b981",
		"Lainnya":         "#64748b",
	}

	breakdown := make([]CategoryBreakdownItem, 0)
	for _, r := range results {
		pct := 0.0
		if grandTotal > 0 {
			pct = (r.Total / grandTotal) * 100
		}
		color := colorMap[r.Category]
		if color == "" {
			color = "#64748b"
		}

		breakdown = append(breakdown, CategoryBreakdownItem{
			Category:   r.Category,
			Amount:     r.Total,
			Percentage: pct,
			Color:      color,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    breakdown,
	})
}
