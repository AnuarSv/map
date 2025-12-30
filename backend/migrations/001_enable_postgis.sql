-- Migration 001: Enable PostGIS Extension
-- Run this as a PostgreSQL superuser (postgres) or a user with CREATE EXTENSION privileges

-- Enable PostGIS for geographic types
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Verify installation
SELECT PostGIS_Version();
