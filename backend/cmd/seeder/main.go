package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"

	"watermap/internal/domain/entity"
	"watermap/internal/infrastructure/config"
	"watermap/internal/infrastructure/database"
)

func main() {
	cfg := config.Load()

	ctx := context.Background()
	pool, err := database.NewPool(ctx, cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer pool.Close()

	log.Println("Connected to database. Starting seeding...")

	// 1. Clear existing users (Optional: Truncate usually safer for seeding dev env)
	_, err = pool.Exec(ctx, "TRUNCATE TABLE users RESTART IDENTITY CASCADE")
	if err != nil {
		log.Printf("Warning: Failed to truncate users table: %v", err)
	} else {
		log.Println("Cleared existing users.")
	}

	// 2. Prepare common password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}
	password := string(hashedPassword)

	// 3. Seed Users
	users := []struct {
		Name   string
		Email  string
		Role   entity.UserRole
	}{}

	// Admins (5)
	for i := 1; i <= 5; i++ {
		users = append(users, struct {
			Name   string
			Email  string
			Role   entity.UserRole
		}{
			Name:  fmt.Sprintf("Admin User %d", i),
			Email: fmt.Sprintf("admin%d@watermap.kz", i),
			Role:  entity.RoleAdmin,
		})
        // Also add the gmail variant requested
        users = append(users, struct {
			Name   string
			Email  string
			Role   entity.UserRole
		}{
			Name:  fmt.Sprintf("Admin User %d (Gmail)", i),
			Email: fmt.Sprintf("admin%d@gmail.com", i),
			Role:  entity.RoleAdmin,
		})
	}

	// Experts (20)
	for i := 1; i <= 20; i++ {
		users = append(users, struct {
			Name   string
			Email  string
			Role   entity.UserRole
		}{
			Name:  fmt.Sprintf("Expert User %d", i),
			Email: fmt.Sprintf("expert%d@watermap.kz", i),
			Role:  entity.RoleExpert,
		})
	}

	// Users (75)
	for i := 1; i <= 75; i++ {
		users = append(users, struct {
			Name   string
			Email  string
			Role   entity.UserRole
		}{
			Name:  fmt.Sprintf("Regular User %d", i),
			Email: fmt.Sprintf("user%d@watermap.kz", i),
			Role:  entity.RoleUser,
		})
	}

	// Insert Loop
	count := 0
	for _, u := range users {
		query := `INSERT INTO users (name, email, password, role, created_at) VALUES ($1, $2, $3, $4, $5)`
		_, err := pool.Exec(ctx, query, u.Name, u.Email, password, u.Role, time.Now())
		if err != nil {
			log.Printf("Failed to insert %s: %v", u.Email, err)
		} else {
			count++
		}
	}

	log.Printf("Successfully seeded %d users.", count)
    log.Println("Passwords are all '123456'")
}
