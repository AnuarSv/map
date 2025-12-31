package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"

	"watermap/internal/adapter/handler"
	"watermap/internal/adapter/middleware"
	"watermap/internal/adapter/repository/postgres"
	"watermap/internal/infrastructure/config"
	"watermap/internal/infrastructure/database"
	"watermap/internal/infrastructure/validator"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Create database connection pool
	ctx := context.Background()
	pool, err := database.NewPool(ctx, cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer pool.Close()
	log.Println("Connected to database")

	// Initialize repositories
	userRepo := postgres.NewUserRepo(pool)
	waterObjectRepo := postgres.NewWaterObjectRepo(pool)

	// Initialize validators
	geomValidator := validator.NewGeometryValidator()

	// Initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(cfg.JWTSecret, userRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(userRepo, cfg.JWTSecret)
	waterObjectHandler := handler.NewWaterObjectHandler(waterObjectRepo, geomValidator)
	adminHandler := handler.NewAdminHandler(waterObjectRepo, userRepo)

	// Create Gin router
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(gin.Logger())

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", cfg.ClientURL)
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// API routes
	api := r.Group("/api")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/logout", authHandler.Logout)
			auth.GET("/me", authMiddleware.Protect(), authHandler.Me)
		}

		// Water objects routes
		waterObjects := api.Group("/water-objects")
		{
			// Public routes
			waterObjects.GET("", waterObjectHandler.GetPublished)
			waterObjects.GET("/:canonicalId", waterObjectHandler.GetByCanonicalID)

			// Expert routes (requires expert or admin role)
			expert := waterObjects.Group("")
			expert.Use(authMiddleware.Protect(), authMiddleware.RequireExpert())
			{
				expert.GET("/my/drafts", waterObjectHandler.GetMyDrafts)
				expert.POST("", waterObjectHandler.Create)
				expert.PUT("/:id", waterObjectHandler.Update)
				expert.POST("/:id/submit", waterObjectHandler.SubmitForReview)
				expert.DELETE("/:id", waterObjectHandler.Delete)
			}
		}

		// Admin routes
		admin := api.Group("/admin")
		admin.Use(authMiddleware.Protect(), authMiddleware.RequireAdmin())
		{
			admin.GET("/pending", adminHandler.GetPending)
			admin.GET("/pending/:id/diff", adminHandler.GetDiff)
			admin.POST("/approve/:id", adminHandler.Approve)
			admin.POST("/reject/:id", adminHandler.Reject)
			admin.GET("/users", adminHandler.GetUsers)
			admin.PUT("/users/:id/role", adminHandler.UpdateUserRole)
		}
	}

	// Create server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		log.Printf("Server starting on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server stopped")
}
