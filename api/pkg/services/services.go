package services

import (
	"strconv"

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
	orgID, _ := strconv.ParseUint(c.Get("orgID"), 10, 32)
	service.OrganizationID = uint(orgID) // Enforce tenant isolation

	db := db.Connect()
	db.Create(&service)
	return c.Status(201).JSON(service)
}

// func to list services
func ListServices(c *fiber.Ctx) error {
	orgID, _ := strconv.ParseUint(c.Get("orgID"), 10, 32)
	var services []models.Service

	db := db.Connect()
	db.Where("organization_id = ?", uint(orgID)).Find(&services)
	return c.Status(200).JSON(services)
}
