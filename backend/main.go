package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/mazkama/auroka/backend/config"
	"github.com/mazkama/auroka/backend/routes"
)

func main() {
	// Load .env if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found or failed to load, using environment variables")
	}

	// Initialize Configs
	config.InitOAuth()
	config.ConnectDB()

	// Setup Router
	r := routes.SetupRouter()

	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}

	log.Printf("Server running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
