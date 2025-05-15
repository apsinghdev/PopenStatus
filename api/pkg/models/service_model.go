package models

type Service struct {
	ID             uint   `gorm:"primaryKey"`
	Name           string `json:"name"`
	Status         string `json:"status"` // Operational/Degraded/etc.
	OrganizationID string `json:"orgID"`  // From Clerk token
}
