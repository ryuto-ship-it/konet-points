const cache = require('../utils/cache');

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const BASE_URL = 'https://api.twitter.com/2';
const CACHE_TTL_24H = 24 * 60 * 60 * 1000;

async function fetchTwitter(path) {
  if (!BEARER_TOKEN) throw new Error('TWITTER_BEARER_TOKEN not configured');
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Twitter API ${res.status}: ${body}`);
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

    // Try to get recent 7-day tweet count (best-effort, uses a second request)
    let recentTweetCount7d = null;
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const tweetsData = await fetchTwitter(
        `/users/${user.id}/tweets?max_results=100&tweet.fields=created_at&start_time=${sevenDaysAgo}`
      );
      recentTweetCount7d = tweetsData.meta?.result_count ?? tweetsData.data?.length ?? 0;
    } catch (e) {
      console.warn(`[Twitter] Could not fetch recent tweets for @${handle}: ${e.message}`);
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
    console.error(`[Twitter] getTwitterData failed for @${handle}: ${err.message}`);
    // Cache null so we don't hammer the rate limit on repeated failures
    cache.set(cacheKey, null, CACHE_TTL_24H);
    return null;
  }
}

// Alias matching the requested interface
const getCachedTwitterData = getTwitterData;

module.exports = { getTwitterData, getCachedTwitterData };
