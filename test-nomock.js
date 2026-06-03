const { aggregateTokenData } = require('./server/services/aggregator');
aggregateTokenData('binancecoin', null, 'bsc').then(res => {
  console.log("Mock Check: Name should be BNB, not Ethereum. Name is:", res.marketData.name);
}).catch(console.error);
