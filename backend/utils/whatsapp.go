package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

type WhatsAppClient struct {
	BaseURL    string
	SessionID  string
	HTTPClient *http.Client
}

var DefaultWhatsAppClient *WhatsAppClient

func InitWhatsAppClient() {
	baseURL := os.Getenv("APIWA_BASE_URL")
	if baseURL == "" {
		baseURL = "http://127.0.0.1:3100"
	}
	sessionID := os.Getenv("APIWA_SESSION_ID")
	if sessionID == "" {
		sessionID = "auroka-main"
	}

	DefaultWhatsAppClient = &WhatsAppClient{
		BaseURL:   strings.TrimRight(baseURL, "/"),
		SessionID: sessionID,
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// NormalizePhoneNumber ensures Indonesian/international phone numbers start with country code (e.g., 62)
func NormalizePhoneNumber(phone string) string {
	cleaned := strings.TrimSpace(phone)
	cleaned = strings.ReplaceAll(cleaned, "-", "")
	cleaned = strings.ReplaceAll(cleaned, " ", "")
	cleaned = strings.ReplaceAll(cleaned, "+", "")
	cleaned = strings.ReplaceAll(cleaned, "(", "")
	cleaned = strings.ReplaceAll(cleaned, ")", "")

	if strings.HasPrefix(cleaned, "0") {
		cleaned = "62" + cleaned[1:]
	}
	return cleaned
}

type SendWhatsAppMessageRequest struct {
	ChatID  string `json:"chatId,omitempty"`
	Phone   string `json:"phone,omitempty"`
	Message string `json:"message"`
}

type SendWhatsAppResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Error   string `json:"error,omitempty"`
}

// SendMessage sends a text message via APIWA session
func (c *WhatsAppClient) SendMessage(toPhone, message string) error {
	if c == nil {
		InitWhatsAppClient()
	}

	normalizedPhone := NormalizePhoneNumber(toPhone)
	// Build JID or direct target
	target := normalizedPhone
	if !strings.Contains(target, "@") {
		target = fmt.Sprintf("%s@c.us", target)
	}

	url := fmt.Sprintf("%s/api/v1/sessions/%s/send-message", c.BaseURL, c.SessionID)

	payload := map[string]interface{}{
		"chatId":  target,
		"phone":   normalizedPhone,
		"message": message,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	apiKey := os.Getenv("APIWA_API_KEY")
	if apiKey != "" {
		req.Header.Set("x-api-key", apiKey)
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		log.Printf("[WARN] APIWA Gateway offline or unreachable at %s: %v\n", url, err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		log.Printf("[WARN] APIWA returned error (%d): %s\n", resp.StatusCode, string(bodyBytes))
		return fmt.Errorf("APIWA error status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	log.Printf("[INFO] WhatsApp message successfully dispatched to %s via APIWA\n", normalizedPhone)
	return nil
}

// SendPhoneVerificationOTP sends 6-digit OTP code to the user's WhatsApp number
func SendPhoneVerificationOTP(toPhone, userName, otpCode string) error {
	normalizedPhone := NormalizePhoneNumber(toPhone)
	message := fmt.Sprintf(`*✨ AUROKA KEUANGAN - Verifikasi WhatsApp*

Halo *%s*! 👋

Berikut adalah kode verifikasi OTP WhatsApp Anda:
🔑 *%s*

_Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun demi keamanan akun Anda._

—
*Auroka Keuangan* • From Understanding to Prosperity`, userName, otpCode)

	if DefaultWhatsAppClient == nil {
		InitWhatsAppClient()
	}

	return DefaultWhatsAppClient.SendMessage(normalizedPhone, message)
}
