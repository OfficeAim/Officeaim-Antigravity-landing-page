-- ============================================================
-- Lesson 1.4: Attach Video URL
-- Video: "Your Free AI Board – The Collaboration Loop"
-- Source: Google Drive
-- FILE_ID: 1002M6zvrQqhFZZAtnQ4zynSa_9_H4GaA
-- ============================================================

UPDATE lessons
SET video_url = 'https://drive.google.com/file/d/1002M6zvrQqhFZZAtnQ4zynSa_9_H4GaA/preview'
WHERE id = '1-4';

-- Verify
SELECT id, title, video_url
FROM lessons
WHERE id = '1-4';
