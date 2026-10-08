package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mazkama/auroka/backend/config"
	"github.com/mazkama/auroka/backend/middleware"
	"github.com/mazkama/auroka/backend/models"
	"github.com/mazkama/auroka/backend/services"
	"github.com/mazkama/auroka/backend/utils"
)

type NotificationController struct{}

func NewNotificationController() *NotificationController {
	return &NotificationController{}
}

// GetNotifications returns list of user notifications with filtering
func (ctrl *NotificationController) GetNotifications(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	category := c.Query("category")
	unreadOnly := c.Query("unread_only")
	search := c.Query("search")
	limitStr := c.DefaultQuery("limit", "50")
	pageStr := c.DefaultQuery("page", "1")

	limit, _ := strconv.Atoi(limitStr)
	page, _ := strconv.Atoi(pageStr)
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit

	query := config.DB.Model(&models.Notification{}).Where("user_id = ?", userID)

	if category != "" && category != "ALL" {
		query = query.Where("category = ?", category)
	}

	if unreadOnly == "true" {
		query = query.Where("is_read = ?", false)
	}

	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("title ILIKE ? OR message ILIKE ?", searchPattern, searchPattern)
	}

	var total int64
	query.Count(&total)

	var notifications []models.Notification
	if err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&notifications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": notifications,
		"meta": gin.H{
			"total": total,
			"page":  page,
			"limit": limit,
		},
	})
}

// GetUnreadCount returns total unread notifications for badge
func (ctrl *NotificationController) GetUnreadCount(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var count int64
	config.DB.Model(&models.Notification{}).Where("user_id = ? AND is_read = ?", userID, false).Count(&count)

	c.JSON(http.StatusOK, gin.H{
		"unread_count": count,
	})
}

// MarkAsRead marks a single notification as read
func (ctrl *NotificationController) MarkAsRead(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	notifID := c.Param("id")
	now := time.Now()

	result := config.DB.Model(&models.Notification{}).
		Where("id = ? AND user_id = ?", notifID, userID).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": now,
		})

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read"})
}

// MarkAllAsRead marks all notifications of the user as read
func (ctrl *NotificationController) MarkAllAsRead(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	now := time.Now()
	if err := config.DB.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": now,
		}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark all as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All notifications marked as read"})
}

// DeleteNotification deletes a notification
func (ctrl *NotificationController) DeleteNotification(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	notifID := c.Param("id")
	result := config.DB.Where("id = ? AND user_id = ?", notifID, userID).Delete(&models.Notification{})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification deleted successfully"})
}

// ClearReadNotifications deletes all read notifications for user
func (ctrl *NotificationController) ClearReadNotifications(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if err := config.DB.Where("user_id = ? AND is_read = ?", userID, true).Delete(&models.Notification{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear read notifications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Read notifications cleared successfully"})
}

// GetSettings returns user notification settings
func (ctrl *NotificationController) GetSettings(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	settings, err := services.EnsureUserSettings(config.DB, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": settings})
}

type UpdateNotificationSettingsRequest struct {
	WhatsAppEnabled    *bool                    `json:"whatsapp_enabled"`
	EmailEnabled       *bool                    `json:"email_enabled"`
	InAppEnabled       *bool                    `json:"in_app_enabled"`
	PreferredChannel   *models.PreferredChannel `json:"preferred_channel"`
	PhoneNumber        *string                  `json:"phone_number"`
	BillReminders      *bool                    `json:"bill_reminders"`
	BudgetAlerts       *bool                    `json:"budget_alerts"`
	LowBalanceAlerts   *bool                    `json:"low_balance_alerts"`
	SecurityAlerts     *bool                    `json:"security_alerts"`
	BudgetThresholdPct *int                     `json:"budget_threshold_pct"`
}

// UpdateSettings updates user notification preferences
func (ctrl *NotificationController) UpdateSettings(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req UpdateNotificationSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload format"})
		return
	}

	settings, err := services.EnsureUserSettings(config.DB, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find settings"})
		return
	}

	// Phone Number Change logic: if changed, reset verification
	if req.PhoneNumber != nil {
		cleanedPhone := utils.NormalizePhoneNumber(*req.PhoneNumber)
		if cleanedPhone != settings.PhoneNumber {
			settings.PhoneNumber = cleanedPhone
			settings.IsPhoneVerified = false
			settings.PhoneVerifiedAt = nil
			// Also disable WhatsApp if phone changed
			settings.WhatsAppEnabled = false
		}
	}

	// Gatekeeper: Cannot enable WhatsApp if not verified
	if req.WhatsAppEnabled != nil {
		if *req.WhatsAppEnabled && !settings.IsPhoneVerified {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Nomor WhatsApp belum terverifikasi. Silakan lakukan verifikasi OTP terlebih dahulu.",
			})
			return
		}
		settings.WhatsAppEnabled = *req.WhatsAppEnabled
	}

	if req.EmailEnabled != nil {
		settings.EmailEnabled = *req.EmailEnabled
	}
	if req.InAppEnabled != nil {
		settings.InAppEnabled = *req.InAppEnabled
	}
	if req.PreferredChannel != nil {
		settings.PreferredChannel = *req.PreferredChannel
	}
	if req.BillReminders != nil {
		settings.BillReminders = *req.BillReminders
	}
	if req.BudgetAlerts != nil {
		settings.BudgetAlerts = *req.BudgetAlerts
	}
	if req.LowBalanceAlerts != nil {
		settings.LowBalanceAlerts = *req.LowBalanceAlerts
	}
	if req.SecurityAlerts != nil {
		settings.SecurityAlerts = *req.SecurityAlerts
	}
	if req.BudgetThresholdPct != nil {
		settings.BudgetThresholdPct = *req.BudgetThresholdPct
	}

	if err := config.DB.Save(settings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Pengaturan notifikasi berhasil diperbarui",
		"data":    settings,
	})
}

