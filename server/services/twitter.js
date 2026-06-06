const cache = require('../utils/cache');

const BASE_URL = 'https://api.twitter.com/2';
const CACHE_TTL_24H = 24 * 60 * 60 * 1000;
const CACHE_TTL_RATE_LIMIT = 15 * 60 * 1000;   // 15 min back-off for 429
const CACHE_TTL_CREDITS = 60 * 60 * 1000;       // 1 hr back-off for 402 credits depleted

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
    // 402: credits depleted — retry in 1 hr
    // 429: rate-limited — retry in 15 min
    // 401: invalid token — cache 24h (no point retrying until token is fixed)
    const ttl = err.statusCode === 402 ? CACHE_TTL_CREDITS
              : err.statusCode === 429 ? CACHE_TTL_RATE_LIMIT
              : CACHE_TTL_24H;
    cache.set(cacheKey, null, ttl);
    return null;
  }
}

// Alias matching the requested interface
const getCachedTwitterData = getTwitterData;

async function analyzeTwitterActivity(username) {
  if (!username || !process.env.TWITTER_BEARER_TOKEN) return null;
  const handle = username.replace(/^@/, '').toLowerCase();
  const cacheKey = `twitter:activity:${handle}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const userData = await fetchTwitter(
      `/users/by/username/${handle}?user.fields=public_metrics,created_at`
    );
    const user = userData.data;
    if (!user) {
      cache.set(cacheKey, null, CACHE_TTL_24H);
      return null;
    }

    const metrics = user.public_metrics || {};
    const now = Date.now();
    const accountAgeMonths = Math.floor(
      (now - new Date(user.created_at).getTime()) / (30 * 24 * 60 * 60 * 1000)
    );

    // Try to fetch recent tweets — fails silently on Twitter Free tier (403)
    let tweets = [];
    try {
      const tweetsData = await fetchTwitter(
        `/users/${user.id}/tweets?max_results=10&tweet.fields=created_at,public_metrics`
      );
      tweets = tweetsData.data || [];
    } catch (e) {
      console.warn(`[Twitter] analyzeTwitterActivity: tweet fetch skipped (${e.statusCode ?? 'err'})`);
    }

    const last7days = tweets.filter(
      t => now - new Date(t.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
    ).length;
    const last30days = tweets.filter(
      t => now - new Date(t.created_at).getTime() < 30 * 24 * 60 * 60 * 1000
    ).length;
    const avgEngagement = tweets.length > 0
      ? Math.round(
          tweets.reduce((sum, t) =>
            sum + (t.public_metrics?.like_count || 0) + (t.public_metrics?.retweet_count || 0), 0
          ) / tweets.length
        )
      : null;

    const followersCount = metrics.followers_count || 0;
    const followingCount = metrics.following_count || 0;

    const result = {
      username: handle,
      followers: followersCount,
      following: followingCount,
      totalTweets: metrics.tweet_count || 0,
      accountAgeMonths,
      last7daysTweets:  tweets.length > 0 ? last7days  : null,
      last30daysTweets: tweets.length > 0 ? last30days : null,
      avgEngagement,
      activityLevel: tweets.length > 0
        ? (last7days >= 7 ? 'HIGH' : last7days >= 3 ? 'MEDIUM' : 'LOW')
        : null,
      isNewAccount: accountAgeMonths < 6,
      followerToFollowingRatio: followingCount > 0
        ? parseFloat((followersCount / followingCount).toFixed(1))
        : null,
    };

    cache.set(cacheKey, result, CACHE_TTL_24H);
    return result;
  } catch (err) {
    const ttl = err.statusCode === 402 ? CACHE_TTL_CREDITS
              : err.statusCode === 429 ? CACHE_TTL_RATE_LIMIT
              : CACHE_TTL_24H;
    cache.set(cacheKey, null, ttl);
    console.error(`[Twitter] analyzeTwitterActivity failed for @${handle}: ${err.message}`);
    return null;
  }
}

module.exports = { getTwitterData, getCachedTwitterData, analyzeTwitterActivity };
