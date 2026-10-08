package services

import (
	"fmt"
	"log"
	"time"

	"github.com/mazkama/auroka/backend/config"
	"github.com/mazkama/auroka/backend/models"
	"github.com/mazkama/auroka/backend/utils"
	"gorm.io/gorm"
)

type NotificationRequest struct {
	UserID       uint
	Category     models.NotificationCategory
	Priority     models.NotificationPriority
	Title        string
	Message      string
	ActionURL    string
	ActionText   string
	ReferenceKey string
	Metadata     string
}

// EnsureUserSettings makes sure a settings row exists for the user
func EnsureUserSettings(db *gorm.DB, userID uint) (*models.UserNotificationSettings, error) {
	var settings models.UserNotificationSettings
	err := db.Where("user_id = ?", userID).First(&settings).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			settings = models.UserNotificationSettings{
				UserID:             userID,
				WhatsAppEnabled:    false,
				EmailEnabled:       true,
				InAppEnabled:       true,
				PreferredChannel:   models.PreferredChannelInApp,
				BillReminders:      true,
				BudgetAlerts:       true,
				LowBalanceAlerts:   true,
				SecurityAlerts:     true,
				BudgetThresholdPct: 80,
			}
			if err := db.Create(&settings).Error; err != nil {
				return nil, err
			}
			return &settings, nil
		}
		return nil, err
	}
	return &settings, nil
}

// DispatchNotification sends in-app notification and optionally triggers WhatsApp or Email
func DispatchNotification(req NotificationRequest) error {
	db := config.DB
	if db == nil {
		return fmt.Errorf("database not initialized")
	}

	var user models.User
	if err := db.First(&user, req.UserID).Error; err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	settings, err := EnsureUserSettings(db, req.UserID)
	if err != nil {
		return fmt.Errorf("failed to load settings: %w", err)
	}

	// 1. In-App Notification (Always create if in_app_enabled or default)
	if settings.InAppEnabled {
		notif := models.Notification{
			UserID:     req.UserID,
			Title:      req.Title,
			Message:    req.Message,
			Category:   req.Category,
			Priority:   req.Priority,
			ActionURL:  req.ActionURL,
			ActionText: req.ActionText,
			IsRead:     false,
			Metadata:   req.Metadata,
		}
		if err := db.Create(&notif).Error; err != nil {
			log.Println("[ERROR] Failed to save in-app notification:", err)
		}
	}

	// 2. Anti-duplicate Rate Limiting Check for Outbound Channels (WhatsApp & Email)
	if req.ReferenceKey != "" {
		todayStart := time.Now().Truncate(24 * time.Hour)
		var existingCount int64
		db.Model(&models.NotificationDeliveryLog{}).
			Where("user_id = ? AND reference_key = ? AND created_at >= ?", req.UserID, req.ReferenceKey, todayStart).
			Count(&existingCount)

		if existingCount > 0 {
			log.Printf("[INFO] Notification with reference_key '%s' already dispatched today for user %d. Skipping external channels.\n", req.ReferenceKey, req.UserID)
			return nil
		}
	}

	// 3. WhatsApp Dispatch (Check if verified and enabled)
	if settings.WhatsAppEnabled && settings.IsPhoneVerified && settings.PhoneNumber != "" {
		waMsg := fmt.Sprintf("*🔔 Auroka Keuangan - %s*\n\n%s\n", req.Title, req.Message)
		if req.ActionURL != "" {
			waMsg += fmt.Sprintf("\n🔗 Buka tautan: %s%s\n", "https://auroka.kuloalan.online", req.ActionURL)
		}
		waMsg += "\n—\n_Auroka Keuangan - Realtime Ledger Intelligence_"

		if utils.DefaultWhatsAppClient == nil {
			utils.InitWhatsAppClient()
		}

		go func(phone, msg string, uid uint, refKey string) {
			err := utils.DefaultWhatsAppClient.SendMessage(phone, msg)
			status := "SENT"
			respData := "ok"
			if err != nil {
				status = "FAILED"
				respData = err.Error()
			}
			logEntry := models.NotificationDeliveryLog{
				UserID:           uid,
				Channel:          "WHATSAPP",
				NotificationType: string(req.Category),
				ReferenceKey:     refKey,
				Recipient:        phone,
				Status:           status,
				ResponseData:     respData,
			}
			config.DB.Create(&logEntry)
		}(settings.PhoneNumber, waMsg, req.UserID, req.ReferenceKey)
	}

	return nil
}
