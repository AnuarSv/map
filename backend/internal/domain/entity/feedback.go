package entity

import "time"

type FeedbackType string

const (
	FeedbackTypeError      FeedbackType = "error"
	FeedbackTypeSuggestion FeedbackType = "suggestion"
	FeedbackTypeOther      FeedbackType = "other"
)

type Feedback struct {
	ID         int          `json:"id"`
	Type       FeedbackType `json:"type"`
	TargetType string       `json:"target_type"`
	TargetID   string       `json:"target_id_str"`
	Message    string       `json:"message"`
	UserID     *int         `json:"user_id"`
	Status     string       `json:"status"`
	CreatedAt  time.Time    `json:"created_at"`
}
