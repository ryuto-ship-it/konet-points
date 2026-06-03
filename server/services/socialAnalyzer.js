const TWITTER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const cache = require('../utils/cache');
const CACHE_TTL = 24 * 60 * 60 * 1000;

async function analyzeTwitterAccount(username) {
  if (!username || !TWITTER_TOKEN) return null;
  const handle = username.replace(/^@/, '').toLowerCase();
  const cacheKey = `social:twitter:${handle}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const userRes = await fetch(
      `https://api.twitter.com/2/users/by/username/${handle}?user.fields=public_metrics,created_at,verified,description`,
      { headers: { Authorization: `Bearer ${TWITTER_TOKEN}` } }
    );
    const userData = await userRes.json();
    const user = userData.data;
    if (!user) { cache.set(cacheKey, null, CACHE_TTL); return null; }

    const accountAgeMonths = Math.floor(
      (Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24 * 30)
    );
    const followers = user.public_metrics.followers_count;
    const following = user.public_metrics.following_count;
    const tweets = user.public_metrics.tweet_count;
    const followerRatio = following > 0 ? parseFloat((followers / following).toFixed(2)) : 999;

    const healthScore =
      (accountAgeMonths >= 12 ? 30 : accountAgeMonths >= 6 ? 20 : 10) +
      (followers >= 10000 ? 30 : followers >= 1000 ? 20 : 10) +
      (followerRatio >= 2 ? 20 : followerRatio >= 1 ? 10 : 0) +
      (tweets >= 500 ? 20 : tweets >= 100 ? 10 : 5);

    const result = {
      username: handle,
      followers,
      following,
      followerRatio,
      tweetCount: tweets,
      accountAgeMonths,
      isNewAccount: accountAgeMonths < 6,
      healthScore,
      healthGrade: healthScore >= 80 ? 'HEALTHY' : healthScore >= 50 ? 'MODERATE' : 'WEAK',
    };
    cache.set(cacheKey, result, CACHE_TTL);
    return result;
  } catch (e) {
    console.error(`[SocialAnalyzer] analyzeTwitterAccount failed: ${e.message}`);
    cache.set(cacheKey, null, CACHE_TTL);
    return null;
  }
}

async function getTelegramInfo(telegramUrl) {
  if (!telegramUrl) return null;
  const username = telegramUrl.split('/').filter(Boolean).pop();
  return { username, url: telegramUrl };
}

module.exports = { analyzeTwitterAccount, getTelegramInfo };
