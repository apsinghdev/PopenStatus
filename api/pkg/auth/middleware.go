package auth

import (
	"log"
	"os"

	// "github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

func ClerkMiddleware() fiber.Handler {
	// Load env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	client, _ := clerk.NewClient(os.Getenv("CLERK_SECRET_KEY"))

	return func(c *fiber.Ctx) error {
		sessToken := c.Get("Authorization")
		claims, err := client.VerifyToken(sessToken)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Unauthorized",
			})
		}
		// Attach claims to context
		c.Set("userID", claims.Claims.Subject)
		return c.Next()
	}
}
