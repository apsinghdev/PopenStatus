package auth

import (
	"log"
	"os"
	"strings"

	// "github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

func ClerkMiddleware() fiber.Handler {
	// Load .env file only in development
	if os.Getenv("ENV") == "dev" {
		err := godotenv.Load()
		if err != nil {
			log.Printf("Warning: Failed to load .env file: %v", err)
		}
	}

	client, _ := clerk.NewClient(os.Getenv("CLERK_SECRET_KEY"))

	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "No authorization header",
			})
		}

		// Extract token from "Bearer <token>"
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid authorization header format",
			})
		}

		claims, err := client.VerifyToken(tokenParts[1])
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid token",
			})
		}

		// Attach claims to context
		c.Set("userID", claims.Claims.Subject)
		// For now, use a default organization ID since Clerk doesn't provide it directly
		c.Set("organizationID", "1")
		return c.Next()
	}
}
