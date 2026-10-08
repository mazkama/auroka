package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mazkama/auroka/backend/config"
	"github.com/mazkama/auroka/backend/models"
	"github.com/mazkama/auroka/backend/utils"
	"golang.org/x/oauth2"
)

type GoogleUserInfo struct {
	Id      string `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

type RegisterInput struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type VerifyEmailInput struct {
	Email string `json:"email" binding:"required,email"`
	Code  string `json:"code" binding:"required"`
}

type ResendVerificationInput struct {
	Email string `json:"email" binding:"required,email"`
}

type ForgotPasswordInput struct {
	Email string `json:"email" binding:"required,email"`
}

type ResetPasswordInput struct {
	Email       string `json:"email" binding:"required,email"`
	Code        string `json:"code" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required,min=6"`
}

type UpdateProfileInput struct {
	Name               string `json:"name"`
	Phone              string `json:"phone"`
	Bio                string `json:"bio"`
	AvatarURL          string `json:"avatar_url"`
	CurrencyPreference string `json:"currency_preference"`
	LanguagePreference string `json:"language_preference"`
	AvatarUrlCamel     string `json:"avatarUrl"`
	CurrencyPrefCamel  string `json:"currencyPreference"`
	LanguagePrefCamel  string `json:"languagePreference"`
}

type UpdatePasswordInput struct {
	OldPassword    string `json:"oldPassword"`
	NewPassword    string `json:"newPassword" binding:"required,min=6"`
	CurrentPassword string `json:"currentPassword"`
}

// Register creates a new user account with hashed password and sends an OTP verification email
func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid. Pastikan nama, email, dan kata sandi minimal 6 karakter telah diisi."})
		return
	}

	cleanEmail := strings.TrimSpace(strings.ToLower(input.Email))
	cleanName := strings.TrimSpace(input.Name)

	if cleanName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama lengkap tidak boleh kosong."})
		return
	}

	// Check if user already exists
	var existingUser models.User
	err := config.DB.Where("email = ?", cleanEmail).First(&existingUser).Error
	if err == nil {
		if existingUser.IsVerified {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email sudah terdaftar dan terverifikasi. Silakan langsung masuk."})
			return
		}
		// If user exists but is not verified, update their password and resend OTP
		hashedPassword, hashErr := utils.HashPassword(input.Password)
		if hashErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi kata sandi."})
			return
		}
		existingUser.Name = cleanName
		existingUser.Password = hashedPassword
		config.DB.Save(&existingUser)
	} else {
		// Hash password
		hashedPassword, hashErr := utils.HashPassword(input.Password)
		if hashErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi kata sandi."})
			return
		}

		newUser := models.User{
			Name:       cleanName,
			Email:      cleanEmail,
			Password:   hashedPassword,
			Role:       "PRO_MEMBER",
			AvatarURL:  "",
			GoogleID:   nil,
			IsVerified: false,
		}

		if createErr := config.DB.Create(&newUser).Error; createErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data pengguna ke database."})
			return
		}
	}

	// Generate 6-digit OTP
	otpCode := utils.GenerateNumericOTP()
	expiresAt := time.Now().Add(15 * time.Minute)

	// Invalidate previous OTPs for this email and type
	config.DB.Model(&models.OTP{}).
		Where("email = ? AND type = ?", cleanEmail, models.OTPTypeEmailVerification).
		Update("is_used", true)

	// Save new OTP
	otpRecord := models.OTP{
		Email:     cleanEmail,
		Code:      otpCode,
		Type:      models.OTPTypeEmailVerification,
		IsUsed:    false,
		ExpiresAt: expiresAt,
	}
	config.DB.Create(&otpRecord)

	// Send verification email via Resend API (run asynchronously to keep register response fast)
	go func(targetEmail, targetName, code string) {
		_ = utils.SendVerificationEmail(targetEmail, targetName, code)
	}(cleanEmail, cleanName, otpCode)

	c.JSON(http.StatusOK, gin.H{
		"message":               "Kode verifikasi telah dikirim ke alamat email Anda. Silakan periksa kotak masuk atau spam.",
		"requires_verification": true,
		"email":                 cleanEmail,
	})
}

