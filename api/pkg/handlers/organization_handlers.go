package handlers

import (
	"github.com/apsinghdev/PopenStatus/api/pkg/db"
	"github.com/apsinghdev/PopenStatus/api/pkg/models"
	"github.com/gofiber/fiber/v2"
)

// ListOrganizations handles GET request to fetch all organizations
func ListOrganizations(c *fiber.Ctx) error {
	var organizations []models.Organization

	// Get database instance
	database := db.GetDB()

	// Fetch all organizations
	if err := database.Find(&organizations).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch organizations",
		})
	}

	return c.Status(fiber.StatusOK).JSON(organizations)
}
