package feedback

import (
	"context"
	"watermap/internal/domain/entity"
)

type Repository interface {
	Create(ctx context.Context, f *entity.Feedback) error
}

type UseCase struct {
	repo Repository
}

func NewUseCase(repo Repository) *UseCase {
	return &UseCase{repo: repo}
}

func (uc *UseCase) Submit(ctx context.Context, f *entity.Feedback) error {
	return uc.repo.Create(ctx, f)
}
