-- CLEANUP FIRST (Using strings to be safe with type-checking)
DELETE FROM quiz_questions WHERE lesson_id IN ('1-1', '1-2', '1-3');
DELETE FROM lessons WHERE module_id::text = '1';
DELETE FROM modules WHERE id::text = '1';

-- Insert Module 1
INSERT INTO modules (id, title, description, intro_video_url, order_index) VALUES
(1, 'Demystifying AI - What It Is and Isn''t (and Why You Don''t Need to Be Scared)', 'Learn the fundamentals of AI and overcome initial anxiety about its complexity.', 'https://youtu.be/UD6mW0ihCww', 1);

-- Insert Lessons for Module 1
INSERT INTO lessons (id, module_id, title, smart_goal, content, video_url, order_index) VALUES
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
<p>It''s crucial to understand that AI, especially in the context of office work, is primarily an <strong>augmentation tool</strong>. It''s designed to extend your abilities, not replace them. Think of it like a calculator for math, a word processor for writing, or a spreadsheet for data. These tools don''t replace your intelligence; they amplify it, allowing you to do more, faster, and with greater accuracy.</p>

<div class="action-box">
<h3>🎯 Action Box</h3>
<p><strong>Task:</strong> Take 5 minutes right now to identify three AI applications you use in your daily life. Write them down. For each one, write a single sentence describing what task it helps you with.</p>
<p><strong>Example:</strong></p>
<ul>
<li>Netflix recommendations: Helps me discover new shows I might enjoy based on my viewing history.</li>
<li>Gmail spam filter: Keeps my inbox clean by automatically identifying and removing unwanted emails.</li>
<li>Google Maps: Finds the fastest route to my destination by analyzing real-time traffic data.</li>
</ul>
</div>',
'https://youtu.be/TJrEb9pLquo', 1),

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
<p>While AI is powerful, it lacks several crucial human qualities:</p>
<ul>
<li><strong>Context and Nuance:</strong> AI doesn''t understand the subtle context of your specific situation, company culture, or personal relationships.</li>
<li><strong>Ethical Reasoning:</strong> AI can''t make ethical judgments or consider the broader implications of decisions.</li>
<li><strong>Creativity and Innovation:</strong> True creativity and out-of-the-box thinking still require human ingenuity.</li>
<li><strong>Emotional Intelligence:</strong> Understanding and responding to human emotions is a uniquely human skill.</li>
</ul>

<div class="action-box">
<h3>🎯 Action Box</h3>
<p><strong>Task:</strong> Think about your typical workday. Identify two specific tasks where AI could help you work faster or more efficiently. For each task, write down:</p>
<ol>
<li>What the task is</li>
<li>How AI could assist you</li>
<li>What part of the task still requires your human judgment</li>
</ol>
<p><strong>Example:</strong></p>
<ul>
<li><strong>Task:</strong> Writing weekly status reports
<ul>
<li><strong>AI Assistance:</strong> Generate a first draft based on my project notes</li>
<li><strong>Human Judgment:</strong> Review for accuracy, add context, adjust tone for my manager</li>
</ul>
</li>
</ul>
</div>',
NULL, 2),

('1-3', 1, 'Your First AI Tool: Introduction to ChatGPT',
'By the end of this lesson, you will have created a free ChatGPT account and successfully executed your first prompt, demonstrating basic interaction with a generative AI tool.',
'<h2>What is ChatGPT?</h2>
<p><strong>ChatGPT</strong> is a conversational AI tool developed by OpenAI. It''s designed to understand and respond to text-based prompts in a natural, human-like way. Think of it as a highly knowledgeable assistant that can help you with a wide range of tasks, from answering questions to drafting content to brainstorming ideas.</p>

<h2>Getting Started with ChatGPT</h2>
<p>The best way to understand ChatGPT is to use it. Here''s how to get started:</p>
<ol>
<li><strong>Create a Free Account:</strong> Go to <a href="https://chat.openai.com" target="_blank">chat.openai.com</a> and sign up for a free account. You''ll need an email address.</li>
<li><strong>Explore the Interface:</strong> Once you''re logged in, you''ll see a simple chat interface. There''s a text box at the bottom where you type your prompts.</li>
<li><strong>Start with a Simple Prompt:</strong> Try asking ChatGPT a question or giving it a task. For example:
<ul>
<li>"Explain the concept of artificial intelligence in simple terms."</li>
<li>"Write a short email to my team about our upcoming meeting."</li>
<li>"Brainstorm five ideas for improving customer service."</li>
</ul>
</li>
</ol>

<h2>Understanding Prompts</h2>
<p>A <strong>prompt</strong> is simply the instruction or question you give to ChatGPT. The quality of the response you get depends heavily on the quality of your prompt. Here are some tips for effective prompts:</p>
<ul>
<li><strong>Be Specific:</strong> The more specific your prompt, the better the response. Instead of "Write an email," try "Write a professional email to my manager requesting a meeting to discuss my project timeline."</li>
<li><strong>Provide Context:</strong> Give ChatGPT relevant background information. For example, "I''m a marketing manager at a tech startup..."</li>
<li><strong>Iterate:</strong> If the first response isn''t quite right, refine your prompt or ask follow-up questions.</li>
</ul>

<h2>Your First Interaction</h2>
<p>Let''s put this into practice. Here''s a simple exercise to get you started:</p>

<div class="action-box">
<h3>🎯 Action Box</h3>
<p><strong>Task:</strong> Create your ChatGPT account and execute your first prompt.</p>
<ol>
<li>Go to <a href="https://chat.openai.com" target="_blank">chat.openai.com</a> and create a free account</li>
<li>Once logged in, type this prompt: "Explain how AI can help me be more productive at work in 3 bullet points."</li>
<li>Read the response and take a screenshot or copy it</li>
<li>Try asking a follow-up question based on the response</li>
</ol>
<p><strong>Reflection:</strong> After completing this exercise, think about how you might use ChatGPT in your daily work. What tasks could it help you with?</p>
</div>',
NULL, 3);

