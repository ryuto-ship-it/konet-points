const express = require('express');
const router = express.Router();
const { fetchLatestTokens, fetchTokensByDate } = require('../services/newListings');

router.get('/', async (req, res) => {
  try {
    const filter = req.query.filter || 'all';
    const date   = req.query.date   || null;

    const listings = date
      ? await fetchTokensByDate(date, filter)
      : await fetchLatestTokens(filter);

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    res.json({
      listings,
      total:          listings.length,
      currentDate:    date || today,
      availableDates: [today, yesterday],
      lastUpdated:    new Date().toISOString(),
    });
  } catch (e) {
    console.error('[Listings] route error:', e.message);
    res.status(500).json({
      error:    e.message,
      listings: [],
      total:    0,
    });
  }
});

module.exports = router;
