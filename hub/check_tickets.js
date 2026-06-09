import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
    console.error("Missing .env file at:", envPath);
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const getEnvVar = (name) => {
    const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
    return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTickets() {
    try {
        console.log("Querying support_tickets table from:", supabaseUrl);
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        console.log("\n--- RECENT TICKETS ---");
        if (!data || data.length === 0) {
            console.log("No tickets found in the queue.");
        } else {
            data.forEach(t => {
                console.log(`\nID: #${t.id}`);
                console.log(`Student: ${t.student_name}`);
                console.log(`Issue: ${t.issue}`);
                console.log(`Description: ${t.description}`);
                console.log(`Status: ${t.status}`);
                console.log(`Prompt: ${t.generated_prompt}`);
                console.log(`Created At: ${t.created_at}`);
                console.log("------------------------");
            });
        }
    } catch (err) {
        console.error("Error querying Supabase:", err.message);
    }
}

checkTickets();
