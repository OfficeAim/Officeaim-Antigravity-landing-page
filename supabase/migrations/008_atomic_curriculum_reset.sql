-- OfficeAIM: SUPREME CURRICULUM MASTER SEED (Final Verified Version)
-- Part 1: Modules & Lessons | Part 2: Quizzes (Full Restoration)
-- Total Lessons: 6 | Total Quiz Questions: 30

-- 1. [CLEANUP] Atomic Wipe
DELETE FROM quiz_questions;
DELETE FROM lessons;
DELETE FROM modules;

-- 2. [MODULES]
INSERT INTO modules (id, title, description, intro_video_url, order_index) VALUES 
(1, 'Módulo 1: Demystifying AI - What It Is and Isn''t', 'Learn the fundamentals of AI and overcome initial anxiety about its complexity.', 'https://drive.google.com/file/d/1oSXuFw2cUxUqi1t3_7dKilhW5Rp3hpEN/preview', 1),
(2, 'Módulo 2: Quick Wins - Immediate AI Productivity Boosts', 'Master your inbox, calendar, and document creation with immediate results.', NULL, 2),
(3, 'Módulo 3: Strategic AI Integration', 'Upgrade for advanced workflows.', NULL, 3);

-- 3. [LESSONS MODULE 1]
INSERT INTO lessons (id, module_id, title, smart_goal, content, video_url, order_index) VALUES
('1-1', 1, 'AI in Your Daily Life: Beyond Hype', 
'By the end of this lesson, you will be able to identify at least three common AI applications in your daily life and articulate in one sentence how AI functions as a tool to augment human capabilities.', 
$$<div class="prose prose-invert max-w-none">
    <h2>What is AI, Really?</h2>
    <p>Forget the robots from sci-fi movies. At its core, <strong>Artificial Intelligence</strong> is simply a computer system designed to perform tasks that typically require human intelligence. This includes things like learning, problem-solving, understanding language, and recognizing patterns. Think of it as a very smart tool, not a sentient being.</p>

    <h2>Where is AI Hiding in Plain Sight?</h2>
    <p>AI isn't some futuristic technology; it's woven into the fabric of our everyday lives. You've probably interacted with it countless times without even realizing it.</p>
    <ul>
        <li><strong>Your Smartphone:</strong> Face ID, voice assistants (Siri, Google Assistant), predictive text, and even the way your camera optimizes photos all use AI.</li>
        <li><strong>Streaming Services:</strong> Netflix, Spotify, and YouTube use AI to recommend movies, music, and videos based on your viewing and listening habits.</li>
        <li><strong>Online Shopping:</strong> When Amazon suggests products you might like, that's AI at work.</li>
        <li><strong>Email Spam Filters:</strong> AI helps keep your inbox clean by identifying and filtering out unwanted emails.</li>
        <li><strong>Navigation Apps:</strong> Google Maps or Waze use AI to analyze traffic patterns and suggest the fastest routes.</li>
    </ul>

    <h2>AI as a Tool: Augmenting Human Capabilities</h2>
    <p>It's crucial to understand that AI, especially in the context of office work, is primarily an <strong>augmentation tool</strong>. It's designed to extend your abilities, not replace them. Think of it like a calculator for math, a word processor for writing, or a spreadsheet for data. These tools don't replace your intelligence; they amplify it, allowing you to do more, faster, and with greater accuracy.</p>

    <div class="action-box bg-indigo-900/40 p-8 rounded-2xl border border-indigo-500/30 my-8">
        <h3 class="text-accent-secondary mt-0">🎯 Action Box: Spot the AI!</h3>
        <p><strong>Task:</strong> Take 5 minutes right now to identify three AI applications you use in your daily life. Write them down. For each one, write a single sentence describing what task it helps you with.</p>
        <p><strong>Example:</strong></p>
        <ul>
            <li>Netflix recommendations: Helps me discover new shows I might enjoy based on my viewing history.</li>
            <li>Gmail spam filter: Keeps my inbox clean by automatically identifying and removing unwanted emails.</li>
        </ul>
    </div>
</div>$$, 'https://drive.google.com/file/d/194EzdUf-DBPafCBZjN48Gnbb99pD1SHX/preview', 1),

