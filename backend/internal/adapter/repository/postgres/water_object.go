package postgres

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"watermap/internal/domain/entity"
	"watermap/internal/domain/repository"
)

type WaterObjectRepo struct {
	pool *pgxpool.Pool
}

func NewWaterObjectRepo(pool *pgxpool.Pool) repository.WaterObjectRepository {
	return &WaterObjectRepo{pool: pool}
}

func (r *WaterObjectRepo) GetPublished(ctx context.Context, filter *repository.WaterObjectFilter) ([]*entity.WaterObject, error) {
	query := `
		SELECT 
			id, canonical_id, version, name_kz, name_ru, name_en,
			object_type, geometry,
			length_km, area_km2, max_depth_m, avg_depth_m,
			water_volume_km3, basin_area_km2, avg_discharge_m3s,
			salinity_level, pollution_index, ecological_status,
			description_kz, description_ru, description_en,
			status, created_by, created_at, published_at
		FROM water_objects
		WHERE status = 'published'
	`

	args := []interface{}{}
	argIdx := 1

	if filter != nil && filter.ObjectType != "" {
		query += fmt.Sprintf(" AND object_type = $%d", argIdx)
		args = append(args, filter.ObjectType)
		argIdx++
	}

	query += " ORDER BY name_kz"

	if filter != nil && filter.Limit > 0 {
		query += fmt.Sprintf(" LIMIT $%d", argIdx)
		args = append(args, filter.Limit)
		argIdx++
	}

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("query published objects: %w", err)
	}
	defer rows.Close()

	return r.scanWaterObjects(rows)
}

func (r *WaterObjectRepo) GetByCanonicalID(ctx context.Context, canonicalID string, status entity.ObjectStatus) (*entity.WaterObject, error) {
	query := `
		SELECT 
			id, canonical_id, version, name_kz, name_ru, name_en,
			object_type, geometry,
			length_km, area_km2, max_depth_m, avg_depth_m,
			water_volume_km3, basin_area_km2, avg_discharge_m3s,
			salinity_level, pollution_index, ecological_status,
			description_kz, description_ru, description_en,
			status, rejection_reason, created_by, updated_by, reviewed_by,
			created_at, updated_at, published_at
		FROM water_objects
		WHERE canonical_id = $1 AND status = $2
	`

	row := r.pool.QueryRow(ctx, query, canonicalID, status)
	return r.scanSingleWaterObject(row)
}

func (r *WaterObjectRepo) GetByID(ctx context.Context, id int64) (*entity.WaterObject, error) {
	query := `
		SELECT 
			id, canonical_id, version, name_kz, name_ru, name_en,
			object_type, geometry,
			length_km, area_km2, max_depth_m, avg_depth_m,
			water_volume_km3, basin_area_km2, avg_discharge_m3s,
			salinity_level, pollution_index, ecological_status,
			description_kz, description_ru, description_en,
			status, rejection_reason, created_by, updated_by, reviewed_by,
			created_at, updated_at, published_at
		FROM water_objects
		WHERE id = $1
	`

	row := r.pool.QueryRow(ctx, query, id)
	return r.scanSingleWaterObject(row)
}

func (r *WaterObjectRepo) GetVersionHistory(ctx context.Context, canonicalID string) ([]*entity.WaterObject, error) {
	query := `
		SELECT 
			id, canonical_id, version, name_kz, name_ru, name_en,
			object_type, geometry,
			length_km, area_km2, max_depth_m, avg_depth_m,
			water_volume_km3, basin_area_km2, avg_discharge_m3s,
			salinity_level, pollution_index, ecological_status,
			description_kz, description_ru, description_en,
			status, created_by, created_at, published_at
		FROM water_objects
		WHERE canonical_id = $1
		ORDER BY version DESC
	`

	rows, err := r.pool.Query(ctx, query, canonicalID)
	if err != nil {
		return nil, fmt.Errorf("query version history: %w", err)
	}
	defer rows.Close()

	return r.scanWaterObjects(rows)
}

func (r *WaterObjectRepo) GetDraftsByUser(ctx context.Context, userID int64) ([]*entity.WaterObject, error) {
	query := `
		SELECT 
			id, canonical_id, version, name_kz, name_ru, name_en,
			object_type, geometry,
			length_km, area_km2, max_depth_m, avg_depth_m,
			water_volume_km3, basin_area_km2, avg_discharge_m3s,
			salinity_level, pollution_index, ecological_status,
			description_kz, description_ru, description_en,
			status, rejection_reason, created_by, created_at, updated_at
		FROM water_objects
		WHERE created_by = $1 AND status IN ('draft', 'pending', 'rejected')
		ORDER BY updated_at DESC
	`

	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("query user drafts: %w", err)
	}
	defer rows.Close()

	return r.scanWaterObjects(rows)
}

