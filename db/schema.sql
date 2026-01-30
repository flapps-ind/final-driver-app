-- Database Schema for RapidResponse EMS
-- Run this in your PostgreSQL instance (e.g. Supabase SQL Editor)

-- 1. Users Table (Drivers)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  unit_id VARCHAR(50) UNIQUE NOT NULL,
  certification_number VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'off_duty' CHECK (status IN ('available', 'off_duty', 'en_route', 'at_scene')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  current_accuracy DECIMAL(10, 2),
  current_speed DECIMAL(10, 2),
  current_heading DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_unit_id ON users(unit_id);
CREATE INDEX IF NOT EXISTS idx_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_user_location ON users(current_latitude, current_longitude);

-- 2. User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_expires ON user_sessions(expires_at);

-- 3. Login Attempts Table
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  success BOOLEAN DEFAULT FALSE,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_time ON login_attempts(email, attempted_at);

-- 4. Emergency Dispatches Table
CREATE TABLE IF NOT EXISTS emergency_dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_id VARCHAR(50) UNIQUE NOT NULL,
  driver_id UUID REFERENCES users(id),
  location_latitude DECIMAL(10, 8) NOT NULL,
  location_longitude DECIMAL(11, 8) NOT NULL,
  address TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  type VARCHAR(50),
  details TEXT,
  -- New fields for external integration
  caller_phone VARCHAR(20),
  caller_name VARCHAR(255),
  emergency_type VARCHAR(50) DEFAULT 'general',
  notes TEXT,
  
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'dispatched', 'en_route', 'arrived', 'completed', 'cancelled')),
  dispatched_at TIMESTAMP,
  arrived_at TIMESTAMP,
  arrival_latitude DECIMAL(10, 8),
  arrival_longitude DECIMAL(11, 8),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_emergency_driver ON emergency_dispatches(emergency_id, driver_id);
CREATE INDEX IF NOT EXISTS idx_emergency_status ON emergency_dispatches(status);

-- 5. Driver Locations Table (History)
CREATE TABLE IF NOT EXISTS driver_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES users(id),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_driver_time ON driver_locations (driver_id, recorded_at);

-- 6. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES users(id),
  emergency_id VARCHAR(50),
  action VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details JSONB
);
