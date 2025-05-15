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
	service.OrganizationID = c.Get("orgID") // Enforce tenant isolation

	db := db.Connect()
	db.Create(&service)
	return c.Status(201).JSON(service)
}

// func to list services
func ListServices(c *fiber.Ctx) error {
	orgID := c.Get("orgID")
	var service models.Service

	db := db.Connect()
	db.Where("organization_id = ?", orgID).Find(&service)
	return c.Status(200).JSON(service)
}
