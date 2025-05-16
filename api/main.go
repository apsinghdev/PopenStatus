package main

import (
	// "github.com/apsinghdev/PopenStatus/api/pkg/auth"
	"github.com/apsinghdev/PopenStatus/api/pkg/db"
	"github.com/apsinghdev/PopenStatus/api/pkg/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

// TODO: enable auth later

func main() {
	app := fiber.New()

	// Configure CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		// AllowCredentials: true,
		ExposeHeaders:    "Content-Length",
		MaxAge:           300,
	}))

	db.Connect()

	// app.Use(auth.ClerkMiddleware())

	routes.ServiceRoutes(app)

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, Papite!")
	})

	app.Listen(":8000")
}