('1-2', 1, 'The Human-AI Partnership: Your New Co-Pilot',
'By the end of this lesson, you will be able to identify at least two specific tasks in your current workflow where AI could act as a co-pilot to augment your work, and articulate in one sentence why human oversight remains essential in the AI partnership.',
$$<div class="prose prose-invert max-w-none">
    <h2>AI as Your Co-Pilot, Not Your Replacement</h2>
    <p>The most effective way to think about AI in the workplace is as a <strong>co-pilot</strong>. Just like a co-pilot in an airplane assists the captain but doesn't replace them, AI assists you in your work but doesn't take over your role. You remain in control, making the final decisions and providing the critical thinking that AI cannot replicate.</p>

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
        <li><strong>Context and Nuance:</strong> AI doesn't understand the subtle context of your specific situation, company culture, or personal relationships.</li>
        <li><strong>Ethical Reasoning:</strong> AI can't make ethical judgments or consider the broader implications of decisions.</li>
        <li><strong>Creativity and Innovation:</strong> True creativity and out-of-the-box thinking still require human ingenuity.</li>
        <li><strong>Emotional Intelligence:</strong> Understanding and responding to human emotions is a uniquely human skill.</li>
    </ul>

    <div class="action-box bg-indigo-900/40 p-8 rounded-2xl border border-indigo-500/30 my-8">
        <h3 class="text-accent-secondary mt-0">🎯 Action Box: Workflow Audit</h3>
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
    </div>
</div>$$, 'https://drive.google.com/file/d/1T1znOk9neze9Uz4SvHHAnTyhUfKoCSCM/preview', 2),

('1-3', 1, 'Your First AI Tool: Introduction to ChatGPT',
'By the end of this lesson, you will have created a free ChatGPT account and successfully executed your first prompt, demonstrating basic interaction with a generative AI tool.',
$$<div class="prose prose-invert max-w-none">
    <h2>What is ChatGPT?</h2>
    <p><strong>ChatGPT</strong> is a conversational AI tool developed by OpenAI. It's designed to understand and respond to text-based prompts in a natural, human-like way. Think of it as a highly knowledgeable assistant that can help you with a wide range of tasks, from answering questions to drafting content to brainstorming ideas.</p>

    <h2>Getting Started with ChatGPT</h2>
    <p>The best way to understand ChatGPT is to use it. Here's how to get started:</p>
    <ol>
        <li><strong>Create a Free Account:</strong> Go to <a href="https://chat.openai.com" target="_blank">chat.openai.com</a> and sign up for a free account. You'll need an email address.</li>
        <li><strong>Explore the Interface:</strong> Once you're logged in, you'll see a simple chat interface. There's a text box at the bottom where you type your prompts.</li>
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
        <li><strong>Provide Context:</strong> Give ChatGPT relevant background information. For example, "I'm a marketing manager at a tech startup..."</li>
        <li><strong>Iterate:</strong> If the first response isn't quite right, refine your prompt or ask follow-up questions.</li>
    </ul>

    <h2>Your First Interaction</h2>
    <p>Let's put this into practice. Here's a simple exercise to get you started:</p>

    <div class="action-box bg-indigo-900/40 p-8 rounded-2xl border border-indigo-500/30 my-8">
        <h3 class="text-accent-secondary mt-0">🎯 Action Box: Your First Interaction</h3>
        <p><strong>Task:</strong> Create your ChatGPT account and execute your first prompt.</p>
        <ol>
            <li>Go to <a href="https://chat.openai.com" target="_blank">chat.openai.com</a> and create a free account</li>
            <li>Once logged in, type this prompt: "Explain how AI can help me be more productive at work in 3 bullet points."</li>
            <li>Read the response and take a screenshot or copy it</li>
            <li>Try asking a follow-up question based on the response</li>
        </ol>
        <p><strong>Reflection:</strong> After completing this exercise, think about how you might use ChatGPT in your daily work. What tasks could it help you with?</p>
    </div>
</div>$$, 'https://drive.google.com/file/d/1Yf1B9D7vp3hpK8eVB1Jl7AhqKA7GoBDP/preview', 3);

