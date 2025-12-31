package entity

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
)

// Domain errors
var (
	ErrNameRequired         = errors.New("name_kz is required")
	ErrInvalidObjectType    = errors.New("invalid object type")
	ErrGeometryTypeMismatch = errors.New("geometry type does not match object type")
	ErrNotFound             = errors.New("object not found")
	ErrUnauthorized         = errors.New("unauthorized")
	ErrForbidden            = errors.New("insufficient permissions")
)

type ObjectType string

const (
	ObjectTypeRiver     ObjectType = "river"
	ObjectTypeLake      ObjectType = "lake"
	ObjectTypeReservoir ObjectType = "reservoir"
	ObjectTypeCanal     ObjectType = "canal"
	ObjectTypeGlacier   ObjectType = "glacier"
	ObjectTypeSpring    ObjectType = "spring"
)

func (o ObjectType) IsValid() bool {
	switch o {
	case ObjectTypeRiver, ObjectTypeLake, ObjectTypeReservoir, ObjectTypeCanal, ObjectTypeGlacier, ObjectTypeSpring:
		return true
	}
	return false
}

type ObjectStatus string

const (
	StatusDraft     ObjectStatus = "draft"
	StatusPending   ObjectStatus = "pending"
	StatusPublished ObjectStatus = "published"
	StatusArchived  ObjectStatus = "archived"
	StatusRejected  ObjectStatus = "rejected"
)

// Geometry represents a GeoJSON geometry
type Geometry struct {
	Type        string          `json:"type"`
	Coordinates json.RawMessage `json:"coordinates"`
}

type WaterObject struct {
	ID          int64        `json:"id"`
	CanonicalID uuid.UUID    `json:"canonical_id"`
	Version     int          `json:"version"`

	// Names
	NameKZ string  `json:"name_kz"`
	NameRU *string `json:"name_ru,omitempty"`
	NameEN *string `json:"name_en,omitempty"`

	// Classification
	ObjectType ObjectType `json:"object_type"`
	Geometry   Geometry   `json:"geometry"`

	// Measurements
	LengthKm        *float64 `json:"length_km,omitempty"`
	AreaKm2         *float64 `json:"area_km2,omitempty"`
	MaxDepthM       *float64 `json:"max_depth_m,omitempty"`
	AvgDepthM       *float64 `json:"avg_depth_m,omitempty"`
	WaterVolumeKm3  *float64 `json:"water_volume_km3,omitempty"`
	BasinAreaKm2    *float64 `json:"basin_area_km2,omitempty"`
	AvgDischargeM3s *float64 `json:"avg_discharge_m3s,omitempty"`

	// Water quality
	SalinityLevel    *string  `json:"salinity_level,omitempty"`
	PollutionIndex   *float64 `json:"pollution_index,omitempty"`
	EcologicalStatus *string  `json:"ecological_status,omitempty"`

	// Content
	DescriptionKZ   *string `json:"description_kz,omitempty"`
	DescriptionRU   *string `json:"description_ru,omitempty"`
	DescriptionEN   *string `json:"description_en,omitempty"`
	HistoricalNotes *string `json:"historical_notes,omitempty"`

	// Status
	Status          ObjectStatus `json:"status"`
	RejectionReason *string      `json:"rejection_reason,omitempty"`

	// Audit
	CreatedBy   int64      `json:"created_by"`
	UpdatedBy   *int64     `json:"updated_by,omitempty"`
	ReviewedBy  *int64     `json:"reviewed_by,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	PublishedAt *time.Time `json:"published_at,omitempty"`
}

// Validate performs domain validation
func (w *WaterObject) Validate() error {
	if w.NameKZ == "" {
		return ErrNameRequired
	}
	if !w.ObjectType.IsValid() {
		return ErrInvalidObjectType
	}
	return nil
}

// AllowedGeometryTypes maps object types to valid geometry types
var AllowedGeometryTypes = map[ObjectType][]string{
	ObjectTypeRiver:     {"LineString", "MultiLineString"},
	ObjectTypeCanal:     {"LineString", "MultiLineString"},
	ObjectTypeLake:      {"Polygon", "MultiPolygon"},
	ObjectTypeReservoir: {"Polygon", "MultiPolygon"},
	ObjectTypeGlacier:   {"Polygon", "MultiPolygon"},
	ObjectTypeSpring:    {"Point"},
}

// IsGeometryTypeValid checks if geometry type matches object type
func IsGeometryTypeValid(geomType string, objType ObjectType) bool {
	allowed, ok := AllowedGeometryTypes[objType]
	if !ok {
		return false
	}
	for _, t := range allowed {
		if t == geomType {
			return true
		}
	}
	return false
}
