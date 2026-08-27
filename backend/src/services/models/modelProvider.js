// ============================================================================
// Project Labyrinth — Model Provider Interface
// ============================================================================
// Base interface for all AI model providers. Ensures Labyrinth can switch
// between AI backends seamlessly without changing the core engine.
// ============================================================================

class ModelProvider {
    /**
     * @returns {string} The name of the provider (e.g., 'gemini', 'huggingface')
     */
    get name() {
        return 'base';
    }

    /**
     * @returns {boolean} True if the provider is correctly configured and available
     */
    isAvailable() {
        return false;
    }

    /**
     * Generate text/JSON content based on a prompt.
     * @param {string} prompt 
     * @param {object} options (e.g., { systemInstruction, format: 'json' })
     * @returns {Promise<string|null>} The generated string, or null on failure
     */
    async generate(prompt, options = {}) {
        throw new Error('generate() not implemented');
    }

    /**
     * Lightweight classification or analysis.
     * @param {string} text 
     * @param {string[]} categories 
     * @returns {Promise<object|null>} e.g., { topCategory: 'recon', scores: {...} }
     */
    async analyze(text, categories = []) {
        throw new Error('analyze() not implemented');
    }

    /**
     * Generate vector embeddings for a given text.
     * @param {string} text 
     * @returns {Promise<number[]|null>} Array of floats representing the embedding
     */
    async embed(text) {
        throw new Error('embed() not implemented');
    }
}

module.exports = ModelProvider;
