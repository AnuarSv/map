-- Migration 002: Add User Roles
-- Adds role column to existing users table

-- Add role column with default 'user'
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' 
    CHECK (role IN ('user', 'expert', 'admin'));

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Optional: Promote a specific user to admin (update email as needed)
-- UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
