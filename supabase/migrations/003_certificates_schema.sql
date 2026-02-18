-- Create student_certificates table
CREATE TABLE IF NOT EXISTS student_certificates (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
  certificate_url TEXT,
  score INTEGER,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS
ALTER TABLE student_certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own certificates" ON student_certificates;
CREATE POLICY "Users can view their own certificates" ON student_certificates 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all certificates" ON student_certificates;
CREATE POLICY "Admins can view all certificates" ON student_certificates 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can insert/update certificates
DROP POLICY IF EXISTS "Admins can insert certificates" ON student_certificates;
CREATE POLICY "Admins can insert certificates" ON student_certificates 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
