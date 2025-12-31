package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"watermap/internal/domain/entity"
	"watermap/internal/domain/repository"
	"watermap/internal/infrastructure/validator"
)

type WaterObjectHandler struct {
	repo      repository.WaterObjectRepository
	validator *validator.GeometryValidator
}

func NewWaterObjectHandler(repo repository.WaterObjectRepository, validator *validator.GeometryValidator) *WaterObjectHandler {
	return &WaterObjectHandler{
		repo:      repo,
		validator: validator,
	}
}

type CreateWaterObjectRequest struct {
	NameKZ          string          `json:"name_kz" binding:"required"`
	NameRU          *string         `json:"name_ru"`
	NameEN          *string         `json:"name_en"`
	ObjectType      string          `json:"object_type" binding:"required"`
	Geometry        json.RawMessage `json:"geometry" binding:"required"`
	LengthKm        *float64        `json:"length_km"`
	AreaKm2         *float64        `json:"area_km2"`
	MaxDepthM       *float64        `json:"max_depth_m"`
	AvgDepthM       *float64        `json:"avg_depth_m"`
	WaterVolumeKm3  *float64        `json:"water_volume_km3"`
	BasinAreaKm2    *float64        `json:"basin_area_km2"`
	AvgDischargeM3s *float64        `json:"avg_discharge_m3s"`
	SalinityLevel   *string         `json:"salinity_level"`
	PollutionIndex  *float64        `json:"pollution_index"`
	EcologicalStatus *string        `json:"ecological_status"`
	DescriptionKZ   *string         `json:"description_kz"`
	DescriptionRU   *string         `json:"description_ru"`
	DescriptionEN   *string         `json:"description_en"`
}

// GetPublished returns all published water objects as GeoJSON FeatureCollection
func (h *WaterObjectHandler) GetPublished(c *gin.Context) {
	filter := &repository.WaterObjectFilter{}

	if objType := c.Query("type"); objType != "" {
		filter.ObjectType = entity.ObjectType(objType)
	}

	objects, err := h.repo.GetPublished(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "fetch_failed",
			"message": err.Error(),
		})
		return
	}

	// Convert to GeoJSON FeatureCollection
	features := make([]map[string]interface{}, 0, len(objects))
	for _, obj := range objects {
		feature := map[string]interface{}{
			"type":     "Feature",
			"geometry": obj.Geometry,
			"properties": map[string]interface{}{
				"id":           obj.ID,
				"canonical_id": obj.CanonicalID,
				"name_kz":      obj.NameKZ,
				"name_ru":      obj.NameRU,
				"name_en":      obj.NameEN,
				"object_type":  obj.ObjectType,
				"length_km":    obj.LengthKm,
				"area_km2":     obj.AreaKm2,
			},
		}
		features = append(features, feature)
	}

	c.JSON(http.StatusOK, gin.H{
		"type":     "FeatureCollection",
		"features": features,
		"metadata": gin.H{
			"total": len(features),
		},
	})
}

// GetByCanonicalID returns a single published water object
func (h *WaterObjectHandler) GetByCanonicalID(c *gin.Context) {
	canonicalID := c.Param("canonicalId")

	obj, err := h.repo.GetByCanonicalID(c.Request.Context(), canonicalID, entity.StatusPublished)
	if err != nil {
		if err == entity.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "not_found",
				"message": "water object not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "fetch_failed",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": obj})
}

// GetMyDrafts returns the current user's drafts
func (h *WaterObjectHandler) GetMyDrafts(c *gin.Context) {
	userID := c.GetInt64("user_id")

	drafts, err := h.repo.GetDraftsByUser(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "fetch_failed",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"drafts": drafts})
}

