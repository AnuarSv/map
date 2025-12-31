package repository

import (
	"context"

	"watermap/internal/domain/entity"
)

type WaterObjectFilter struct {
	ObjectType entity.ObjectType
	Status     entity.ObjectStatus
	CreatedBy  *int64
	Limit      int
	Offset     int
}

type WaterObjectRepository interface {
	// Public queries
	GetPublished(ctx context.Context, filter *WaterObjectFilter) ([]*entity.WaterObject, error)
	GetByCanonicalID(ctx context.Context, canonicalID string, status entity.ObjectStatus) (*entity.WaterObject, error)
	GetByID(ctx context.Context, id int64) (*entity.WaterObject, error)
	GetVersionHistory(ctx context.Context, canonicalID string) ([]*entity.WaterObject, error)

	// Expert operations
	GetDraftsByUser(ctx context.Context, userID int64) ([]*entity.WaterObject, error)
	Create(ctx context.Context, obj *entity.WaterObject) (*entity.WaterObject, error)
	Update(ctx context.Context, obj *entity.WaterObject) (*entity.WaterObject, error)
	Delete(ctx context.Context, id int64, userID int64) error
	SubmitForReview(ctx context.Context, id int64, userID int64) error

	// Admin operations
	GetPending(ctx context.Context) ([]*entity.WaterObject, error)
	Approve(ctx context.Context, id int64, reviewerID int64) error
	Reject(ctx context.Context, id int64, reviewerID int64, reason string) error
}

type UserRepository interface {
	GetByID(ctx context.Context, id int64) (*entity.User, error)
	GetByEmail(ctx context.Context, email string) (*entity.User, error)
	Create(ctx context.Context, user *entity.User) (*entity.User, error)
	UpdateRole(ctx context.Context, id int64, role entity.UserRole) error
	GetAll(ctx context.Context) ([]*entity.User, error)
}

type ChangeLogRepository interface {
	Create(ctx context.Context, log *entity.ChangeLog) error
	GetByCanonicalID(ctx context.Context, canonicalID string) ([]*entity.ChangeLog, error)
}