type RequestPhoneOTPRequest struct {
	PhoneNumber string `json:"phone_number" binding:"required"`
}

// RequestPhoneOTP sends 6-digit OTP code to WhatsApp for verification
func (ctrl *NotificationController) RequestPhoneOTP(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req RequestPhoneOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nomor telepon wajib diisi"})
		return
	}

	phone := utils.NormalizePhoneNumber(req.PhoneNumber)
	if len(phone) < 9 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format nomor telepon tidak valid"})
		return
	}

	// Rate Limiting: 1 OTP request per 60 seconds
	var recentOTP models.OTP
	oneMinuteAgo := time.Now().Add(-60 * time.Second)
	if err := config.DB.Where("phone = ? AND type = ? AND created_at > ?", phone, models.OTPTypePhoneVerification, oneMinuteAgo).First(&recentOTP).Error; err == nil {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "Silakan tunggu 60 detik sebelum meminta OTP kembali"})
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	otpCode := utils.GenerateNumericOTP()
	expiresAt := time.Now().Add(10 * time.Minute)

	otpRecord := models.OTP{
		Phone:     phone,
		Code:      otpCode,
		Type:      models.OTPTypePhoneVerification,
		Channel:   models.OTPChannelWhatsApp,
		ExpiresAt: expiresAt,
	}

	if err := config.DB.Create(&otpRecord).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat sesi verifikasi"})
		return
	}

	// Send OTP asynchronously
	go func() {
		_ = utils.SendPhoneVerificationOTP(phone, user.Name, otpCode)
	}()

	c.JSON(http.StatusOK, gin.H{
		"message":    "Kode OTP berhasil dikirim melalui WhatsApp ke " + phone,
		"expires_in": 600,
	})
}

type ConfirmPhoneOTPRequest struct {
	PhoneNumber string `json:"phone_number" binding:"required"`
	Code        string `json:"code" binding:"required"`
}

// ConfirmPhoneOTP verifies the OTP and marks user phone as verified
func (ctrl *NotificationController) ConfirmPhoneOTP(c *gin.Context) {
	userID := middleware.GetAuthUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req ConfirmPhoneOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nomor WhatsApp dan kode OTP wajib diisi"})
		return
	}

	phone := utils.NormalizePhoneNumber(req.PhoneNumber)

	var otp models.OTP
	err := config.DB.Where("phone = ? AND code = ? AND type = ? AND is_used = false AND expires_at > ?",
		phone, req.Code, models.OTPTypePhoneVerification, time.Now()).Order("created_at DESC").First(&otp).Error

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kode OTP salah atau sudah kedaluwarsa"})
		return
	}

	// Mark OTP as used
	otp.IsUsed = true
	config.DB.Save(&otp)

	// Update user notification settings
	settings, _ := services.EnsureUserSettings(config.DB, userID)
	now := time.Now()
	settings.PhoneNumber = phone
	settings.IsPhoneVerified = true
	settings.PhoneVerifiedAt = &now
	settings.WhatsAppEnabled = true // Auto-enable upon successful verification
	config.DB.Save(settings)

	// Also update User profile phone
	config.DB.Model(&models.User{}).Where("id = ?", userID).Update("phone", phone)

	c.JSON(http.StatusOK, gin.H{
		"message": "Nomor WhatsApp berhasil diverifikasi! Notifikasi WhatsApp telah diaktifkan.",
		"data":    settings,
	})
}
