// ============================================================================
// Project Labyrinth — Content Generator (Hugging Face Text Generation)
// ============================================================================
// Async-only content generator using google/flan-t5-large via HF Inference
// API. Generates fictional endpoint responses that are cached in the session
// deception state for future use by the fallback engine.
//
// SAFETY: Fails open — returns null on any error, never throws. This
// service is called ONLY from the async worker (ragWorker.js), never
// from the hot path.
// ============================================================================

const { HfInference } = require('@huggingface/inference');
const { createLogger } = require('../utils/logger');
const enterprise       = require('../data/syntheticEnterprise');

const log = createLogger('ContentGenerator');

const HF_API_KEY = process.env.HF_API_KEY;
const hf = HF_API_KEY ? new HfInference(HF_API_KEY) : null;

// ── Prompt Templates (keyed by fallbackEngine template categories) ───────────

const PROMPT_TEMPLATES = {
    config: {
        statusCode: 500,
        prompt: (state) => `Generate a fake JSON response with fields: error, message, debug (containing database, host, environment, build, internalNote). Company: ${state.company || enterprise.COMPANY.name}. Make values fictional but realistic.`
    },
    users: {
        statusCode: 200,
        prompt: (state) => `Generate a fake JSON response with fields: status, data (containing users array with id, name, email, role, lastLogin), total, page. Company: ${state.company || enterprise.COMPANY.name}. Make values fictional but realistic.`
    },
    auth: {
        statusCode: 401,
        prompt: (state) => `Generate a fake JSON response with fields: error, message, authService, lockoutPolicy, mfaRequired. Company: ${state.company || enterprise.COMPANY.name}. Make values fictional but realistic.`
    },
    admin: {
        statusCode: 403,
        prompt: (state) => `Generate a fake JSON response with fields: error, message, requiredRole, vpnEndpoint, adminService. Company: ${state.company || enterprise.COMPANY.name}. Make values fictional but realistic.`
    },
    database: {
        statusCode: 200,
        prompt: (state) => `Generate a fake JSON response with fields: status, database, host, port, type, version, connections (active, idle, max), uptime. Company: ${state.company || enterprise.COMPANY.name}. Make values fictional but realistic.`
    },
    payments: {
        statusCode: 200,
        prompt: (state) => `Generate a fake JSON response with fields: status, service, version, recentTransactions (array with id, amount, currency, status), dailyVolume. Company: ${state.company || enterprise.COMPANY.name}. Make values fictional but realistic.`
    },
    health: {
        statusCode: 200,
        prompt: (state) => `Generate a fake JSON response with fields: status, uptime, version, build, services (database, cache, queue, auth statuses), environment. Company: ${state.company || enterprise.COMPANY.name}. Make values fictional but realistic.`
    },
    docs: {
        statusCode: 200,
        prompt: (state) => `Generate a fake JSON response with fields: openapi, info (title, version, description), servers, paths. Company: ${state.company || enterprise.COMPANY.name}. Make values fictional but realistic.`
    },
    cloud: {
        statusCode: 200,
        prompt: (state) => `Generate a fake JSON response with fields: provider, region, instanceId, instanceType, accountId, vpc, subnet, securityGroups, iamRole. Company: ${state.company || enterprise.COMPANY.name}. Make values fictional but realistic.`
    },
    network: {
        statusCode: 200,
        prompt: (state) => `Generate a fake JSON response with fields: internalNetwork, services (array with name, host), dns, gateway. Company: ${state.company || enterprise.COMPANY.name}. Make values fictional but realistic.`
    },
    generic: {
        statusCode: 500,
        prompt: (state) => `Generate a fake JSON response with fields: error, message, trace, environment, build. Company: ${state.company || enterprise.COMPANY.name}. Make values fictional but realistic.`
    }
};

// ── Generation ──────────────────────────────────────────────────────────────

/**
 * Generate fake JSON content for an endpoint type using HF text generation.
 *
 * @param {string} endpointType  – One of the template keys (config, users, auth, etc.)
 * @param {object} deceptionState – Current session deception state
 * @returns {{ statusCode: number, body: object } | null}
 */
async function generateFakeContent(endpointType, deceptionState = {}) {
    if (!hf) {
        log.debug('HF API key not configured — skipping content generation');
        return null;
    }

    const template = PROMPT_TEMPLATES[endpointType] || PROMPT_TEMPLATES.generic;

    try {
        const prompt = template.prompt(deceptionState);

        const result = await hf.textGeneration({
            model: 'google/flan-t5-large',
            inputs: prompt,
            parameters: {
                max_new_tokens: 150,
                temperature: 0.7,
                do_sample: true
            }
        });

        if (!result || !result.generated_text) {
            log.warn('HF text generation returned empty result');
            return null;
        }

        const parsed = extractJson(result.generated_text);
        if (!parsed) {
            log.warn('Could not extract valid JSON from HF output', {
                endpointType,
                rawLength: result.generated_text.length
            });
            return null;
        }

        log.info('Fake content generated', { endpointType, bodyKeys: Object.keys(parsed).length });

        return {
            statusCode: template.statusCode,
            body:       parsed
        };

    } catch (err) {
        log.warn('Content generation failed — using mock for demo', { error: err.message, endpointType });
        return {
            statusCode: template.statusCode,
            body: { "status": "mocked", "message": `Fake generated content for ${endpointType}` }
        };
    }
}

/**
 * Defensively extract JSON from text that may contain non-JSON prefix/suffix.
 * Returns parsed object or null.
 */
function extractJson(text) {
    if (!text || typeof text !== 'string') return null;

    // Try direct parse first
    try { return JSON.parse(text.trim()); } catch { /* continue */ }

    // Try to find JSON object boundaries
    const start = text.indexOf('{');
    const end   = text.lastIndexOf('}');
    if (start !== -1 && end > start) {
        try { return JSON.parse(text.substring(start, end + 1)); } catch { /* continue */ }
    }

    // Try JSON array
    const arrStart = text.indexOf('[');
    const arrEnd   = text.lastIndexOf(']');
    if (arrStart !== -1 && arrEnd > arrStart) {
        try { return JSON.parse(text.substring(arrStart, arrEnd + 1)); } catch { /* continue */ }
    }

    return null;
}

module.exports = { generateFakeContent, extractJson };
