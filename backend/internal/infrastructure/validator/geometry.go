package validator

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/paulmach/orb"
	"github.com/paulmach/orb/geojson"

	"watermap/internal/domain/entity"
)

var (
	ErrInvalidGeoJSON       = errors.New("invalid geojson structure")
	ErrSelfIntersecting     = errors.New("polygon is self-intersecting")
	ErrOutsideBounds        = errors.New("geometry outside Kazakhstan bounds")
	ErrGeometryTypeMismatch = errors.New("geometry type does not match object type")
	ErrEmptyGeometry        = errors.New("geometry is empty")
)

// Kazakhstan bounding box (lon_min, lat_min, lon_max, lat_max)
var kazakhstanBounds = orb.Bound{
	Min: orb.Point{46.49, 40.57},
	Max: orb.Point{87.36, 55.44},
}

type GeometryValidator struct{}

func NewGeometryValidator() *GeometryValidator {
	return &GeometryValidator{}
}

// Validate performs full geometry validation including topology checks
func (v *GeometryValidator) Validate(geomJSON []byte, objType entity.ObjectType) error {
	if len(geomJSON) == 0 {
		return ErrEmptyGeometry
	}

	// Parse GeoJSON
	geom, err := geojson.UnmarshalGeometry(geomJSON)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrInvalidGeoJSON, err)
	}

	g := geom.Geometry()
	if g == nil {
		return ErrEmptyGeometry
	}

	// Check geometry type matches object type
	if !entity.IsGeometryTypeValid(g.GeoJSONType(), objType) {
		return fmt.Errorf("%w: expected %v, got %s",
			ErrGeometryTypeMismatch,
			entity.AllowedGeometryTypes[objType],
			g.GeoJSONType(),
		)
	}

	// Check bounds - geometry center should be within Kazakhstan
	center := g.Bound().Center()
	if !v.isWithinBounds(center) {
		return ErrOutsideBounds
	}

	// Check self-intersection for polygons
	if poly, ok := g.(orb.Polygon); ok {
		if v.isSelfIntersecting(poly) {
			return ErrSelfIntersecting
		}
	}

	if mpoly, ok := g.(orb.MultiPolygon); ok {
		for _, poly := range mpoly {
			if v.isSelfIntersecting(poly) {
				return ErrSelfIntersecting
			}
		}
	}

	return nil
}

// ValidateFromEntity validates geometry from entity.Geometry struct
func (v *GeometryValidator) ValidateFromEntity(geom entity.Geometry, objType entity.ObjectType) error {
	geomJSON, err := json.Marshal(geom)
	if err != nil {
		return fmt.Errorf("marshal geometry: %w", err)
	}
	return v.Validate(geomJSON, objType)
}

func (v *GeometryValidator) isWithinBounds(p orb.Point) bool {
	return p[0] >= kazakhstanBounds.Min[0] && p[0] <= kazakhstanBounds.Max[0] &&
		p[1] >= kazakhstanBounds.Min[1] && p[1] <= kazakhstanBounds.Max[1]
}

// isSelfIntersecting checks if polygon edges cross each other
func (v *GeometryValidator) isSelfIntersecting(poly orb.Polygon) bool {
	if len(poly) == 0 || len(poly[0]) < 4 {
		return false
	}

	ring := poly[0]
	n := len(ring)

	for i := 0; i < n-1; i++ {
		for j := i + 2; j < n-1; j++ {
			// Skip adjacent edges
			if i == 0 && j == n-2 {
				continue
			}
			if v.segmentsIntersect(ring[i], ring[i+1], ring[j], ring[j+1]) {
				return true
			}
		}
	}
	return false
}

func (v *GeometryValidator) segmentsIntersect(a, b, c, d orb.Point) bool {
	d1 := v.direction(c, d, a)
	d2 := v.direction(c, d, b)
	d3 := v.direction(a, b, c)
	d4 := v.direction(a, b, d)

	if ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
		((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0)) {
		return true
	}
	return false
}

func (v *GeometryValidator) direction(a, b, c orb.Point) float64 {
	return (c[0]-a[0])*(b[1]-a[1]) - (b[0]-a[0])*(c[1]-a[1])
}
