const { Router } = require('express');
const { getListings } = require('../services/newListings');

const router = Router();

router.get('/', (req, res) => {
  const filter = req.query.filter || 'all';
  const listings = getListings(filter);
  res.json({
    listings,
    total: listings.length,
    lastUpdated: new Date().toISOString(),
  });
});

module.exports = router;
