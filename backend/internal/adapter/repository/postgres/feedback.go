package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"watermap/internal/domain/entity"
)

type FeedbackRepository struct {
	pool *pgxpool.Pool
}

func NewFeedbackRepository(pool *pgxpool.Pool) *FeedbackRepository {
	return &FeedbackRepository{pool: pool}
}

func (r *FeedbackRepository) Create(ctx context.Context, f *entity.Feedback) error {
	query := `
		INSERT INTO feedback (type, target_type, target_id_str, message, user_id, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`
	err := r.pool.QueryRow(ctx, query,
		f.Type,
		f.TargetType,
		f.TargetID,
		f.Message,
		f.UserID,
		"open",
		time.Now(),
	).Scan(&f.ID)

	if err != nil {
		return fmt.Errorf("create feedback: %w", err)
	}

	return nil
}