// VerifyEmail verifies the 6-digit OTP code and activates the account
func VerifyEmail(c *gin.Context) {
	var input VerifyEmailInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email dan kode verifikasi 6 digit wajib diisi."})
		return
	}

	cleanEmail := strings.TrimSpace(strings.ToLower(input.Email))
	cleanCode := strings.TrimSpace(input.Code)

	var otpRecord models.OTP
	err := config.DB.Where("email = ? AND code = ? AND type = ? AND is_used = false AND expires_at > ?",
		cleanEmail, cleanCode, models.OTPTypeEmailVerification, time.Now()).
		Order("created_at desc").
		First(&otpRecord).Error

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kode verifikasi salah atau sudah kadaluarsa. Silakan minta kode baru."})
		return
	}

	// Mark OTP as used
	otpRecord.IsUsed = true
	config.DB.Save(&otpRecord)

	// Update user status to verified
	var user models.User
	if err := config.DB.Where("email = ?", cleanEmail).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Akun pengguna tidak ditemukan."})
		return
	}

	user.IsVerified = true
	config.DB.Save(&user)

	// Generate JWT
	jwtToken, err := utils.GenerateJWT(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat token autentikasi."})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Email berhasil diverifikasi! Selamat datang di Auroka.",
		"token":   jwtToken,
		"user": gin.H{
			"id":                  user.ID,
			"name":                user.Name,
			"email":               user.Email,
			"phone":               user.Phone,
			"bio":                 user.Bio,
			"role":                user.Role,
			"avatarUrl":           user.AvatarURL,
			"avatar_url":          user.AvatarURL,
			"currencyPreference":  user.CurrencyPreference,
			"currency_preference": user.CurrencyPreference,
			"languagePreference":  user.LanguagePreference,
			"language_preference": user.LanguagePreference,
		},
	})
}

// ResendVerification resends an OTP verification code
func ResendVerification(c *gin.Context) {
	var input ResendVerificationInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Alamat email tidak valid."})
		return
	}

	cleanEmail := strings.TrimSpace(strings.ToLower(input.Email))

	var user models.User
	if err := config.DB.Where("email = ?", cleanEmail).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Akun dengan email ini tidak ditemukan."})
		return
	}

	if user.IsVerified {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Akun ini sudah terverifikasi. Silakan langsung masuk."})
		return
	}

	// Generate new OTP
	otpCode := utils.GenerateNumericOTP()
	expiresAt := time.Now().Add(15 * time.Minute)

	// Invalidate previous OTPs
	config.DB.Model(&models.OTP{}).
		Where("email = ? AND type = ?", cleanEmail, models.OTPTypeEmailVerification).
		Update("is_used", true)

	otpRecord := models.OTP{
		Email:     cleanEmail,
		Code:      otpCode,
		Type:      models.OTPTypeEmailVerification,
		IsUsed:    false,
		ExpiresAt: expiresAt,
	}
	config.DB.Create(&otpRecord)

	// Send email asynchronously
	go func(targetEmail, targetName, code string) {
		_ = utils.SendVerificationEmail(targetEmail, targetName, code)
	}(cleanEmail, user.Name, otpCode)

	c.JSON(http.StatusOK, gin.H{
		"message": "Kode verifikasi baru berhasil dikirim ke email Anda.",
	})
}

// ForgotPassword generates an OTP code and sends a password reset email
func ForgotPassword(c *gin.Context) {
	var input ForgotPasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Alamat email tidak valid."})
		return
	}

	cleanEmail := strings.TrimSpace(strings.ToLower(input.Email))

	var user models.User
	if err := config.DB.Where("email = ?", cleanEmail).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Akun dengan email ini tidak ditemukan."})
		return
	}

	// Generate 6-digit OTP
	otpCode := utils.GenerateNumericOTP()
	expiresAt := time.Now().Add(15 * time.Minute)

	// Invalidate previous unused OTPs for this email and type
	config.DB.Model(&models.OTP{}).
		Where("email = ? AND type = ?", cleanEmail, models.OTPTypePasswordReset).
		Update("is_used", true)

	// Save new OTP
	otpRecord := models.OTP{
		Email:     cleanEmail,
		Code:      otpCode,
		Type:      models.OTPTypePasswordReset,
		IsUsed:    false,
		ExpiresAt: expiresAt,
	}
	config.DB.Create(&otpRecord)

	// Send password reset email asynchronously
	go func(targetEmail, targetName, code string) {
		_ = utils.SendPasswordResetEmail(targetEmail, targetName, code)
	}(cleanEmail, user.Name, otpCode)

	c.JSON(http.StatusOK, gin.H{
		"message": "Kode OTP reset kata sandi telah dikirim ke email Anda.",
	})
}