func (r *WaterObjectRepo) Create(ctx context.Context, obj *entity.WaterObject) (*entity.WaterObject, error) {
	geometryJSON, err := json.Marshal(obj.Geometry)
	if err != nil {
		return nil, fmt.Errorf("marshal geometry: %w", err)
	}

	query := `
		INSERT INTO water_objects (
			name_kz, name_ru, name_en, object_type,
			geometry,
			length_km, area_km2, max_depth_m, avg_depth_m,
			water_volume_km3, basin_area_km2, avg_discharge_m3s,
			salinity_level, pollution_index, ecological_status,
			description_kz, description_ru, description_en,
			status, created_by
		) VALUES (
			$1, $2, $3, $4,
			$5::jsonb,
			$6, $7, $8, $9, $10, $11, $12,
			$13, $14, $15,
			$16, $17, $18,
			'draft', $19
		)
		RETURNING id, canonical_id, version, created_at, updated_at
	`

	row := r.pool.QueryRow(ctx, query,
		obj.NameKZ, obj.NameRU, obj.NameEN, obj.ObjectType,
		string(geometryJSON),
		obj.LengthKm, obj.AreaKm2, obj.MaxDepthM, obj.AvgDepthM,
		obj.WaterVolumeKm3, obj.BasinAreaKm2, obj.AvgDischargeM3s,
		obj.SalinityLevel, obj.PollutionIndex, obj.EcologicalStatus,
		obj.DescriptionKZ, obj.DescriptionRU, obj.DescriptionEN,
		obj.CreatedBy,
	)

	if err := row.Scan(&obj.ID, &obj.CanonicalID, &obj.Version, &obj.CreatedAt, &obj.UpdatedAt); err != nil {
		return nil, fmt.Errorf("insert water object: %w", err)
	}

	obj.Status = entity.StatusDraft
	return obj, nil
}

func (r *WaterObjectRepo) Update(ctx context.Context, obj *entity.WaterObject) (*entity.WaterObject, error) {
	geometryJSON, err := json.Marshal(obj.Geometry)
	if err != nil {
		return nil, fmt.Errorf("marshal geometry: %w", err)
	}

	query := `
		UPDATE water_objects SET
			name_kz = $1, name_ru = $2, name_en = $3,
			geometry = $4::jsonb,
			length_km = $5, area_km2 = $6, max_depth_m = $7, avg_depth_m = $8,
			water_volume_km3 = $9, basin_area_km2 = $10, avg_discharge_m3s = $11,
			salinity_level = $12, pollution_index = $13, ecological_status = $14,
			description_kz = $15, description_ru = $16, description_en = $17,
			updated_by = $18, updated_at = NOW()
		WHERE id = $19 AND status IN ('draft', 'rejected')
		RETURNING version, updated_at
	`

	row := r.pool.QueryRow(ctx, query,
		obj.NameKZ, obj.NameRU, obj.NameEN,
		string(geometryJSON),
		obj.LengthKm, obj.AreaKm2, obj.MaxDepthM, obj.AvgDepthM,
		obj.WaterVolumeKm3, obj.BasinAreaKm2, obj.AvgDischargeM3s,
		obj.SalinityLevel, obj.PollutionIndex, obj.EcologicalStatus,
		obj.DescriptionKZ, obj.DescriptionRU, obj.DescriptionEN,
		obj.UpdatedBy, obj.ID,
	)

	if err := row.Scan(&obj.Version, &obj.UpdatedAt); err != nil {
		if err == pgx.ErrNoRows {
			return nil, entity.ErrNotFound
		}
		return nil, fmt.Errorf("update water object: %w", err)
	}

	return obj, nil
}

func (r *WaterObjectRepo) Delete(ctx context.Context, id int64, userID int64) error {
	result, err := r.pool.Exec(ctx,
		"DELETE FROM water_objects WHERE id = $1 AND created_by = $2 AND status = 'draft'",
		id, userID,
	)
	if err != nil {
		return fmt.Errorf("delete water object: %w", err)
	}
	if result.RowsAffected() == 0 {
		return entity.ErrNotFound
	}
	return nil
}

func (r *WaterObjectRepo) SubmitForReview(ctx context.Context, id int64, userID int64) error {
	result, err := r.pool.Exec(ctx,
		"UPDATE water_objects SET status = 'pending', updated_at = NOW() WHERE id = $1 AND created_by = $2 AND status IN ('draft', 'rejected')",
		id, userID,
	)
	if err != nil {
		return fmt.Errorf("submit for review: %w", err)
	}
	if result.RowsAffected() == 0 {
		return entity.ErrNotFound
	}
	return nil
}

