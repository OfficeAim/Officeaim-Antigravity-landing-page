-- Insert the Admin User profile (assuming their Auth ID is b2283a40-d51e-4bd2-ba46-262465a83d95, change if different)
INSERT INTO public.profiles (id, full_name, email, role, membership_status, ai_proficiency)
VALUES
  ('b2283a40-d51e-4bd2-ba46-262465a83d95', 'Rody Figueroa', 'rody@officeaim.com', 'admin', 'active', 'Master Architect')
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin', membership_status = 'active', full_name = 'Rody Figueroa';

-- Insert some mock students to populate the dashboard stats
INSERT INTO public.profiles (id, full_name, email, role, membership_status, ai_proficiency)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Sarah Jenkins', 'sarah.j@example.com', 'student', 'active', 'Pioneer'),
  ('b2222222-2222-2222-2222-222222222222', 'Michael Chen', 'm.chen@example.com', 'student', 'active', 'Apprentice'),
  ('c3333333-3333-3333-3333-333333333333', 'Emily Rodriguez', 'emily.r@example.com', 'student', 'beta', 'Voyager'),
  ('d4444444-4444-4444-4444-444444444444', 'David Kim', 'david.k@example.com', 'student', 'canceled', 'Novice')
ON CONFLICT (id) DO NOTHING;

-- Insert some dummy progress for the students
INSERT INTO public.student_progress (user_id, lesson_id, status, quiz_score)
VALUES
  -- Sarah finished module 1 early lessons
  ('a1111111-1111-1111-1111-111111111111', 1, 'completed', 100),
  ('a1111111-1111-1111-1111-111111111111', 2, 'completed', 85),
  ('a1111111-1111-1111-1111-111111111111', 3, 'in_progress', null),
  
  -- Michael just started
  ('b2222222-2222-2222-2222-222222222222', 1, 'in_progress', null),
  
  -- Emily is far ahead
  ('c3333333-3333-3333-3333-333333333333', 1, 'completed', 95),
  ('c3333333-3333-3333-3333-333333333333', 2, 'completed', 90),
  ('c3333333-3333-3333-3333-333333333333', 3, 'completed', 100),
  ('c3333333-3333-3333-3333-333333333333', 4, 'in_progress', null)
ON CONFLICT DO NOTHING;

-- Insert some dummy quiz attempts
INSERT INTO public.quiz_attempts (user_id, lesson_id, score, passed)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 1, 100, true),
  ('a1111111-1111-1111-1111-111111111111', 2, 85, true),
  ('c3333333-3333-3333-3333-333333333333', 1, 95, true),
  ('c3333333-3333-3333-3333-333333333333', 2, 90, true),
  ('c3333333-3333-3333-3333-333333333333', 3, 100, true)
ON CONFLICT DO NOTHING;
