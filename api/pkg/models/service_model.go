package models

import (
	"time"

	"gorm.io/gorm"
)

type Organization struct {
	ID uint `gorm:"primarykey" json:"id"`

	// Clerk organization ID
	ClerkOrgID string `gorm:"uniqueIndex;not null" json:"clerk_org_id"`

	// Organization details
	Name string `gorm:"not null" json:"name"`
	Slug string `gorm:"uniqueIndex;not null" json:"slug"`

	// Relations
	Services  []Service            `gorm:"foreignKey:OrganizationID" json:"services,omitempty"`
	Incidents []Incident           `gorm:"foreignKey:OrganizationID" json:"incidents,omitempty"`
	Members   []OrganizationMember `gorm:"foreignKey:OrganizationID" json:"members,omitempty"`
}

type Service struct {
	gorm.Model
	Name           string `gorm:"not null"` // e.g., "API"
	Description    string
	Status         string `gorm:"not null;default:'operational'"` // Enum: operational/degraded/partial_outage/major_outage
	UserID         string `gorm:"not null"`                       // Clerk user ID
	OrganizationID uint   `gorm:"not null"`
	Organization   Organization
}

type Incident struct {
	gorm.Model
	Title          string `gorm:"not null"` // e.g., "Database Outage"
	Description    string
	Status         string `gorm:"not null"` // Enum: investigating/identified/resolved
	Severity       string // Optional: critical/high/medium/low
	ServiceID      uint   // Foreign key to Service
	Service        Service
	OrganizationID uint `gorm:"not null"`
	Organization   Organization
	Updates        []IncidentUpdate `gorm:"foreignKey:IncidentID"`
}

type IncidentUpdate struct {
	gorm.Model
	Message    string `gorm:"not null"` // e.g., "Root cause identified"
	IncidentID uint   // Foreign key to Incident
	Incident   Incident
}

type Maintenance struct {
	gorm.Model
	Title          string `gorm:"not null"`
	Description    string
	ScheduledStart time.Time
	ScheduledEnd   time.Time
	Status         string `gorm:"not null"` // Enum: scheduled/in_progress/completed
	ServiceID      uint   // Foreign key to Service
	Service        Service
	OrganizationID uint `gorm:"not null"`
	Organization   Organization
}

type OrganizationMember struct {
	gorm.Model
	ClerkUserID    string `gorm:"not null"` // Clerk's external user ID (no local user table needed)
	OrganizationID uint   `gorm:"not null"`
	Organization   Organization
	Role           string `gorm:"not null"` // Enum: admin/member
}
