package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"watermap/internal/domain/entity"
	"watermap/internal/domain/repository"
)

type AuthMiddleware struct {
	jwtSecret string
	userRepo  repository.UserRepository
}

func NewAuthMiddleware(jwtSecret string, userRepo repository.UserRepository) *AuthMiddleware {
	return &AuthMiddleware{
		jwtSecret: jwtSecret,
		userRepo:  userRepo,
	}
}

// Protect requires authentication via JWT
func (m *AuthMiddleware) Protect() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := ""

		// Try cookie first
		if cookie, err := c.Cookie("token"); err == nil {
			tokenString = cookie
		}

		// Try Authorization header
		if tokenString == "" {
			authHeader := c.GetHeader("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "unauthorized",
				"message": "no token provided",
			})
			return
		}

		// Parse token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(m.jwtSecret), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "unauthorized",
				"message": "invalid token",
			})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "unauthorized",
				"message": "invalid token claims",
			})
			return
		}

		userIDFloat, ok := claims["id"].(float64)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "unauthorized",
				"message": "invalid user id in token",
			})
			return
		}

		userID := int64(userIDFloat)

		// Get user from database
		user, err := m.userRepo.GetByID(c.Request.Context(), userID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "unauthorized",
				"message": "user not found",
			})
			return
		}

		// Set user in context
		c.Set("user_id", user.ID)
		c.Set("user_role", user.Role)
		c.Set("user", user)

		c.Next()
	}
}

// RequireRole checks if user has one of the allowed roles
func (m *AuthMiddleware) RequireRole(allowedRoles ...entity.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("user_role")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "unauthorized",
				"message": "authentication required",
			})
			return
		}

		userRole := role.(entity.UserRole)

		for _, allowed := range allowedRoles {
			if userRole == allowed {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"error":    "forbidden",
			"message":  "insufficient permissions",
			"required": allowedRoles,
			"current":  userRole,
		})
	}
}

// RequireExpert is a shorthand for RequireRole with expert and admin
func (m *AuthMiddleware) RequireExpert() gin.HandlerFunc {
	return m.RequireRole(entity.RoleExpert, entity.RoleAdmin)
}

// RequireAdmin is a shorthand for RequireRole with admin only
func (m *AuthMiddleware) RequireAdmin() gin.HandlerFunc {
	return m.RequireRole(entity.RoleAdmin)
}
