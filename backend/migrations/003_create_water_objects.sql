-- Migration 003: Create Water Objects Table
-- Core table for storing rivers, lakes, reservoirs
-- NOTE: Using JSONB for geometry since PostGIS may not be installed
-- Can be migrated to native GEOMETRY type later when PostGIS is available

CREATE TABLE IF NOT EXISTS water_objects (
    id SERIAL PRIMARY KEY,
    
    -- Unique identifier that persists across versions
    canonical_id UUID NOT NULL DEFAULT gen_random_uuid(),
    version INT NOT NULL DEFAULT 1,
    
    -- Names (multilingual)
    name_kz VARCHAR(255) NOT NULL,           -- Kazakh name (required)
    name_ru VARCHAR(255),                     -- Russian name
    name_en VARCHAR(255),                     -- English name
    
    -- Object classification
    object_type VARCHAR(50) NOT NULL 
        CHECK (object_type IN ('river', 'lake', 'reservoir', 'canal', 'glacier', 'spring')),
    
    -- Geometry stored as GeoJSON (JSONB for indexing)
    -- Format: { "type": "LineString", "coordinates": [[lng, lat], ...] }
    geometry JSONB NOT NULL,
    
    -- Hydrological Measurements
    length_km DECIMAL(10, 2),                 -- For rivers/canals
    area_km2 DECIMAL(12, 2),                  -- For lakes/reservoirs
    max_depth_m DECIMAL(8, 2),
    avg_depth_m DECIMAL(8, 2),
    water_volume_km3 DECIMAL(10, 4),
    basin_area_km2 DECIMAL(12, 2),
    avg_discharge_m3s DECIMAL(10, 2),         -- Average water flow
    
    -- Water Quality Data
    salinity_level VARCHAR(50),               -- freshwater, brackish, saline
    pollution_index DECIMAL(4, 2),            -- 0-10 scale
    ecological_status VARCHAR(50),            -- good, moderate, poor, critical
    
    -- Rich Content
    description_kz TEXT,
    description_ru TEXT,
    description_en TEXT,
    historical_notes TEXT,
    sources JSONB DEFAULT '[]',               -- Array of citation objects
    
    -- Workflow Status
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'pending', 'published', 'archived', 'rejected')),
    
    -- Audit Fields
    created_by INT NOT NULL REFERENCES users(id),
    updated_by INT REFERENCES users(id),
    reviewed_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    
    -- Rejection feedback
    rejection_reason TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_water_objects_canonical ON water_objects(canonical_id);
CREATE INDEX IF NOT EXISTS idx_water_objects_status ON water_objects(status);
CREATE INDEX IF NOT EXISTS idx_water_objects_type ON water_objects(object_type);
CREATE INDEX IF NOT EXISTS idx_water_objects_created_by ON water_objects(created_by);

-- GIN index for geometry JSONB (for later spatial queries with pg_trgm)
CREATE INDEX IF NOT EXISTS idx_water_objects_geometry ON water_objects USING GIN(geometry);

-- Unique constraint: only one published version per canonical object
CREATE UNIQUE INDEX IF NOT EXISTS idx_water_objects_unique_published 
    ON water_objects(canonical_id) WHERE (status = 'published');

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_water_objects_updated_at ON water_objects;
CREATE TRIGGER update_water_objects_updated_at
    BEFORE UPDATE ON water_objects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
