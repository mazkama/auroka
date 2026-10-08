package config

import (
	"log"
	"time"

	"github.com/mazkama/auroka/backend/models"
	"github.com/mazkama/auroka/backend/utils"
	"gorm.io/gorm"
)

func SeedDemoData() {
	var count int64
	DB.Model(&models.User{}).Where("email = ?", "demo@auroka.com").Count(&count)
	if count > 0 {
		log.Println("Demo user already exists. Skipping seed.")
		return
	}

	log.Println("Seeding demo user and initial ledger data...")

	hashedPassword, err := utils.HashPassword("AurokaDemo2026!")
	if err != nil {
		log.Println("Failed to hash demo password:", err)
		return
	}

	demoUser := models.User{
		Name:       "Mas Alan (Demo Account)",
		Email:      "demo@auroka.com",
		Password:   hashedPassword,
		Role:       "PRO_MEMBER",
		IsVerified: true,
		AvatarURL:  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
	}

	if err := DB.Create(&demoUser).Error; err != nil {
		log.Println("Failed to create demo user:", err)
		return
	}

	// 1. Wallets
	wallets := []models.Wallet{
		{
			ID:            "w-demo-1",
			UserID:        demoUser.ID,
			Name:          "Bank BCA Utama",
			Type:          models.TypeBank,
			AccountNumber: "8830192841",
			IconName:      "BuildingLibrary",
			Color:         "#005caa",
		},
		{
			ID:            "w-demo-2",
			UserID:        demoUser.ID,
			Name:          "Mandiri Tabungan",
			Type:          models.TypeBank,
			AccountNumber: "13700019284",
			IconName:      "CreditCard",
			Color:         "#003366",
		},
		{
			ID:            "w-demo-3",
			UserID:        demoUser.ID,
			Name:          "GoPay Premium",
			Type:          models.TypeEWallet,
			AccountNumber: "081298765432",
			IconName:      "Smartphone",
			Color:         "#00aa13",
		},
		{
			ID:            "w-demo-4",
			UserID:        demoUser.ID,
			Name:          "Kas Dompet Fisik",
			Type:          models.TypeCash,
			AccountNumber: "",
			IconName:      "Banknotes",
			Color:         "#784b00",
		},
	}

	for _, w := range wallets {
		DB.Create(&w)
	}

	// 2. Initial Balances & Historical Transactions
	today := time.Now().Format("2006-01-02")
	thisMonth := time.Now().Format("2006-01")

	// Initial Balance Transactions
	txInitBCA := models.Transaction{
		ID:              "tx-init-1",
		UserID:          demoUser.ID,
		WalletID:        "w-demo-1",
		Type:            models.TxInitialBalance,
		TotalAmount:     25000000,
		TransactionDate: thisMonth + "-01",
		Title:           "Saldo Awal Rekening BCA",
		Note:            "Pembukuan saldo awal ledger",
		Items: []models.TransactionItem{
			{
				ID:           "item-init-1",
				ItemName:     "Saldo Awal",
				CategoryID:   "cat-income",
				CategoryName: "Gaji",
				Amount:       25000000,
			},
		},
	}
	DB.Create(&txInitBCA)

	txInitMandiri := models.Transaction{
		ID:              "tx-init-2",
		UserID:          demoUser.ID,
		WalletID:        "w-demo-2",
		Type:            models.TxInitialBalance,
		TotalAmount:     15000000,
		TransactionDate: thisMonth + "-01",
		Title:           "Saldo Awal Rekening Mandiri",
		Note:            "Pembukuan saldo awal ledger",
		Items: []models.TransactionItem{
			{
				ID:           "item-init-2",
				ItemName:     "Saldo Awal Mandiri",
				CategoryID:   "cat-income",
				CategoryName: "Investasi",
				Amount:       15000000,
			},
		},
	}
	DB.Create(&txInitMandiri)

	txInitGoPay := models.Transaction{
		ID:              "tx-init-3",
		UserID:          demoUser.ID,
		WalletID:        "w-demo-3",
		Type:            models.TxInitialBalance,
		TotalAmount:     2000000,
		TransactionDate: thisMonth + "-01",
		Title:           "Saldo Awal GoPay",
		Note:            "Saldo operasional e-wallet",
		Items: []models.TransactionItem{
			{
				ID:           "item-init-3",
				ItemName:     "Topup Saldo Awal",
				CategoryID:   "cat-income",
				CategoryName: "Lainnya",
				Amount:       2000000,
			},
		},
	}
	DB.Create(&txInitGoPay)

	txInitCash := models.Transaction{
		ID:              "tx-init-4",
		UserID:          demoUser.ID,
		WalletID:        "w-demo-4",
		Type:            models.TxInitialBalance,
		TotalAmount:     1000000,
		TransactionDate: thisMonth + "-01",
		Title:           "Saldo Kas Dompet",
		Note:            "Uang tunai fisik",
		Items: []models.TransactionItem{
			{
				ID:           "item-init-4",
				ItemName:     "Tarik Tunai Awal Bulan",
				CategoryID:   "cat-income",
				CategoryName: "Lainnya",
				Amount:       1000000,
			},
		},
	}
	DB.Create(&txInitCash)

	// Additional Realistic Expenses
	txExpense1 := models.Transaction{
		ID:              "tx-exp-1",
		UserID:          demoUser.ID,
		WalletID:        "w-demo-1",
		Type:            models.TxOut,
		TotalAmount:     850000,
		TransactionDate: today,
		LocationName:    "Superindo Mall",
		CityName:        "Surabaya",
		Title:           "Belanja Bulanan & Kebutuhan Dapur",
		Note:            "Belanja sembako bulanan",
		Items: []models.TransactionItem{
			{
				ID:           "item-exp-1a",
				ItemName:     "Bahan Makanan & Minyak Goreng",
				CategoryID:   "cat-food",
				CategoryName: "Makan & Minum",
				Amount:       550000,
				Rating:       5,
			},
			{
				ID:            "item-exp-1b",
				ItemName:      "Sabun & Titipan Detergen Mas Budi",
				CategoryID:    "cat-shopping",
				CategoryName:  "Belanja",
				Amount:        300000,
				IsFriendOrder: true,
				FriendName:    "Mas Budi",
				Rating:        4,
			},
		},
	}
	DB.Create(&txExpense1)

	txExpense2 := models.Transaction{
		ID:              "tx-exp-2",
		UserID:          demoUser.ID,
		WalletID:        "w-demo-3",
		Type:            models.TxOut,
		TotalAmount:     125000,
		TransactionDate: today,
		LocationName:    "Kopi Kenangan Rest Area",
		CityName:        "Surabaya",
		Title:           "Kopi & Snack Rapat Sore",
		Note:            "Ngopi sore bareng tim",
		Items: []models.TransactionItem{
			{
				ID:           "item-exp-2a",
				ItemName:     "Kenangan Mantan Large x2",
				CategoryID:   "cat-food",
				CategoryName: "Makan & Minum",
				Amount:       75000,
				Rating:       5,
			},
			{
				ID:            "item-exp-2b",
				ItemName:      "Roti Coklat Titipan Doni",
				CategoryID:    "cat-food",
				CategoryName:  "Makan & Minum",
				Amount:        50000,
				IsFriendOrder: true,
				FriendName:    "Doni",
				Rating:        4,
			},
		},
	}
	DB.Create(&txExpense2)

	// 3. Budgets
	budgets := []models.Budget{
		{
			ID:          "b-demo-1",
			UserID:      demoUser.ID,
			Category:    "Makan & Minum",
			LimitAmount: 3000000,
			Month:       thisMonth,
		},
		{
			ID:          "b-demo-2",
			UserID:      demoUser.ID,
			Category:    "Belanja",
			LimitAmount: 2500000,
			Month:       thisMonth,
		},
		{
			ID:          "b-demo-3",
			UserID:      demoUser.ID,
			Category:    "Transportasi",
			LimitAmount: 1500000,
			Month:       thisMonth,
		},
		{
			ID:          "b-demo-4",
			UserID:      demoUser.ID,
			Category:    "Listrik & Air",
			LimitAmount: 1000000,
			Month:       thisMonth,
		},
		{
			ID:          "b-demo-5",
			UserID:      demoUser.ID,
			Category:    "Hiburan",
			LimitAmount: 1200000,
			Month:       thisMonth,
		},
	}

	for _, b := range budgets {
		DB.Create(&b)
	}

	log.Println("Demo user and ledger data successfully seeded!")
}

