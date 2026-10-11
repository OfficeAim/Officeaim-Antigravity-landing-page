-- ==============================================================================
-- INSERT TWO NEW NEWS TRANSMISSIONS INTO SUPABASE (OCTOBER 09 & OCTOBER 10)
-- ==============================================================================

INSERT INTO public.news (title, description, youtube_url, category, published, published_at)
VALUES 
(
    'This Open-Source AI Video Editor Lets You Stay in the Director’s Seat',
    'AI can draft scripts and assemble videos, but HyperFrames Studio is built to let an agent do the building while you direct the revisions yourself. Features open-source Apache-2.0 workflows on Mac/Linux.',
    'https://youtu.be/-UZKFPYCTsU',
    'Generative AI',
    true,
    '2026-10-09 10:00:00+00'
),
(
    'Google Nano Banana 2.1 and OpenBot: The New AI Tools for Visuals and Teamwork',
    'Google’s Nano Banana 2.1 brings stronger image generation and multi-image fusion, while OpenBot organizes AI agents in a shared workspace. Discover what to know for multi-agent workflows.',
    'https://youtu.be/B4X9izGan8k',
    'AI Workflow Strategy',
    true,
    '2026-10-10 10:00:00+00'
)
ON CONFLICT DO NOTHING;

-- Verification
SELECT id, title, category, published_at, published 
FROM public.news 
ORDER BY published_at DESC 
LIMIT 5;
