const GOPLUS_API_KEY = process.env.GOPLUS_API_KEY;
const BASE_URL = 'https://api.gopluslabs.io/api/v1';

async function getTokenSecurity(contractAddress, chainId = '1') {
  try {
    const headers = GOPLUS_API_KEY ? { 'Authorization': GOPLUS_API_KEY } : {};
    const url = `${BASE_URL}/token_security/${chainId}?contract_addresses=${contractAddress}`;
    
    const res = await fetch(url, { headers });
    const data = await res.json();
    
    if (data.code !== 1) return null;
    
    const result = data.result?.[contractAddress.toLowerCase()];
    if (!result) return null;

    return {
      isHoneypot: result.is_honeypot === '1',
      isOpenSource: result.is_open_source === '1',
      ownerAddress: result.owner_address || null,
      canTakeBackOwnership: result.can_take_back_ownership === '1',
      isProxy: result.is_proxy === '1',
      buyTax: result.buy_tax || '0',
      sellTax: result.sell_tax || '0',
      isBlacklisted: result.is_blacklist === '1',
      isMintable: result.is_mintable === '1',
      lpHolders: result.lp_holders || [],
      lpTotalSupply: result.lp_total_supply || null,
      holderCount: result.holder_count || null,
      top10HolderRatio: result.top10_holder_rate || null,
    };
  } catch (err) {
    console.error(`[GoPlus] getTokenSecurity failed: ${err.message}`);
    return null;
  }
}

module.exports = { getTokenSecurity };
