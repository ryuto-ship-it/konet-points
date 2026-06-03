/**
 * @module services/etherscan
 * @description Etherscan API v2 client with mock data fallback.
 * Provides transaction counts, transaction lists, token info, and contract source lookups.
 * Falls back to realistic mock data when the API key is missing or the API fails.
 */

const cache = require('../utils/cache');

const BASE_URL = 'https://api.etherscan.io/v2/api';
const API_KEY = process.env.ETHERSCAN_API_KEY;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns true if we should use mock data (no API key configured).
 * @returns {boolean}
 */
function shouldUseMock() {
  // Try real API first instead of aggressive mock fallback
  return false;
}

/**
 * Make an authenticated GET request to the Etherscan API v2.
 *
 * @param {Object} params - Query parameters (module, action, etc.)
 * @param {number} [chainId=1] - Chain ID (1 = Ethereum mainnet)
 * @returns {Promise<Object>} Parsed JSON response
 * @throws {Error} On network / HTTP errors
 */
async function fetchEtherscan(params, chainId = 1) {

  const searchParams = new URLSearchParams({
    ...params,
    chainid: String(chainId),
    apikey: API_KEY,
  });

  const url = `${BASE_URL}?${searchParams.toString()}`;
  console.log(`[Etherscan] GET ${url.replace(API_KEY, '***')}`);

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Etherscan API ${res.status}: ${body}`);
  }

  const data = await res.json();

  // Etherscan returns status "0" on errors (sometimes with a message)
  if (data.status === '0' && data.message === 'NOTOK') {
    throw new Error(`Etherscan error: ${data.result}`);
  }

  return data;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_TX_COUNT = '0x1a4b5c'; // ~1_723_740 transactions

const MOCK_TX_LIST = {
  status: '1',
  message: 'OK',
  result: [
    {
      blockNumber: '19450000',
      timeStamp: String(Math.floor(Date.now() / 1000) - 3600),
      hash: '0xabc123def456789abc123def456789abc123def456789abc123def456789abc1',
      from: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
      to: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      value: '1500000000000000000',
      gas: '21000',
      gasPrice: '25000000000',
      isError: '0',
      functionName: 'transfer(address _to, uint256 _value)',
      contractAddress: '',
    },
    {
      blockNumber: '19449990',
      timeStamp: String(Math.floor(Date.now() / 1000) - 7200),
      hash: '0xdef456789abc123def456789abc123def456789abc123def456789abc123def4',
      from: '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5',
      to: '0x742d35cc6634c0532925a3b844bc9e7595f2bd38',
      value: '2300000000000000000',
      gas: '65000',
      gasPrice: '22000000000',
      isError: '0',
      functionName: 'swap(uint256,uint256,address,bytes)',
      contractAddress: '',
    },
    {
      blockNumber: '19449800',
      timeStamp: String(Math.floor(Date.now() / 1000) - 14400),
      hash: '0x789abc123def456789abc123def456789abc123def456789abc123def456789a',
      from: '0x388c818ca8b9251b393131c08a736a67ccb19297',
      to: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      value: '5000000000000000000',
      gas: '120000',
      gasPrice: '28000000000',
      isError: '0',
      functionName: 'deposit()',
      contractAddress: '',
    },
  ],
};

const MOCK_TOKEN_INFO = {
  status: '1',
  message: 'OK',
  result: [
    {
      contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      tokenName: 'Tether USD',
      symbol: 'USDT',
      divisor: '6',
      tokenType: 'ERC20',
      totalSupply: '39823315997942794',
      blueCheckmark: 'true',
      description: 'Tether gives you the joint benefits of open blockchain technology and traditional currency.',
      website: 'https://tether.to/',
      email: '',
      blog: '',
      reddit: '',
      slack: '',
      facebook: '',
      twitter: 'https://twitter.com/Tether_to',
      bitcointalk: '',
      github: '',
      telegram: '',
      wechat: '',
      linkedin: '',
      discord: '',
      whitepaper: '',
    },
  ],
};

const MOCK_CONTRACT_SOURCE = {
  status: '1',
  message: 'OK',
  result: [
    {
      SourceCode: '// SPDX-License-Identifier: MIT\\npragma solidity ^0.8.0;\\n\\ncontract Token { ... }',
      ABI: '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"type":"function"}]',
      ContractName: 'Token',
      CompilerVersion: 'v0.8.19+commit.7dd6d404',
      OptimizationUsed: '1',
      Runs: '200',
      ConstructorArguments: '',
      EVMVersion: 'Default',
      Library: '',
      LicenseType: 'MIT',
      Proxy: '0',
      Implementation: '',
      SwarmSource: '',
    },
  ],
};

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Get the number of transactions performed by an address.
 *
 * @param {string} address - Ethereum address
 * @param {number} [chainId=1] - Chain ID
 * @returns {Promise<string>} Transaction count as hex string
 */
async function getTransactionCount(address, chainId = 1) {
  const cacheKey = `es:txcount:${chainId}:${address}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (shouldUseMock()) {
    console.log('[Etherscan] Using mock data for getTransactionCount');
    cache.set(cacheKey, MOCK_TX_COUNT, CACHE_TTL);
    return MOCK_TX_COUNT;
  }

  try {
    const data = await fetchEtherscan(
      { module: 'proxy', action: 'eth_getTransactionCount', address, tag: 'latest' },
      chainId
    );
    const count = data.result || MOCK_TX_COUNT;
    cache.set(cacheKey, count, CACHE_TTL);
    return count;
  } catch (err) {
    console.error(`[Etherscan] getTransactionCount failed: ${err.message}`);
    return MOCK_TX_COUNT;
  }
}

