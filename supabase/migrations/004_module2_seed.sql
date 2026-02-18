-- Module 2 Seed: The Executive Efficiency System (Evergreen Strategy)
-- Based on NotebookLM analysis of Manus AI content

DO $$
DECLARE
    v_module_id INTEGER;
BEGIN
    -- 1. Find or Create Module 2
    SELECT id INTO v_module_id FROM modules WHERE title = 'Module 2: The Executive Efficiency System' LIMIT 1;
    
    IF v_module_id IS NULL THEN
        INSERT INTO modules (title, description, order_index)
        VALUES (
            'Module 2: The Executive Efficiency System', 
            'Master the "Evergreen" protocols for high-performance execution. Move beyond tools to architectural productivity.',
            2
        ) RETURNING id INTO v_module_id;
    END IF;

    -- 2. Cleanup existing Module 2 content to avoid duplicates/conflicts
    DELETE FROM quiz_questions WHERE lesson_id IN ('2-1', '2-2', '2-3');
    DELETE FROM lessons WHERE id IN ('2-1', '2-2', '2-3');

    -- 3. Insert Lessons (IDs are TEXT, e.g., '2-1')
    
    -- Lesson 2.1: The Zero-Latency Communication Hub
    INSERT INTO lessons (
        id, module_id, title, smart_goal, content, order_index, video_url, 
        image_url, passing_threshold
    )
    VALUES (
        '2-1',
        v_module_id,
        '2.1 The Zero-Latency Communication Hub',
        'By the end of this lesson, you will convert your inbox into a decision stream using specific AI filters, moving from reactive checking to proactive decision making.',
        '# From Inbox to Intelligence Network
        
        **The Old Way:** Checking email as a task list.
        **The OfficeAIM Way:** Architecting a decision stream.
        
        In this lesson, we transform your approach to communication. It is not about writing faster; it is about designing a system where:
        
        1.  **AI Triages Decisions:** We configure filters that sort by "Capital Value", not arrival time.
        2.  **Context-Aware Drafting:** You do not write emails; you audit drafts created with your specific "Voice Profile".
        3.  **The 3-Sentence Protocol:** Executive brevity as a power move.
        
        *Tool Focus: Contextual prompting for tone and intent.*',
        1,
        'https://www.youtube.com/embed/dQw4w9WgXcQ', -- Placeholder
        'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&q=80', -- Email/Communication Abstract
        80
    );

    -- Lesson 2.2: Temporal Architecture
    INSERT INTO lessons (
        id, module_id, title, smart_goal, content, order_index, video_url, 
        image_url, passing_threshold
    )
    VALUES (
        '2-2',
        v_module_id,
        '2.2 Temporal Architecture & Sovereign Time',
        'By the end of this lesson, you will implement an automated scheduling defense system that reclaims at least 5 hours of deep work per week.',
        '# Defending Your Most Finite Resource
        
        **The Old Way:** Letting others fill your slots.
        **The OfficeAIM Way:** Algorithmic Time Boxing.
        
        Your calendar is a fortress. This lesson teaches you:
        
        1.  **Energy Mapping:** AI analyzes your peak performance hours and blocks them automatically.
        2.  **The Negotiation Proxy:** Using AI to draft polite but firm "No" responses to low-value meetings.
        3.  **Agenda Enforcement:** No agenda, no meeting. The AI checks this for you.
        
        *Tool Focus: Calendar API integration and automated scheduling agents.*',
        2,
        'https://www.youtube.com/embed/dQw4w9WgXcQ', -- Placeholder
        'https://images.unsplash.com/photo-1506784365847-bbad93919335?auto=format&fit=crop&q=80', -- Calendar/Time Abstract
        80
    );

    -- Lesson 2.3: Knowledge Synthesis
    INSERT INTO lessons (
        id, module_id, title, smart_goal, content, order_index, video_url, 
        image_url, passing_threshold
    )
    VALUES (
        '2-3',
        v_module_id,
        '2.3 Knowledge Synthesis & Artifact Creation',
        'By the end of this lesson, you will be able to generate a high-level executive memo from raw notes in under 2 minutes using multi-modal synthesis.',
        '# The Editor-in-Chief Mindset
        
        **The Old Way:** Staring at a blank page.
        **The OfficeAIM Way:** The "Diamond Process" (Expand -> Refine -> Polish).
        
        Stop writing. Start directing.
        
        1.  **Multi-Modal Synthesis:** Turn one voice note into a Memo, a Slide Deck, and a Slack update simultaneously.
        2.  **Reverse Prompting:** Ask the AI what *it* needs to know to generate the perfect document.
        3.  **Artifact Polish:** Using AI to apply "Executive Polish" to rough notes instantly.
        
        *Tool Focus: Multi-modal LLMs (Claude 3.5, GPT-4).*',
        3,
        'https://www.youtube.com/embed/dQw4w9WgXcQ', -- Placeholder
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80', -- Documents/Writing Abstract
        80
    );

    -- 4. Insert Quizzes
    INSERT INTO quiz_questions (lesson_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index) VALUES
    ('2-1', 'What is the primary goal of the Zero-Latency Hub?', 'Emptying the inbox', 'Sorting mails by color', 'Triaging decisions based on capital value', 'Auto-deleting all emails', 'C', 'The goal is to move from reactive checking to proactive decision triaging based on value.', 1),
    ('2-2', 'What is the "Negotiation Proxy"?', 'A lawyer', 'AI drafting firm refusals for meetings', 'A calendar plugin', 'A negotiation course', 'B', 'It is the use of AI to act as a buffer and negotiator for your time, politely declining low-value requests.', 1),
    ('2-3', 'What mindset replaces "Drafting" in the Executive Efficiency System?', 'Typing faster', 'Dictation', 'Knowledge Synthesis (Editor-in-Chief)', 'Outsourcing', 'C', 'You shift from being the writer (drafter) to being the Editor-in-Chief who directs the synthesis of knowledge.', 1);

END $$;
