-- OFFICEAIM CAMPUS - FULL CURRICULUM SEED (9 LESSONS)
-- "AI Fear Buster: From Anxiety to Confidence"

-- 1. Clear existing lessons to avoid conflicts
TRUNCATE TABLE lessons CASCADE;

-- 2. Insert Lessons
INSERT INTO lessons (id, course_id, module_number, lesson_number, title, content, action_box, ai_prompt, video_url, order_index)
VALUES 
-- MODULE 1: THE MINDSET SHIFT
('1-1', 'fear-buster', 1, 1, 'The Human-Centric AI: Why You Are the Pilot', 'Most people fear AI because they think it''s a replacement. In reality, AI is a "Co-Pilot" that requires a skilled Captain. This lesson explains how your unique human judgment is the most valuable asset in the AI era.', 'Identify one task you do daily that feels like "Boring Logistics." Mentally reframe it as a task your Co-Pilot should handle.', 'Act as a professional career coach. Explain how AI "augmentation" differs from "automation" using a bicycle/engine analogy.', '/images/module1_hero_anxiety_to_confidence.png', 1),

('1-2', 'fear-buster', 1, 2, 'The 15-Criteria Rubric: How We Define Excellence', 'AI can produce quantity, but only you can ensure quality. We use a proprietary 15-criteria rubric to grade AI output. You will learn to spot "AI Halucinations" and "Generic Fluff" within seconds.', 'Download the 15-Criteria PDF and apply it to the next email draft you get from an AI.', 'Review this block of text [PASTE TEXT] using the "OfficeAIM Quality Rubric." Focus on clarity, tone, and specific actionable advice.', '/images/example_1.webp', 2),

('1-3', 'fear-buster', 1, 3, 'Anxiety Diffusion: The "Sandwich" Strategy', 'When you feel overwhelmed by a new tool, use the Sandwich Strategy: Do the first 5% manually, let AI do the middle 90%, and finish the final 5% manually. This keeps you in control while maximizing speed.', 'Apply the Sandwich Strategy to a project status update today.', 'I have drafted the first paragraph of an update: [PASTE 5%]. Please generate the detailed middle section based on these notes: [PASTE NOTES].', '/images/example_2.webp', 3),

-- MODULE 2: REGAINING TIME (VELOCITY)
('2-1', 'fear-buster', 2, 1, 'Drafting at 10x: The "Verbal Dump" Technique', 'Stop staring at a blank page. The Verbal Dump Technique involves speaking your messy thoughts into a transcript and letting AI structure it into a professional document. Velocity starts here.', 'Record a 2-minute voice note about a project. Use the prompt below to turn it into a memo.', 'Structure the following messy voice transcript into a professional internal memo with headers, bullet points, and a clear call to action: [PASTE TRANSCRIPT].', '/images/module2_hero_velocity.png', 4),

('2-2', 'fear-buster', 2, 2, 'Inbox Zero... For Real: AI Email Triage', 'Learn how to use AI as a "Chief of Staff" that categorizes your emails by urgency and drafts replies before you even open them. We focus on moving from "Reactive" to "Proactive" communication.', 'Set up a basic email sorting prompt. Test it on your 5 most recent unread emails.', 'Act as a Chief of Staff. Categorize these 10 emails into: Must Reply (Urgent), Informational (Read later), or Low Value. Draft a 1-sentence summary for each: [PASTE EMAILS].', '/images/example_3.webp', 5),

('2-3', 'fear-buster', 2, 3, 'The Prompt Vault: Building Your Library', 'Don''t reinvent the wheel every time. Successful AI users build a "Prompt Vault." We show you how to categorize prompts by "Energy Level" so you know exactly which one to pull when you''re tired.', 'Create a folder on your desktop called "Prompt Vault" and save today''s most useful prompt.', 'Create a library of 5 prompt templates for common office tasks: Agenda Setting, Conflict Resolution, Data Summary, Research, and Scheduling.', '/images/example_4.webp', 6),

-- MODULE 3: THE PROMOTABLE SKILLS
('3-1', 'fear-buster', 3, 1, 'Strategic Synthesis: Making Sense of Chaos', 'The most promotable skill today is the ability to synthesize massive amounts of data into strategic insights. AI is the tool; your brain is the filter. Learn the "3-Point Synthesis" method.', 'Take a long report or article. Use AI to find the 3 points that actually matter for your boss.', 'Synthesize this meeting transcript into 3 key strategic pillars, 2 potential risks, and 1 recommendation for the Executive Team: [PASTE TRANSCRIPT].', '/images/example_5.webp', 7),

('3-2', 'fear-buster', 3, 2, 'The Behavior UX: Designing Your Custom Workflow', 'In this lesson, you design your own "Agentic Workflow" using the 8 Agents in our HQ. You will learn which agent to call for which specific office crisis.', 'Sketch out a workflow that connects the Project Manager agent to the SEO Master agent.', 'Create a step-by-step workflow for launching a new internal newsletter, identifying which AI specialized role handles each stage.', '/images/example_6.webp', 8),

('3-3', 'fear-buster', 3, 3, 'Founding Member Mastery: The Road Ahead', 'Final Lesson. You have moved from AI Anxiety to AI Confidence. We discuss how to maintain your "Founding Member" edge as tech changes. Welcome to the 1% of office professionals who actually "get it."', 'Write a "Commitment Letter" to yourself about how you will use AI in the next 30 days.', 'Draft a 1-year professional development plan that keeps me at the forefront of AI office automation, focusing on augmentation rather than substitution.', '/images/example_7.webp', 9);

-- 3. Update Course Progress Stats (Simulated)
-- Normally this would happen via n8n or app logic, but for the seed we ensure courses are visible.
INSERT INTO courses (id, title, description, slug, is_premium)
VALUES 
('fear-buster', 'AI Fear Buster: From Anxiety to Confidence', 'Gateway course for office professionals.', 'fear-buster', FALSE),
('productivity-sprint', 'The AI Productivity Sprint', 'Advanced office workflows.', 'productivity-sprint', TRUE) 
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;