-- 4. [LESSONS MODULE 2]
INSERT INTO lessons (id, module_id, title, smart_goal, content, video_url, order_index) VALUES
('2-1', 2, 'Email Management with AI: Taming Your Inbox', 
'By the end of this lesson, you will be able to utilize an AI tool to draft a professional email response and summarize a lengthy email thread, demonstrating how AI can save you 15+ minutes daily on email management.', 
$$<div class="prose prose-invert max-w-none">
    <h2>Why Email is the #1 Productivity Killer</h2>
    <p>The average office worker spends <strong>2.5 hours per day</strong> reading and responding to emails. That's over 30% of your workday consumed by your inbox. But here's the good news: AI can dramatically reduce this time by handling the repetitive, time-consuming aspects of email management while you focus on the decisions that truly matter.</p>

    <h2>AI as Your Email Assistant</h2>
    <p>Think of AI as your personal email assistant who never sleeps, never gets tired, and can process information in seconds. Here's what AI can do for your inbox:</p>
    <ul>
        <li><strong>Draft Responses:</strong> Generate polite, professional replies based on the context of incoming emails. You review, adjust, and send — cutting drafting time by 70%.</li>
        <li><strong>Summarize Long Threads:</strong> Condense lengthy email conversations with multiple participants into concise bullet points. No more scrolling through 20+ emails to find the key decisions.</li>
        <li><strong>Improve Your Writing:</strong> Suggest tone adjustments, fix grammar, and make your messages more concise and professional.</li>
        <li><strong>Prioritize Your Inbox:</strong> Help you identify which emails need urgent attention and which can wait.</li>
    </ul>

    <h2>The 3-Step Email AI Workflow</h2>
    <p>Here's a simple process to integrate AI into your daily email routine:</p>
    <ol>
        <li><strong>Scan & Sort:</strong> Open your inbox and identify emails that need responses. Group them by type (quick replies, detailed responses, FYI only).</li>
        <li><strong>AI Draft:</strong> For each email needing a response, paste the incoming email into ChatGPT with a clear prompt describing the response you need.</li>
        <li><strong>Review & Send:</strong> Read the AI draft, adjust for your personal voice and any specific context the AI might not know, then send.</li>
    </ol>

    <h2>Real-World Examples</h2>
    <p>Let's look at common email scenarios where AI shines:</p>
    <ul>
        <li><strong>Client follow-ups:</strong> "Draft a professional follow-up email to a client who hasn't responded in 5 days about our proposal."</li>
        <li><strong>Meeting recaps:</strong> "Summarize this meeting discussion and create action items with assignees."</li>
        <li><strong>Difficult conversations:</strong> "Help me write a diplomatic response declining a request while maintaining the relationship."</li>
    </ul>

    <div class="action-box bg-indigo-900/40 p-8 rounded-2xl border border-indigo-500/30 my-8">
        <h3 class="text-accent-secondary mt-0">🎯 Action Box: Draft an Email Response!</h3>
        <p><strong>Scenario:</strong> A client is asking for an update on a project that's slightly behind schedule.</p>
        <p><strong>Instructions:</strong></p>
        <ol>
            <li>Open ChatGPT (or your preferred AI tool)</li>
            <li>Copy and paste this prompt:</li>
        </ol>
        <pre class="bg-black/50 p-4 rounded text-xs">"Act as a professional assistant. Draft a polite response to a client who is asking for a project status update. The project is slightly behind schedule due to an unexpected technical challenge. Acknowledge the delay honestly, reassure them of the quality of work, and promise to deliver a detailed recovery plan by end of day. Keep the tone professional but warm."</pre>
        <ol start="3">
            <li>Review the AI's draft — does it match your communication style?</li>
            <li>Adjust any specific details (project name, timeline, etc.)</li>
        </ol>
    </div>

    <div class="action-box bg-emerald-900/40 p-8 rounded-2xl border border-emerald-500/30 my-8">
        <h3 class="text-accent-secondary mt-0">🚀 Try Our Email Prompt Generator!</h3>
        <p>Want a faster way to build email prompts? We've built a <strong>Prompt Generator</strong> right into the OfficeAIM platform that helps you create professional email prompts in seconds — no need to type them from scratch.</p>
        <p><a href="/#demo" target="_blank" style="color: #22d3ee; text-decoration: underline; font-weight: bold;">👉 Open the OfficeAIM Prompt Generator</a></p>
        <p><strong>How to use it:</strong></p>
        <ol>
            <li>Select the type of email you need (follow-up, response, request, etc.)</li>
            <li>Fill in the context fields</li>
            <li>Copy the generated prompt and paste it into ChatGPT</li>
            <li>Review, adjust, and send!</li>
        </ol>
        <p class="text-sm text-text-muted italic">💡 Tip: Use the Prompt Generator for quick emails, and ChatGPT directly for more complex or nuanced conversations.</p>
    </div>

    <div class="action-box bg-indigo-900/40 p-8 rounded-2xl border border-indigo-500/30 my-8">
        <h3 class="text-accent-secondary mt-0">🎯 Action Box: Summarize an Email Thread!</h3>
        <p><strong>Task:</strong> Find a long email thread in your inbox (5+ messages). Then use this prompt:</p>
        <pre class="bg-black/50 p-4 rounded text-xs">"Act as a project coordinator. Summarize the following email thread into 3-5 key bullet points. Identify: (1) the main topic, (2) key decisions made, (3) any outstanding action items, and (4) who is responsible for what. [Paste Thread Here]"</pre>
        <p><strong>Reflection:</strong> How much time did the AI save you compared to reading the entire thread manually? Imagine doing this for every long thread in your day.</p>
    </div>
</div>$$, 'https://drive.google.com/file/d/1EMjlHPZ-VHbUqbTaQlm0xvxbCoNYs562/preview', 1),