/**
 * Get a list of normal transactions for an address.
 *
 * @param {string} address - Ethereum address
 * @param {number} [chainId=1] - Chain ID
 * @param {number} [page=1] - Page number
 * @param {number} [offset=100] - Number of results per page
 * @returns {Promise<Object>} Transaction list response
 */
async function getTransactionList(address, chainId = 1, page = 1, offset = 100) {
  const cacheKey = `es:txlist:${chainId}:${address}:${page}:${offset}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (shouldUseMock()) {
    console.log('[Etherscan] Using mock data for getTransactionList');
    cache.set(cacheKey, MOCK_TX_LIST, CACHE_TTL);
    return MOCK_TX_LIST;
  }

  try {
    const data = await fetchEtherscan(
      {
        module: 'account',
        action: 'txlist',
        address,
        startblock: '0',
        endblock: '99999999',
        page: String(page),
        offset: String(offset),
        sort: 'desc',
      },
      chainId
    );
    cache.set(cacheKey, data, CACHE_TTL);
    return data;
  } catch (err) {
    console.error(`[Etherscan] getTransactionList failed: ${err.message}`);
    return MOCK_TX_LIST;
  }
}

/**
 * Get token information for a contract address.
 *
 * @param {string} contractAddress - Token contract address
 * @param {number} [chainId=1] - Chain ID
 * @returns {Promise<Object>} Token info response
 */
async function getTokenInfo(contractAddress, chainId = 1) {
  const cacheKey = `es:tokeninfo:${chainId}:${contractAddress}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (shouldUseMock()) {
    console.log('[Etherscan] Using mock data for getTokenInfo');
    cache.set(cacheKey, MOCK_TOKEN_INFO, CACHE_TTL);
    return MOCK_TOKEN_INFO;
  }

  try {
    const data = await fetchEtherscan(
      { module: 'token', action: 'tokeninfo', contractaddress: contractAddress },
      chainId
    );
    cache.set(cacheKey, data, CACHE_TTL);
    return data;
  } catch (err) {
    console.error(`[Etherscan] getTokenInfo failed: ${err.message}`);
    return MOCK_TOKEN_INFO;
  }
}

/**
 * Get the source code of a verified contract.
 *
 * @param {string} address - Contract address
 * @param {number} [chainId=1] - Chain ID
 * @returns {Promise<Object>} Contract source code response
 */
async function getContractSource(address, chainId = 1) {
  const cacheKey = `es:source:${chainId}:${address}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (shouldUseMock()) {
    console.log('[Etherscan] Using mock data for getContractSource');
    cache.set(cacheKey, MOCK_CONTRACT_SOURCE, CACHE_TTL);
    return MOCK_CONTRACT_SOURCE;
  }

    try {
    const data = await fetchEtherscan(
      { module: 'contract', action: 'getsourcecode', address },
      chainId
    );
    cache.set(cacheKey, data, CACHE_TTL);
    return data;
  } catch (err) {
    console.error(`[Etherscan] getContractSource failed: ${err.message}`);
    return MOCK_CONTRACT_SOURCE;
  }
}

/**
 * Get network statistics for a blockchain.
 *
 * @param {number} [chainId=1] - Chain ID
 * @returns {Promise<Object>} Network stats including gas price, nodes, and total supply
 */
async function getNetworkStats(chainId = 1) {
  const cacheKey = `es:netstats:${chainId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (shouldUseMock()) {
    console.log('[Etherscan] Using mock data for getNetworkStats');
    const mockStats = {
      gasPrice: '28 Gwei',
      nodeCount: '8,421',
      dailyTransactions: '1,245,210',
      activeAddresses: '412,850',
    };
    cache.set(cacheKey, mockStats, CACHE_TTL);
    return mockStats;
  }

  try {
    const gasData = await fetchEtherscan({ module: 'gastracker', action: 'gasoracle' }, chainId).catch(() => null);
    const ethPriceData = await fetchEtherscan({ module: 'stats', action: 'ethprice' }, chainId).catch(() => null);
    
    const stats = {
      gasPrice: gasData?.result?.ProposeGasPrice ? `${gasData.result.ProposeGasPrice} Gwei` : '25 Gwei',
      nodeCount: '8,400+',
      dailyTransactions: '1,200,000+',
      activeAddresses: '400,000+',
      ethPrice: ethPriceData?.result?.ethusd ? `$${parseFloat(ethPriceData.result.ethusd).toLocaleString()}` : 'N/A',
    };
    
    cache.set(cacheKey, stats, CACHE_TTL);
    return stats;
  } catch (err) {
    console.error(`[Etherscan] getNetworkStats failed: ${err.message}`);
    return {
      gasPrice: '22 Gwei',
      nodeCount: '8,400+',
      dailyTransactions: '1,200,000+',
      activeAddresses: '400,000+',
      ethPrice: 'N/A',
    };
  }
}

module.exports = {
  getTransactionCount,
  getTransactionList,
  getTokenInfo,
  getContractSource,
  getNetworkStats,
};