// CalculateWalletBalance calculates balance of a wallet from transactions
func CalculateWalletBalance(tx *gorm.DB, walletID string) float64 {
	var totalIn float64
	var totalOut float64

	// Standard IN transactions, Initial Balance, Adjustment
	tx.Model(&models.Transaction{}).
		Where("wallet_id = ? AND type IN ('IN', 'INITIAL_BALANCE', 'ADJUSTMENT')", walletID).
		Select("COALESCE(SUM(total_amount), 0)").
		Scan(&totalIn)

	// Standard OUT transactions
	tx.Model(&models.Transaction{}).
		Where("wallet_id = ? AND type = 'OUT'", walletID).
		Select("COALESCE(SUM(total_amount), 0)").
		Scan(&totalOut)

	// TRANSFER transactions: check items (Transfer Masuk -> IN, Transfer Keluar -> OUT) or title prefix
	var transferIn float64
	tx.Table("transactions").
		Joins("JOIN transaction_items ON transaction_items.transaction_id = transactions.id").
		Where("transactions.wallet_id = ? AND transactions.type = 'TRANSFER' AND transaction_items.item_name = 'Transfer Masuk'", walletID).
		Select("COALESCE(SUM(transactions.total_amount), 0)").
		Scan(&transferIn)

	var transferOut float64
	tx.Table("transactions").
		Joins("JOIN transaction_items ON transaction_items.transaction_id = transactions.id").
		Where("transactions.wallet_id = ? AND transactions.type = 'TRANSFER' AND transaction_items.item_name = 'Transfer Keluar'", walletID).
		Select("COALESCE(SUM(transactions.total_amount), 0)").
		Scan(&transferOut)

	return (totalIn + transferIn) - (totalOut + transferOut)
}
