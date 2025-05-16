package routes

import (
	"github.com/apsinghdev/PopenStatus/api/pkg/services"
	"github.com/gofiber/fiber/v2"
)

func ServiceRoutes(app *fiber.App) {
	api := app.Group("/api")
	servicesGroup := api.Group("/services")
	incidentsGroup := api.Group("/incidents")

	servicesGroup.Post("/create", services.CreateService)
	servicesGroup.Get("/list", services.ListServices)

	incidentsGroup.Post("/create", services.CreateIncident)
	incidentsGroup.Get("/list", services.ListIncidents)
}
