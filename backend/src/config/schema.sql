-- Nirvaan Database Schema (PostgreSQL / Neon)

CREATE TYPE user_role AS ENUM ('caller', 'driver', 'admin');
CREATE TYPE vehicle_type AS ENUM ('basic', 'icu');
CREATE TYPE trip_status AS ENUM ('requested', 'accepted', 'ongoing', 'completed', 'cancelled');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'caller',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE drivers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  vehicle_type vehicle_type NOT NULL DEFAULT 'basic',
  vehicle_number VARCHAR(20),
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  is_available BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  caller_id INTEGER REFERENCES users(id),
  driver_id INTEGER REFERENCES drivers(id),
  pickup_lat DOUBLE PRECISION NOT NULL,
  pickup_lng DOUBLE PRECISION NOT NULL,
  pickup_address TEXT,
  status trip_status NOT NULL DEFAULT 'requested',
  requested_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE trip_prices (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
  distance_km NUMERIC(6,2),
  price_charged NUMERIC(8,2),
  vehicle_type vehicle_type NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE hospitals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  contact_number VARCHAR(15),
  specialty_tags TEXT[] NOT NULL DEFAULT '{}', -- e.g. {'cancer','oncology'}
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_drivers_available ON drivers(is_available);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_hospitals_specialty ON hospitals USING GIN(specialty_tags);

CREATE TABLE emergency_contacts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  relationship VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);