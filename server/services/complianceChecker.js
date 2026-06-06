function calculateKoreanExchangeScore({
  volume24h      = 0,
  liquidity      = 0,
  tokenAgeInDays = 0,
  hasAudit       = false,
  teamKYC        = false,
  hasWhitepaper  = false,
  contractVerified = false,
  holderCount    = 0,
  tier1or2Listed = false,
}) {
  let score = 0;
  const requirements = [];

  // 1. 거래량 (30점) — 가장 중요
  const volK = Math.round((volume24h || 0) / 1000);
  if (volume24h >= 1_000_000) {
    score += 30;
    requirements.push({ item: '일일 거래량 $1M+', met: true });
  } else if (volume24h >= 500_000) {
    score += 15;
    requirements.push({ item: `일일 거래량 $1M+ 필요 (현재 $${volK}K)`, met: false });
  } else {
    requirements.push({ item: `일일 거래량 $1M+ 필요 (현재 $${volK}K)`, met: false });
  }

  // 2. DEX 유동성 (20점)
  const liqK = Math.round((liquidity || 0) / 1000);
  if (liquidity >= 1_000_000) {
    score += 20;
    requirements.push({ item: 'DEX 유동성 $1M+', met: true });
  } else if (liquidity >= 100_000) {
    score += 10;
    requirements.push({ item: `DEX 유동성 $1M+ 필요 (현재 $${liqK}K)`, met: false });
  } else {
    requirements.push({ item: `DEX 유동성 $1M+ 필요 (현재 $${liqK}K)`, met: false });
  }

  // 3. 운영 기간 (15점)
  const days = tokenAgeInDays || 0;
  if (days >= 180) {
    score += 15;
    requirements.push({ item: '운영 기간 6개월+', met: true });
  } else if (days >= 90) {
    score += 7;
    requirements.push({ item: `운영 기간 6개월+ 필요 (현재 ${days}일)`, met: false });
  } else {
    requirements.push({ item: `운영 기간 6개월+ 필요 (현재 ${days}일)`, met: false });
  }

  // 4. 보안 감사 (15점)
  if (hasAudit) {
    score += 15;
    requirements.push({ item: '보안 감사 완료 (CertiK/Hacken)', met: true });
  } else {
    requirements.push({ item: '보안 감사 완료 필요', met: false });
  }

  // 5. 팀 KYC (10점)
  if (teamKYC) {
    score += 10;
    requirements.push({ item: '팀 신원 공개 (KYC)', met: true });
  } else {
    requirements.push({ item: '팀 신원 공개 필요', met: false });
  }

  // 6. 홀더 수 (5점)
  const holders = holderCount || 0;
  if (holders >= 1000) {
    score += 5;
    requirements.push({ item: '홀더 1,000명+', met: true });
  } else {
    requirements.push({
      item: `홀더 1,000명+ 필요${holders > 0 ? ` (현재 ${holders.toLocaleString()}명)` : ''}`,
      met: false,
    });
  }

  // 7. T1/T2 거래소 상장 (5점)
  if (tier1or2Listed) {
    score += 5;
    requirements.push({ item: 'T1/T2 거래소 상장', met: true });
  } else {
    requirements.push({ item: 'T1/T2 거래소 상장 필요', met: false });
  }

  return {
    bithumbScore: score,
    upbitScore: Math.round(score * 0.9),   // 업비트가 더 엄격
    requirements,
    overallGrade: score >= 80 ? 'READY' : score >= 50 ? 'PARTIAL' : 'NOT_READY',
  };
}

function checkCompliance({
  hasAudit          = false,
  teamKYC           = false,
  hasWhitepaper     = false,
  contractVerified  = false,
  hasVestingSchedule = false,
  marketCap         = 0,
  description       = '',
  tags              = [],
  // New fields for realistic exchange score
  volume24h         = 0,
  liquidity         = 0,
  tokenAgeInDays    = 0,
  holderCount       = 0,
  tier1or2Listed    = false,
}) {
  const daxaRequirements = [
    { item: '스마트 컨트랙트 감사', met: !!hasAudit,          required: true,  note: 'CertiK / Hacken 등 공인 감사 기관' },
    { item: '팀 KYC/KYB',         met: !!teamKYC,           required: true,  note: '창립진 신원 공개 필수' },
    { item: '백서 공개',           met: !!hasWhitepaper,     required: true,  note: '토크노믹스 · 로드맵 포함' },
    { item: '컨트랙트 검증',       met: !!contractVerified,  required: true,  note: '소스코드 공개 검증 (Etherscan)' },
    { item: '베스팅 스케줄',       met: !!hasVestingSchedule, required: false, note: '팀/투자자 락업 일정' },
  ];

  const requiredItems = daxaRequirements.filter(r => r.required);
  const requiredMet   = requiredItems.filter(r => r.met).length;
  const allMet        = daxaRequirements.filter(r => r.met).length;

  const upbitRequirements = [
    { item: '스마트 컨트랙트 감사', met: !!hasAudit },
    { item: '팀 신원 공개 (KYC)',  met: !!teamKYC },
    { item: 'DAXA 컴플라이언스',   met: requiredMet === requiredItems.length },
    { item: 'Travel Rule 준수 가능', met: !!contractVerified },
    { item: '백서 공개',            met: !!hasWhitepaper },
  ];

  const bithumbRequirements = [
    { item: 'AML/CFT 준수 체계',   met: !!contractVerified },
    { item: '법인 등록 여부',       met: false },
    { item: '컨트랙트 검증',        met: !!contractVerified },
    { item: '백서 공개',            met: !!hasWhitepaper },
  ];

  const exchangeScore = calculateKoreanExchangeScore({
    volume24h, liquidity, tokenAgeInDays,
    hasAudit, teamKYC, hasWhitepaper, contractVerified,
    holderCount, tier1or2Listed,
  });

  const desc = (description || '').toLowerCase();
  const securityIndicators = [];
  if (desc.includes('profit'))     securityIndicators.push('수익 기대 명시');
  if (desc.includes('investment')) securityIndicators.push('투자 수단으로 표현');
  if (desc.includes('dividend'))   securityIndicators.push('배당 언급');

  return {
    daxaRequirements,
    daxaComplianceRate: Math.round(allMet / daxaRequirements.length * 100),
    daxaReady: requiredMet === requiredItems.length,
    upbitRequirements,
    upbitScore:   exchangeScore.upbitScore,
    bithumbRequirements,
    bithumbScore: exchangeScore.bithumbScore,
    koreanExchangeScore: exchangeScore.bithumbScore,
    koreanExchangeGrade: exchangeScore.overallGrade,
    koreanExchangeRequirements: exchangeScore.requirements,
    securityIndicators,
    euMicaApplicable: (marketCap || 0) > 5_000_000,
    usSecRisk: securityIndicators.length >= 2 ? 'HIGH' : 'LOW',
  };
}

module.exports = { checkCompliance };
