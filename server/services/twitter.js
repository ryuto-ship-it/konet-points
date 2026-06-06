const cache = require('../utils/cache');

const BASE_URL = 'https://api.twitter.com/2';
const CACHE_TTL_24H = 24 * 60 * 60 * 1000;
const CACHE_TTL_RATE_LIMIT = 15 * 60 * 1000; // 15 min back-off for 429

async function fetchTwitter(path) {
  const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
  if (!BEARER_TOKEN) {
    console.warn('[Twitter] TWITTER_BEARER_TOKEN is not set — skipping');
    throw new Error('TWITTER_BEARER_TOKEN not configured');
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`Twitter API ${res.status}: ${body}`);
    err.statusCode = res.status;
    console.error(`[Twitter] HTTP ${res.status} for ${path}: ${body}`);
    throw err;
  }
  return res.json();
}

async function getTwitterData(username) {
  if (!username) return null;
  const handle = username.replace(/^@/, '').toLowerCase();

  const cacheKey = `twitter:${handle}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) {
    console.log(`[Twitter] Cache hit for @${handle}`);
    return cached;
  }

  try {
    const userData = await fetchTwitter(
      `/users/by/username/${handle}?user.fields=public_metrics,created_at,verified`
    );

    if (!userData.data) {
      cache.set(cacheKey, null, CACHE_TTL_24H);
      return null;
    }

    const user = userData.data;
    const metrics = user.public_metrics || {};

    // Try to get recent 7-day tweet count (requires Basic tier; best-effort)
    let recentTweetCount7d = null;
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const tweetsData = await fetchTwitter(
        `/users/${user.id}/tweets?max_results=10&tweet.fields=created_at&start_time=${sevenDaysAgo}`
      );
      recentTweetCount7d = tweetsData.meta?.result_count ?? tweetsData.data?.length ?? 0;
    } catch (e) {
      // 403 = Free tier doesn't allow timeline endpoint; silently skip
      console.warn(`[Twitter] Could not fetch recent tweets for @${handle} (${e.statusCode ?? 'err'}): ${e.message}`);
    }

    const result = {
      handle,
      followersCount: metrics.followers_count ?? null,
      tweetCount: metrics.tweet_count ?? null,
      createdAt: user.created_at || null,
      verified: user.verified || false,
      recentTweetCount7d,
    };

    cache.set(cacheKey, result, CACHE_TTL_24H);
    console.log(`[Twitter] Fetched data for @${handle} — ${result.followersCount} followers`);
    return result;
  } catch (err) {
    console.error(`[Twitter] getTwitterData failed for @${handle}: HTTP ${err.statusCode ?? 'N/A'} — ${err.message}`);
    // 429: rate-limited — back off 15 min only (not 24h, so it retries sooner)
    // 401: token invalid / not set — no point retrying for 24h
    const ttl = err.statusCode === 429 ? CACHE_TTL_RATE_LIMIT : CACHE_TTL_24H;
    cache.set(cacheKey, null, ttl);
    return null;
  }
}

// Alias matching the requested interface
const getCachedTwitterData = getTwitterData;

module.exports = { getTwitterData, getCachedTwitterData };