func (r *WaterObjectRepo) GetPending(ctx context.Context) ([]*entity.WaterObject, error) {
	query := `
		SELECT 
			wo.id, wo.canonical_id, wo.version, wo.name_kz, wo.name_ru, wo.name_en,
			wo.object_type, wo.geometry,
			wo.length_km, wo.area_km2, wo.max_depth_m, wo.avg_depth_m,
			wo.water_volume_km3, wo.basin_area_km2, wo.avg_discharge_m3s,
			wo.salinity_level, wo.pollution_index, wo.ecological_status,
			wo.description_kz, wo.description_ru, wo.description_en,
			wo.status, wo.created_by, wo.created_at, wo.updated_at
		FROM water_objects wo
		WHERE wo.status = 'pending'
		ORDER BY wo.updated_at ASC
	`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("query pending objects: %w", err)
	}
	defer rows.Close()

	return r.scanWaterObjects(rows)
}

func (r *WaterObjectRepo) Approve(ctx context.Context, id int64, reviewerID int64) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	// Get pending object's canonical_id
	var canonicalID string
	err = tx.QueryRow(ctx,
		"SELECT canonical_id FROM water_objects WHERE id = $1 AND status = 'pending'",
		id,
	).Scan(&canonicalID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return entity.ErrNotFound
		}
		return fmt.Errorf("get canonical_id: %w", err)
	}

	// Archive current published version
	_, err = tx.Exec(ctx,
		"UPDATE water_objects SET status = 'archived' WHERE canonical_id = $1 AND status = 'published'",
		canonicalID,
	)
	if err != nil {
		return fmt.Errorf("archive old version: %w", err)
	}

	// Publish new version
	_, err = tx.Exec(ctx,
		"UPDATE water_objects SET status = 'published', published_at = NOW(), reviewed_by = $1 WHERE id = $2",
		reviewerID, id,
	)
	if err != nil {
		return fmt.Errorf("publish version: %w", err)
	}

	return tx.Commit(ctx)
}

func (r *WaterObjectRepo) Reject(ctx context.Context, id int64, reviewerID int64, reason string) error {
	result, err := r.pool.Exec(ctx,
		"UPDATE water_objects SET status = 'rejected', rejection_reason = $1, reviewed_by = $2, updated_at = NOW() WHERE id = $3 AND status = 'pending'",
		reason, reviewerID, id,
	)
	if err != nil {
		return fmt.Errorf("reject water object: %w", err)
	}
	if result.RowsAffected() == 0 {
		return entity.ErrNotFound
	}
	return nil
}

func (r *WaterObjectRepo) scanWaterObjects(rows pgx.Rows) ([]*entity.WaterObject, error) {
	var objects []*entity.WaterObject
	for rows.Next() {
		obj := &entity.WaterObject{}
		var geometryJSON []byte

		// Flexible scan based on available columns
		err := rows.Scan(
			&obj.ID, &obj.CanonicalID, &obj.Version,
			&obj.NameKZ, &obj.NameRU, &obj.NameEN,
			&obj.ObjectType, &geometryJSON,
			&obj.LengthKm, &obj.AreaKm2, &obj.MaxDepthM, &obj.AvgDepthM,
			&obj.WaterVolumeKm3, &obj.BasinAreaKm2, &obj.AvgDischargeM3s,
			&obj.SalinityLevel, &obj.PollutionIndex, &obj.EcologicalStatus,
			&obj.DescriptionKZ, &obj.DescriptionRU, &obj.DescriptionEN,
			&obj.Status, &obj.CreatedBy, &obj.CreatedAt, &obj.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scan row: %w", err)
		}

		if err := json.Unmarshal(geometryJSON, &obj.Geometry); err != nil {
			return nil, fmt.Errorf("unmarshal geometry: %w", err)
		}

		objects = append(objects, obj)
	}
	return objects, rows.Err()
}

func (r *WaterObjectRepo) scanSingleWaterObject(row pgx.Row) (*entity.WaterObject, error) {
	obj := &entity.WaterObject{}
	var geometryJSON []byte

	err := row.Scan(
		&obj.ID, &obj.CanonicalID, &obj.Version,
		&obj.NameKZ, &obj.NameRU, &obj.NameEN,
		&obj.ObjectType, &geometryJSON,
		&obj.LengthKm, &obj.AreaKm2, &obj.MaxDepthM, &obj.AvgDepthM,
		&obj.WaterVolumeKm3, &obj.BasinAreaKm2, &obj.AvgDischargeM3s,
		&obj.SalinityLevel, &obj.PollutionIndex, &obj.EcologicalStatus,
		&obj.DescriptionKZ, &obj.DescriptionRU, &obj.DescriptionEN,
		&obj.Status, &obj.RejectionReason, &obj.CreatedBy, &obj.UpdatedBy, &obj.ReviewedBy,
		&obj.CreatedAt, &obj.UpdatedAt, &obj.PublishedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, entity.ErrNotFound
		}
		return nil, fmt.Errorf("scan row: %w", err)
	}

	if err := json.Unmarshal(geometryJSON, &obj.Geometry); err != nil {
		return nil, fmt.Errorf("unmarshal geometry: %w", err)
	}

	return obj, nil
}
