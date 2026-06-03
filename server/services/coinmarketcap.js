const CMC_API_KEY = process.env.CMC_API_KEY;
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

async function getProjectInfoByContract(contractAddress) {
  try {
    const headers = CMC_API_KEY ? { 'X-CMC_PRO_API_KEY': CMC_API_KEY } : {};
    const url = `${BASE_URL}/cryptocurrency/info?address=${contractAddress}`;
    
    const res = await fetch(url, { headers });
    const data = await res.json();
    
    if (data.status?.error_code !== 0) {
      console.warn(`[CMC] API Error: ${data.status?.error_message}`);
      return null;
    }

    const coins = data.data;
    if (!coins) return null;

    // The data object keys are the coin IDs, we just get the first valid object
    const coinKeys = Object.keys(coins);
    if (coinKeys.length === 0) return null;
    
    const project = coins[coinKeys[0]];
    
    return {
      description: project.description || '',
      logo: project.logo || '',
      urls: project.urls || {},
      tags: project.tags || [],
      dateAdded: project.date_added || null,
      // Note: certik score might not be directly in the basic info endpoint, 
      // but we return what we find.
    };
  } catch (err) {
    console.error(`[CMC] getProjectInfoByContract failed: ${err.message}`);
    return null;
  }
}

module.exports = { getProjectInfoByContract };
