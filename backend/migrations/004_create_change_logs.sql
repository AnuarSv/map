-- Migration 004: Create Change Logs Table
-- Audit trail for all changes to water objects

CREATE TABLE IF NOT EXISTS change_logs (
    id SERIAL PRIMARY KEY,
    
    water_object_id INT NOT NULL REFERENCES water_objects(id) ON DELETE CASCADE,
    canonical_id UUID NOT NULL,
    
    -- Change metadata
    action VARCHAR(20) NOT NULL 
        CHECK (action IN ('create', 'update', 'submit', 'approve', 'reject', 'archive')),
    
    -- What changed (for updates)
    changed_fields JSONB,                     -- { "field": { "old": x, "new": y } }
    
    -- Review workflow
    reviewer_notes TEXT,                      -- Admin feedback
    
    -- Actor
    performed_by INT NOT NULL REFERENCES users(id),
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_change_logs_canonical ON change_logs(canonical_id);
CREATE INDEX IF NOT EXISTS idx_change_logs_water_object ON change_logs(water_object_id);
CREATE INDEX IF NOT EXISTS idx_change_logs_action ON change_logs(action);
CREATE INDEX IF NOT EXISTS idx_change_logs_date ON change_logs(performed_at);
CREATE INDEX IF NOT EXISTS idx_change_logs_performed_by ON change_logs(performed_by);
