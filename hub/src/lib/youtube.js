/**
 * YouTube Utility Helper
 * Robustly parses diverse YouTube URL formats and generates embed and thumbnail URLs.
 */

export const extractYouTubeId = (url) => {
    if (!url || typeof url !== 'string') return null;
    
    // Trim whitespace
    const trimmed = url.trim();

    // Direct ID check (if user just pasted the 11 character ID)
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
        return trimmed;
    }

    // RegEx patterns for common YouTube URL formats
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtube-nocookie\.com\/embed\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
        const match = trimmed.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
};

export const getYouTubeEmbedUrl = (url, autoplay = false) => {
    const videoId = extractYouTubeId(url);
    if (!videoId) return null;
    return `https://www.youtube-nocookie.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`;
};

export const getYouTubeThumbnailUrl = (url) => {
    const videoId = extractYouTubeId(url);
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

/**
 * Validates whether a YouTube URL is valid and actually published (not scheduled/unassigned/private).
 */
export const isYouTubePublished = (url) => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim().toLowerCase();
    if (!trimmed || ['not published', 'private', 'scheduled', 'pending', 'tbd', 'coming soon', 'none', 'draft'].includes(trimmed)) {
        return false;
    }
    if (trimmed.includes('not published') || trimmed.includes('private') || trimmed.includes('scheduled')) {
        return false;
    }
    return !!extractYouTubeId(url.trim());
};

/**
 * Natural Sentence Case Formatter for human-readable news titles
 * Converts robotic Title Case into natural sentence case while preserving
 * proper nouns, acronyms (AI, OpenAI, Google, MVP), model tags (v6, 4.5), and colons.
 * Example: "Suno v6 Turns Music Ideas Into Drafts—But Know The Free-Plan Limits"
 *       -> "Suno v6 turns music ideas into drafts—but know the free-plan limits"
 */
export const toSentenceCase = (title) => {
    if (!title || typeof title !== 'string') return '';
    const trimmed = title.trim();
    if (!trimmed) return '';

    const preservedMap = new Map([
        ['ai', 'AI'],
        ['agi', 'AGI'],
        ['llm', 'LLM'],
        ['llms', 'LLMs'],
        ['api', 'API'],
        ['apis', 'APIs'],
        ['mvp', 'MVP'],
        ['suno', 'Suno'],
        ['ideogram', 'Ideogram'],
        ['openai', 'OpenAI'],
        ['google', 'Google'],
        ['openbot', 'OpenBot'],
        ['nano', 'Nano'],
        ['banana', 'Banana'],
        ['officeaim', 'OfficeAIM'],
        ['hyperframes', 'HyperFrames'],
        ['anthropic', 'Anthropic'],
        ['claude', 'Claude'],
        ['chatgpt', 'ChatGPT'],
        ['youtube', 'YouTube'],
        ['meta', 'Meta'],
        ['notebooklm', 'NotebookLM'],
        ['dots', 'Dots'],
        ['studio', 'Studio'],
        ['ui', 'UI'],
        ['ux', 'UX'],
        ['ceo', 'CEO'],
        ['cto', 'CTO'],
        ['sql', 'SQL']
    ]);

    const tokens = trimmed.split(/([ \t\r\n\—\-\:\?\!\.]+)/);
    let isStartOfSentence = true;

    const formattedTokens = tokens.map((token) => {
        if (!token || /^[ \t\r\n\—\-\:\?\!\.]+$/.test(token)) {
            if (/[\.\?\!\:]/.test(token)) {
                isStartOfSentence = true;
            }
            return token;
        }

        const match = token.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9'’]+)([^a-zA-Z0-9]*)$/);
        if (!match) {
            isStartOfSentence = false;
            return token;
        }

        const [, prefix, coreWord, suffix] = match;
        const lowerCore = coreWord.toLowerCase();

        let replacement = '';
        if (preservedMap.has(lowerCore)) {
            replacement = preservedMap.get(lowerCore);
        } else if (/^v\d+(\.\d+)?$/i.test(coreWord)) {
            replacement = coreWord.toLowerCase();
        } else if (/^\d+(\.\d+)?$/.test(coreWord)) {
            replacement = coreWord;
        } else if (isStartOfSentence) {
            replacement = coreWord.charAt(0).toUpperCase() + coreWord.slice(1).toLowerCase();
        } else {
            replacement = coreWord.toLowerCase();
        }

        isStartOfSentence = false;
        return `${prefix}${replacement}${suffix}`;
    });

    return formattedTokens.join('');
};
