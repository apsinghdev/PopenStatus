package routes

import (
	"github.com/apsinghdev/PopenStatus/api/pkg/services"
	"github.com/gofiber/fiber/v2"
)

func ServiceRoutes(app *fiber.App) {
	api := app.Group("/api")
	servicesGroup := api.Group("/services")

	servicesGroup.Post("/", services.CreateService)
	servicesGroup.Get("/", services.ListServices)
}
