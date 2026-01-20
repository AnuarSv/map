package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"watermap/internal/domain/entity"
	"watermap/internal/usecase/feedback"
)

type FeedbackHandler struct {
	useCase *feedback.UseCase
}

func NewFeedbackHandler(uc *feedback.UseCase) *FeedbackHandler {
	return &FeedbackHandler{useCase: uc}
}

type submitFeedbackRequest struct {
	Type       entity.FeedbackType `json:"type" binding:"required"`
	TargetType string              `json:"target_type" binding:"required"`
	TargetID   string              `json:"target_id_str"`
	Message    string              `json:"message" binding:"required"`
}

func (h *FeedbackHandler) Submit(c *gin.Context) {
	var req submitFeedbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	fb := &entity.Feedback{
		Type:       req.Type,
		TargetType: req.TargetType,
		TargetID:   req.TargetID,
		Message:    req.Message,
	}

	if err := h.useCase.Submit(c.Request.Context(), fb); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, fb)
}