-- Insert Quiz Questions for Lesson 1.1
INSERT INTO quiz_questions (lesson_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index) VALUES
('1-1', 'What is the most accurate definition of Artificial Intelligence (AI)?', 
'A sentient robot that can think and feel like humans',
'A computer system designed to perform tasks that typically require human intelligence',
'A futuristic technology that doesn''t exist yet',
'A replacement for all human workers',
'B', 'AI is a computer system designed to perform tasks that typically require human intelligence, such as learning, problem-solving, and pattern recognition. It''s a tool, not a sentient being.', 1),

('1-1', 'Which of the following is NOT an example of AI in daily life mentioned in the lesson?',
'Face ID on smartphones',
'Netflix recommendations',
'Traditional alarm clocks',
'Google Maps navigation',
'C', 'Traditional alarm clocks are simple timers and do not use AI. The other options all use AI to enhance their functionality.', 2),

('1-1', 'How should we primarily think of AI in the context of office work?',
'As a replacement for human workers',
'As an augmentation tool that extends human capabilities',
'As a threat to job security',
'As entertainment software',
'B', 'AI should be viewed as an augmentation tool that extends and amplifies human capabilities, similar to how a calculator helps with math or a word processor helps with writing.', 3),

('1-1', 'Which streaming service was mentioned as using AI for recommendations?',
'Hulu only',
'Netflix, Spotify, and YouTube',
'Cable TV',
'Radio stations',
'B', 'The lesson specifically mentions Netflix, Spotify, and YouTube as examples of streaming services that use AI to recommend content based on user habits.', 4),

('1-1', 'What is the main purpose of AI as described in the lesson?',
'To replace human intelligence entirely',
'To make humans obsolete',
'To amplify human capabilities and help us do more, faster, and with greater accuracy',
'To create sentient robots',
'C', 'The lesson emphasizes that AI is designed to amplify human capabilities, allowing us to accomplish more tasks faster and with greater accuracy, not to replace humans.', 5);

-- Insert Quiz Questions for Lesson 1.2
INSERT INTO quiz_questions (lesson_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index) VALUES
('1-2', 'What is the best metaphor for AI in the workplace according to the lesson?',
'A replacement pilot',
'A co-pilot',
'A passenger',
'An autopilot system',
'B', 'The lesson uses the co-pilot metaphor to emphasize that AI assists you in your work but doesn''t replace you. You remain in control and make final decisions.', 1),

('1-2', 'What does "augmentation" mean in the context of AI?',
'Replacing human workers',
'Enhancing or extending existing human capabilities',
'Making tasks more complicated',
'Eliminating the need for human judgment',
'B', 'Augmentation means enhancing or extending your existing capabilities. AI tools help you work faster and more efficiently without replacing your role.', 2),

('1-2', 'Which of the following is NOT a capability that AI lacks according to the lesson?',
'Context and nuance understanding',
'Analyzing large datasets',
'Ethical reasoning',
'Emotional intelligence',
'B', 'AI is actually very good at analyzing large datasets to identify trends. However, it lacks context understanding, ethical reasoning, and emotional intelligence.', 3),

('1-2', 'What is one way AI can augment your work?',
'By making all decisions for you',
'By speeding up repetitive tasks like data entry',
'By eliminating the need for creativity',
'By removing human oversight',
'B', 'AI can speed up repetitive tasks such as data entry, formatting, or scheduling, allowing you to focus on higher-level work that requires human judgment.', 4),

('1-2', 'Why is human judgment still essential when working with AI?',
'Because AI is always wrong',
'Because AI lacks context, ethical reasoning, creativity, and emotional intelligence',
'Because AI is too expensive',
'Because AI doesn''t work well',
'B', 'Human judgment remains essential because AI lacks several crucial qualities: understanding context and nuance, making ethical judgments, true creativity, and emotional intelligence.', 5);

-- Insert Quiz Questions for Lesson 1.3
INSERT INTO quiz_questions (lesson_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index) VALUES
('1-3', 'What is ChatGPT?',
'A social media platform',
'A conversational AI tool developed by OpenAI',
'A video game',
'A smartphone app for texting',
'B', 'ChatGPT is a conversational AI tool developed by OpenAI that can understand and respond to text-based prompts in a natural, human-like way.', 1),

('1-3', 'What is a "prompt" in the context of ChatGPT?',
'A notification on your phone',
'The instruction or question you give to ChatGPT',
'A type of AI model',
'A payment method',
'B', 'A prompt is the instruction or question you give to ChatGPT. The quality of your prompt directly affects the quality of the response you receive.', 2),

('1-3', 'Which of the following is a tip for creating effective prompts?',
'Be as vague as possible',
'Be specific and provide context',
'Use only single words',
'Never ask follow-up questions',
'B', 'Effective prompts are specific and include relevant context. This helps ChatGPT understand exactly what you need and provide better responses.', 3),

('1-3', 'Where do you go to create a ChatGPT account?',
'google.com',
'facebook.com',
'chat.openai.com',
'chatgpt.org',
'C', 'You can create a free ChatGPT account at chat.openai.com. You''ll need an email address to sign up.', 4),

('1-3', 'What should you do if ChatGPT''s first response isn''t quite right?',
'Give up and stop using it',
'Refine your prompt or ask follow-up questions',
'Delete your account',
'Use the same prompt repeatedly',
'B', 'If the first response isn''t quite right, you should refine your prompt or ask follow-up questions. ChatGPT is designed for iterative conversation.', 5);
