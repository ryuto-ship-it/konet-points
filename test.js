const { aggregateTokenData } = require('./server/services/aggregator');
aggregateTokenData('binancecoin', null, 'bsc').then(res => {
  console.log(JSON.stringify(res, null, 2));
}).catch(console.error);
