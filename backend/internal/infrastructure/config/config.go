package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port       string
	DBHost     string
	DBPort     int
	DBName     string
	DBUser     string
	DBPassword string
	JWTSecret  string
	ClientURL  string
}

func Load() *Config {
	dbPort, _ := strconv.Atoi(getEnv("DB_PORT", "5432"))

	return &Config{
		Port:       getEnv("PORT", "5000"),
		DBHost:     getEnv("DB_HOST", "127.0.0.1"),
		DBPort:     dbPort,
		DBName:     getEnv("DB_NAME", "pern_auth"),
		DBUser:     getEnv("DB_USER", "myuser"),
		DBPassword: getEnv("DB_PASSWORD", "mypassword"),
		JWTSecret:  getEnv("JWT_SECRET", "your-secret-key"),
		ClientURL:  getEnv("CLIENT_URL", "http://localhost:5173"),
	}
}

func (c *Config) DatabaseURL() string {
	return "postgres://" + c.DBUser + ":" + c.DBPassword + "@" + c.DBHost + ":" + strconv.Itoa(c.DBPort) + "/" + c.DBName
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
