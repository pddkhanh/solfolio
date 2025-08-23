-- Initial database setup for SolFolio

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema
CREATE SCHEMA IF NOT EXISTS solfolio;

-- Set search path
SET search_path TO solfolio, public;

-- Create tables will be handled by migrations
-- This file is for any initial database setup needed

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA solfolio TO solfolio;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA solfolio TO solfolio;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA solfolio TO solfolio;

-- Initial setup complete
SELECT 'Database initialization complete' as status;
