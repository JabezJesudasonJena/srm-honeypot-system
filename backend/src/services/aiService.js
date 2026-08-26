// ============================================================================
// Project Labyrinth — Gemini AI Service
// ============================================================================
// Wrapper around the Google Generative AI SDK that handles:
//   1. Contextual deception response generation
//   2. Retry logic with exponential backoff
//   3. Strict JSON validation of AI output
//   4. Graceful failure (returns null, never throws)
//
// The system prompt enforces synthetic-only data generation and consistency
// with the current deception state.
// ============================================================================

const orchestrator = require('./models/modelOrchestrator');
const { validateJsonResponse } = require('../utils/jsonValidator');
const { createLogger } = require('../utils/logger');

const log = createLogger('AIService');
const AI_ENABLED = (process.env.AI_ENABLED || 'true') === 'true';
const AI_MAX_RETRIES = parseInt(process.env.AI_MAX_RETRIES) || 2;

// ── System Prompt ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the deception response generator for Project Labyrinth, an adaptive cyber deception platform.

CRITICAL RULES:
1. ALL data you generate MUST be purely FICTIONAL and SYNTHETIC.
2. NEVER include real credentials, real API keys, real cloud resources, or real personal information.
3. You MUST maintain consistency with the provided deception state — if a database called "postgres-prod-02" was previously revealed, reference that EXACT name.
4. Respond ONLY in valid JSON format matching the requested schema.
5. Make responses realistic enough to keep an attacker engaged and investigating further.
6. Include subtle "breadcrumbs" that lead the attacker deeper into the fictional environment.
7. Use the company name, employee names, and service names from the deception state.

You are generating responses for a HONEYPOT — your goal is to make the attacker believe they have found a real vulnerable system.`;

// ── Generation ──────────────────────────────────────────────────────────────

/**
 * Generate a deceptive response using Gemini.
 *
 * @param {object} params
 * @param {object} params.request       – Attacker request details
 * @param {string} params.intent        – Detected attacker intent
 * @param {object} params.deceptionState – Current session deception state
 * @param {string[]} params.ragContext  – Retrieved RAG documents
 * @param {string} params.objective     – What the deception should achieve
 * @returns {object|null}               – Parsed JSON response or null on failure
 */
async function generateDeception({ request, intent, deceptionState, ragContext = [], objective }) {
    if (!AI_ENABLED) return null;

    const prompt = buildPrompt({ request, intent, deceptionState, ragContext, objective });

    for (let attempt = 1; attempt <= AI_MAX_RETRIES; attempt++) {
        try {
            const startTime = Date.now();
            
            const result = await orchestrator.generateDeception(prompt, {
                systemInstruction: SYSTEM_PROMPT,
                format: 'json',
                temperature: 0.7,
                maxOutputTokens: 1024
            });

            if (!result || !result.text) {
                log.warn(`AI provider returned null (attempt ${attempt})`);
                continue;
            }

            const latency = Date.now() - startTime;
            const text = result.text;
            const validation = validateJsonResponse(text, ['statusCode', 'body']);

            if (validation.valid) {
                log.info('AI deception generated', { intent, provider: result.provider, latency: `${latency}ms`, attempt });
                return { ...validation.data, aiGenerated: true, provider: result.provider, latencyMs: latency };
            }

            log.warn(`AI output validation failed (attempt ${attempt})`, { error: validation.error });

        } catch (err) {
            log.error(`AI generation failed (attempt ${attempt})`, { error: err.message });
            if (attempt < AI_MAX_RETRIES) {
                // Exponential backoff
                await new Promise(r => setTimeout(r, 1000 * attempt));
            }
        }
    }

    log.warn('All AI attempts exhausted — falling back');
    return null;
}

// ── Prompt Builder ──────────────────────────────────────────────────────────

function buildPrompt({ request, intent, deceptionState, ragContext, objective }) {
    return `Generate a deceptive HTTP response for the following attacker probe.

## Attacker Request
- Method: ${request.method}
- Path: ${request.path}
- Intent: ${intent}

## Current Deception State (MUST maintain consistency)
${JSON.stringify(deceptionState, null, 2)}

## Retrieved Context (from synthetic knowledge base)
${ragContext.length > 0 ? ragContext.join('\n\n') : 'No specific context retrieved.'}

## Deception Objective
${objective || 'Keep the attacker engaged. Reveal enough synthetic information to seem real, but include breadcrumbs that lead deeper into the fictional environment.'}

## Required JSON Response Format
{
  "statusCode": <HTTP status code (200, 401, 403, 500, etc.)>,
  "body": { <response body that the attacker will see> },
  "newAssets": [
    { "type": "<service|database|employee|credential|config|cloud|network>", "data": { <asset details> } }
  ],
  "suggestedCanary": <true if this is a good place to inject a canary credential>
}

Remember: ALL data must be FICTIONAL. Maintain consistency with the deception state above.`;
}

/**
 * Generate a threat intelligence summary for a completed attack session.
 */
async function generateThreatReport(sessionData) {
    if (!AI_ENABLED) return null;

    const prompt = `Generate a threat intelligence report for the following attack session.
The report should be a professional executive summary suitable for a SOC team.

## Attack Session Data
${JSON.stringify(sessionData, null, 2)}

## Required JSON Format
{
  "executiveSummary": "<2-3 paragraph summary>",
  "attackerProfile": "<classification of the attacker>",
  "tacticsObserved": ["<list of MITRE ATT&CK-like tactics>"],
  "recommendedActions": ["<list of defensive recommendations>"],
  "riskAssessment": "<LOW|MEDIUM|HIGH|CRITICAL>"
}

IMPORTANT: Base ALL facts on the session data provided. Do NOT invent attack events that are not in the data.`;

    try {
        const result = await orchestrator.generateDeception(prompt, {
            systemInstruction: SYSTEM_PROMPT,
            format: 'json',
            temperature: 0.5,
            maxOutputTokens: 2048
        });

        if (!result || !result.text) return null;

        const validation = validateJsonResponse(result.text, ['executiveSummary']);
        return validation.valid ? validation.data : null;
    } catch (err) {
        log.error('Threat report generation failed', { error: err.message });
        return null;
    }
}

function isAvailable() {
    return AI_ENABLED && (!!process.env.GEMINI_API_KEY || !!process.env.HF_API_KEY);
}

module.exports = { generateDeception, generateThreatReport, isAvailable };
