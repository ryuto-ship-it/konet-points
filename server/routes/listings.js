const { Router } = require('express');
const { getListings, getAvailableDates } = require('../services/newListings');

const router = Router();

router.get('/', (req, res) => {
  const filter = req.query.filter || 'all';
  const date = req.query.date || null;
  const listings = getListings(filter, date);
  const availableDates = getAvailableDates();

  res.json({
    listings,
    total: listings.length,
    availableDates,
    currentDate: date,
    lastUpdated: new Date().toISOString(),
  });
});

module.exports = router;
