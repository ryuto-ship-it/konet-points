const EXCHANGE_TIERS = {
  TIER1: {
    score: 100,
    label: '글로벌 탑티어',
    exchanges: [
      'Binance', 'Coinbase', 'Upbit', 'Bithumb',
      'Coinbase Exchange', 'Coinbase Pro'
    ]
  },
  TIER2: {
    score: 80,
    label: '글로벌 메이저',
    exchanges: [
      'OKX', 'Bybit', 'Kraken', 'Bitfinex',
      'Gemini', 'Bitstamp'
    ]
  },
  TIER3: {
    score: 60,
    label: '미드티어',
    exchanges: [
      'KuCoin', 'HTX', 'Bitget', 'Gate.io',
      'Gate', 'Huobi'
    ]
  },
  TIER4: {
    score: 40,
    label: '소형 검증',
    exchanges: [
      'MEXC', 'BingX', 'LBank', 'BitMart',
      'AscendEX', 'BitMax', 'CoinEx', 'Phemex',
      'WhiteBIT', 'XT.com', 'Pionex', 'CoinW',
      'BloFin', 'ProBit', 'DigiFinex', 'Deepcoin',
      'Hotcoin', 'Nominex', 'Paribu', 'BTCC'
    ]
  },
  TIER5: {
    score: 15,
    label: '미검증/소규모',
    exchanges: []  // 위에 없으면 자동으로 TIER5
  }
};

function getExchangeTier(exchangeName) {
  if (!exchangeName) return { tier: 'TIER5', score: 15, label: '미검증/소규모' };
  const name = exchangeName.toLowerCase().trim();

  for (const [tier, data] of Object.entries(EXCHANGE_TIERS)) {
    if (tier === 'TIER5') continue;
    if (data.exchanges.some(e =>
      name.includes(e.toLowerCase()) ||
      e.toLowerCase().includes(name)
    )) {
      return { tier, score: data.score, label: data.label };
    }
  }
  return { tier: 'TIER5', score: 15, label: '미검증/소규모' };
}

function calculateListingScore(exchanges) {
  if (!exchanges?.length) {
    return {
      score: 0, grade: 'F',
      reason: '상장 거래소 없음',
      tierCounts: {}
    };
  }

  const tierCounts = {
    TIER1: 0, TIER2: 0, TIER3: 0,
    TIER4: 0, TIER5: 0
  };
  let totalScore = 0;

  exchanges.forEach(ex => {
    const name = ex.exchangeName || ex.name || ex.market?.name || '';
    const { tier, score } = getExchangeTier(name);
    tierCounts[tier]++;
    totalScore += score;
  });

  let grade, reason;

  if (tierCounts.TIER1 >= 2) {
    grade = 'A+';
    reason = `글로벌 탑티어 ${tierCounts.TIER1}개 상장 (Binance/Coinbase/Upbit/Bithumb 등)`;
  } else if (tierCounts.TIER1 === 1) {
    grade = 'A';
    reason = `글로벌 탑티어 1개 상장`;
  } else if (tierCounts.TIER2 >= 2) {
    grade = 'B+';
    reason = `메이저 거래소 ${tierCounts.TIER2}개 상장 (OKX/Bybit/Kraken 등)`;
  } else if (tierCounts.TIER2 === 1) {
    grade = 'B';
    reason = `메이저 거래소 1개 상장`;
  } else if (tierCounts.TIER3 >= 2) {
    grade = 'C+';
    reason = `미드티어 거래소 ${tierCounts.TIER3}개 상장 (KuCoin/HTX/Bitget 등)`;
  } else if (tierCounts.TIER3 === 1) {
    grade = 'C';
    reason = `미드티어 거래소 1개 상장`;
  } else if (tierCounts.TIER4 >= 3) {
    grade = 'D+';
    reason = `소형 거래소 ${tierCounts.TIER4}개 상장`;
  } else if (tierCounts.TIER4 >= 1) {
    grade = 'D';
    reason = `소형 거래소 ${tierCounts.TIER4}개 상장`;
  } else {
    grade = 'F';
    reason = '미검증 거래소만 상장 또는 미상장';
  }

  // Base score: tier average
  const baseScore = Math.round(totalScore / exchanges.length);

  // T1/T2 bonus points
  const bonus = (tierCounts.TIER1 * 30) + (tierCounts.TIER2 * 15);
  const score = Math.min(100, baseScore + bonus);

  return { score, grade, reason, tierCounts };
}

module.exports = { getExchangeTier, calculateListingScore, EXCHANGE_TIERS };
