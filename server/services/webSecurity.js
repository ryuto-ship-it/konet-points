const cache = require('../utils/cache');

const CACHE_TTL = 60 * 60 * 1000; // 1 hr

async function analyzeWebsite(websiteUrl) {
  if (!websiteUrl) return null;

  const cacheKey = `websec:${websiteUrl}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  let result;
  try {
    const url = new URL(websiteUrl);
    const sslOk = url.protocol === 'https:';

    let securityHeaders = {
      'x-frame-options': null,
      'x-content-type-options': null,
      'content-security-policy': null,
      'strict-transport-security': null,
      'x-xss-protection': null,
    };
    let reachable = false;
    let statusCode = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(websiteUrl, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeout);
      statusCode = res.status;
      reachable = res.ok || res.status < 500;

      Object.keys(securityHeaders).forEach(h => {
        securityHeaders[h] = res.headers.get(h) || null;
      });
    } catch (fetchErr) {
      console.warn(`[WebSecurity] HEAD request failed for ${websiteUrl}: ${fetchErr.message}`);
    }

    const presentHeaders = Object.values(securityHeaders).filter(Boolean).length;
    const score = Math.round((sslOk ? 40 : 0) + (presentHeaders / 5 * 60));

    result = {
      url: websiteUrl,
      reachable,
      statusCode,
      sslEnabled: sslOk,
      securityHeaders,
      presentHeaderCount: presentHeaders,
      totalHeaderCount: 5,
      score,
      grade: score >= 80 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW',
    };
  } catch (e) {
    console.warn(`[WebSecurity] analyzeWebsite error for ${websiteUrl}: ${e.message}`);
    result = { url: websiteUrl, error: true, reachable: false, score: 0, grade: 'LOW' };
  }

  cache.set(cacheKey, result, CACHE_TTL);
  console.log(`[WebSecurity] ${websiteUrl} → score ${result.score} (${result.grade})`);
  return result;
}

module.exports = { analyzeWebsite };
