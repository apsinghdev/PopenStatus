package services

import (
	"fmt"

	"github.com/apsinghdev/PopenStatus/api/pkg/db"
	"github.com/apsinghdev/PopenStatus/api/pkg/models"
	"github.com/apsinghdev/PopenStatus/api/pkg/utils"
	"github.com/gofiber/fiber/v2"
)

type CreateServiceRequest struct {
	Name           string `json:"name" validate:"required"`
	Description    string `json:"description"`
	Status         string `json:"status" validate:"required,oneof=operational degraded partial_outage major_outage"`
	UserID         string `json:"user_id" validate:"required"`
	OrganizationID string `json:"OrganizationID" validate:"required"`
}

func HandleCreateService(c *fiber.Ctx) error {
	// Parse request body
	var req CreateServiceRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate request
	if err := utils.Validate.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Validation failed",
			"details": err.Error(),
		})
	}

	// Get database instance
	database := db.GetDB()

	// Get organization by Clerk ID
	var organization models.Organization
	fmt.Println("Organization ID:", req.OrganizationID)
	if err := database.Where("clerk_org_id = ?", req.OrganizationID).First(&organization).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Organization not found",
		})
	}

	// Create service
	service := models.Service{
		Name:           req.Name,
		Description:    req.Description,
		Status:         req.Status,
		UserID:         req.UserID,
		OrganizationID: organization.ID,
	}

	// Save to database
	if err := database.Create(&service).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create service",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(service)
}
