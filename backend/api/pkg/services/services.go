package services

import (
	"github.com/apsinghdev/PopenStatus/api/pkg/db"
	"github.com/apsinghdev/PopenStatus/api/pkg/models"
	"github.com/apsinghdev/PopenStatus/api/pkg/utils"
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

	// Get organization ID from query parameters
	clerkOrgID := c.Query("organization_id")
	if clerkOrgID == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Organization ID is required",
		})
	}

	// First find the organization by its clerk_org_id
	var org models.Organization
	if err := db.Where("clerk_org_id = ?", clerkOrgID).First(&org).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Organization not found",
		})
	}

	// Find services for the specific organization using its internal ID and preload the Organization
	result := db.Preload("Organization").Where("organization_id = ?", org.ID).Find(&services)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch services",
		})
	}

	return c.Status(200).JSON(services)
}

type CreateIncidentRequest struct {
	Title          string `json:"title" validate:"required"`
	Description    string `json:"description"`
	Status         string `json:"status" validate:"required,oneof=investigating identified resolved"`
	ServiceID      string `json:"service_id" validate:"required"`
	OrganizationID string `json:"organization_id" validate:"required"`
}

// func to create an incident
func CreateIncident(c *fiber.Ctx) error {
	// Parse request body
	var req CreateIncidentRequest
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
	database := db.Connect()

	// Get organization by Clerk ID
	var organization models.Organization
	if err := database.Where("clerk_org_id = ?", req.OrganizationID).First(&organization).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Organization not found",
		})
	}

	// Create incident
	incident := models.Incident{
		Title:          req.Title,
		Description:    req.Description,
		Status:         req.Status,
		ServiceID:      req.ServiceID,
		OrganizationID: organization.ID,
	}

	// Save to database
	if err := database.Create(&incident).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create incident",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(incident)
}

// func to list incidents
func ListIncidents(c *fiber.Ctx) error {
	var incidents []models.Incident
	db := db.Connect()

	// Get organization ID and service ID from query parameters
	clerkOrgID := c.Query("organization_id")
	serviceID := c.Query("service_id")

	if clerkOrgID == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Organization ID is required",
		})
	}

	// First find the organization by its clerk_org_id
	var org models.Organization
	if err := db.Where("clerk_org_id = ?", clerkOrgID).First(&org).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Organization not found",
		})
	}

	// Build the query
	query := db.Where("organization_id = ?", org.ID)

	// Add service ID filter if provided
	if serviceID != "" {
		query = query.Where("service_id = ?", serviceID)
	}

	// Execute the query
	result := query.Find(&incidents)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch incidents",
		})
	}

	return c.Status(200).JSON(incidents)
}

// GetOrganizationStatus fetches all services and their incidents for a given organization
func GetOrganizationStatus(c *fiber.Ctx) error {
	orgSlug := c.Params("slug")
	if orgSlug == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Organization slug is required",
		})
	}

	db := db.Connect()

	// Find the organization
	var org models.Organization
	if err := db.Where("slug = ?", orgSlug).First(&org).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Organization not found",
		})
	}

	// Fetch all services for the organization
	var services []models.Service
	if err := db.Where("organization_id = ?", org.ID).Find(&services).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch services",
		})
	}

	// Fetch all incidents for the organization
	var incidents []models.Incident
	if err := db.Where("organization_id = ?", org.ID).
		Preload("Updates").
		Preload("Service").
		Find(&incidents).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch incidents",
		})
	}

	// Prepare the response
	response := fiber.Map{
		"organization": fiber.Map{
			"id":   org.ID,
			"name": org.Name,
			"slug": org.Slug,
		},
		"services":  services,
		"incidents": incidents,
	}

	return c.Status(200).JSON(response)
}

// DeleteService deletes a service and all its related data
func DeleteService(c *fiber.Ctx) error {
	serviceID := c.Params("id")
	clerkOrgID := c.Query("organization_id")

	if serviceID == "" || clerkOrgID == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Service ID and Organization ID are required",
		})
	}

	db := db.Connect()

	// First find the organization by its clerk_org_id
	var org models.Organization
	if err := db.Where("clerk_org_id = ?", clerkOrgID).First(&org).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Organization not found",
		})
	}

	// Then verify the service belongs to the organization using internal org ID
	var service models.Service
	if err := db.Where("id = ? AND organization_id = ?", serviceID, org.ID).First(&service).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Service not found or does not belong to the organization",
		})
	}

	// Start a transaction to ensure all deletions are atomic
	tx := db.Begin()

	// Delete all incident updates for incidents related to this service
	if err := tx.Where("incident_id IN (SELECT id FROM incidents WHERE service_id = ?)", serviceID).Delete(&models.IncidentUpdate{}).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete incident updates",
		})
	}

	// Delete all incidents related to this service
	if err := tx.Where("service_id = ?", serviceID).Delete(&models.Incident{}).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete incidents",
		})
	}

	// Delete all maintenance records related to this service
	if err := tx.Where("service_id = ?", serviceID).Delete(&models.Maintenance{}).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete maintenance records",
		})
	}

	// Finally delete the service
	if err := tx.Delete(&service).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete service",
		})
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to commit transaction",
		})
	}

	return c.Status(200).JSON(fiber.Map{
		"message": "Service and all related data deleted successfully",
	})
}

