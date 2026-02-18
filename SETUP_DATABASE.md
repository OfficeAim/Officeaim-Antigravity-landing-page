# 🚀 Quick Start: Setting Up Your LMS Database

## Step 1: Run Database Migrations

1. **Open your Supabase Dashboard:**
   - Go to: https://guemwhrdqmbneoccucht.supabase.co
   - Log in with your account

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Run Migration 1 (Create Tables):**
   - Copy ALL the contents from: `supabase/migrations/001_create_modules_schema.sql`
   - Paste into the SQL Editor
   - Click "Run" (or press Cmd+Enter)
   - You should see "Success. No rows returned"

4. **Run Migration 2 (Add Module 1 Data):**
   - Click "+ New query" again
   - Copy ALL the contents from: `supabase/migrations/002_seed_module_1.sql`
   - Paste into the SQL Editor
   - Click "Run"
   - You should see "Success. No rows returned"

5. **Verify the Data:**
   - Click "Table Editor" in the left sidebar
   - You should now see these tables:
     - `modules` → 1 row (Module 1: Demystifying AI)
     - `lessons` → 3 rows (Lessons 1.1, 1.2, 1.3)
     - `quiz_questions` → 15 rows (5 questions per lesson)
     - `student_progress` → 0 rows (will fill when students start)
     - `quiz_attempts` → 0 rows (will fill when students take quizzes)

## Step 2: Test the LMS

Once migrations are complete:

1. **Log in to your student account:**
   - Go to: http://localhost:5173/hub/login
   - Use your student credentials

2. **Navigate to Module 1:**
   - Go to: http://localhost:5173/hub/module/1
   - You should see the module intro video and all 3 lessons

3. **Start Lesson 1.1:**
   - Click "Start Module 1"
   - Watch the lesson video
   - Take the quiz (need 80% to pass = 4 out of 5 correct)
   - Lesson 1.2 will unlock after passing

## What Happens Next

- ✅ Your student progress is tracked in real-time
- ✅ Lessons unlock progressively (1.2 unlocks after 1.1, etc.)
- ✅ Quiz scores are saved
- ✅ Admin dashboard will show all student progress
- ✅ Certificate generation triggers when module is complete

## Troubleshooting

**Error: "relation already exists"**
- Some tables might already exist. Run this first:
```sql
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS student_progress CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
```

**Error: "permission denied"**
- Make sure you're logged in as the project owner in Supabase

**Can't see the data in Table Editor**
- Refresh the page
- Check the SQL Editor for any error messages

---

**Ready?** Run those migrations and let me know when it's done! 🎉