// ResetPassword validates OTP and updates the user's password
func ResetPassword(c *gin.Context) {
	var input ResetPasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid. Pastikan email, kode OTP, dan kata sandi baru minimal 6 karakter telah diisi."})
		return
	}

	cleanEmail := strings.TrimSpace(strings.ToLower(input.Email))
	cleanCode := strings.TrimSpace(input.Code)

	var otpRecord models.OTP
	err := config.DB.Where("email = ? AND code = ? AND type = ? AND is_used = false AND expires_at > ?",
		cleanEmail, cleanCode, models.OTPTypePasswordReset, time.Now()).
		Order("created_at desc").
		First(&otpRecord).Error

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kode OTP reset kata sandi salah atau sudah kadaluarsa. Silakan minta kode baru."})
		return
	}

	var user models.User
	if err := config.DB.Where("email = ?", cleanEmail).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Akun pengguna tidak ditemukan."})
		return
	}

	hashedPassword, hashErr := utils.HashPassword(input.NewPassword)
	if hashErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi kata sandi baru."})
		return
	}

	// Update user password
	user.Password = hashedPassword
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui kata sandi."})
		return
	}

	// Mark OTP as used
	otpRecord.IsUsed = true
	config.DB.Save(&otpRecord)

	c.JSON(http.StatusOK, gin.H{
		"message": "Kata sandi berhasil diatur ulang. Silakan masuk dengan kata sandi baru.",
	})
}

// Login verifies credentials and returns a JWT token
func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format email atau kata sandi tidak valid."})
		return
	}

	cleanEmail := strings.TrimSpace(strings.ToLower(input.Email))

	var user models.User
	if err := config.DB.Where("email = ?", cleanEmail).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau kata sandi salah."})
		return
	}

	// If account has no password (e.g., registered exclusively via Google OAuth)
	if user.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Akun ini terdaftar via Google OAuth. Silakan masuk menggunakan tombol 'Masuk dengan Google'."})
		return
	}

	// Compare bcrypt password
	if !utils.CheckPassword(user.Password, input.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau kata sandi salah."})
		return
	}

	// Check if user is verified (Google OAuth users or demo account are pre-verified)
	if !user.IsVerified && user.GoogleID == nil {
		// Auto send new OTP
		otpCode := utils.GenerateNumericOTP()
		expiresAt := time.Now().Add(15 * time.Minute)

		config.DB.Model(&models.OTP{}).
			Where("email = ? AND type = ?", cleanEmail, models.OTPTypeEmailVerification).
			Update("is_used", true)

		otpRecord := models.OTP{
			Email:     cleanEmail,
			Code:      otpCode,
			Type:      models.OTPTypeEmailVerification,
			IsUsed:    false,
			ExpiresAt: expiresAt,
		}
		config.DB.Create(&otpRecord)

		go func(targetEmail, targetName, code string) {
			_ = utils.SendVerificationEmail(targetEmail, targetName, code)
		}(cleanEmail, user.Name, otpCode)

		c.JSON(http.StatusForbidden, gin.H{
			"error":                 "Email Anda belum diverifikasi. Kode verifikasi baru telah dikirim ke email Anda.",
			"requires_verification": true,
			"email":                 user.Email,
		})
		return
	}

	// Generate JWT
	jwtToken, err := utils.GenerateJWT(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat token autentikasi."})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil",
		"token":   jwtToken,
		"user": gin.H{
			"id":                  user.ID,
			"name":                user.Name,
			"email":               user.Email,
			"phone":               user.Phone,
			"bio":                 user.Bio,
			"role":                user.Role,
			"avatarUrl":           user.AvatarURL,
			"avatar_url":          user.AvatarURL,
			"currencyPreference":  user.CurrencyPreference,
			"currency_preference": user.CurrencyPreference,
			"languagePreference":  user.LanguagePreference,
			"language_preference": user.LanguagePreference,
		},
	})
}

// GetMe returns current authenticated user profile
func GetMe(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Pengguna tidak terautentikasi."})
		return
	}

	var user models.User
	if err := config.DB.First(&user, userIDVal).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan."})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":                  user.ID,
			"name":                user.Name,
			"email":               user.Email,
			"phone":               user.Phone,
			"bio":                 user.Bio,
			"role":                user.Role,
			"avatarUrl":           user.AvatarURL,
			"avatar_url":          user.AvatarURL,
			"currencyPreference":  user.CurrencyPreference,
			"currency_preference": user.CurrencyPreference,
			"languagePreference":  user.LanguagePreference,
			"language_preference": user.LanguagePreference,
		},
	})
}

