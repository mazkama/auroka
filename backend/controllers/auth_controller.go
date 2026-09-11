package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"

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

// Register creates a new user account with hashed password
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
	if err := config.DB.Where("email = ?", cleanEmail).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email sudah terdaftar. Silakan masuk atau gunakan email lain."})
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi kata sandi."})
		return
	}

	user := models.User{
		Name:      cleanName,
		Email:     cleanEmail,
		Password:  hashedPassword,
		Role:      "PRO_MEMBER",
		AvatarURL: "",
		GoogleID:  nil,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data pengguna ke database."})
		return
	}

	// Generate JWT
	jwtToken, err := utils.GenerateJWT(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat token autentikasi."})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Registrasi berhasil",
		"token":   jwtToken,
		"user": gin.H{
			"id":        user.ID,
			"name":      user.Name,
			"email":     user.Email,
			"role":      user.Role,
			"avatarUrl": user.AvatarURL,
		},
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
			"id":        user.ID,
			"name":      user.Name,
			"email":     user.Email,
			"role":      user.Role,
			"avatarUrl": user.AvatarURL,
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
			"id":        user.ID,
			"name":      user.Name,
			"email":     user.Email,
			"role":      user.Role,
			"avatarUrl": user.AvatarURL,
		},
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
		// User does not exist, create new
		user = models.User{
			Email:     userInfo.Email,
			Name:      userInfo.Name,
			GoogleID:  &userInfo.Id,
			AvatarURL: userInfo.Picture,
			Role:      "PRO_MEMBER",
		}
		if err := config.DB.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
	} else if user.GoogleID == nil || *user.GoogleID == "" {
		// Update existing user with Google ID
		user.GoogleID = &userInfo.Id
		user.AvatarURL = userInfo.Picture
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
