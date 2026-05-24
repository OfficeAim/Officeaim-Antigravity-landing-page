import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the hub/.env file
dotenv.config({ path: path.resolve(__dirname, '../hub/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ ERROR: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
}

// Initialize Supabase client with the Service Role Key to bypass RLS for administrative tasks
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

/**
 * Executes a raw SQL query or standard Supabase client operations.
 * Note: Raw SQL execution via supabase-js requires a custom RPC function (e.g., 'exec_sql') 
 * on your Supabase Postgres instance, or you must execute standard Table queries.
 */
async function runMigration() {
    console.log("🚀 Starting Supabase Migration Bridge...");

    const sqlQueries = [
        // 1. Repair Profiles RLS for Admins
        `DO $$ 
         BEGIN 
            DROP POLICY IF EXISTS "Admins view all" ON public.profiles;
            CREATE POLICY "Admins view all" ON public.profiles FOR SELECT TO authenticated USING (is_admin());
         END $$;`,

        // 1b. Add language and country to profiles
        `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english';`,
        `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;`,

        // 2. Create admin_inbox if not exists
        `CREATE TABLE IF NOT EXISTS admin_inbox (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'info',
            is_read BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );`,

        // 3. Whistleblower trigger for checklist_state 7/7
        `CREATE OR REPLACE FUNCTION notify_admin_on_completion()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.checklist_state = '7/7' AND (OLD.checklist_state IS NULL OR OLD.checklist_state <> '7/7') THEN
                INSERT INTO admin_inbox (user_id, title, message, type)
                VALUES (NEW.user_id, 'Project Completion', 'Student finished checklist 7/7', 'alert');
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;`,

        `DROP TRIGGER IF EXISTS tr_whistleblower ON student_projects;`,
        `CREATE TRIGGER tr_whistleblower
        AFTER UPDATE ON student_projects
        FOR EACH ROW
        EXECUTE FUNCTION notify_admin_on_completion();`
    ];

    try {
        console.log("📡 Sending SQL to Supabase via MCP...");

        for (const query of sqlQueries) {
            // We use the supabase-mcp-server tool for execution
            // But for this script, we'll just log it as it's meant to be run by the user or agent
            console.log(`Executing: ${query.substring(0, 50)}...`);
        }

        console.log("✅ SQL execution simulation complete.");
    } catch (err) {
        console.error("❌ Migration failed:", err);
    }
}

runMigration();
