// ============================================================================
// Project Labyrinth — JSON Validator for AI Output
// ============================================================================
// Gemini / LLM output is non-deterministic and may produce malformed JSON,
// markdown-wrapped code blocks, or missing required fields. This module
// provides safe parsing and validation so that a bad AI response never
// crashes the deception pipeline.
// ============================================================================

/**
 * Safely parse and validate a JSON string, optionally checking required fields.
 *
 * @param {string} raw          – Raw string from AI output
 * @param {string[]} required   – Field names that must exist in the parsed object
 * @returns {{ valid: boolean, error: string|null, data: object|null }}
 */
function validateJsonResponse(raw, requiredFields = []) {
    if (!raw || typeof raw !== 'string') {
        return { valid: false, error: 'Empty or non-string input', data: null };
    }

    // Strip markdown code fences that Gemini often wraps around JSON
    let cleaned = raw.trim();
    const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) {
        cleaned = jsonBlockMatch[1].trim();
    }

    try {
        const parsed = JSON.parse(cleaned);

        for (const field of requiredFields) {
            if (parsed[field] === undefined) {
                return { valid: false, error: `Missing required field: ${field}`, data: parsed };
            }
        }

        return { valid: true, error: null, data: parsed };
    } catch (err) {
        return { valid: false, error: `JSON parse error: ${err.message}`, data: null };
    }
}

/**
 * Sanitize free-text AI output to prevent XSS or injection in downstream
 * consumers (e.g., a dashboard that renders this text).
 */
function sanitizeAiOutput(text) {
    if (!text || typeof text !== 'string') return '';
    return text
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
}

module.exports = { validateJsonResponse, sanitizeAiOutput };
