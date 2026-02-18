-- 1. WIPE OLD TABLES (Start Fresh)
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS student_progress CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;

-- 2. CREATE CORRECT SCHEMA
CREATE TABLE modules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  intro_video_url TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  smart_goal TEXT NOT NULL,
  content TEXT NOT NULL,
  video_url TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE quiz_questions (
  id SERIAL PRIMARY KEY,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE student_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'in_progress', 'completed')),
  quiz_score INTEGER DEFAULT 0,
  quiz_attempts INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  answers JSONB NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ENABLE SECURITY
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modules" ON modules FOR SELECT USING (true);
CREATE POLICY "Anyone can view lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "Anyone can view quiz questions" ON quiz_questions FOR SELECT USING (true);
CREATE POLICY "Users can view their own progress" ON student_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON student_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON student_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quiz attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. SEED MODULE 1 DATA
INSERT INTO modules (id, title, description, intro_video_url, order_index) VALUES
(1, 'Demystifying AI - What It Is and Isn''t (and Why You Don''t Need to Be Scared)', 'Learn the fundamentals of AI and overcome initial anxiety about its complexity.', 'https://youtu.be/UD6mW0ihCww', 1);

INSERT INTO lessons (id, module_id, title, smart_goal, content, video_url, order_index) VALUES
('1-1', 1, 'AI in Your Daily Life: Beyond Hype', 
'By the end of this lesson, you will be able to identify at least three common AI applications in your daily life and articulate in one sentence how AI functions as a tool to augment human capabilities, thereby reducing initial anxiety about AI''s complexity.',
'<h2>What is AI, Really?</h2><p>Forget the robots from sci-fi movies. At its core, <strong>Artificial Intelligence</strong> is simply a computer system designed to perform tasks that typically require human intelligence.</p>',
'https://youtu.be/TJrEb9pLquo', 1),
('1-2', 1, 'The Human-AI Partnership: Your New Co-Pilot',
'By the end of this lesson, you will be able to identify at least two specific tasks in your current workflow where AI could act as a co-pilot to augment your work.',
'<h2>AI as Your Co-Pilot, Not Your Replacement</h2><p>The most effective way to think about AI in the workplace is as a <strong>co-pilot</strong>.</p>',
NULL, 2),
('1-3', 1, 'Your First AI Tool: Introduction to ChatGPT',
'By the end of this lesson, you will have created a free ChatGPT account and successfully executed your first prompt.',
'<h2>What is ChatGPT?</h2><p><strong>ChatGPT</strong> is a conversational AI tool developed by OpenAI.</p>',
NULL, 3);

-- 5. SEED QUIZ QUESTIONS (Truncated for brevity, focusing on Lesson 1.1 first)
INSERT INTO quiz_questions (lesson_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index) VALUES
('1-1', 'What is the most accurate definition of AI?', 'A robot', 'A computer system for human tasks', 'Science fiction', 'Magic', 'B', 'AI is a tool for tasks requiring human intelligence.', 1);

COMMIT;
