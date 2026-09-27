-- =========================================================================
-- Smart Safety Jacket Supabase Database Schema
-- Paste and run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- =========================================================================

-- 1. Create Smart Jacket Vitals Log Table
CREATE TABLE IF NOT EXISTS public.smart_jacket_vitals (
    id BIGSERIAL PRIMARY KEY,
    jacket_id TEXT NOT NULL DEFAULT 'JACKET-ALPHA-01',
    heart_rate INTEGER NOT NULL,
    spo2 INTEGER NOT NULL,
    respiration_rate INTEGER,
    skin_temperature NUMERIC(4, 1),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    hrv INTEGER,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast time-series retrieval
CREATE INDEX IF NOT EXISTS idx_jacket_vitals_created_at 
ON public.smart_jacket_vitals (jacket_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.smart_jacket_vitals ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read and insert for the web application
CREATE POLICY "Allow public read on vitals" 
ON public.smart_jacket_vitals FOR SELECT USING (true);

CREATE POLICY "Allow public insert on vitals" 
ON public.smart_jacket_vitals FOR INSERT WITH CHECK (true);


-- 2. Create Alerts & Safety Incident Table
CREATE TABLE IF NOT EXISTS public.smart_jacket_alerts (
    id BIGSERIAL PRIMARY KEY,
    jacket_id TEXT NOT NULL DEFAULT 'JACKET-ALPHA-01',
    alert_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'SYSTEM',
    severity TEXT NOT NULL,
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jacket_alerts_created_at 
ON public.smart_jacket_alerts (jacket_id, created_at DESC);

ALTER TABLE public.smart_jacket_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on alerts" 
ON public.smart_jacket_alerts FOR SELECT USING (true);

CREATE POLICY "Allow public insert on alerts" 
ON public.smart_jacket_alerts FOR INSERT WITH CHECK (true);


-- 3. Create Emergency Contacts Table
CREATE TABLE IF NOT EXISTS public.smart_jacket_contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_priority BOOLEAN DEFAULT FALSE,
    notified BOOLEAN DEFAULT FALSE,
    notified_time TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.smart_jacket_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on contacts" 
ON public.smart_jacket_contacts FOR ALL USING (true);


-- 4. Create Sports & Workout Telemetry Table
CREATE TABLE IF NOT EXISTS public.smart_jacket_workouts (
    id BIGSERIAL PRIMARY KEY,
    jacket_id TEXT NOT NULL DEFAULT 'JACKET-ALPHA-01',
    sport_type TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    calories_burned INTEGER NOT NULL,
    avg_heart_rate INTEGER,
    peak_heart_rate INTEGER,
    avg_cadence INTEGER,
    total_laps INTEGER DEFAULT 0,
    laps_data JSONB DEFAULT '[]'::jsonb,
    time_in_zones JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.smart_jacket_workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on workouts" 
ON public.smart_jacket_workouts FOR SELECT USING (true);

CREATE POLICY "Allow public insert on workouts" 
ON public.smart_jacket_workouts FOR INSERT WITH CHECK (true);
