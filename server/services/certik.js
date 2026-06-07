// Formats CertiK / audit data from CMC into a unified certikData object.
// CertiK's own API (api.certik.com) requires authentication and is not publicly accessible.
// Sub-scores and KYC/bug-bounty badge fields are null unless a paid integration is added.

async function getCertiKDirectData(projectSlug) {
  try {
    const res = await fetch(
      `https://api.certik.com/skynet/v1/projects/${projectSlug}`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function buildCertiKData(cmciDetail) {
  if (!cmciDetail) return null;

  const certik = cmciDetail.certik || null;
  const auditInfos = cmciDetail.auditInfos || [];
  const certikAudit = auditInfos.find(a => a.auditor === 'CertiK');
  const otherAudits = auditInfos.filter(a => a.auditor !== 'CertiK');

  const hasCertikAudit = !!(certikAudit && certikAudit.status === 2);
  const hasAnyAudit = cmciDetail.isAudited === true || auditInfos.some(a => a.status === 2);

  // CertiK Partial Rating: score exists but < 70 → not a full audit
  const certikScore = certik?.score ?? null;
  const isPartialRating = certikScore !== null && certikScore > 0 && certikScore < 70;
  const isFullCertikAudit = hasCertikAudit && certikScore !== null && certikScore >= 70;

  return {
    // Overall audit status
    isAudited: hasAnyAudit,
    hasCertikAudit,
    isPartialRating,
    isFullCertikAudit,

    // CertiK Skynet score (from CMC cryptoRating)
    skynetScore: certikScore,
    skynetRating: certik?.rating ?? null,
    skynetUpdated: certik?.updateTime ?? null,
    skynetLink: certik?.link ?? null,

    // All audit records (multi-auditor)
    auditInfos: auditInfos.map(a => ({
      auditor:   a.auditor,
      completed: a.status === 2,
      date:      a.date,
      reportUrl: a.reportUrl,
    })),

    // Primary audit entry
    primaryAudit: certikAudit
      ? { auditor: 'CertiK', date: certikAudit.date, reportUrl: certikAudit.reportUrl }
      : otherAudits.find(a => a.status === 2)
        ? { auditor: otherAudits[0].auditor, date: otherAudits[0].date, reportUrl: otherAudits[0].reportUrl }
        : null,

    // Sub-scores — require CertiK paid API; null unless integrated
    subScores: {
      codeSecurity:  null,
      operational:   null,
      market:        null,
      community:     null,
      governance:    null,
      fundamental:   null,
    },

    // Badges — require CertiK API; null unless integrated
    badges: {
      auditByCertik:     hasCertikAudit,
      kycByCertik:       null,
      bugBounty:         null,
      contractVerified:  !!(cmciDetail.isAudited),
    },

    // CMC holder data (complementary to on-chain)
    cmcHolderCount:        cmciDetail.cmcHolderCount || null,
    cmcDailyActiveHolders: cmciDetail.cmcDailyActiveHolders || null,
    cmcHolderList:         cmciDetail.cmcHolderList || [],

    // Project age
    dateLaunched: cmciDetail.dateLaunched || null,

    source: 'CoinMarketCap',
  };
}

module.exports = { buildCertiKData, getCertiKDirectData };
