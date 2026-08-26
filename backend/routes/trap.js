const express = require('express');
const router = express.Router();
const { Queue } = require('bullmq');
const redisConnection = require('../config/redis');

// Initialize the BullMQ queue for processing attacker probes
const probeQueue = new Queue('attacker-probes', { connection: redisConnection });

// The Catch-All Trap Route
// Security & Architecture Reasoning: We use router.all('*') to intercept every HTTP method 
// (GET, POST, PUT, DELETE, OPTIONS) and every path. This acts as a universal sinkhole.
router.all('*', async (req, res) => {
    // Extract metadata from the probe. We want to capture as much intelligence as possible.
    const probeData = {
        method: req.method,
        path: req.originalUrl,
        headers: req.headers,
        query: req.query,
        body: req.body,
        ip: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString()
    };

    // Immediate alerting layer
    console.log(`🚨 HACKER PROBE DETECTED: [${probeData.method}] ${probeData.path} from ${probeData.ip}`);

    try {
        // Enqueue the data for heavy lifting (vector search, Gemini API call) later.
        // This decouples ingestion from processing, protecting against DoS attacks.
        await probeQueue.add('probe-event', probeData);
    } catch (err) {
        console.error("Failed to enqueue probe data:", err);
    }

    // Deception Strategy:
    // Return a realistic-looking fake JSON response. A generic 500 error mimics 
    // a vulnerable, broken backend, keeping automated scanners and manual attackers engaged.
    res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while processing the transaction.",
        code: "ERR_INTERNAL_500"
    });
});

module.exports = router;
