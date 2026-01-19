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

const schema = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS water_objects (
    id SERIAL PRIMARY KEY,
    canonical_id VARCHAR(255) UNIQUE NOT NULL,
    version INT NOT NULL DEFAULT 1,
    name_kz VARCHAR(255),
    name_ru VARCHAR(255),
    name_en VARCHAR(255),
    description_kz TEXT,
    description_ru TEXT,
    description_en TEXT,
    object_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    area_km2 FLOAT,
    water_volume_km3 FLOAT,
    max_depth_m FLOAT,
    avg_depth_m FLOAT,
    length_km FLOAT,
    salinity VARCHAR(50),
    geometry JSONB,
    created_by INT REFERENCES users(id),
    reviewed_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS object_history (
    id SERIAL PRIMARY KEY,
    object_id INT REFERENCES water_objects(id),
    version INT NOT NULL,
    data JSONB NOT NULL,
    changed_by INT REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT NOW()
);

-- GeoKZ: Regions of Kazakhstan
CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name_kz VARCHAR(100) NOT NULL,
    name_ru VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    code VARCHAR(10),
    center_city VARCHAR(100),
    population INTEGER,
    area_km2 DECIMAL,
    geometry JSONB
);

-- GeoKZ: Cities
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name_kz VARCHAR(100) NOT NULL,
    name_ru VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    region_id INT REFERENCES regions(id),
    population INTEGER,
    is_capital BOOLEAN DEFAULT FALSE,
    is_regional_center BOOLEAN DEFAULT FALSE,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    geometry JSONB
);

-- GeoKZ: Minerals/Natural Resources
CREATE TABLE IF NOT EXISTS minerals (
    id SERIAL PRIMARY KEY,
    name_kz VARCHAR(100) NOT NULL,
    name_ru VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    mineral_type VARCHAR(50) NOT NULL,
    description_ru TEXT,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    geometry JSONB
);

-- GeoKZ: Landforms (Mountains, Plains, Plateaus)
CREATE TABLE IF NOT EXISTS landforms (
    id SERIAL PRIMARY KEY,
    name_kz VARCHAR(100) NOT NULL,
    name_ru VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    landform_type VARCHAR(30) NOT NULL,
    elevation_m INTEGER,
    description_ru TEXT,
    geometry JSONB
);

-- GeoKZ: Quiz Collections
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'medium',
    question_count INTEGER DEFAULT 0,
    created_by INT REFERENCES users(id),
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- GeoKZ: Quiz Questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES quizzes(id) ON DELETE CASCADE,
    question_type VARCHAR(30) NOT NULL,
    target_table VARCHAR(50) NOT NULL,
    target_id INTEGER NOT NULL,
    question_text TEXT,
    options JSONB,
    correct_answer TEXT,
    order_num INTEGER DEFAULT 0
);

-- GeoKZ: User Quiz Results
CREATE TABLE IF NOT EXISTS quiz_results (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    quiz_id INT REFERENCES quizzes(id),
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    time_seconds INTEGER,
    completed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_water_objects_status ON water_objects(status);
CREATE INDEX IF NOT EXISTS idx_water_objects_type ON water_objects(object_type);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_regions_name ON regions(name_ru);
CREATE INDEX IF NOT EXISTS idx_cities_region ON cities(region_id);
CREATE INDEX IF NOT EXISTS idx_minerals_type ON minerals(mineral_type);
CREATE INDEX IF NOT EXISTS idx_landforms_type ON landforms(landform_type);
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON quizzes(category);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results(user_id);
`

func main() {
	cfg := config.Load()

	ctx := context.Background()
	pool, err := database.NewPool(ctx, cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer pool.Close()

	log.Println("Connected to database")

	// Create tables
	log.Println("Creating tables...")
	_, err = pool.Exec(ctx, schema)
	if err != nil {
		log.Fatalf("Failed to create tables: %v", err)
	}
	log.Println("Tables created successfully")

	// Check if users exist
	var count int
	err = pool.QueryRow(ctx, "SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		log.Fatalf("Failed to query users: %v", err)
	}

	if count > 0 {
		log.Printf("Database already contains %d users. Skipping seed.", count)
		return
	}

	// Seed users
	log.Println("Seeding users...")
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}
	password := string(hashedPassword)

	users := []struct {
		Name  string
		Email string
		Role  entity.UserRole
	}{}

	// Admins
	for i := 1; i <= 5; i++ {
		users = append(users, struct {
			Name  string
			Email string
			Role  entity.UserRole
		}{
			Name:  fmt.Sprintf("Admin User %d", i),
			Email: fmt.Sprintf("admin%d@watermap.kz", i),
			Role:  entity.RoleAdmin,
		})
	}

	// Experts
	for i := 1; i <= 20; i++ {
		users = append(users, struct {
			Name  string
			Email string
			Role  entity.UserRole
		}{
			Name:  fmt.Sprintf("Expert User %d", i),
			Email: fmt.Sprintf("expert%d@watermap.kz", i),
			Role:  entity.RoleExpert,
		})
	}

	// Users
	for i := 1; i <= 75; i++ {
		users = append(users, struct {
			Name  string
			Email string
			Role  entity.UserRole
		}{
			Name:  fmt.Sprintf("Regular User %d", i),
			Email: fmt.Sprintf("user%d@watermap.kz", i),
			Role:  entity.RoleUser,
		})
	}

	inserted := 0
	for _, u := range users {
		query := `INSERT INTO users (name, email, password, role, created_at) VALUES ($1, $2, $3, $4, $5)`
		_, err := pool.Exec(ctx, query, u.Name, u.Email, password, u.Role, time.Now())
		if err != nil {
			log.Printf("Failed to insert %s: %v", u.Email, err)
		} else {
			inserted++
		}
	}

	log.Printf("Seeded %d users", inserted)
	log.Println("Default password: 123456")
	log.Println("Done")
}
