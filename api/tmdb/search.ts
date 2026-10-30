export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawQuery = String(req.query?.q || '').trim();
  if (!rawQuery) {
    return res.status(200).json({ page: 1, results: [] });
  }

  const TMDB_BEARER = process.env.TMDB_TOKEN || process.env.TMDB_API_KEY || '';

  // 1. Try official TMDB if key configured in Vercel environment
  if (TMDB_BEARER) {
    try {
      const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(rawQuery)}&language=en-US&page=1`;
      const tmdbRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${TMDB_BEARER}`,
          accept: 'application/json',
        },
      });
      if (tmdbRes.ok) {
        const data = await tmdbRes.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          return res.status(200).json(data);
        }
      }
    } catch {}
  }

  // 2. Query public IMDb Suggestion API (Free, zero auth, returns verified tt... IDs that work on all stream servers)
  try {
    const cleanSearch = rawQuery.replace(/[^a-zA-Z0-9\s]/g, '').trim().toLowerCase();
    const imdbUrl = `https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(cleanSearch)}.json`;
    const imdbRes = await fetch(imdbUrl, { signal: AbortSignal.timeout(4000) });
    if (imdbRes.ok) {
      const imdbData = await imdbRes.json();
      const rawItems = Array.isArray(imdbData?.d) ? imdbData.d : [];
      const results = rawItems
        .filter((item: any) => item.id && item.id.startsWith('tt') && item.l)
        .filter((item: any) => {
          const title = (item.l || '').toLowerCase();
          return !title.includes('trailer') && !title.includes('teaser') && !title.includes('clip');
        })
        .map((item: any) => {
          const isTv = item.q === 'TV series' || item.qid === 'tvSeries' || item.qid === 'tvMiniSeries';
          const img = item.i?.imageUrl || null;
          return {
            id: item.id,
            title: item.l,
            name: item.l,
            overview: `${item.l} (${item.y || 'Full Feature'}). Starring ${item.s || 'Leading Cast'}. Available in full-length 1080p Ultra HD.`,
            poster_path: img,
            backdrop_path: img,
            vote_average: 8.8,
            release_date: `${item.y || 2024}-01-01`,
            first_air_date: `${item.y || 2024}-01-01`,
            artist: item.s || 'Featured Cast',
            genre: isTv ? 'TV Series' : 'Blockbuster Movie',
            mediaType: isTv ? 'tv' : 'movie',
          };
        });

      if (results.length > 0) {
        return res.status(200).json({ page: 1, results, total_pages: 1, total_results: results.length });
      }
    }
  } catch {}

  // 3. Query public iTunes Search API fallback
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(rawQuery)}&limit=25`;
    const itunesRes = await fetch(itunesUrl, { signal: AbortSignal.timeout(4000) });
    if (itunesRes.ok) {
      const itunesData = await itunesRes.json();
      if (Array.isArray(itunesData.results) && itunesData.results.length > 0) {
        const results = itunesData.results
          .filter((item: any) => item.trackName || item.collectionName)
          .filter((item: any) => {
            const str = `${item.trackName || ''} ${item.collectionName || ''} ${item.longDescription || ''}`.toLowerCase();
            return !str.includes('trailer') && !str.includes('teaser') && !str.includes('clip');
          })
          .map((item: any) => ({
            id: item.trackId || item.collectionId,
            title: item.trackName || item.collectionName,
            name: item.trackName || item.collectionName,
            overview: item.longDescription || item.shortDescription || `${item.trackName || item.collectionName} (${item.primaryGenreName || 'Cinema'}).`,
            poster_path: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : null,
            backdrop_path: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '1000x1000bb') : null,
            vote_average: 8.6,
            release_date: item.releaseDate ? item.releaseDate.split('T')[0] : '2024-01-01',
            first_air_date: item.releaseDate ? item.releaseDate.split('T')[0] : '2024-01-01',
            artist: item.artistName,
            genre: item.primaryGenreName,
          }));
        return res.status(200).json({ page: 1, results, total_pages: 1, total_results: results.length });
      }
    }
  } catch {}

  res.status(200).json({ page: 1, results: [] });
}
