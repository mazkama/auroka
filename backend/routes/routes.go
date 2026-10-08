package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/mazkama/auroka/backend/controllers"
	"github.com/mazkama/auroka/backend/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// CORS Setup
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := r.Group("/api/v1")
	{
		// 1. Auth & Profile
		auth := api.Group("/auth")
		{
			auth.POST("/register", controllers.Register)
			auth.POST("/verify-email", controllers.VerifyEmail)
			auth.POST("/resend-verification", controllers.ResendVerification)
			auth.POST("/forgot-password", controllers.ForgotPassword)
			auth.POST("/reset-password", controllers.ResetPassword)
			auth.POST("/login", controllers.Login)
			auth.GET("/google", controllers.GoogleLogin)
			auth.GET("/google/callback", controllers.GoogleCallback)
			auth.GET("/me", middleware.AuthMiddleware(), controllers.GetMe)
			auth.PUT("/profile", middleware.AuthMiddleware(), controllers.UpdateProfile)
			auth.PUT("/password", middleware.AuthMiddleware(), controllers.UpdatePassword)
		}

		// 2. Wallets (Protected)
		wallets := api.Group("/wallets", middleware.AuthMiddleware())
		{
			wallets.GET("", controllers.GetWallets)
			wallets.GET("/:id", controllers.GetWalletByID)
			wallets.POST("", controllers.CreateWallet)
			wallets.PUT("/:id", controllers.UpdateWallet)
			wallets.DELETE("/:id", controllers.DeleteWallet)
		}

		// 3. Transactions (Protected Ledger)
		transactions := api.Group("/transactions", middleware.AuthMiddleware())
		{
			transactions.GET("", controllers.GetTransactions)
			transactions.GET("/:id", controllers.GetTransactionByID)
			transactions.POST("", controllers.CreateTransaction)
			transactions.POST("/transfer", controllers.TransferFunds)
			transactions.PUT("/:id", controllers.UpdateTransaction)
			transactions.DELETE("/:id", controllers.DeleteTransaction)
		}

		// 4. Budgets (Protected)
		budgets := api.Group("/budgets", middleware.AuthMiddleware())
		{
			budgets.GET("", controllers.GetBudgets)
			budgets.POST("", controllers.CreateBudget)
			budgets.PUT("/:id", controllers.UpdateBudget)
			budgets.DELETE("/:id", controllers.DeleteBudget)
		}

		// 5. Bills & Subscriptions (Protected)
		bills := api.Group("/bills", middleware.AuthMiddleware())
		{
			bills.GET("", controllers.GetBills)
			bills.POST("", controllers.CreateBill)
			bills.PUT("/:id", controllers.UpdateBill)
			bills.DELETE("/:id", controllers.DeleteBill)
			bills.POST("/:id/pay", controllers.PayBill)
		}

		// 6. Analytics & Reports (Protected)
		analytics := api.Group("/analytics", middleware.AuthMiddleware())
		{
			analytics.GET("/summary", controllers.GetFinancialSummary)
			analytics.GET("/trend", controllers.GetCashFlowTrend)
			analytics.GET("/categories", controllers.GetCategoryBreakdown)
		}

		// 7. Notifications & WhatsApp Gatekeeper (Protected)
		notifCtrl := controllers.NewNotificationController()
		notifications := api.Group("/notifications", middleware.AuthMiddleware())
		{
			notifications.GET("", notifCtrl.GetNotifications)
			notifications.GET("/unread-count", notifCtrl.GetUnreadCount)
			notifications.PATCH("/:id/read", notifCtrl.MarkAsRead)
			notifications.POST("/read-all", notifCtrl.MarkAllAsRead)
			notifications.DELETE("/clear-read", notifCtrl.ClearReadNotifications)
			notifications.DELETE("/:id", notifCtrl.DeleteNotification)
			notifications.GET("/settings", notifCtrl.GetSettings)
			notifications.PUT("/settings", notifCtrl.UpdateSettings)
			notifications.POST("/verify-phone/request", notifCtrl.RequestPhoneOTP)
			notifications.POST("/verify-phone/confirm", notifCtrl.ConfirmPhoneOTP)
		}
	}

	return r
}
