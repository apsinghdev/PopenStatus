package main

import (
	"fmt"
	"time"

	"github.com/apsinghdev/PopenStatus/api/pkg/db"
	"github.com/apsinghdev/PopenStatus/api/pkg/models"
)

func main() {
	// Connect to the database
	dbConn := db.Connect()

	// Auto migrate all models
	dbConn.AutoMigrate(
		&models.Organization{},
		&models.Service{},
		&models.Incident{},
		&models.IncidentUpdate{},
		&models.Maintenance{},
		&models.OrganizationMember{},
	)

	// Create demo organization
	org := models.Organization{
		Name: "Tech Corp",
		Slug: "tech-corp",
	}
	dbConn.Create(&org)

	// Add team members (using fake Clerk user IDs)
	members := []models.OrganizationMember{
		{
			ClerkUserID:    "user_2fDz8sLk9PZJmRnQ4tGbWALeExi",
			OrganizationID: org.ID,
			Role:           "admin",
		},
		{
			ClerkUserID:    "user_5tHj4kLm7PdRnQ9WzVbCXeExiAl",
			OrganizationID: org.ID,
			Role:           "member",
		},
	}
	dbConn.Create(&members)

	// Create services under the organization
	services := []models.Service{
		{
			Name:           "API Service",
			Description:    "Core application API",
			Status:         "operational",
			UserID:         "user_2fDz8sLk9PZJmRnQ4tGbWALeExi",
			OrganizationID: org.ID,
		},
		{
			Name:           "Database Cluster",
			Description:    "Primary PostgreSQL database",
			Status:         "degraded_performance",
			UserID:         "user_2fDz8sLk9PZJmRnQ4tGbWALeExi",
			OrganizationID: org.ID,
		},
	}
	dbConn.Create(&services)

	// Create incidents with nested updates
	incidents := []models.Incident{
		{
			Title:          "API Latency Spike",
			Description:    "Increased response times across endpoints",
			Status:         "identified",
			Severity:       "high",
			ServiceID:      services[0].ID,
			OrganizationID: org.ID,
			Updates: []models.IncidentUpdate{
				{Message: "Initial investigation started"},
				{Message: "Identified overloaded caching layer"},
			},
		},
		{
			Title:          "Database Replication Lag",
			Description:    "Primary-replica synchronization delay",
			Status:         "investigating",
			Severity:       "medium",
			ServiceID:      services[1].ID,
			OrganizationID: org.ID,
			Updates: []models.IncidentUpdate{
				{Message: "Monitoring alerts triggered"},
			},
		},
	}
	dbConn.Create(&incidents)

	// Create maintenance window
	maintenance := models.Maintenance{
		Title:          "Database Version Upgrade",
		Description:    "Planned PostgreSQL 14 -> 15 upgrade",
		ScheduledStart: time.Now().Add(24 * time.Hour),
		ScheduledEnd:   time.Now().Add(26 * time.Hour),
		Status:         "scheduled",
		ServiceID:      services[1].ID,
		OrganizationID: org.ID,
	}
	dbConn.Create(&maintenance)

	fmt.Println("✅ Successfully seeded the database")
}
