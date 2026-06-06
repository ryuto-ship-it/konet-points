function checkCompliance({
  hasAudit = false,
  teamKYC = false,
  hasWhitepaper = false,
  contractVerified = false,
  hasVestingSchedule = false,
  marketCap = 0,
  description = '',
  tags = [],
}) {
  const daxaRequirements = [
    { item: '스마트 컨트랙트 감사', met: !!hasAudit,       required: true,  note: 'CertiK / Hacken 등 공인 감사 기관' },
    { item: '팀 KYC/KYB',         met: !!teamKYC,        required: true,  note: '창립진 신원 공개 필수' },
    { item: '백서 공개',           met: !!hasWhitepaper,  required: true,  note: '토크노믹스 · 로드맵 포함' },
    { item: '컨트랙트 검증',       met: !!contractVerified, required: true, note: '소스코드 공개 검증 (Etherscan)' },
    { item: '베스팅 스케줄',       met: !!hasVestingSchedule, required: false, note: '팀/투자자 락업 일정' },
  ];

  const requiredItems = daxaRequirements.filter(r => r.required);
  const requiredMet   = requiredItems.filter(r => r.met).length;

  // 업비트 요건
  const upbitRequirements = [
    { item: '스마트 컨트랙트 감사', met: !!hasAudit },
    { item: '팀 신원 공개 (KYC)',  met: !!teamKYC },
    { item: 'DAXA 컴플라이언스',   met: requiredMet === requiredItems.length },
    { item: 'Travel Rule 준수 가능', met: !!contractVerified },
    { item: '백서 공개',            met: !!hasWhitepaper },
  ];

  // 빗썸 요건
  const bithumbRequirements = [
    { item: 'AML/CFT 준수 체계',   met: !!contractVerified },
    { item: '법인 등록 여부',       met: false },
    { item: '컨트랙트 검증',        met: !!contractVerified },
    { item: '백서 공개',            met: !!hasWhitepaper },
  ];

  const upbitScore   = Math.round(upbitRequirements.filter(r => r.met).length   / upbitRequirements.length   * 100);
  const bithumbScore = Math.round(bithumbRequirements.filter(r => r.met).length / bithumbRequirements.length * 100);

  const koreanExchangeScore = Math.round(
    (!!hasAudit        ? 25 : 0) +
    (!!teamKYC         ? 25 : 0) +
    (!!hasWhitepaper   ? 20 : 0) +
    (!!contractVerified? 20 : 0) +
    (!!hasVestingSchedule ? 10 : 0)
  );

  // Simple Howey-test securities indicators
  const desc = (description || '').toLowerCase();
  const securityIndicators = [];
  if (desc.includes('profit'))     securityIndicators.push('수익 기대 명시');
  if (desc.includes('investment')) securityIndicators.push('투자 수단으로 표현');
  if (desc.includes('dividend'))   securityIndicators.push('배당 언급');

  return {
    daxaRequirements,
    daxaComplianceRate: Math.round(requiredMet / requiredItems.length * 100),
    daxaReady: requiredMet === requiredItems.length,
    upbitRequirements,
    upbitScore,
    bithumbRequirements,
    bithumbScore,
    koreanExchangeScore,
    koreanExchangeGrade: koreanExchangeScore >= 80 ? 'READY' : koreanExchangeScore >= 60 ? 'PARTIAL' : 'NOT_READY',
    securityIndicators,
    euMicaApplicable: (marketCap || 0) > 5_000_000,
    usSecRisk: securityIndicators.length >= 2 ? 'HIGH' : 'LOW',
  };
}

module.exports = { checkCompliance };