// Create creates a new draft water object
func (h *WaterObjectHandler) Create(c *gin.Context) {
	var req CreateWaterObjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "validation_error",
			"message": err.Error(),
		})
		return
	}

	objType := entity.ObjectType(req.ObjectType)
	if !objType.IsValid() {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "validation_error",
			"message": "invalid object_type",
		})
		return
	}

	// Validate geometry
	if err := h.validator.Validate(req.Geometry, objType); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "geometry_error",
			"message": err.Error(),
		})
		return
	}

	userID := c.GetInt64("user_id")

	var geom entity.Geometry
	if err := json.Unmarshal(req.Geometry, &geom); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "geometry_parse_error",
			"message": err.Error(),
		})
		return
	}

	obj := &entity.WaterObject{
		NameKZ:           req.NameKZ,
		NameRU:           req.NameRU,
		NameEN:           req.NameEN,
		ObjectType:       objType,
		Geometry:         geom,
		LengthKm:         req.LengthKm,
		AreaKm2:          req.AreaKm2,
		MaxDepthM:        req.MaxDepthM,
		AvgDepthM:        req.AvgDepthM,
		WaterVolumeKm3:   req.WaterVolumeKm3,
		BasinAreaKm2:     req.BasinAreaKm2,
		AvgDischargeM3s:  req.AvgDischargeM3s,
		SalinityLevel:    req.SalinityLevel,
		PollutionIndex:   req.PollutionIndex,
		EcologicalStatus: req.EcologicalStatus,
		DescriptionKZ:    req.DescriptionKZ,
		DescriptionRU:    req.DescriptionRU,
		DescriptionEN:    req.DescriptionEN,
		CreatedBy:        userID,
	}

	result, err := h.repo.Create(c.Request.Context(), obj)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "create_failed",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "draft created",
		"data":    result,
	})
}

// Update updates a draft water object
func (h *WaterObjectHandler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_id",
			"message": "invalid object id",
		})
		return
	}

	var req CreateWaterObjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "validation_error",
			"message": err.Error(),
		})
		return
	}

	objType := entity.ObjectType(req.ObjectType)

	// Validate geometry
	if err := h.validator.Validate(req.Geometry, objType); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "geometry_error",
			"message": err.Error(),
		})
		return
	}

	userID := c.GetInt64("user_id")

	var geom entity.Geometry
	if err := json.Unmarshal(req.Geometry, &geom); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "geometry_parse_error",
			"message": err.Error(),
		})
		return
	}

	obj := &entity.WaterObject{
		ID:               id,
		NameKZ:           req.NameKZ,
		NameRU:           req.NameRU,
		NameEN:           req.NameEN,
		ObjectType:       objType,
		Geometry:         geom,
		LengthKm:         req.LengthKm,
		AreaKm2:          req.AreaKm2,
		MaxDepthM:        req.MaxDepthM,
		AvgDepthM:        req.AvgDepthM,
		WaterVolumeKm3:   req.WaterVolumeKm3,
		BasinAreaKm2:     req.BasinAreaKm2,
		AvgDischargeM3s:  req.AvgDischargeM3s,
		SalinityLevel:    req.SalinityLevel,
		PollutionIndex:   req.PollutionIndex,
		EcologicalStatus: req.EcologicalStatus,
		DescriptionKZ:    req.DescriptionKZ,
		DescriptionRU:    req.DescriptionRU,
		DescriptionEN:    req.DescriptionEN,
		UpdatedBy:        &userID,
	}

	result, err := h.repo.Update(c.Request.Context(), obj)
	if err != nil {
		if err == entity.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "not_found",
				"message": "draft not found or not editable",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "update_failed",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "draft updated",
		"data":    result,
	})
}

// SubmitForReview submits a draft for review
func (h *WaterObjectHandler) SubmitForReview(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_id",
			"message": "invalid object id",
		})
		return
	}

	userID := c.GetInt64("user_id")

	if err := h.repo.SubmitForReview(c.Request.Context(), id, userID); err != nil {
		if err == entity.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "not_found",
				"message": "draft not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "submit_failed",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "submitted for review"})
}

// Delete removes a draft
func (h *WaterObjectHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_id",
			"message": "invalid object id",
		})
		return
	}

	userID := c.GetInt64("user_id")

	if err := h.repo.Delete(c.Request.Context(), id, userID); err != nil {
		if err == entity.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "not_found",
				"message": "draft not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "delete_failed",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "draft deleted"})
}
