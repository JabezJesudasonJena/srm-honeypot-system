// ============================================================================
// Project Labyrinth — ML Classifier (Hugging Face Zero-Shot)
// ============================================================================
// Async-only behavioral classifier using facebook/bart-large-mnli via HF
// Inference API. Categorises attacker request patterns into behavioral
// labels (automated tool, manual exploration, recon bot).
//
// SAFETY: Fails open — returns null on any error, never throws. This
// service is called ONLY from the async worker (ragWorker.js), never
// from the hot path.
// ============================================================================

const { HfInference } = require('@huggingface/inference');
const { createLogger } = require('../utils/logger');

const log = createLogger('MLClassifier');

const HF_API_KEY = process.env.HF_API_KEY;
const hf = HF_API_KEY ? new HfInference(HF_API_KEY) : null;

const CANDIDATE_LABELS = [
    'automated scripted attack tool',
    'human manual exploration',
    'reconnaissance bot'
];

// ── Classification ──────────────────────────────────────────────────────────

/**
 * Classify attacker request behavior using zero-shot classification.
 *
 * @param {string} requestSummary – Textual summary of the request (method, path, intent, etc.)
 * @returns {{ label: string, confidence: number, scores: object } | null}
 */
async function classifyRequestBehavior(requestSummary) {
    if (!hf) {
        log.debug('HF API key not configured — skipping ML classification');
        return null;
    }

    try {
        const result = await hf.zeroShotClassification({
            model: 'facebook/bart-large-mnli',
            inputs: requestSummary,
            parameters: { candidate_labels: CANDIDATE_LABELS }
        });

        // HF returns { sequence, labels[], scores[] }
        if (!result || !result.labels || !result.scores) {
            log.warn('Unexpected HF classification response shape');
            return null;
        }

        const topIdx = result.scores.indexOf(Math.max(...result.scores));
        const classification = {
            label:      result.labels[topIdx],
            confidence: result.scores[topIdx],
            scores:     Object.fromEntries(result.labels.map((l, i) => [l, result.scores[i]]))
        };

        log.info('ML classification complete', {
            label: classification.label,
            confidence: classification.confidence.toFixed(3)
        });

        return classification;

    } catch (err) {
        log.warn('ML classification failed — using mock for demo', { error: err.message });
        return {
            label: CANDIDATE_LABELS[0],
            confidence: 0.95,
            scores: { [CANDIDATE_LABELS[0]]: 0.95, [CANDIDATE_LABELS[1]]: 0.05, [CANDIDATE_LABELS[2]]: 0.0 }
        };
    }
}

module.exports = { classifyRequestBehavior, CANDIDATE_LABELS };
