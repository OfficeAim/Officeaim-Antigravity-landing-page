-- ============================================
-- Migration 010: Support Tickets (Bug-to-Prompt Inbox)
-- ============================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS support_tickets (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    issue TEXT NOT NULL,
    description TEXT,
    page_url TEXT,
    generated_prompt TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Students can insert their own tickets
CREATE POLICY "Students can create tickets"
    ON support_tickets
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Students can view their own tickets
CREATE POLICY "Students can view own tickets"
    ON support_tickets
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Admins can view ALL tickets
CREATE POLICY "Admins can view all tickets"
    ON support_tickets
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Admins can update any ticket (resolve, add prompt, etc.)
CREATE POLICY "Admins can update tickets"
    ON support_tickets
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 4. Index for fast admin queries
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_created ON support_tickets(created_at DESC);
