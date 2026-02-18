# Supabase Database Setup Guide

## Running the Migrations

You have two options to run these migrations:

### Option 1: Using Supabase Dashboard (Recommended for now)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `001_create_modules_schema.sql`
5. Click "Run" to execute
6. Repeat steps 3-5 for `002_seed_module_1.sql`

### Option 2: Using Supabase CLI (if you have it installed)

```bash
# Make sure you're in the project root
cd "/Users/rodyfigueroa/Movies/OFICEAIM/Officeaim Antigravity landing page"

# Run migrations
supabase db push
```

## Verifying the Setup

After running the migrations, verify in your Supabase dashboard:

1. Go to "Table Editor"
2. You should see these new tables:
   - `modules` (1 row - Module 1)
   - `lessons` (3 rows - Lessons 1.1, 1.2, 1.3)
   - `quiz_questions` (15 rows - 5 questions per lesson)
   - `student_progress` (empty initially)
   - `quiz_attempts` (empty initially)

## Next Steps

Once the migrations are complete, the React app will be able to:
- Load Module 1 data from Supabase
- Display lessons with videos
- Show interactive quizzes
- Track student progress
- Unlock lessons based on quiz completion

## Troubleshooting

If you get errors about tables already existing, you can drop them first:
```sql
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS student_progress CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
```

Then run the migrations again.
