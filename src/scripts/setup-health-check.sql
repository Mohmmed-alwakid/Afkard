-- Create health check table
CREATE TABLE IF NOT EXISTS health_check (
  id SERIAL PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'healthy',
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  message TEXT
);

-- Insert initial health check record
INSERT INTO health_check (status, message)
VALUES ('healthy', 'System is operational')
ON CONFLICT DO NOTHING; 