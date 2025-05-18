package handlers

import (
	"fmt"
	"os"
	"strings"

	"net/http"

	"github.com/apsinghdev/PopenStatus/api/pkg/db"
	"github.com/apsinghdev/PopenStatus/api/pkg/models"
	"github.com/gofiber/fiber/v2"
	svix "github.com/svix/svix-webhooks/go"
)

type ClerkWebhookEvent struct {
	Data struct {
		ID          string `json:"id"`
		Name        string `json:"name"`
		Slug        string `json:"slug"`
		Description string `json:"description"`
	} `json:"data"`
	Type string `json:"type"`
}

func verifyWebhookSignature(c *fiber.Ctx) error {
	webhookSecret := os.Getenv("CLERK_WEBHOOK_SIGNING_SECRET")
	if webhookSecret == "" {
		return fiber.NewError(fiber.StatusInternalServerError, "CLERK_WEBHOOK_SIGNING_SECRET is not set")
	}

	fmt.Println("webhookSecret", webhookSecret)

	wh, err := svix.NewWebhook(webhookSecret)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to initialize Clerk webhook verifier")
	}
	fmt.Println("webhook", wh)
	// Convert Fiber headers to net/http headers
	headers := http.Header{}
	c.Request().Header.VisitAll(func(key, value []byte) {
		headers.Set(string(key), string(value))
	})

	// Validate the signature
	if err := wh.Verify(c.Body(), headers); err != nil {
		fmt.Println("😍 invalid webhook signature")
		return fiber.NewError(fiber.StatusUnauthorized, "Invalid Clerk webhook signature")
	}

	return nil
}


func HandleClerkWebhook(c *fiber.Ctx) error {
	fmt.Println("🔥 HandleClerkWebhook")
	// Step 1: Signature verification
	if err := verifyWebhookSignature(c); err != nil {
		return err
	}

	// Step 2: Parse the JSON body into your expected struct
	var event ClerkWebhookEvent
	if err := c.BodyParser(&event); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid webhook payload",
		})
	}

	// Step 3: Only handle organization events
	if !strings.HasPrefix(event.Type, "organization.") {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message": "Ignored non-organization event",
		})
	}

	db := db.GetDB()

	switch event.Type {
	case "organization.created":
		org := models.Organization{
			ClerkOrgID: event.Data.ID,
			Name:       event.Data.Name,
			Slug:       event.Data.Slug,
		}

		if err := db.Create(&org).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create organization",
			})
		}

	case "organization.updated":
		var org models.Organization
		if err := db.Where("clerk_org_id = ?", event.Data.ID).First(&org).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Organization not found",
			})
		}

		org.Name = event.Data.Name
		org.Slug = event.Data.Slug

		if err := db.Save(&org).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to update organization",
			})
		}

	case "organization.deleted":
		if err := db.Where("clerk_org_id = ?", event.Data.ID).Delete(&models.Organization{}).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to delete organization",
			})
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Webhook processed successfully",
	})
}

