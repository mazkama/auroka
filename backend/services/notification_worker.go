package services

import (
	"fmt"
	"log"
	"time"

	"github.com/mazkama/auroka/backend/config"
	"github.com/mazkama/auroka/backend/models"
)

// StartNotificationWorker starts scheduled background job for bill scanning and budget alerts
func StartNotificationWorker() {
	ticker := time.NewTicker(15 * time.Minute)
	go func() {
		// Run immediately once on start
		RunBillAndBudgetScan()
		for range ticker.C {
			RunBillAndBudgetScan()
		}
	}()
	log.Println("[INFO] Notification background scanner worker started (interval 15m)")
}

// RunBillAndBudgetScan checks recurring bills and budget status for all active users
func RunBillAndBudgetScan() {
	db := config.DB
	if db == nil {
		return
	}

	now := time.Now()
	todayDay := now.Day()
	today := now.Format("2006-01-02")
	thisMonth := now.Format("2006-01")

	// 1. Scan Unpaid/PENDING Bills approaching due date (H-3, H-1, Hari H based on DueDay)
	var bills []models.Bill
	db.Where("status = ?", "PENDING").Find(&bills)

	for _, bill := range bills {
		if bill.DueDay <= 0 {
			continue
		}

		daysUntilDue := bill.DueDay - todayDay

		if daysUntilDue == 3 || daysUntilDue == 1 || daysUntilDue == 0 {
			urgencyText := fmt.Sprintf("dalam %d hari lagi (tanggal %d)", daysUntilDue, bill.DueDay)
			if daysUntilDue == 0 {
				urgencyText = "HARI INI"
			} else if daysUntilDue == 1 {
				urgencyText = fmt.Sprintf("BESOK (tanggal %d)", bill.DueDay)
			}

			title := fmt.Sprintf("Tagihan %s Jatuh Tempo %s", bill.Name, urgencyText)
			msg := fmt.Sprintf("Tagihan rutin %s sebesar Rp %s akan jatuh tempo %s. Jangan lupa lakukan pembayaran tepat waktu.",
				bill.Name, formatRupiahInt(bill.Amount), urgencyText)

			refKey := fmt.Sprintf("bill-%d-%s-d%d", bill.ID, today, daysUntilDue)

			_ = DispatchNotification(NotificationRequest{
				UserID:       bill.UserID,
				Category:     models.NotificationCategoryBill,
				Priority:     models.NotificationPriorityHigh,
				Title:        title,
				Message:      msg,
				ActionURL:    "/bills",
				ActionText:   "Lihat Tagihan",
				ReferenceKey: refKey,
			})
		}
	}

	// 2. Scan Budgets for overspending alerts (>= 80% or >= 100%)
	var budgets []models.Budget
	db.Where("month = ?", thisMonth).Find(&budgets)

	for _, b := range budgets {
		if b.LimitAmount <= 0 {
			continue
		}

		// Calculate spent in category for this month
		var spent float64
		db.Table("transactions").
			Joins("JOIN transaction_items ON transaction_items.transaction_id = transactions.id").
			Where("transactions.user_id = ? AND transactions.type = 'OUT' AND transactions.transaction_date LIKE ? AND transaction_items.category_name = ?",
				b.UserID, thisMonth+"%", b.Category).
			Select("COALESCE(SUM(transaction_items.amount), 0)").
			Scan(&spent)

		pct := (spent / b.LimitAmount) * 100

		if pct >= 100 {
			refKey := fmt.Sprintf("budget-100-%d-%s", b.ID, thisMonth)
			_ = DispatchNotification(NotificationRequest{
				UserID:       b.UserID,
				Category:     models.NotificationCategoryBudget,
				Priority:     models.NotificationPriorityHigh,
				Title:        fmt.Sprintf("🚨 Anggaran %s Telah Melebihi Batas (%.0f%%)", b.Category, pct),
				Message:      fmt.Sprintf("Pengeluaran kategori %s telah mencapai Rp %s dari limit Rp %s (%.1f%%). Kendalikan belanja Anda.", b.Category, formatRupiahInt(spent), formatRupiahInt(b.LimitAmount), pct),
				ActionURL:    "/budgets",
				ActionText:   "Periksa Anggaran",
				ReferenceKey: refKey,
			})
		} else if pct >= 80 {
			refKey := fmt.Sprintf("budget-80-%d-%s", b.ID, thisMonth)
			_ = DispatchNotification(NotificationRequest{
				UserID:       b.UserID,
				Category:     models.NotificationCategoryBudget,
				Priority:     models.NotificationPriorityMedium,
				Title:        fmt.Sprintf("⚠️ Peringatan Anggaran: Kategori %s Mencapai %.0f%%", b.Category, pct),
				Message:      fmt.Sprintf("Pengeluaran kategori %s sudah mencapai Rp %s dari limit Rp %s (%.1f%%).", b.Category, formatRupiahInt(spent), formatRupiahInt(b.LimitAmount), pct),
				ActionURL:    "/budgets",
				ActionText:   "Lihat Anggaran",
				ReferenceKey: refKey,
			})
		}
	}
}

func formatRupiahInt(val float64) string {
	intVal := int64(val)
	str := fmt.Sprintf("%d", intVal)
	n := len(str)
	if n <= 3 {
		return str
	}
	var res []byte
	rem := n % 3
	if rem > 0 {
		res = append(res, str[:rem]...)
	}
	for i := rem; i < n; i += 3 {
		if len(res) > 0 {
			res = append(res, '.')
		}
		res = append(res, str[i:i+3]...)
	}
	return string(res)
}
