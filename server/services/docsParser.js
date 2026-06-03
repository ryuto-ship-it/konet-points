async function fetchAndParseWhitepaper(urls) {
  const { whitepaper, website, docs, technicalDoc } = urls;

  const urlsToTry = [
    whitepaper,
    technicalDoc,
    docs,
    website ? website.replace(/\/$/, '') + '/whitepaper' : null,
    website ? website.replace(/\/$/, '') + '/docs' : null,
    website ? website.replace(/\/$/, '') + '/litepaper' : null,
  ].filter(Boolean);

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DorphinBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/pdf,text/plain',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) continue;

      const contentType = res.headers.get('content-type') || '';
      // Skip PDFs and binary files — only parse HTML/text
      if (contentType.includes('pdf') || contentType.includes('octet-stream')) continue;

      const text = await res.text();

      const cleaned = text
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 5000);

      if (cleaned.length > 200) {
        return { source: url, content: cleaned, found: true };
      }
    } catch {
      continue;
    }
  }

  return { found: false, content: null, source: null };
}

module.exports = { fetchAndParseWhitepaper };
