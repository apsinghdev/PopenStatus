package db

import (
	"fmt"
	"log"
	"os"

	// "github.com/apsinghdev/PopenStatus/api/pkg/models"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var dbInstance *gorm.DB

func Connect() *gorm.DB {
	// Load .env file only in development
	// if os.Getenv("ENV") == "dev" {
		err := godotenv.Load()
		fmt.Println("🔑 Loaded .env file", err)
		if err != nil {
			log.Printf("Warning: Failed to load .env file: %v", err)
		}
	// }

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		panic("DATABASE_URL environment variable is not set")
	}

	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database")
	}

	dbInstance = db

	fmt.Println("✅ Successfully connected to the database")

	// TODO: enable migrations later

	// // Drop existing tables
	// db.Migrator().DropTable(
	// 	&models.Organization{},
	// 	&models.Service{},
	// 	&models.Incident{},
	// 	&models.IncidentUpdate{},
	// 	&models.Maintenance{},
	// 	&models.OrganizationMember{},
	// )

	// // Apply schema to the DB
	// err = db.AutoMigrate(
	// 	&models.Organization{},
	// 	&models.Service{},
	// 	&models.Incident{},
	// 	&models.IncidentUpdate{},
	// 	&models.Maintenance{},
	// 	&models.OrganizationMember{},
	// )
	// if err != nil {
	// 	panic("failed to migrate schema: " + err.Error())
	// }

	fmt.Println("✅ Successfully migrated the database")

	return db
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	if dbInstance == nil {
		panic("Database not initialized")
	}
	return dbInstance
}