('2-2', 2, 'Calendar & Scheduling: Your AI-Powered Assistant', 
'By the end of this lesson, you will be able to identify at least two specific scheduling challenges in your workflow and formulate an AI prompt that finds the optimal meeting time, reducing scheduling friction by 50%.', 
$$<div class="prose prose-invert max-w-none">
    <h2>The Scheduling Nightmare</h2>
    <p>Have you ever spent 15 minutes going back and forth trying to find a meeting time that works for everyone? You're not alone. <strong>Scheduling coordination</strong> is one of the most frustrating and time-wasting activities in office life. The more people involved, the worse it gets — finding a slot for 4+ people can feel like solving a puzzle.</p>

    <h2>How AI Transforms Your Calendar</h2>
    <p>AI scheduling tools can analyze multiple busy calendars, consider time zones, respect preferences, and find the best possible meeting slots in seconds. Here's how AI can help:</p>
    <ul>
        <li><strong>Finding Optimal Times:</strong> AI can analyze multiple calendars simultaneously and identify windows where all participants are available, considering factors like buffer time between meetings.</li>
        <li><strong>Managing Conflicts:</strong> When there's no perfect slot, AI can suggest alternatives — like splitting a meeting into two shorter sessions or identifying the slot with the fewest conflicts.</li>
        <li><strong>Protecting Your Focus Time:</strong> AI can block out "deep work" periods on your calendar and only suggest meeting slots outside those times.</li>
        <li><strong>Handling Time Zones:</strong> For international teams, AI can automatically convert time zones and find slots that work across regions.</li>
    </ul>

    <h2>AI Scheduling in Practice</h2>
    <p>You don't need special scheduling software to start. You can use ChatGPT to help you think through scheduling challenges:</p>
    <ul>
        <li><strong>Planning weekly agendas:</strong> "Help me organize my week. I have these 8 meetings to schedule and these 3 blocks of focus time I need to protect."</li>
        <li><strong>Handling conflicts:</strong> "I have two meeting invites at 2 PM on Tuesday. Help me draft a message to reschedule the less urgent one."</li>
        <li><strong>Preparing for meetings:</strong> "Based on this meeting agenda, help me prepare 3 key talking points and 2 questions to ask."</li>
    </ul>

    <h2>The "No Agenda, No Meeting" Rule</h2>
    <p>One of the most powerful productivity habits is refusing meetings without clear agendas. AI can help you enforce this diplomatically:</p>
    <ul>
        <li>Draft polite requests for agendas when meetings are proposed without them</li>
        <li>Suggest agenda templates based on the meeting type</li>
        <li>Summarize what decisions need to be made before the meeting starts</li>
    </ul>

    <div class="action-box bg-indigo-900/40 p-8 rounded-2xl border border-indigo-500/30 my-8">
        <h3 class="text-accent-secondary mt-0">🎯 Action Box: Find the Perfect Meeting Slot!</h3>
        <p><strong>Task:</strong> Think of a real scheduling challenge you've faced recently. Then try this exercise:</p>
        <ol>
            <li>Identify a meeting you need to schedule with 3+ people</li>
            <li>List the constraints (time zones, preferences, deadlines)</li>
            <li>Use this prompt in ChatGPT:</li>
        </ol>
        <pre class="bg-black/50 p-4 rounded text-xs">"Act as a highly efficient executive assistant. I need to schedule a 1-hour meeting with the following constraints: Alice is available Mon/Wed 9-12, Bob is available Mon-Thu 2-5, and Carol is only available Tue/Wed all day. Find the best 3 possible time slots, ranked by how many participants can attend. Also suggest an agenda template for a project kickoff meeting."</pre>
        <p><strong>Reflection:</strong> How does having AI think through scheduling options compare to the back-and-forth email chains you usually deal with?</p>
    </div>
</div>$$, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 2),

