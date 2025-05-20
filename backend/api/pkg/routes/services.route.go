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
	servicesGroup.Delete("/:id", services.DeleteService)
	servicesGroup.Put("/:id", services.UpdateService)

	incidentsGroup.Post("/create", services.CreateIncident)
	incidentsGroup.Get("/list", services.ListIncidents)
	incidentsGroup.Delete("/delete/:id", services.DeleteIncident)
	incidentsGroup.Put("/update/:id", services.UpdateIncident)

	orgGroup.Get("/:slug/status", services.GetOrganizationStatus)
	orgGroup.Get("/list", handlers.ListOrganizations)
}
