require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const trapRoute = require('./routes/trap');
require('./workers/ragWorker'); // Initialize and start the BullMQ worker

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for parsing incoming JSON payloads securely
app.use(express.json());

// Enable CORS to allow cross-origin probes, mimicking a public-facing vulnerable API
app.use(cors());

// Log incoming requests for initial visibility before deeper inspection
app.use(morgan('combined'));

// Mount the catch-all trap route
// Architecture Reasoning: This sinkhole captures all traffic that doesn't hit a defined route,
// ensuring every probe across the entire endpoint surface is logged and sent to the queue.
app.use('*', trapRoute);

// Robust global error handling
// Security Reasoning: Attackers often send malformed payloads (e.g., extremely large JSON, invalid syntax)
// to crash the application. This ensures the honeypot gracefully handles them and stays alive.
app.use((err, req, res, next) => {
    console.error(`🚨 INTERNAL ERROR:`, err.message);
    res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🛡️  Project Labyrinth Honeypot is active and listening on port ${PORT}`);
});
