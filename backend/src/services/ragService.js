// ============================================================================
// Project Labyrinth — RAG Service (pgvector Integration)
// ============================================================================
// Handles embedding generation and semantic search against the synthetic
// knowledge base stored in Supabase with pgvector.
//
// Architecture:
//   1. Seed phase: Generate embeddings for all synthetic documents and store
//      them in Supabase.
//   2. Query phase: For each attacker probe, generate a query embedding and
//      find the most semantically relevant synthetic documents.
//
// Graceful degradation: If Supabase or embeddings are unavailable, the
// service returns empty results rather than failing the pipeline.
// ============================================================================

const supabase     = require('../../config/db');
const { KNOWLEDGE_BASE } = require('../data/syntheticEnterprise');
const { createLogger }   = require('../utils/logger');
const orchestrator = require('./models/modelOrchestrator');

const log = createLogger('RAGService');

// ── Embedding Generation ────────────────────────────────────────────────────

async function generateEmbedding(text) {
    try {
        return await orchestrator.embedText(text);
    } catch (err) {
        log.error('Embedding generation failed', { error: err.message });
        return null;
    }
}

// ── Knowledge Base Seeding ──────────────────────────────────────────────────

/**
 * Seed the Supabase vector store with synthetic knowledge base documents.
 * This should be called once during initial setup.
 *
 * Requires the following Supabase SQL migration to have been run:
 *
 *   CREATE EXTENSION IF NOT EXISTS vector;
 *
 *   CREATE TABLE IF NOT EXISTS knowledge_base (
 *     id BIGSERIAL PRIMARY KEY,
 *     title TEXT NOT NULL,
 *     content TEXT NOT NULL,
 *     department TEXT,
 *     service TEXT,
 *     embedding VECTOR(768),
 *     created_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 *
 *   CREATE OR REPLACE FUNCTION match_documents(
 *     query_embedding VECTOR(768),
 *     match_threshold FLOAT DEFAULT 0.5,
 *     match_count INT DEFAULT 5
 *   )
 *   RETURNS TABLE (
 *     id BIGINT,
 *     title TEXT,
 *     content TEXT,
 *     department TEXT,
 *     service TEXT,
 *     similarity FLOAT
 *   )
 *   LANGUAGE plpgsql
 *   AS $$
 *   BEGIN
 *     RETURN QUERY
 *     SELECT
 *       kb.id,
 *       kb.title,
 *       kb.content,
 *       kb.department,
 *       kb.service,
 *       1 - (kb.embedding <=> query_embedding) AS similarity
 *     FROM knowledge_base kb
 *     WHERE 1 - (kb.embedding <=> query_embedding) > match_threshold
 *     ORDER BY kb.embedding <=> query_embedding
 *     LIMIT match_count;
 *   END;
 *   $$;
 */
async function seedKnowledgeBase() {
    const model = getEmbeddingModel();
    if (!model) {
        log.warn('Cannot seed knowledge base — embedding model unavailable');
        return { seeded: 0, errors: 0 };
    }

    let seeded = 0;
    let errors = 0;

    for (const doc of KNOWLEDGE_BASE) {
        try {
            // Check if already seeded
            const { data: existing } = await supabase
                .from('knowledge_base')
                .select('id')
                .eq('title', doc.title)
                .limit(1);

            if (existing && existing.length > 0) {
                log.debug(`Skipping already-seeded doc: ${doc.title}`);
                continue;
            }

            const embedding = await generateEmbedding(`${doc.title}\n${doc.content}`);
            if (!embedding) {
                errors++;
                continue;
            }

            const { error } = await supabase.from('knowledge_base').insert({
                title:      doc.title,
                content:    doc.content,
                department: doc.department,
                service:    doc.service,
                embedding:  embedding
            });

            if (error) {
                log.error(`Failed to insert doc: ${doc.title}`, { error: error.message });
                errors++;
            } else {
                seeded++;
                log.info(`Seeded document: ${doc.title}`);
            }
        } catch (err) {
            log.error(`Seeding error for: ${doc.title}`, { error: err.message });
            errors++;
        }
    }

    log.info(`Knowledge base seeding complete`, { seeded, errors, total: KNOWLEDGE_BASE.length });
    return { seeded, errors };
}

// ── Semantic Search ─────────────────────────────────────────────────────────

/**
 * Search the knowledge base for documents relevant to the attacker's request.
 *
 * @param {string} query – Normalized query text from the attacker request
 * @param {number} topK  – Number of results to return
 * @returns {string[]}   – Array of document content strings
 */
async function searchContext(query, topK = 3) {
    // WORKAROUND: Supabase vector search is skipped due to missing schema (PGRST202)
    // and network blocks on embedding models. Falling back immediately to local keyword search.
    log.debug('Bypassing vector search — using local keyword fallback');
    return keywordFallback(query);
}

/**
 * Simple keyword-based fallback when vector search is unavailable.
 * Searches the in-memory knowledge base by keyword overlap.
 */
function keywordFallback(query) {
    const words = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    if (words.length === 0) return [];

    const scored = KNOWLEDGE_BASE.map(doc => {
        const text = `${doc.title} ${doc.content} ${doc.department} ${doc.service}`.toLowerCase();
        const matches = words.filter(w => text.includes(w)).length;
        return { doc, score: matches / words.length };
    });

    return scored
        .filter(s => s.score > 0.1)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(s => `[${s.doc.title}] ${s.doc.content}`);
}

module.exports = { generateEmbedding, seedKnowledgeBase, searchContext, keywordFallback };
