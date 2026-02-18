-- 1. ADD COLUMNS TO TABLES
ALTER TABLE modules ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. UPDATE MODULE DATA
UPDATE modules 
SET thumbnail_url = '/images/module1_hero.png'
WHERE id = 1;

-- 3. UPDATE LESSON DATA WITH IMAGE URLS
UPDATE lessons SET image_url = '/images/lesson1_1.png' WHERE id = '1-1';
UPDATE lessons SET image_url = '/images/lesson1_2.png' WHERE id = '1-2';
UPDATE lessons SET image_url = '/images/lesson1_3.png' WHERE id = '1-3';

-- 4. RE-IMPORT FULL CONTENT (to make sure everything is clean and escaped)
-- This includes the fix for the previous issue with single quotes and types
DELETE FROM quiz_questions WHERE lesson_id IN ('1-1', '1-2', '1-3');
DELETE FROM lessons WHERE module_id::text = '1';
DELETE FROM modules WHERE id::text = '1';

INSERT INTO modules (id, title, description, intro_video_url, thumbnail_url, order_index) VALUES
(1, 'Demystifying AI - What It Is and Isn''t (and Why You Don''t Need to Be Scared)', 'Learn the fundamentals of AI and overcome initial anxiety about its complexity.', 'https://youtu.be/UD6mW0ihCww', '/images/module1_hero.png', 1);

INSERT INTO lessons (id, module_id, title, smart_goal, content, video_url, image_url, order_index) VALUES
('1-1', 1, 'AI in Your Daily Life: Beyond Hype', 
'By the end of this lesson, you will be able to identify at least three common AI applications in your daily life and articulate in one sentence how AI functions as a tool to augment human capabilities, thereby reducing initial anxiety about AI''s complexity.',
'<h2>What is AI, Really?</h2>
<p>Forget the robots from sci-fi movies. At its core, <strong>Artificial Intelligence</strong> is simply a computer system designed to perform tasks that typically require human intelligence. This includes things like learning, problem-solving, understanding language, and recognizing patterns. Think of it as a very smart tool, not a sentient being.</p>

<h2>Where is AI Hiding in Plain Sight?</h2>
<p>AI isn''t some futuristic technology; it''s woven into the fabric of our everyday lives. You''ve probably interacted with it countless times without even realizing it.</p>
<ul>
<li><strong>Your Smartphone:</strong> Face ID, voice assistants (Siri, Google Assistant), predictive text, and even the way your camera optimizes photos all use AI.</li>
<li><strong>Streaming Services:</strong> Netflix, Spotify, and YouTube use AI to recommend movies, music, and videos based on your viewing and listening habits.</li>
<li><strong>Online Shopping:</strong> When Amazon suggests products you might like, that''s AI at work.</li>
<li><strong>Email Spam Filters:</strong> AI helps keep your inbox clean by identifying and filtering out unwanted emails.</li>
<li><strong>Navigation Apps:</strong> Google Maps or Waze use AI to analyze traffic patterns and suggest the fastest routes.</li>
</ul>

<h2>AI as a Tool: Augmenting Human Capabilities</h2>
<p>It''s crucial to understand that AI, especially in the context of office work, is primarily an <strong>augmentation tool</strong>. It''s designed to extend your abilities, not replace them. Think of it like a calculator for math, a word processor for writing, or a spreadsheet for data. These tools don''t replace your intelligence; they amplify it, allowing you to do more, faster, and with greater accuracy.</p>',
'https://youtu.be/TJrEb9pLquo', '/images/lesson1_1.png', 1),

('1-2', 1, 'The Human-AI Partnership: Your New Co-Pilot',
'By the end of this lesson, you will be able to identify at least two specific tasks in your current workflow where AI could act as a co-pilot to augment your work, and articulate in one sentence why human oversight remains essential in the AI partnership.',
'<h2>AI as Your Co-Pilot, Not Your Replacement</h2>
<p>The most effective way to think about AI in the workplace is as a <strong>co-pilot</strong>. Just like a co-pilot in an airplane assists the captain but doesn''t replace them, AI assists you in your work but doesn''t take over your role. You remain in control, making the final decisions and providing the critical thinking that AI cannot replicate.</p>

<h2>What Does "Augmentation" Really Mean?</h2>
<p><strong>Augmentation</strong> means enhancing or extending your existing capabilities. AI tools are designed to:</p>
<ul>
<li><strong>Speed up repetitive tasks:</strong> Automate data entry, formatting, or scheduling.</li>
<li><strong>Provide insights:</strong> Analyze large datasets to identify trends you might miss.</li>
<li><strong>Generate drafts:</strong> Create initial versions of emails, reports, or presentations that you can refine.</li>
<li><strong>Offer suggestions:</strong> Recommend next steps, potential solutions, or alternative approaches.</li>
</ul>

<h2>Why Human Judgment is Irreplaceable</h2>
<p>While AI is powerful, it lacks several crucial human qualities: Context and Nuance, Ethical Reasoning, Creativity and Innovation, and Emotional Intelligence. Understanding and responding to human emotions is a uniquely human skill.</p>',
NULL, '/images/lesson1_2.png', 2),