('2-3', 2, 'Document Creation Basics: AI Drafting & Refinement', 
'By the end of this lesson, you will be able to generate a first draft of a short business document using AI and refine its tone, length, or structure, reducing your drafting time by approximately 30%.', 
$$<div class="prose prose-invert max-w-none">
    <h2>The Blank Page Problem</h2>
    <p>One of the biggest challenges in office work is <strong>starting from scratch</strong>. Whether it's a project update memo, a presentation outline, or a quarterly report, staring at a blank page can be paralyzing. AI changes this dynamic entirely — instead of creating from zero, you become an <strong>editor</strong> who refines AI-generated drafts.</p>

    <h2>The Diamond Process: Expand → Refine → Polish</h2>
    <p>Think of document creation as a diamond-cutting process with three clear stages:</p>
    <ol>
        <li><strong>Expand (Raw Material):</strong> Give AI your rough notes, bullet points, or ideas. Let it generate a comprehensive first draft that covers all the topics. Don't worry about perfection at this stage — focus on completeness.</li>
        <li><strong>Refine (Shaping):</strong> Review the draft and cut what's unnecessary. Reorganize sections. Add specific details the AI couldn't know. Adjust the structure to match your audience's expectations.</li>
        <li><strong>Polish (Final Cut):</strong> Fine-tune the tone, fix any awkward phrasing, ensure consistency, and add your personal touch. This is where the document goes from "good" to "great."</li>
    </ol>

    <h2>The Editor-in-Chief Mindset</h2>
    <p>The key mental shift is this: <strong>stop writing, start directing</strong>. You're no longer the writer who crafts every sentence — you're the editor-in-chief who:</p>
    <ul>
        <li>Defines the purpose and audience of the document</li>
        <li>Provides the key data points and context</li>
        <li>Reviews and approves the final output</li>
        <li>Ensures quality and accuracy</li>
    </ul>
    <p>This mindset allows you to turn one set of notes into <strong>multiple outputs</strong> simultaneously — a memo for your manager, a slide deck for the team, and a Slack update for stakeholders.</p>

    <h2>Common Document Types AI Can Help With</h2>
    <ul>
        <li><strong>Status Reports:</strong> Weekly/monthly project updates with clear structure</li>
        <li><strong>Meeting Notes:</strong> Organized summaries with action items</li>
        <li><strong>Proposals:</strong> Client-facing documents with professional formatting</li>
        <li><strong>Presentations:</strong> Slide outlines with speaker notes</li>
        <li><strong>SOPs (Standard Operating Procedures):</strong> Step-by-step process documentation</li>
    </ul>

    <div class="action-box bg-indigo-900/40 p-8 rounded-2xl border border-indigo-500/30 my-8">
        <h3 class="text-accent-secondary mt-0">🎯 Action Box: Draft a Project Update Memo!</h3>
        <p><strong>Task:</strong> Create a weekly project update using the Diamond Process.</p>
        <ol>
            <li><strong>Step 1 (Expand):</strong> Use this prompt to generate your first draft:</li>
        </ol>
        <pre class="bg-black/50 p-4 rounded text-xs">"Act as a professional project manager. Draft a weekly project update memo using this information:
- Project name: AI Integration Initiative
- Status: On Track
- Key accomplishment this week: Completed the first pilot test with 5 team members
- Challenge: Training materials need updating for non-technical staff
- Next steps: Roll out to full department by end of month
- Tone: Professional but optimistic"</pre>
        <ol start="2">
            <li><strong>Step 2 (Refine):</strong> Read the draft. Is anything missing? Too long? Ask AI to adjust: "Make this more concise — aim for 150 words maximum."</li>
            <li><strong>Step 3 (Polish):</strong> Add any specific names, dates, or details the AI couldn't know. Adjust the tone to match your company culture.</li>
        </ol>
        <p><strong>Reflection:</strong> How long did it take you to create this memo with AI compared to writing it from scratch? Most people report a 30-50% time savings on their first try, with even greater savings as they refine their prompting skills.</p>
    </div>
</div>$$, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 3);

