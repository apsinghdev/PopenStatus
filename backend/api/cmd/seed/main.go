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

	// Drop existing tables
	dbConn.Migrator().DropTable(
		&models.OrganizationMember{},
		&models.IncidentUpdate{},
		&models.Incident{},
		&models.Maintenance{},
		&models.Service{},
		&models.Organization{},
	)

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
		ClerkOrgID: "org_2fDz8sLk9PZJmRnQ4tGbWALeExi",
		Name:       "Tech Corp",
		Slug:       "tech-corp",
	}
	dbConn.Create(&org)

	// Add team members (using org.ID now)
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
			Status:         "degraded", // fixed invalid enum
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
			ServiceID:      fmt.Sprint(services[0].ID),
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
			ServiceID:      fmt.Sprint(services[1].ID),
			OrganizationID: org.ID,
			Updates: []models.IncidentUpdate{
				{Message: "Monitoring alerts triggered"},
			},
		},
		{
			Title:          "API Service Degraded Performance",
			Description:    "Increased response times across endpoints",
			Status:         "resolved",
			Severity:       "medium",
			ServiceID:      fmt.Sprint(services[0].ID),
			OrganizationID: org.ID,
			Updates: []models.IncidentUpdate{
				{Message: "Monitoring alerts triggered"},
			},
		},
	}
	for _, incident := range incidents {
		dbConn.Create(&incident)
	}

	// Create maintenance window
	maintenance := models.Maintenance{
		Title:          "Database Version Upgrade",
		Description:    "Planned PostgreSQL 14 -> 15 upgrade",
		ScheduledStart: time.Now().Add(24 * time.Hour),
		ScheduledEnd:   time.Now().Add(26 * time.Hour),
		Status:         "scheduled",
		ServiceID:      fmt.Sprint(services[1].ID),
		OrganizationID: org.ID,
	}
	dbConn.Create(&maintenance)

	fmt.Println("✅ Successfully seeded the database")
}
