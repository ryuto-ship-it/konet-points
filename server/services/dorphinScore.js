function calculateDorphinScore({
  volume24h      = 0,
  liquidity      = 0,
  marketCap      = 0,
  tokenAgeInDays = 0,
  exchangeCount  = 0,
  tier1Count     = 0,
  tier2Count     = 0,
  tier3Count     = 0,
  priceChange24h = 0,
  priceChange7d  = 0,
  buys           = 0,
  sells          = 0,
  washTradingRisk = 'LOW',
  telegramCount  = 0,
  twitterFollowers = 0,
  holderCount    = 0,
  hasAudit       = false,
  teamKYC        = false,
  lpLockDays     = 0,
  pairCreatedAt  = null,
  athDropPercent = 0,
} = {}) {
  let score = 100;
  const pumpDumpSignals = [];
  const volumeSignals   = [];
  const socialSignals   = [];
  const positiveSignals = [];

  // ── 펌프덤프 패턴 감지 ──────────────────────────────────────────────────────
  // 빠른 다중 상장 + 동시 급락 조합만 의심 — 상장 자체는 긍정
  if (tokenAgeInDays < 14 && exchangeCount >= 5 && athDropPercent > 90) {
    score -= 20;
    pumpDumpSignals.push({
      signal:   '런치앤덤프 패턴',
      detail:   `출시 ${tokenAgeInDays}일 만에 ${exchangeCount}개 거래소 상장 후 ATH 대비 ${athDropPercent.toFixed(0)}% 급락 — 조율된 매도 의심`,
      severity: 'HIGH',
    });
  } else if (exchangeCount >= 5 && tokenAgeInDays < 14) {
    positiveSignals.push(
      `빠른 거래소 확장 — 출시 ${tokenAgeInDays}일 만에 ${exchangeCount}개 거래소 상장`
    );
  }

  // Only fire if Block 1 (launch+dump+exchange) didn't already fire
  if (athDropPercent > 90 && tokenAgeInDays < 30 && pumpDumpSignals.length === 0) {
    score -= 30;
    pumpDumpSignals.push({
      signal:   '런치 앤 덤프 패턴',
      detail:   `출시 ${tokenAgeInDays}일 만에 ATH 대비 ${athDropPercent.toFixed(1)}% 하락`,
      severity: 'CRITICAL',
    });
  }

  // 7일 가격 -80% 이상 급락
  if (priceChange7d < -80) {
    score -= 20;
    pumpDumpSignals.push({
      signal:   '7일 급락',
      detail:   `최근 7일 ${priceChange7d.toFixed(1)}% 하락`,
      severity: 'HIGH',
    });
  }

  // ── 거래량 진위 분석 ────────────────────────────────────────────────────────
  const volLiqRatio = liquidity > 0 ? volume24h / liquidity : 0;
  if (volLiqRatio > 100) {
    score -= 20;
    volumeSignals.push({
      signal:   '워시트레이딩 강한 의심',
      detail:   `거래량/유동성 비율 ${volLiqRatio.toFixed(0)}배 — 정상 범위(1-10배) 초과`,
      severity: 'HIGH',
    });
  } else if (volLiqRatio > 30) {
    score -= 10;
    volumeSignals.push({
      signal:   '워시트레이딩 의심',
      detail:   `거래량/유동성 비율 ${volLiqRatio.toFixed(0)}배 — 과열 범위`,
      severity: 'MEDIUM',
    });
  }

  const sellRatio = (buys + sells) > 0 ? sells / (buys + sells) * 100 : 50;
  if (sellRatio > 65) {
    score -= 15;
    volumeSignals.push({
      signal:   '매도 압력 집중',
      detail:   `매도 비율 ${sellRatio.toFixed(1)}% — 팀/초기투자자 매도 의심`,
      severity: 'HIGH',
    });
  }

  if (washTradingRisk === 'HIGH') {
    score -= 10;
    volumeSignals.push({
      signal:   '온체인 세탁거래 탐지',
      detail:   '반복 주소 거래 패턴 발견 [OnchainVerifier]',
      severity: 'HIGH',
    });
  }

  // ── 소셜 vs 온체인 불일치 ───────────────────────────────────────────────────
  if (telegramCount > 50000 && volume24h < 50000) {
    const perMemberVolume = telegramCount > 0 ? (volume24h / telegramCount).toFixed(2) : '0.00';
    score -= 15;
    socialSignals.push({
      signal:   '커뮤니티-거래 활동 불일치',
      detail:   `멤버 ${telegramCount.toLocaleString()}명 대비 1인당 일거래량 $${perMemberVolume} — 실제 활성 유저 비율이 매우 낮거나 멤버 수가 인위적으로 부풀려진 가능성. 텔레그램 멤버 구매 또는 봇 의심.`,
      severity: 'MEDIUM',
    });
  }

  const mcapMillions = (marketCap || 0) / 1_000_000;

  // 트위터 팔로워 vs 시총 불일치 (큰 시총 + 소규모 커뮤니티)
  if (mcapMillions > 10 && twitterFollowers < 1000 && twitterFollowers > 0) {
    score -= 5;
    socialSignals.push({
      signal:   '커뮤니티 기반 취약',
      detail:   `시총 $${mcapMillions.toFixed(1)}M 대비 트위터 팔로워 ${twitterFollowers.toLocaleString()}명`,
      severity: 'MEDIUM',
    });
  }

  // ── 긍정 신호 ───────────────────────────────────────────────────────────────
  if (hasAudit)          positiveSignals.push('보안 감사 완료');
  if (teamKYC)           positiveSignals.push('팀 신원 공개');
  if (lpLockDays > 365)  positiveSignals.push(`LP ${lpLockDays}일 락업`);
  if (tier1Count > 0)    positiveSignals.push(`티어1 거래소 ${tier1Count}개 상장`);
  else if (tier2Count > 0) positiveSignals.push(`티어2 거래소 ${tier2Count}개 상장`);
  if (holderCount > 1000) positiveSignals.push(`홀더 ${holderCount.toLocaleString()}명`);
  if (liquidity >= 1_000_000) positiveSignals.push('DEX 유동성 $1M+');
  if (tokenAgeInDays >= 180)  positiveSignals.push(`운영 기간 ${tokenAgeInDays}일`);

  score = Math.max(0, Math.min(100, score));

  const grade = score >= 80 ? 'A'
              : score >= 65 ? 'B'
              : score >= 50 ? 'C'
              : score >= 35 ? 'D' : 'F';

  const allWarnings = [...pumpDumpSignals, ...volumeSignals, ...socialSignals];
  const hasCritical = allWarnings.some(s => s.severity === 'CRITICAL');
  const hasHigh     = allWarnings.some(s => s.severity === 'HIGH');

  const summary = hasCritical
    ? '🚨 심각한 러그풀/조작 패턴 감지'
    : hasHigh && pumpDumpSignals.length > 0
      ? '⚠️ 펌프덤프 패턴 감지'
      : hasHigh
        ? '⚠️ 거래량 이상 징후'
        : grade === 'A' || grade === 'B'
          ? '✅ 기본 지표 양호'
          : '📊 추가 검증 필요';

  return {
    dorphinScore: score,
    dorphinGrade: grade,
    pumpDumpSignals,
    volumeSignals,
    socialSignals,
    positiveSignals,
    summary,
    riskLevel: hasCritical ? 'CRITICAL' : hasHigh ? 'HIGH' : allWarnings.length > 0 ? 'MEDIUM' : 'LOW',
  };
}

module.exports = { calculateDorphinScore };