-- 5. [QUIZZES MODULE 1]
INSERT INTO quiz_questions (lesson_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index) VALUES 
('1-1', 'What is the most accurate definition of AI?', 'Sentient robot', 'Computer system for tasks requiring human intelligence', 'Futuristic myth', 'Human replacement', 'B', 'AI is a smart tool for processing and pattern recognition.', 1),
('1-1', 'Which service uses AI for recommendations?', 'Radio', 'Netflix, Spotify, and YouTube', 'Newspapers', 'Analog TV', 'B', 'Streaming services use AI to learn user habits.', 2),
('1-1', 'How should we primarily think of AI in office work?', 'Replacement', 'Augmentation tool that extends human capabilities', 'Threat', 'Entertainment', 'B', 'AI extends your abilities, like a calculator for math.', 3),
('1-1', 'Which of the following is NOT an AI application mentioned?', 'Face ID', 'Traditional alarm clock', 'Google Maps', 'Predictive text', 'B', 'Traditional alarm clocks are simple timers, not AI.', 4),
('1-1', 'What is the main purpose of AI as described?', 'Replace humans', 'Make humans obsolete', 'Amplify human capabilities', 'Create sentient robots', 'C', 'AI is designed to amplify human intelligence.', 5),

('1-2', 'Best metaphor for AI in the workplace?', 'Pilot', 'Co-pilot', 'Passenger', 'Autopilot', 'B', 'AI assists while you maintain control and oversight.', 1),
('1-2', 'What does "augmentation" mean in AI?', 'Replacing workers', 'Enhancing or extending existing capabilities', 'Making tasks complex', 'Eliminating judgment', 'B', 'It means enhancing your existing reach/speed.', 2),
('1-2', 'Which of the following is NOT a capability AI lacks?', 'Context understanding', 'Analyzing large datasets', 'Ethical reasoning', 'Emotional intelligence', 'B', 'AI is actually very good at analyzing large datasets.', 3),
('1-2', 'How can AI augment your work?', 'Making decisions blindly', 'Speeding up repetitive tasks like data entry', 'Eliminating creativity', 'Removing oversight', 'B', 'It handles the mundane, freeing you for high-level work.', 4),
('1-2', 'Why is human judgment still essential?', 'AI is always wrong', 'AI lacks context and ethical reasoning', 'AI is too expensive', 'AI is slow', 'B', 'Human context and ethics are irreplaceable.', 5),

('1-3', 'What is ChatGPT?', 'Social media', 'Conversational AI tool developed by OpenAI', 'Video game', 'Email provider', 'B', 'It is a large language model designed for dialogue.', 1),
('1-3', 'What is a "prompt" in ChatGPT?', 'Notification', 'Instruction or question given to the AI', 'Payment', 'Type of model', 'B', 'The prompt is the core input for interaction.', 2),
('1-3', 'Tip for effective prompting?', 'Be vague', 'Be specific and provide context', 'Use single words', 'Never follow up', 'B', 'Specificity leads to better, more accurate results.', 3),
('1-3', 'Where do you go to create a ChatGPT account?', 'google.com', 'chat.openai.com', 'facebook.com', 'apple.com', 'B', 'OpenAI hosts the app on their chat subdomain.', 4),
('1-3', 'What to do if the first response isn''t right?', 'Give up', 'Refine your prompt or ask follow-up questions', 'Delete account', 'Repeat exactly', 'B', 'Iteration is key to getting the best output.', 5);

