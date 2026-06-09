import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Load env (you must have VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE in .env)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE key in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Test cohort credentials (DO NOT COMMIT THIS FILE TO REPO)
const users = [
  { email: 'rody@officeaim.com', password: 'TODO_ADMIN_PASSWORD', role: 'admin' },
  { email: 'jean.andrade492@flounderfantasy.com', password: 'Alfena4445-011', role: 'FREE' },
  { email: 'cubaontdekker@gmail.com', password: 'Alin@1963', role: 'PRO' },
  { email: 'plusstudent@officeaim.app', password: 'PlusPassword123!', role: 'PLUS' },
  { email: 'freshstudent@officeaim.app', password: 'FreshPassword123!', role: 'FREE' },
];

(async () => {
  for (const u of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      // You can add app_metadata for role/tier
      app_metadata: { tier: u.role },
    });
    if (error) {
      console.error(`Error creating ${u.email}:`, error.message);
    } else {
      console.log(`Created ${u.email} (id: ${data.user.id})`);
    }
  }
})();
