package db

import (
	"fmt"
	"os"

	// "github.com/apsinghdev/PopenStatus/api/pkg/models"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var dbInstance *gorm.DB

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
