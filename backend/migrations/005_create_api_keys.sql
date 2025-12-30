-- Migration 005: Create API Keys Table
-- For future API monetization and rate limiting

CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    
    key_hash VARCHAR(64) NOT NULL UNIQUE,     -- SHA-256 of the actual key
    key_prefix VARCHAR(12) NOT NULL,          -- First chars for identification (e.g., "wm_abc123")
    
    -- Owner information
    name VARCHAR(100) NOT NULL,               -- "Startup XYZ Production Key"
    organization VARCHAR(255),
    owner_email VARCHAR(255) NOT NULL,
    
    -- Tier & Limits
    tier VARCHAR(20) NOT NULL DEFAULT 'free'
        CHECK (tier IN ('free', 'basic', 'premium', 'enterprise')),
    rate_limit_per_minute INT NOT NULL DEFAULT 60,
    rate_limit_per_day INT NOT NULL DEFAULT 1000,
    allowed_endpoints TEXT[] DEFAULT ARRAY['read'],
    
    -- Usage tracking
    total_requests BIGINT DEFAULT 0,
    last_used_at TIMESTAMP,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Billing (for future Stripe integration)
    billing_email VARCHAR(255),
    stripe_customer_id VARCHAR(100)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_api_keys_tier ON api_keys(tier);
