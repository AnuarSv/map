package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"watermap/internal/domain/entity"
	"watermap/internal/domain/repository"
)

type AdminHandler struct {
	waterObjectRepo repository.WaterObjectRepository
	userRepo        repository.UserRepository
}

func NewAdminHandler(waterObjectRepo repository.WaterObjectRepository, userRepo repository.UserRepository) *AdminHandler {
	return &AdminHandler{
		waterObjectRepo: waterObjectRepo,
		userRepo:        userRepo,
	}
}

// GetPending returns all pending submissions
func (h *AdminHandler) GetPending(c *gin.Context) {
	pending, err := h.waterObjectRepo.GetPending(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "fetch_failed",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"pending": pending})
}

// GetDiff returns the pending object and its published version for comparison
func (h *AdminHandler) GetDiff(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_id",
			"message": "invalid object id",
		})
		return
	}

	pending, err := h.waterObjectRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		if err == entity.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "not_found",
				"message": "pending object not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "fetch_failed",
			"message": err.Error(),
		})
		return
	}

	// Try to get published version
	published, _ := h.waterObjectRepo.GetByCanonicalID(
		c.Request.Context(),
		pending.CanonicalID.String(),
		entity.StatusPublished,
	)

	c.JSON(http.StatusOK, gin.H{
		"pending":   pending,
		"published": published,
	})
}

// Approve publishes a pending object
func (h *AdminHandler) Approve(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_id",
			"message": "invalid object id",
		})
		return
	}

	reviewerID := c.GetInt64("user_id")

	if err := h.waterObjectRepo.Approve(c.Request.Context(), id, reviewerID); err != nil {
		if err == entity.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "not_found",
				"message": "pending object not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "approve_failed",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "object approved and published"})
}

type RejectRequest struct {
	Reason string `json:"reason" binding:"required"`
}

// Reject rejects a pending object
func (h *AdminHandler) Reject(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_id",
			"message": "invalid object id",
		})
		return
	}

	var req RejectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "validation_error",
			"message": "reason is required",
		})
		return
	}

	reviewerID := c.GetInt64("user_id")

	if err := h.waterObjectRepo.Reject(c.Request.Context(), id, reviewerID, req.Reason); err != nil {
		if err == entity.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "not_found",
				"message": "pending object not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "reject_failed",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "object rejected"})
}

// GetUsers returns all users
func (h *AdminHandler) GetUsers(c *gin.Context) {
	users, err := h.userRepo.GetAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "fetch_failed",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"users": users})
}

type UpdateRoleRequest struct {
	Role string `json:"role" binding:"required"`
}

// UpdateUserRole updates a user's role
func (h *AdminHandler) UpdateUserRole(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_id",
			"message": "invalid user id",
		})
		return
	}

	var req UpdateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "validation_error",
			"message": "role is required",
		})
		return
	}

	role := entity.UserRole(req.Role)
	if !role.IsValid() {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "validation_error",
			"message": "invalid role",
		})
		return
	}

	if err := h.userRepo.UpdateRole(c.Request.Context(), id, role); err != nil {
		if err == entity.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "not_found",
				"message": "user not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "update_failed",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "role updated"})
}