// UpdateService updates a service's information
func UpdateService(c *fiber.Ctx) error {
	serviceID := c.Params("id")
	clerkOrgID := c.Query("organization_id")

	if serviceID == "" || clerkOrgID == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Service ID and Organization ID are required",
		})
	}

	// Parse the update data
	var updateData struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Status      string `json:"status"`
	}
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	db := db.Connect()

	// First find the organization by its clerk_org_id
	var org models.Organization
	if err := db.Where("clerk_org_id = ?", clerkOrgID).First(&org).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Organization not found",
		})
	}

	// Then verify the service belongs to the organization using internal org ID
	var service models.Service
	if err := db.Where("id = ? AND organization_id = ?", serviceID, org.ID).First(&service).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Service not found or does not belong to the organization",
		})
	}

	// Update the service fields if they are provided
	if updateData.Name != "" {
		service.Name = updateData.Name
	}
	if updateData.Description != "" {
		service.Description = updateData.Description
	}
	if updateData.Status != "" {
		service.Status = updateData.Status
	}

	// Save the updated service
	if err := db.Save(&service).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update service",
		})
	}

	return c.Status(200).JSON(service)
}

type UpdateIncidentRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status" validate:"omitempty,oneof=investigating identified resolved"`
}

// DeleteIncident deletes an incident
func DeleteIncident(c *fiber.Ctx) error {
	incidentID := c.Params("id")
	clerkOrgID := c.Query("organization_id")
	serviceID := c.Query("service_id")

	if incidentID == "" || clerkOrgID == "" || serviceID == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Incident ID, Organization ID, and Service ID are required",
		})
	}

	db := db.Connect()

	// First find the organization by its clerk_org_id
	var org models.Organization
	if err := db.Where("clerk_org_id = ?", clerkOrgID).First(&org).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Organization not found",
		})
	}

	// Then verify the incident belongs to both the organization and service
	var incident models.Incident
	if err := db.Where("id = ? AND organization_id = ? AND service_id = ?",
		incidentID, org.ID, serviceID).First(&incident).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Incident not found or does not belong to the specified organization and service",
		})
	}

	// Start a transaction to ensure all deletions are atomic
	tx := db.Begin()

	// Delete all incident updates for this incident
	if err := tx.Where("incident_id = ?", incidentID).Delete(&models.IncidentUpdate{}).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete incident updates",
		})
	}

	// Delete the incident
	if err := tx.Delete(&incident).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete incident",
		})
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to commit transaction",
		})
	}

	return c.Status(200).JSON(fiber.Map{
		"message": "Incident and all related data deleted successfully",
	})
}

// UpdateIncident updates an incident's information
func UpdateIncident(c *fiber.Ctx) error {
	incidentID := c.Params("id")
	clerkOrgID := c.Query("organization_id")
	serviceID := c.Query("service_id")

	if incidentID == "" || clerkOrgID == "" || serviceID == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Incident ID, Organization ID, and Service ID are required",
		})
	}

	// Parse the update data
	var req UpdateIncidentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate request
	if err := utils.Validate.Struct(req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   "Validation failed",
			"details": err.Error(),
		})
	}

	db := db.Connect()

	// First find the organization by its clerk_org_id
	var org models.Organization
	if err := db.Where("clerk_org_id = ?", clerkOrgID).First(&org).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Organization not found",
		})
	}

	// Then verify the incident belongs to both the organization and service
	var incident models.Incident
	if err := db.Where("id = ? AND organization_id = ? AND service_id = ?",
		incidentID, org.ID, serviceID).First(&incident).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Incident not found or does not belong to the specified organization and service",
		})
	}

	// Update the incident fields if they are provided
	if req.Title != "" {
		incident.Title = req.Title
	}
	if req.Description != "" {
		incident.Description = req.Description
	}
	if req.Status != "" {
		incident.Status = req.Status
	}

	// Save the updated incident
	if err := db.Save(&incident).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update incident",
		})
	}

	return c.Status(200).JSON(incident)
}
