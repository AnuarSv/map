package config

import (
	"net/url"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port         string
	DatabaseURL  string
	DBHost       string
	DBPort       int
	DBName       string
	DBUser       string
	DBPassword   string
	RedisURL     string
	JWTSecret    string
	ClientURL    string
}

func Load() *Config {
	cfg := &Config{
		Port:        getEnv("PORT", "5000"),
		DatabaseURL: getEnv("DATABASE_URL", ""),
		RedisURL:    getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:   getEnv("JWT_SECRET", "your-secret-key"),
		ClientURL:   getEnv("CLIENT_URL", "http://localhost:5173"),
	}

	// Parse DATABASE_URL if provided
	if cfg.DatabaseURL != "" {
		if parsed, err := url.Parse(cfg.DatabaseURL); err == nil {
			cfg.DBHost = parsed.Hostname()
			cfg.DBPort, _ = strconv.Atoi(parsed.Port())
			if cfg.DBPort == 0 {
				cfg.DBPort = 5432
			}
			cfg.DBName = strings.TrimPrefix(parsed.Path, "/")
			cfg.DBUser = parsed.User.Username()
			cfg.DBPassword, _ = parsed.User.Password()
		}
	} else {
		// Fallback to individual env vars
		cfg.DBHost = getEnv("DB_HOST", "127.0.0.1")
		cfg.DBPort, _ = strconv.Atoi(getEnv("DB_PORT", "5432"))
		cfg.DBName = getEnv("DB_NAME", "watermap")
		cfg.DBUser = getEnv("DB_USER", "watermap")
		cfg.DBPassword = getEnv("DB_PASSWORD", "watermap")
		cfg.DatabaseURL = "postgres://" + cfg.DBUser + ":" + cfg.DBPassword + "@" + cfg.DBHost + ":" + strconv.Itoa(cfg.DBPort) + "/" + cfg.DBName
	}

	return cfg
}

func (c *Config) GetDatabaseURL() string {
	return c.DatabaseURL
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
