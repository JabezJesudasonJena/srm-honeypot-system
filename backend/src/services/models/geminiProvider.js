// ============================================================================
// Project Labyrinth — Gemini Provider
// ============================================================================

const { GoogleGenerativeAI } = require('@google/generative-ai');
const ModelProvider = require('./modelProvider');
const { createLogger } = require('../../utils/logger');

const log = createLogger('GeminiProvider');

class GeminiProvider extends ModelProvider {
    constructor() {
        super();
        this.genAI = null;
        this.textModel = null;
        this.embedModel = null;
        
        if (this.isAvailable()) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.textModel = this.genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
            this.embedModel = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
        }
    }

    get name() {
        return 'gemini';
    }

    isAvailable() {
        return !!process.env.GEMINI_API_KEY;
    }

    async generate(prompt, options = {}) {
        if (!this.textModel) return null;
        
        try {
            const req = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
            if (options.systemInstruction) {
                req.systemInstruction = { parts: [{ text: options.systemInstruction }] };
            }
            
            const config = {
                temperature: options.temperature || 0.7,
                maxOutputTokens: options.maxOutputTokens || 1024,
            };
            
            if (options.format === 'json') {
                config.responseMimeType = 'application/json';
            }
            
            req.generationConfig = config;
            
            const result = await this.textModel.generateContent(req);
            return result.response?.text?.() || null;
        } catch (err) {
            log.error('Gemini generate failed', { error: err.message });
            return null;
        }
    }

    async analyze(text, categories = []) {
        if (!this.textModel || categories.length === 0) return null;
        
        const prompt = `Classify the following text into ONE of these categories: ${categories.join(', ')}.
Respond with ONLY the exact category name in JSON format: {"category": "..."}.
Text: ${text}`;

        try {
            const res = await this.generate(prompt, { format: 'json', temperature: 0.1 });
            if (res) {
                const parsed = JSON.parse(res);
                return { topCategory: parsed.category, provider: this.name };
            }
        } catch (err) {
            log.error('Gemini analyze failed', { error: err.message });
        }
        return null;
    }

    async embed(text) {
        if (!this.embedModel) return null;
        try {
            const result = await this.embedModel.embedContent(text);
            return result.embedding.values;
        } catch (err) {
            log.error('Gemini embed failed', { error: err.message });
            return null;
        }
    }
}

module.exports = new GeminiProvider();
