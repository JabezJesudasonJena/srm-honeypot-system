// ============================================================================
// Project Labyrinth — Hugging Face Provider
// ============================================================================
// Uses the free Hugging Face Inference API via standard fetch.
// Designed for lightweight classification and embeddings.
// ============================================================================

const ModelProvider = require('./modelProvider');
const { createLogger } = require('../../utils/logger');

const log = createLogger('HFProvider');

const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
const CLASSIFICATION_MODEL = 'facebook/bart-large-mnli'; // Zero-shot classification

class HuggingFaceProvider extends ModelProvider {
    get name() {
        return 'huggingface';
    }

    isAvailable() {
        // We can use it without a token (though highly rate-limited)
        // or with a token for better stability.
        return true; 
    }

    async _fetch(model, payload) {
        const url = `https://api-inference.huggingface.co/models/${model}`;
        const headers = { 'Content-Type': 'application/json' };
        
        if (process.env.HF_API_KEY) {
            headers['Authorization'] = `Bearer ${process.env.HF_API_KEY}`;
        }
        
        // Timeout to ensure we don't hang the worker
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeout);
            
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Status ${res.status}: ${text}`);
            }
            return await res.json();
        } catch (err) {
            clearTimeout(timeout);
            throw err;
        }
    }

    async generate(prompt, options = {}) {
        // We prefer Gemini for generation, HF is fallback/specialised for analysis
        return null; 
    }

    async analyze(text, categories = []) {
        if (categories.length === 0) return null;
        try {
            // Using zero-shot classification
            const result = await this._fetch(CLASSIFICATION_MODEL, {
                inputs: text,
                parameters: { candidate_labels: categories }
            });
            
            if (result && result.labels && result.scores) {
                const scores = {};
                for (let i = 0; i < result.labels.length; i++) {
                    scores[result.labels[i]] = result.scores[i];
                }
                return {
                    topCategory: result.labels[0],
                    scores,
                    provider: this.name
                };
            }
        } catch (err) {
            log.warn('HF analyze failed (rate limited or timeout)', { error: err.message });
        }
        return null;
    }

    async embed(text) {
        try {
            // Returns an array of arrays if multiple inputs, or a flat array
            const result = await this._fetch(EMBEDDING_MODEL, { inputs: text });
            if (Array.isArray(result)) {
                return result;
            }
        } catch (err) {
            log.warn('HF embed failed', { error: err.message });
        }
        return null;
    }
}

module.exports = new HuggingFaceProvider();
