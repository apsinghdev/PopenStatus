package routes

import (
	"github.com/apsinghdev/PopenStatus/api/pkg/handlers"
	"github.com/apsinghdev/PopenStatus/api/pkg/services"
	"github.com/gofiber/fiber/v2"
)

func ServiceRoutes(app *fiber.App) {
	api := app.Group("/api")
	servicesGroup := api.Group("/services")
	incidentsGroup := api.Group("/incidents")
	orgGroup := api.Group("/organizations")

	servicesGroup.Post("/create", services.HandleCreateService)
	servicesGroup.Get("/list", services.ListServices)

	incidentsGroup.Post("/create", services.CreateIncident)
	incidentsGroup.Get("/list", services.ListIncidents)

	orgGroup.Get("/:slug/status", services.GetOrganizationStatus)
	orgGroup.Get("/list", handlers.ListOrganizations)
}
