package db

import (
	"fmt"
	"os"

	"github.com/apsinghdev/PopenStatus/api/pkg/models"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect() *gorm.DB {
	// Load env variables from .env file
	err := godotenv.Load()
	if err != nil {
		panic("Failed to load .env file")
	}

	connStr := os.Getenv("DATABASE_URL")
	db, err := gorm.Open(postgres.Open(connStr), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database")
	}

	fmt.Println("✅ Successfully connected to the database")

	// Apply schema to the DB
	err = db.AutoMigrate(
		&models.Organization{},
		&models.Service{},
		&models.Incident{},
		&models.IncidentUpdate{},
		&models.Maintenance{},
		&models.OrganizationMember{},
	)
	if err != nil {
		panic("failed to migrate schema: " + err.Error())
	}

	fmt.Println("✅ Successfully migrated the database")

	return db
}
