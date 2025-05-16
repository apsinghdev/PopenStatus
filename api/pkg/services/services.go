package services

import (
	"github.com/apsinghdev/PopenStatus/api/pkg/db"
	"github.com/apsinghdev/PopenStatus/api/pkg/models"
	"github.com/gofiber/fiber/v2"
)

// func to create a service
func CreateService(c *fiber.Ctx) error {
	var service models.Service
	if err := c.BodyParser(&service); err != nil {
		return err
	}
	service.UserID = c.Get("UserID") // Use Clerk user ID directly

	db := db.Connect()
	db.Create(&service)
	return c.Status(201).JSON(service)
}

// func to list services
func ListServices(c *fiber.Ctx) error {
	var services []models.Service
	db := db.Connect()
	result := db.Find(&services)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch services",
		})
	}

	return c.Status(200).JSON(services)
}

// func to create an incident
func CreateIncident(c *fiber.Ctx) error {
	var incident models.Incident
	if err := c.BodyParser(&incident); err != nil {
		return err
	}

	db := db.Connect()
	db.Create(&incident)
	return c.Status(201).JSON(incident)
}

// func to list incidents
func ListIncidents(c *fiber.Ctx) error {
	var incidents []models.Incident
	db := db.Connect()
	result := db.Find(&incidents)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch incidents",
		})
	}

	return c.Status(200).JSON(incidents)
}
