const cache = require('../utils/cache');
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function analyzeGithub(githubUrl) {
  if (!githubUrl) return null;
  const cacheKey = `github:${githubUrl}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const parts = githubUrl.replace('https://github.com/', '').replace(/\/$/, '').split('/');
    const owner = parts[0];
    const repo = parts[1];
    if (!owner) { cache.set(cacheKey, null, CACHE_TTL); return null; }

    const headers = { 'User-Agent': 'DorphinResearch/1.0' };

    const repoPath = repo ? `${owner}/${repo}` : null;
    const [repoRes, commitsRes] = await Promise.all([
      repoPath
        ? fetch(`https://api.github.com/repos/${repoPath}`, { headers })
        : fetch(`https://api.github.com/users/${owner}/repos?sort=updated&per_page=1`, { headers }),
      repoPath
        ? fetch(`https://api.github.com/repos/${repoPath}/stats/participation`, { headers })
        : Promise.resolve(null),
    ]);

    let repoData = {};
    if (repoRes.ok) {
      const json = await repoRes.json();
      repoData = Array.isArray(json) ? (json[0] || {}) : json;
    }

    let recentCommits = 0, totalCommits = 0;
    if (commitsRes?.ok) {
      const commitsData = await commitsRes.json();
      if (commitsData?.all) {
        recentCommits = commitsData.all.slice(-4).reduce((a, b) => a + b, 0);
        totalCommits = commitsData.all.reduce((a, b) => a + b, 0);
      }
    }

    const result = {
      repoUrl: githubUrl,
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      openIssues: repoData.open_issues_count || 0,
      lastUpdate: repoData.updated_at || null,
      recentCommits,
      totalCommits,
      isActive: recentCommits > 0,
      isDormant: recentCommits === 0,
    };
    cache.set(cacheKey, result, CACHE_TTL);
    return result;
  } catch (e) {
    console.error(`[GithubAnalyzer] failed: ${e.message}`);
    cache.set(cacheKey, null, CACHE_TTL);
    return null;
  }
}

module.exports = { analyzeGithub };
