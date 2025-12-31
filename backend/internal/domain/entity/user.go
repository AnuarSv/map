package entity

import (
	"time"

	"github.com/google/uuid"
)

type UserRole string

const (
	RoleUser   UserRole = "user"
	RoleExpert UserRole = "expert"
	RoleAdmin  UserRole = "admin"
)

func (r UserRole) IsValid() bool {
	switch r {
	case RoleUser, RoleExpert, RoleAdmin:
		return true
	}
	return false
}

func (r UserRole) CanEdit() bool {
	return r == RoleExpert || r == RoleAdmin
}

func (r UserRole) CanReview() bool {
	return r == RoleAdmin
}

type User struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Password  string    `json:"-"` // Never serialize
	Role      UserRole  `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

type ChangeAction string

const (
	ActionCreate  ChangeAction = "create"
	ActionUpdate  ChangeAction = "update"
	ActionSubmit  ChangeAction = "submit"
	ActionApprove ChangeAction = "approve"
	ActionReject  ChangeAction = "reject"
	ActionArchive ChangeAction = "archive"
)

type ChangeLog struct {
	ID            int64                  `json:"id"`
	WaterObjectID int64                  `json:"water_object_id"`
	CanonicalID   uuid.UUID              `json:"canonical_id"`
	Action        ChangeAction           `json:"action"`
	ChangedFields map[string]interface{} `json:"changed_fields,omitempty"`
	ReviewerNotes *string                `json:"reviewer_notes,omitempty"`
	PerformedBy   int64                  `json:"performed_by"`
	PerformedAt   time.Time              `json:"performed_at"`
}