('1-3', 1, 'Your First AI Tool: Introduction to ChatGPT',
'By the end of this lesson, you will have created a free ChatGPT account and successfully executed your first prompt, demonstrating basic interaction with a generative AI tool.',
'<h2>What is ChatGPT?</h2>
<p><strong>ChatGPT</strong> is a conversational AI tool developed by OpenAI. It''s designed to understand and respond to text-based prompts in a natural, human-like way. Think of it as a highly knowledgeable assistant that can help you with a wide range of tasks, from answering questions to drafting content to brainstorming ideas.</p>

<h2>Getting Started with ChatGPT</h2>
<ol>
<li><strong>Create a Free Account:</strong> Go to <a href="https://chat.openai.com" target="_blank">chat.openai.com</a> and sign up for a free account.</li>
<li><strong>Explore the Interface:</strong> There''s a text box at the bottom where you type your prompts.</li>
<li><strong>Understanding Prompts:</strong> A prompt is simply the instruction or question you give to ChatGPT. The quality of the response depends on the quality of your prompt.</li>
</ol>',
NULL, '/images/lesson1_3.png', 3);

-- 5. RELOAD QUIZZES
-- Lesson 1.1 Quizzes
INSERT INTO quiz_questions (lesson_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index) VALUES
('1-1', 'What is the most accurate definition of Artificial Intelligence (AI)?', 'A sentient robot that can think and feel like humans', 'A computer system designed to perform tasks that typically require human intelligence', 'A futuristic technology that doesn''t exist yet', 'A replacement for all human workers', 'B', 'AI is a computer system designed to perform tasks that typically require human intelligence, such as learning, problem-solving, and pattern recognition.', 1),
('1-1', 'Which of the following is NOT an example of AI in daily life mentioned in the lesson?', 'Face ID on smartphones', 'Netflix recommendations', 'Traditional alarm clocks', 'Google Maps navigation', 'C', 'Traditional alarm clocks are simple timers and do not use AI.', 2),
('1-1', 'How should we primarily think of AI in the context of office work?', 'As a replacement for human workers', 'As an augmentation tool that extends human capabilities', 'As a threat to job security', 'As entertainment software', 'B', 'AI should be viewed as an augmentation tool that extends and amplifies human capabilities.', 3),
('1-1', 'Which streaming service was mentioned as using AI for recommendations?', 'Hulu only', 'Netflix, Spotify, and YouTube', 'Cable TV', 'Radio stations', 'B', 'The lesson specifically mentions Netflix, Spotify, and YouTube as examples of AI-driven recommendations.', 4),
('1-1', 'What is the main purpose of AI as described in the lesson?', 'To replace human intelligence entirely', 'To make humans obsolete', 'To amplify human capabilities and help us do more, faster, and with greater accuracy', 'To create sentient robots', 'C', 'The lesson emphasizes that AI is designed to amplify human capabilities.', 5);

-- Lesson 1.2 Quizzes
INSERT INTO quiz_questions (lesson_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index) VALUES
('1-2', 'What is the best metaphor for AI in the workplace?', 'A replacement pilot', 'A co-pilot', 'A passenger', 'An autopilot system', 'B', 'The co-pilot assists the captain but doesn''t replace them. You remain in control.', 1),
('1-2', 'What does "augmentation" mean in the context of AI?', 'Replacing human workers', 'Enhancing or extending existing human capabilities', 'Making tasks more complicated', 'Eliminating the need for human judgment', 'B', 'Augmentation means enhancing or extending your existing capabilities.', 2),
('1-2', 'Which of these is a capability that AI lacks?', 'Analyzing large datasets', 'Context, nuance, and ethical reasoning', 'Providing rapid suggestions', 'Automating repetitive data entry', 'B', 'AI is great at data analysis but lacks the human ability to understand deep context and ethics.', 3),
('1-2', 'One major benefit of AI in office work is:', 'It removes the need for human decisions', 'It can speed up repetitive tasks like data entry', 'It replaces the need for creative brainstorming', 'It operates entirely without human oversight', 'B', 'AI excels at speeding up repetitive, low-level tasks.', 4),
('1-2', 'Why is human judgment still essential?', 'Because AI is always wrong', 'Because AI lacks context and emotional intelligence', 'Because AI is too expensive', 'Because AI doesn''t work well with data', 'B', 'Human judgment provides the ethical and emotional context that AI cannot replicate.', 5);

-- Lesson 1.3 Quizzes
INSERT INTO quiz_questions (lesson_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index) VALUES
('1-3', 'What is ChatGPT?', 'A social media platform', 'A conversational AI tool developed by OpenAI', 'A video game', 'A smartphone app for texting', 'B', 'ChatGPT is a conversational AI model designed for natural language interaction.', 1),
('1-3', 'What is a "prompt" in the context of ChatGPT?', 'A notification on your phone', 'The instruction or question you give to ChatGPT', 'A type of computer hardware', 'A payment method', 'B', 'A prompt is the command or question you type into the interface.', 2),
('1-3', 'Which of the following is a tip for better results with ChatGPT?', 'Be as vague as possible', 'Be specific and provide relevant context', 'Use only one-word prompts', 'Avoid using follow-up questions', 'B', 'Specific prompts with clear context yield much higher quality results.', 3),
('1-3', 'Where do you go to create a free ChatGPT account?', 'google.com', 'chat.openai.com', 'facebook.com', 'apple.com', 'B', 'OpenAI hosts ChatGPT at chat.openai.com.', 4),
('1-3', 'If the first response from ChatGPT isn''t right, you should:', 'Give up immediately', 'Refine your prompt or ask follow-up questions', 'Report it as a broken website', 'Type the exact same prompt again', 'B', 'Iterating and refining prompts is a key part of the process.', 5);
