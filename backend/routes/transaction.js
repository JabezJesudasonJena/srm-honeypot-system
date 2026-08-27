// ============================================================================
// Project Labyrinth — Transaction URL Routes
// ============================================================================
// Demonstrates context-aware deception: the same transaction URL returns real
// data to its legitimate owner and structurally-similar fake data to anyone
// else, with identical HTTP 200 status codes in both cases.
//
// Pattern: mirrors canaryManager.js's ownership-check logic — an ID is tied
// to an owning session at creation time, and checked on every access.
//
// Two routes:
//   POST /labyrinth-api/transaction/create   → create a transaction (dashboard)
//   GET  /api/transaction/:transactionId     → fetch transaction (public-facing)
// ============================================================================

const express = require('express');
const crypto  = require('crypto');

const redisConnection = require('../config/redis');
const sessionManager  = require('../src/services/sessionManager');
const threatScorer    = require('../src/services/threatScorer');
const { createLogger } = require('../src/utils/logger');
const { EMPLOYEES, COMPANY, SERVICES } = require('../src/data/syntheticEnterprise');

const log = createLogger('TransactionRoute');

const TRANSACTION_PREFIX = 'labyrinth:transaction:';
const TRANSACTION_TTL    = 3600;  // 1 hour — conservative; canaryManager uses 48h

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Pick a real-looking record from syntheticEnterprise data to serve as the
 * "real" transaction payload. Pulls from EMPLOYEES to build a believable
 * financial transaction record.
 */
function buildRealPayload() {
    const employee = EMPLOYEES[Math.floor(Math.random() * EMPLOYEES.length)];
    const amount   = (Math.random() * 50000 + 1000).toFixed(2);
    const refId    = crypto.randomBytes(6).toString('hex').toUpperCase();

    return {
        transactionRef: `REF-${refId}`,
        status:         'completed',
        amount:         parseFloat(amount),
        currency:       'USD',
        merchant:       COMPANY.name,
        department:     employee.department,
        authorizedBy: {
            employeeId: employee.id,
            name:       employee.name,
            email:      employee.email,
            role:       employee.role
        },
        processor:   SERVICES.find(s => s.name === 'payment-service')?.host || '10.20.4.12',
        processedAt: new Date().toISOString(),
        region:      COMPANY.region
    };
}

/**
 * Generate a fake payload with the exact same field structure as a real one,
 * but with obviously generic/placeholder values. Not trying to be
 * indistinguishable — just structurally identical so the HTTP response shape
 * doesn't reveal the deception.
 */
function buildFakePayload() {
    return {
        transactionRef: 'REF-000000000000',
        status:         'completed',
        amount:         0.00,
        currency:       'USD',
        merchant:       'Acme Corp',
        department:     'General',
        authorizedBy: {
            employeeId: 'EMP-000',
            name:       'John Doe',
            email:      'jdoe@example.internal',
            role:       'Staff'
        },
        processor:   '10.0.0.1',
        processedAt: new Date().toISOString(),
        region:      'us-east-1'
    };
}

// ── Dashboard route: POST /transaction/create ───────────────────────────────
// (Mounted under /labyrinth-api in server.js, so full path is
//  POST /labyrinth-api/transaction/create)

const dashboardRouter = express.Router();

dashboardRouter.post('/transaction/create', async (req, res) => {
    try {
        // sessionTracker is NOT applied to /labyrinth-api routes (they're
        // mounted before the middleware), so we do a lightweight session
        // resolution here — same getOrCreateSession call the tracker uses.
        const { session } = await sessionManager.getOrCreateSession(req);
        const ownerSessionId = session.sessionId;

        // Generate unique transaction ID: TXN-{12 hex chars}
        const transactionId = `TXN-${crypto.randomBytes(6).toString('hex')}`;

        // Build the real payload from syntheticEnterprise data
        const realPayload = buildRealPayload();

        // Store in Redis keyed by transaction ID — mirrors canaryManager's
        // Redis storage pattern (prefix + ID → JSON, with TTL)
        const record = {
            ownerSessionId,
            createdAt:   new Date().toISOString(),
            realPayload
        };

        await redisConnection.set(
            TRANSACTION_PREFIX + transactionId,
            JSON.stringify(record),
            'EX',
            TRANSACTION_TTL
        );

        log.info('Transaction created', { transactionId, ownerSessionId: ownerSessionId.substring(0, 8) });

        res.json({
            transactionId,
            url: `/api/transaction/${transactionId}`
        });

    } catch (err) {
        log.error('Transaction creation failed', { error: err.message });
        res.status(500).json({ error: 'Failed to create transaction', message: err.message });
    }
});

// ── Public route: GET /api/transaction/:transactionId ───────────────────────
// (Mounted directly in server.js AFTER sessionTracker but BEFORE the trap
//  catch-all so it doesn't get swallowed)

const publicRouter = express.Router();

publicRouter.get('/api/transaction/:transactionId', async (req, res) => {
    const { transactionId } = req.params;

    try {
        const raw = await redisConnection.get(TRANSACTION_PREFIX + transactionId);

        if (!raw) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const record = JSON.parse(raw);

        // Ownership check — mirrors canaryManager's checkForCanary pattern:
        // compare the current requester's session ID against the stored owner
        const currentSessionId = req.attackSession?.sessionId || null;
        const isOwner = currentSessionId && currentSessionId === record.ownerSessionId;

        const eventType = isOwner
            ? 'TRANSACTION_ACCESS_LEGITIMATE'
            : 'TRANSACTION_ACCESS_MISMATCH';
        const payload   = isOwner
            ? record.realPayload
            : buildFakePayload();

        // Log to timeline — same pattern as trap.js's sessionManager.addTimelineEntry
        if (currentSessionId) {
            try {
                await sessionManager.addTimelineEntry(
                    currentSessionId,
                    eventType,
                    `Transaction ${transactionId} accessed (${isOwner ? 'owner' : 'mismatch'})`,
                    {
                        transactionId,
                        ownerSessionId: record.ownerSessionId,
                        requesterSessionId: currentSessionId,
                        isOwner
                    }
                );
                
                if (!isOwner) {
                    await threatScorer.calculateScore(currentSessionId, {
                        intent: 'UNAUTHORIZED_TRANSACTION_ACCESS',
                        confidence: 1.0,
                        reasons: [`Attempted to access a transaction belonging to a different session (ID: ${transactionId})`]
                    });
                }
            } catch { /* non-critical, same as trap.js */ }
        }

        log.info(`Transaction accessed: ${eventType}`, {
            transactionId,
            requester: (currentSessionId || 'unknown').substring(0, 8),
            owner: record.ownerSessionId.substring(0, 8)
        });

        // Always 200 — the deception is in the content, not the status code
        res.json(payload);

    } catch (err) {
        log.error('Transaction lookup failed', { error: err.message, transactionId });
        // Fail safely — generic response rather than crash
        res.json(buildFakePayload());
    }
});

module.exports = { dashboardRouter, publicRouter };