-- 6. [QUIZZES MODULE 2]
INSERT INTO quiz_questions (lesson_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index) VALUES 
('2-1', 'What is the primary benefit of using AI for email management?', 'Eliminating reading entirely', 'Automating mundane tasks like drafting and summarizing', 'Working offline only', 'Personal use only', 'B', 'AI excels at handling repetitive email tasks like drafting responses and summarizing long threads, saving you 15+ minutes daily while you focus on decisions that matter.', 1),
('2-1', 'Which task can AI email assistants perform effectively?', 'Replace all human review', 'Draft replies and summarize long threads', 'Decide email importance by title only', 'Change all styles to informal', 'B', 'AI is excellent at synthesizing information from long threads and generating draft replies, but you should always review and personalize before sending.', 2),
('2-1', 'According to the lesson, how much time can AI save on email daily?', '5 minutes', '15+ minutes', '1 hour', 'No time saved', 'B', 'The lesson targets saving 15+ minutes daily on email management through AI-assisted drafting and summarization — initial efficiency wins that compound over time.', 3),
('2-1', 'What is the primary function of AI when summarizing email threads?', 'Delete the original thread', 'Condense conversation into key points and action items', 'Translate languages', 'Auto-forward emails', 'B', 'AI summarization extracts the key decisions, action items, and responsible parties from long email threads so you don''t have to read every message.', 4),
('2-1', 'What does the co-pilot metaphor imply for AI email management?', 'AI sends everything automatically', 'You review and refine AI-generated drafts before sending', 'AI is the captain of your inbox', 'No human oversight is needed', 'B', 'Just like a co-pilot assists but doesn''t replace the captain, AI drafts emails but you maintain control by reviewing, adjusting tone, and adding context.', 5),

('2-2', 'How does AI streamline the scheduling process?', 'Eliminates all meetings', 'Finds optimal time slots for multiple attendees simultaneously', 'Accepts all invites blindly', 'Works for individuals only', 'B', 'AI can analyze multiple busy calendars at once, considering factors like time zones, buffer time, and preferences to find the best available slots.', 1),
('2-2', 'What is a key capability of AI scheduling tools?', 'Suggesting solutions for scheduling conflicts', 'Only sending manual emails', 'Ignoring certain participants', 'Attending meetings on your behalf', 'A', 'When there''s no perfect slot, AI can suggest creative alternatives like splitting meetings or identifying the slot with the fewest conflicts.', 2),
('2-2', 'What percentage reduction in scheduling friction does Lesson 2.2 target?', '10%', '50% for simple scenarios', '100%', '0%', 'B', 'The SMART goal targets a 50% reduction in scheduling coordination effort by using AI to analyze calendars and suggest optimal times instead of exchanging emails.', 3),
('2-2', 'Why is finding meeting times described as a "nightmare"?', 'Too many tools exist', 'Multiple busy calendars create complex overlapping constraints', 'No one wants to attend meetings', 'Time zones don''t exist', 'B', 'The more participants involved, the more calendar constraints overlap, making manual coordination exponentially harder — especially across time zones.', 4),
('2-2', 'What defines the "Optimal Slot" in AI scheduling?', 'The longest available time', 'The slot where all participants are free with minimal conflicts', 'A randomly selected time', 'The first empty slot found', 'B', 'An optimal slot maximizes attendee availability while respecting preferences like buffer time between meetings and protected focus time.', 5),

('2-3', 'What mindset should you adopt for AI document creation?', 'Typing faster', 'Editor-in-Chief who directs and refines', 'Complete outsourcing', 'Pure dictation', 'B', 'The key shift is from writer to editor-in-chief — you define the purpose, provide context, and refine AI output rather than crafting every sentence yourself.', 1),
('2-3', 'What is the "Diamond Process" for document creation?', 'Writing in circles', 'Expand → Refine → Polish', 'Working harder', 'Cutting text randomly', 'B', 'The Diamond Process has three stages: Expand (generate comprehensive drafts), Refine (cut unnecessary content and reorganize), and Polish (fine-tune tone and add personal touch).', 2),
('2-3', 'What is the primary benefit of using AI for document creation?', 'Eliminating writer''s block by providing a starting point', 'No thinking is needed', 'Getting an instant final version', 'Replacing human authors entirely', 'A', 'AI eliminates the blank page problem by generating first drafts you can refine, making it much easier to start any document.', 3),
('2-3', 'What can AI help with when refining a document?', 'Nothing useful', 'Tone, length, and style adjustments', 'Randomizing the text', 'Changing fonts only', 'B', 'AI is incredibly flexible with adjustments — you can ask it to make content more concise, change the tone from formal to casual, or restructure for a different audience.', 4),
('2-3', 'What is the target drafting time reduction for Lesson 2.3?', '10%', '30%', '100%', '50%', 'B', 'The SMART goal targets approximately 30% reduction in drafting time, with most people reporting 30-50% savings on their first try and even greater savings as prompting skills improve.', 5);

SELECT 'SUCCESS: Supreme Curriculum Synchronized (30 Questions)' as verification_status;
