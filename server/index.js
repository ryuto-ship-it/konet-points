/**
 * @module index
 * @description Express server entry point for the Dolphin Research crypto token analysis platform.
 * Sets up CORS, JSON parsing, API routes, error handling, and health check.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const searchRoutes = require('./routes/search');
const reportRoutes = require('./routes/report');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────

// CORS – allow dynamic client URL or local dev server
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse JSON request bodies
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ─── Routes ────────────────────────────────────────────────────────────────────

/** Health check endpoint */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      coingecko: !!process.env.COINGECKO_API_KEY && process.env.COINGECKO_API_KEY !== 'your_coingecko_demo_key',
      etherscan: !!process.env.ETHERSCAN_API_KEY && process.env.ETHERSCAN_API_KEY !== 'your_etherscan_key',
      anthropic: !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_key',
      goplus: !!process.env.GOPLUS_API_KEY,
      twitter: !!process.env.TWITTER_BEARER_TOKEN,
    },
  });
});

/** Token search */
app.use('/api/search', searchRoutes);

/** Report generation */
app.use('/api/report', reportRoutes);

/** New listings feed */
app.use('/api/listings', require('./routes/listings'));

// ─── 404 Handler ───────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
  });
});

// ─── Error Handling Middleware ──────────────────────────────────────────────────

// Express 5 handles async errors automatically, but we still provide a global handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[Server] Unhandled error: ${err.message}`);
  console.error(err.stack);

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Dolphin Research Server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Search:       http://localhost:${PORT}/api/search?q=ethereum`);
  console.log(`   Report:       http://localhost:${PORT}/api/report/ethereum\n`);

  // Explicit Twitter key debug log
  console.log('[Twitter] Key:', !!process.env.TWITTER_BEARER_TOKEN);

  // Log API key status
  const keys = {
    CoinGecko: process.env.COINGECKO_API_KEY && process.env.COINGECKO_API_KEY !== 'your_coingecko_demo_key',
    Etherscan: process.env.ETHERSCAN_API_KEY && process.env.ETHERSCAN_API_KEY !== 'your_etherscan_key',
    Anthropic: process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_key',
    Twitter: !!process.env.TWITTER_BEARER_TOKEN,
  };

  for (const [name, configured] of Object.entries(keys)) {
    console.log(`   ${configured ? '✅' : '⚠️'}  ${name}: ${configured ? 'configured' : 'using mock data'}`);
  }
  console.log('');
});

module.exports = app;
