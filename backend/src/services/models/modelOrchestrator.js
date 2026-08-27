// ============================================================================
// Project Labyrinth — Model Orchestrator
// ============================================================================
// Central logic to route requests to the best available provider based on
// intent, load, and availability. Implements graceful fallback.
// ============================================================================

const gemini = require('./geminiProvider');
const hf = require('./huggingfaceProvider');
const { createLogger } = require('../../utils/logger');
const metricsCollector = require('../metricsCollector');

const log = createLogger('ModelOrchestrator');

class ModelOrchestrator {
    
    /**
     * Choose the best provider for generating contextual deception.
     */
    async generateDeception(prompt, options) {
        metricsCollector.increment('orchestratorRequests');
        
        // Primary: Gemini
        if (gemini.isAvailable()) {
            const res = await gemini.generate(prompt, options);
            if (res) {
                metricsCollector.increment('geminiCalls');
                return { text: res, provider: gemini.name };
            }
        }
        
        // Fallback: None (FallbackEngine handles deterministic fallback if this returns null)
        metricsCollector.increment('fallbackActivations');
        return null; 
    }

    /**
     * Embed text for RAG. Prefers HF (lightweight, fast) but falls back to Gemini.
     */
    async embedText(text) {
        // Try HF first for embeddings (faster/cheaper)
        let vector = await hf.embed(text);
        if (vector) {
            metricsCollector.increment('hfCalls');
            // HF sometimes wraps single results in array
            if (Array.isArray(vector) && Array.isArray(vector[0])) return vector[0];
            return vector;
        }
        
        // Fallback to Gemini
        if (gemini.isAvailable()) {
            vector = await gemini.embed(text);
            if (vector) {
                metricsCollector.increment('geminiCalls');
                return vector;
            }
        }
        return null;
    }

    /**
     * Lightweight classification.
     */
    async analyzeBehavior(text, categories) {
        // Try HF zero-shot first
        const result = await hf.analyze(text, categories);
        if (result) {
            metricsCollector.increment('hfCalls');
            return result;
        }
        
        // Fallback to Gemini
        if (gemini.isAvailable()) {
            const gemResult = await gemini.analyze(text, categories);
            if (gemResult) {
                metricsCollector.increment('geminiCalls');
                return gemResult;
            }
        }
        return null;
    }
}

module.exports = new ModelOrchestrator();