// UpdateProfile updates the current authenticated user's profile details
func UpdateProfile(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Pengguna tidak terautentikasi."})
		return
	}

	var user models.User
	if err := config.DB.First(&user, userIDVal).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan."})
		return
	}

	var input UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data profil tidak valid."})
		return
	}

	if strings.TrimSpace(input.Name) != "" {
		user.Name = strings.TrimSpace(input.Name)
	}
	if input.Phone != "" {
		user.Phone = strings.TrimSpace(input.Phone)
	}
	if input.Bio != "" {
		user.Bio = input.Bio
	}
	if input.AvatarURL != "" {
		user.AvatarURL = input.AvatarURL
	} else if input.AvatarUrlCamel != "" {
		user.AvatarURL = input.AvatarUrlCamel
	}
	if input.CurrencyPreference != "" {
		user.CurrencyPreference = input.CurrencyPreference
	} else if input.CurrencyPrefCamel != "" {
		user.CurrencyPreference = input.CurrencyPrefCamel
	}
	if input.LanguagePreference != "" {
		user.LanguagePreference = input.LanguagePreference
	} else if input.LanguagePrefCamel != "" {
		user.LanguagePreference = input.LanguagePrefCamel
	}

	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui profil pengguna."})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profil berhasil diperbarui.",
		"user": gin.H{
			"id":                  user.ID,
			"name":                user.Name,
			"email":               user.Email,
			"phone":               user.Phone,
			"bio":                 user.Bio,
			"role":                user.Role,
			"avatar_url":          user.AvatarURL,
			"avatarUrl":           user.AvatarURL,
			"currency_preference": user.CurrencyPreference,
			"currencyPreference":  user.CurrencyPreference,
			"language_preference": user.LanguagePreference,
			"languagePreference":  user.LanguagePreference,
		},
	})
}

// UpdatePassword updates the current authenticated user's password
func UpdatePassword(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Pengguna tidak terautentikasi."})
		return
	}

	var user models.User
	if err := config.DB.First(&user, userIDVal).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan."})
		return
	}

	var input UpdatePasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kata sandi saat ini dan kata sandi baru (minimal 6 karakter) wajib diisi."})
		return
	}

	oldPassword := input.OldPassword
	if oldPassword == "" {
		oldPassword = input.CurrentPassword
	}

	// Verify current password if user has password set
	if user.Password != "" {
		if oldPassword == "" || !utils.CheckPassword(user.Password, oldPassword) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Kata sandi lama tidak sesuai."})
			return
		}
	}

	hashedPassword, err := utils.HashPassword(input.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi kata sandi baru."})
		return
	}

	user.Password = hashedPassword
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui kata sandi."})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Kata sandi berhasil diperbarui.",
	})
}

func GoogleLogin(c *gin.Context) {
	url := config.GoogleOAuthConfig.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func GoogleCallback(c *gin.Context) {
	state := c.Query("state")
	if state != "state-token" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid state"})
		return
	}

	code := c.Query("code")
	token, err := config.GoogleOAuthConfig.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to exchange token"})
		return
	}

	client := config.GoogleOAuthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil || resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get user info"})
		return
	}
	defer resp.Body.Close()

	var userInfo GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode user info"})
		return
	}

	// Check if user exists
	var user models.User
	result := config.DB.Where("email = ?", userInfo.Email).First(&user)

	if result.Error != nil {
		// User does not exist, create new (pre-verified by Google)
		user = models.User{
			Email:      userInfo.Email,
			Name:       userInfo.Name,
			GoogleID:   &userInfo.Id,
			AvatarURL:  userInfo.Picture,
			Role:       "PRO_MEMBER",
			IsVerified: true,
		}
		if err := config.DB.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
	} else {
		// Update existing user with Google ID and ensure verified
		user.GoogleID = &userInfo.Id
		if user.AvatarURL == "" && userInfo.Picture != "" {
			user.AvatarURL = userInfo.Picture
		}
		user.IsVerified = true
		config.DB.Save(&user)
	}

	// Generate JWT
	jwtToken, err := utils.GenerateJWT(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Redirect to frontend with token
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}
	c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/dashboard?token="+jwtToken)
}
