package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/mazkama/auroka/backend/utils"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer {token}"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims, err := utils.ValidateJWT(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		if userIDVal, ok := claims["user_id"]; ok {
			var uid uint
			switch v := userIDVal.(type) {
			case float64:
				uid = uint(v)
			case int:
				uid = uint(v)
			case uint:
				uid = v
			}
			c.Set("userID", uid)
		}
		if emailVal, ok := claims["email"]; ok {
			c.Set("userEmail", emailVal)
		}

		c.Next()
	}
}

func GetAuthUserID(c *gin.Context) uint {
	val, exists := c.Get("userID")
	if !exists {
		return 0
	}
	if uid, ok := val.(uint); ok {
		return uid
	}
	return 0
}

func GetAuthUserEmail(c *gin.Context) string {
	val, exists := c.Get("userEmail")
	if !exists {
		return ""
	}
	if email, ok := val.(string); ok {
		return email
	}
	return ""
}
