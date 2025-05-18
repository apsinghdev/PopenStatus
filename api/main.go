package main

import (
	// "github.com/apsinghdev/PopenStatus/api/pkg/auth"
	"github.com/apsinghdev/PopenStatus/api/pkg/db"
	"github.com/apsinghdev/PopenStatus/api/pkg/handlers"
	// "github.com/apsinghdev/PopenStatus/api/pkg/models"
	"github.com/apsinghdev/PopenStatus/api/pkg/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

// TODO: enable auth later

func main() {
	app := fiber.New()

	// Configure CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins:  "*",
		AllowHeaders:  "Origin, Content-Type, Accept, Authorization",
		AllowMethods:  "GET, POST, PUT, DELETE, OPTIONS",
		ExposeHeaders: "Content-Length",
		MaxAge:        300,
	}))

	// Initialize database
	db.Connect()

	// // Drop existing tables
	// database.Migrator().DropTable(
	// 	&models.Organization{},
	// 	&models.Service{},
	// 	&models.Incident{},
	// 	&models.IncidentUpdate{},
	// 	&models.Maintenance{},
	// 	&models.OrganizationMember{},
	// )

	// // Apply migrations
	// err := database.AutoMigrate(
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

	// app.Use(auth.ClerkMiddleware())

	// Register routes
	routes.ServiceRoutes(app)

	// Register webhook handler
	app.Post("/webhooks/clerk", handlers.HandleClerkWebhook)

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Server is running!")
	})

	app.Listen(":8000")
}
