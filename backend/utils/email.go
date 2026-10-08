package utils

import (
	"bytes"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/big"
	"net/http"
	"os"
)

// GenerateNumericOTP generates a secure 6-digit numeric string
func GenerateNumericOTP() string {
	n, err := rand.Int(rand.Reader, big.NewInt(900000))
	if err != nil {
		return "123456"
	}
	return fmt.Sprintf("%06d", n.Int64()+100000)
}

type ResendEmailRequest struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Html    string   `json:"html"`
}

// SendVerificationEmail sends a 6-digit OTP verification email via Resend API
func SendVerificationEmail(toEmail, userName, otpCode string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		log.Println("[WARN] RESEND_API_KEY is not set. Verification OTP code for", toEmail, "is:", otpCode)
		return nil
	}

	fromSender := os.Getenv("RESEND_FROM_EMAIL")
	if fromSender == "" {
		fromSender = "Auroka Keuangan <onboarding@resend.dev>"
	}

	htmlContent := fmt.Sprintf(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifikasi Akun Auroka</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8f9ff;
      margin: 0;
      padding: 0;
      color: #0b1c30;
    }
    .container {
      max-width: 560px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 74, 198, 0.06);
    }
    .header {
      background: linear-gradient(135deg, #004ac6 0%%, #2563eb 100%%);
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }
    .logo-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 800;
      font-size: 14px;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .desc {
      font-size: 14px;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .otp-box {
      background: #eff4ff;
      border: 2px dashed #004ac6;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }
    .otp-label {
      font-size: 12px;
      font-weight: 700;
      color: #004ac6;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 8px;
    }
    .otp-code {
      font-family: 'SF Mono', 'Roboto Mono', Menlo, Consolas, Monaco, monospace;
      font-size: 34px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #004ac6;
    }
    .warning {
      font-size: 12px;
      color: #64748b;
      background: #f8fafc;
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 20px;
      line-height: 1.5;
    }
    .footer {
      background: #f8fafc;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">✨ AUROKA FINANCE</div>
      <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Verifikasi Alamat Email Anda</h1>
    </div>
    <div class="content">
      <div class="greeting">Halo, %s! 👋</div>
      <p class="desc">
        Terima kasih telah bergabung di <strong>Auroka</strong> — platform manajemen keuangan pribadi modern dengan The Realtime Ledger System.
      </p>
      <p class="desc">
        Silakan gunakan kode verifikasi (OTP) 6-digit berikut untuk mengaktifkan akun Anda:
      </p>
      
      <div class="otp-box">
        <div class="otp-label">Kode Verifikasi OTP</div>
        <div class="otp-code">%s</div>
      </div>

      <div class="warning">
        ⏱️ <strong>Penting:</strong> Kode ini hanya berlaku selama <strong>15 menit</strong>. Jangan berikan kode ini kepada siapa pun, termasuk pihak yang mengatasnamakan tim Auroka.
      </div>
    </div>
    <div class="footer">
      &copy; 2026 Auroka Keuangan &bull; From Understanding to Prosperity
    </div>
  </div>
</body>
</html>`, userName, otpCode)

	payload := ResendEmailRequest{
		From:    fromSender,
		To:      []string{toEmail},
		Subject: fmt.Sprintf("%s adalah Kode Verifikasi Akun Auroka Anda", otpCode),
		Html:    htmlContent,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("[ERROR] Failed to send email via Resend API:", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		log.Printf("[ERROR] Resend API error (%d): %s\n", resp.StatusCode, string(bodyBytes))
		return fmt.Errorf("resend API returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	log.Printf("[INFO] Verification email successfully sent to %s via Resend API\n", toEmail)
	return nil
}

// SendPasswordResetEmail sends a 6-digit OTP password reset email via Resend API
func SendPasswordResetEmail(toEmail, userName, otpCode string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		log.Println("[WARN] RESEND_API_KEY is not set. Password Reset OTP code for", toEmail, "is:", otpCode)
		return nil
	}

	fromSender := os.Getenv("RESEND_FROM_EMAIL")
	if fromSender == "" {
		fromSender = "Auroka Keuangan <onboarding@resend.dev>"
	}

	htmlContent := fmt.Sprintf(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kode Reset Kata Sandi Auroka</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8f9ff;
      margin: 0;
      padding: 0;
      color: #0b1c30;
    }
    .container {
      max-width: 560px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 74, 198, 0.06);
    }
    .header {
      background: linear-gradient(135deg, #004ac6 0%%, #2563eb 100%%);
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }
    .logo-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 800;
      font-size: 14px;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .desc {
      font-size: 14px;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .otp-box {
      background: #eff4ff;
      border: 2px dashed #004ac6;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }
    .otp-label {
      font-size: 12px;
      font-weight: 700;
      color: #004ac6;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 8px;
    }
    .otp-code {
      font-family: 'SF Mono', 'Roboto Mono', Menlo, Consolas, Monaco, monospace;
      font-size: 34px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #004ac6;
    }
    .warning {
      font-size: 12px;
      color: #64748b;
      background: #f8fafc;
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 20px;
      line-height: 1.5;
    }
    .footer {
      background: #f8fafc;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">🔐 AUROKA KEAMANAN</div>
      <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Kode Reset Kata Sandi Auroka</h1>
    </div>
    <div class="content">
      <div class="greeting">Halo, %s! 👋</div>
      <p class="desc">
        Kami menerima permintaan untuk mengatur ulang kata sandi akun <strong>Auroka</strong> Anda.
      </p>
      <p class="desc">
        Gunakan kode OTP 6-digit berikut untuk melanjutkan proses reset kata sandi:
      </p>
      
      <div class="otp-box">
        <div class="otp-label">Kode Reset Kata Sandi</div>
        <div class="otp-code">%s</div>
      </div>

      <div class="warning">
        ⏱️ <strong>Penting:</strong> Kode OTP ini hanya berlaku selama <strong>15 menit</strong>. Jika Anda tidak merasa meminta reset kata sandi, abaikan email ini dan akun Anda tetap aman.
      </div>
    </div>
    <div class="footer">
      &copy; 2026 Auroka Keuangan &bull; From Understanding to Prosperity
    </div>
  </div>
</body>
</html>`, userName, otpCode)

	payload := ResendEmailRequest{
		From:    fromSender,
		To:      []string{toEmail},
		Subject: fmt.Sprintf("%s adalah Kode Reset Kata Sandi Auroka Anda", otpCode),
		Html:    htmlContent,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("[ERROR] Failed to send password reset email via Resend API:", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		log.Printf("[ERROR] Resend API error (%d): %s\n", resp.StatusCode, string(bodyBytes))
		return fmt.Errorf("resend API returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	log.Printf("[INFO] Password reset email successfully sent to %s via Resend API\n", toEmail)
	return nil
}
