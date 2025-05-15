package main

import (
	"github.com/apsinghdev/PopenStatus/api/pkg/auth"
	"github.com/apsinghdev/PopenStatus/api/pkg/db"
	"github.com/apsinghdev/PopenStatus/api/pkg/routes"
	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	db.Connect()

	app.Use(auth.ClerkMiddleware())

	routes.ServiceRoutes(app)

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, Ajeet!")
	})

	app.Listen(":8000")
}
