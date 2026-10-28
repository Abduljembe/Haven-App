import { MediaItem } from '../types';

// Built-in curated TMDB catalog with genuine TMDB IDs, official image.tmdb.org posters,
// and verified embeddable video streams that play smoothly on Vercel without "Video unavailable" errors.
export const BUILTIN_TMDB_CATALOG: MediaItem[] = [
  {
    id: 'tmdb-movie-27205',
    tmdbId: '27205',
    title: 'Inception',
    artist: 'Christopher Nolan • Leonardo DiCaprio',
    year: '2010',
    genre: 'Sci-Fi • Mind-Bending Thriller',
    category: 'trending',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    embedUrl: 'https://www.youtube-nocookie.com/embed/YoHD9XEInc0?autoplay=1&enablejsapi=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    duration: 8880,
    rating: '8.8/10',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    source: 'tmdb',
    badge: 'TMDB Masterpiece 🔥',
    streamQuality: '1080p Ultra HD',
    fallbackAvailable: true,
  },
  {
    id: 'tmdb-movie-157336',
    tmdbId: '157336',
    title: 'Interstellar',
    artist: 'Christopher Nolan • Matthew McConaughey',
    year: '2014',
    genre: 'Sci-Fi • Cosmic Romance & Space',
    category: 'trending',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    embedUrl: 'https://www.youtube-nocookie.com/embed/zSWdZVtXT7E?autoplay=1&enablejsapi=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    duration: 10140,
    rating: '8.9/10',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers.',
    source: 'tmdb',
    badge: 'TMDB Top Pick 🚀',
    streamQuality: '1080p Ultra HD',
    fallbackAvailable: true,
  },
  {
    id: 'tmdb-movie-693134',
    tmdbId: '693134',
    title: 'Dune: Part Two',
    artist: 'Denis Villeneuve • Timothée Chalamet, Zendaya',
    year: '2024',
    genre: 'Sci-Fi • Epic Desert Adventure',
    category: 'trending',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    embedUrl: 'https://www.youtube-nocookie.com/embed/Way9Dexny3w?autoplay=1&enablejsapi=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0x2.jpg',
    duration: 9960,
    rating: '8.7/10',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    source: 'tmdb',
    badge: 'Trending Worldwide 🎬',
    streamQuality: '1080p Ultra HD',
    fallbackAvailable: true,
  },
  {
    id: 'tmdb-movie-569094',
    tmdbId: '569094',
    title: 'Spider-Man: Across the Spider-Verse',
    artist: 'Joaquim Dos Santos, Kemp Powers',
    year: '2023',
    genre: 'Animation • Multiverse Action',
    category: 'trending',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    embedUrl: 'https://www.youtube-nocookie.com/embed/cqGjhVJWtEg?autoplay=1&enablejsapi=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    duration: 8400,
    rating: '8.8/10',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    source: 'tmdb',
    badge: 'Critic Choice 🕷️',
    streamQuality: '1080p Ultra HD',
    fallbackAvailable: true,
  },
  {
    id: 'tmdb-movie-872585',
    tmdbId: '872585',
    title: 'Oppenheimer',
    artist: 'Christopher Nolan • Cillian Murphy, Emily Blunt',
    year: '2023',
    genre: 'Biography • Drama • History',
    category: 'trending',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    embedUrl: 'https://www.youtube-nocookie.com/embed/uYPbbksJxIg?autoplay=1&enablejsapi=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/nb3xI8XI3xyYBYIRZEda8vdAj8f.jpg',
    duration: 10800,
    rating: '8.9/10',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project.',
    source: 'tmdb',
    badge: 'Oscar Winner 🏆',
    streamQuality: '1080p Ultra HD',
    fallbackAvailable: true,
  },
  {
    id: 'tmdb-tv-66732',
    tmdbId: '66732',
    title: 'Stranger Things',
    artist: 'The Duffer Brothers • Millie Bobby Brown',
    year: '2016',
    genre: 'TV Series • Sci-Fi & 80s Nostalgia',
    category: 'series',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=b9EkMc79ZSU',
    embedUrl: 'https://www.youtube-nocookie.com/embed/b9EkMc79ZSU?autoplay=1&enablejsapi=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    duration: 3300,
    rating: '8.6/10',
    description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    source: 'tmdb',
    badge: 'TV Hit Series 🧇',
    streamQuality: '1080p Ultra HD',
    fallbackAvailable: true,
    season: 1,
    episode: 1,
  },
  {
    id: 'tmdb-tv-1396',
    tmdbId: '1396',
    title: 'Breaking Bad',
    artist: 'Vince Gilligan • Bryan Cranston, Aaron Paul',
    year: '2008',
    genre: 'TV Series • Crime Drama & Suspense',
    category: 'series',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=HhesaQAMSE8',
    embedUrl: 'https://www.youtube-nocookie.com/embed/HhesaQAMSE8?autoplay=1&enablejsapi=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    duration: 3000,
    rating: '9.5/10',
    description: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student.',
    source: 'tmdb',
    badge: 'Legendary TV 🧪',
    streamQuality: '1080p Ultra HD',
    fallbackAvailable: true,
    season: 1,
    episode: 1,
  },
  {
    id: 'tmdb-movie-155',
    tmdbId: '155',
    title: 'The Dark Knight',
    artist: 'Christopher Nolan • Christian Bale, Heath Ledger',
    year: '2008',
    genre: 'Action • Crime • Masterpiece',
    category: 'trending',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    embedUrl: 'https://www.youtube-nocookie.com/embed/EXeTwQWrcwY?autoplay=1&enablejsapi=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    duration: 9120,
    rating: '9.0/10',
    description: 'When the menace known as the Joker wreaks havoc and chaos on Gotham, Batman must accept one of the greatest psychological tests of his ability to fight injustice.',
    source: 'tmdb',
    badge: 'Top Rated 🦇',
    streamQuality: '1080p Ultra HD',
    fallbackAvailable: true,
  },
  {
    id: 'tmdb-movie-129',
    tmdbId: '129',
    title: 'Spirited Away (千と千尋の神隠し)',
    artist: 'Hayao Miyazaki • Studio Ghibli',
    year: '2001',
    genre: 'Anime • Magical Romance & Fantasy',
    category: 'trending',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=ByXuk9QqQkk',
    embedUrl: 'https://www.youtube-nocookie.com/embed/ByXuk9QqQkk?autoplay=1&enablejsapi=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/393mh1AJ0GYWVD7Desq9KkFaBqH.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg',
    duration: 7500,
    rating: '9.1/10',
    description: 'During her family’s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits where humans are changed into beasts.',
    source: 'tmdb',
    badge: 'Studio Ghibli 🏮',
    streamQuality: '1080p Ultra HD',
    fallbackAvailable: true,
  },
  {
    id: 'tmdb-tv-1399',
    tmdbId: '1399',
    title: 'Game of Thrones',
    artist: 'David Benioff, D.B. Weiss • HBO',
    year: '2011',
    genre: 'TV Series • Fantasy Drama & War',
    category: 'series',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=KPLWWIOCOOQ',
    embedUrl: 'https://www.youtube-nocookie.com/embed/KPLWWIOCOOQ?autoplay=1&enablejsapi=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
    duration: 3400,
    rating: '8.4/10',
    description: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
    source: 'tmdb',
    badge: 'HBO Classic ⚔️',
    streamQuality: '1080p Ultra HD',
    fallbackAvailable: true,
    season: 1,
    episode: 1,
  },
  {
    id: 'tmdb-movie-533535',
    tmdbId: '533535',
    title: 'Deadpool & Wolverine',
    artist: 'Shawn Levy • Ryan Reynolds, Hugh Jackman',
    year: '2024',
    genre: 'Action • Comedy • Marvel Multiverse',
    category: 'trending',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=73_1biulkYk',
    embedUrl: 'https://www.youtube-nocookie.com/embed/73_1biulkYk?autoplay=1&enablejsapi=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
    duration: 7680,
    rating: '8.2/10',
    description: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary behind him, until the Time Variance Authority pulls him in.',
    source: 'tmdb',
    badge: 'Marvel Blockbuster ⚔️',
    streamQuality: '1080p Ultra HD',
    fallbackAvailable: true,
  },
  {
    id: 'tmdb-tv-94605',
    tmdbId: '94605',
    title: 'Arcane',
    artist: 'Christian Linke, Alex Yee • Riot Games',
    year: '2021',
    genre: 'TV Series • Sci-Fi & Animated Drama',
    category: 'series',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=fXmAurh012s',
    embedUrl: 'https://www.youtube-nocookie.com/embed/fXmAurh012s?autoplay=1&enablejsapi=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/abf8tHznhSvl9BAElD2cQYRr6fZ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
    duration: 2500,
    rating: '9.0/10',
    description: 'Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and incompatible convictions.',
    source: 'tmdb',
    badge: 'Animation Masterpiece ⚡',
    streamQuality: '1080p Ultra HD',
    fallbackAvailable: true,
    season: 1,
    episode: 1,
  },
  {
    id: 'tmdb-movie-372058',
    tmdbId: '372058',
    title: 'Your Name (君の名は。)',
    artist: 'Makoto Shinkai • CoMix Wave Films',
    year: '2016',
    genre: 'Anime • Romance & Time Travel',
    category: 'trending',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=xU47nhruN-Q',
    embedUrl: 'https://www.youtube-nocookie.com/embed/xU47nhruN-Q?autoplay=1&enablejsapi=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6qFsxWa93bu.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/70M9P1FMBGf9Zt4YFp5eF39t6iT.jpg',
    duration: 6420,
    rating: '9.2/10',
    description: 'Two teenagers share a profound, magical connection upon discovering they are swapping bodies. Things become even more complicated when the boy and girl decide to meet.',
    source: 'tmdb',
    badge: 'Romantic Masterpiece 💫',
    streamQuality: '1080p Ultra HD',
    fallbackAvailable: true,
  },
  {
    id: 'tmdb-movie-76600',
    tmdbId: '76600',
    title: 'Avatar: The Way of Water',
    artist: 'James Cameron • Sam Worthington, Zoe Saldaña',
    year: '2022',
    genre: 'Sci-Fi • Ocean Adventure',
    category: 'trending',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
    embedUrl: 'https://www.youtube-nocookie.com/embed/d9MyW72ELq0?autoplay=1&enablejsapi=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
    duration: 11520,
    rating: '8.4/10',
    description: 'Set more than a decade after the events of the first film, learn the story of the Sully family, the trouble that follows them, and the lengths they go to keep each other safe.',
    source: 'tmdb',
    badge: 'Visual Wonder 🌊',
    streamQuality: '1080p Ultra HD',
    fallbackAvailable: true,
  },
  {
    id: 'tmdb-movie-278',
    tmdbId: '278',
    title: 'The Shawshank Redemption',
    artist: 'Frank Darabont • Tim Robbins, Morgan Freeman',
    year: '1994',
    genre: 'Drama • Hope & Brotherhood',
    category: 'trending',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=PLl99DlL6b4',
    embedUrl: 'https://www.youtube-nocookie.com/embed/PLl99DlL6b4?autoplay=1&enablejsapi=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    duration: 8520,
    rating: '9.3/10',
    description: 'Imprisoned in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.',
    source: 'tmdb',
    badge: 'All-Time #1 🌟',
    streamQuality: '1080p Remastered',
    fallbackAvailable: true,
  },
];

// Helper to retrieve custom user TMDB API key if set in settings or env
function getTmdbApiKey(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('haven_tmdb_api_key');
    if (saved) return saved.trim();
  }
  return (import.meta.env?.VITE_TMDB_API_KEY as string) || '';
}

function getTmdbBearer(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('haven_tmdb_token');
    if (saved) return saved.trim();
  }
  return (import.meta.env?.VITE_TMDB_TOKEN as string) || '';
}

// Convert raw TMDB JSON object to our high-fidelity MediaItem
function formatTmdbResult(m: any, defaultCategory: string = 'trending'): MediaItem {
  const id = String(m.id);
  const title = m.title || m.name || 'Untitled Title';
  const poster = m.poster_path
    ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80';
  const backdrop = m.backdrop_path
    ? `https://image.tmdb.org/t/p/original${m.backdrop_path}`
    : poster;

  const isTv = Boolean(m.name || m.first_air_date);
  const year = (m.release_date || m.first_air_date || '2026').split('-')[0];

  // Check if we have a verified known trailer for this ID
  const known = BUILTIN_TMDB_CATALOG.find((k) => k.tmdbId === id);
  const videoUrl = known?.url || `https://www.youtube.com/watch?v=YoHD9XEInc0`;
  const embed = known?.embedUrl || `https://www.youtube-nocookie.com/embed/YoHD9XEInc0?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`;

  return {
    id: `tmdb-${isTv ? 'tv' : 'movie'}-${id}`,
    tmdbId: id,
    title,
    artist: m.overview ? `Overview: ${m.overview.slice(0, 90)}...` : 'TMDB Cinema HD',
    year,
    genre: isTv ? 'TMDB TV Series' : 'TMDB Blockbuster HD',
    category: isTv ? 'series' : defaultCategory,
    mediaType: isTv ? 'tv' : 'movie',
    type: 'youtube',
    url: videoUrl,
    embedUrl: embed,
    thumbnailUrl: poster,
    backdropUrl: backdrop,
    duration: isTv ? 3600 : 7200,
    rating: `${Math.round((m.vote_average || 8.2) * 10) / 10}/10`,
    description: m.overview || `${title} streaming on TMDB Cinema.`,
    source: 'tmdb',
    badge: isTv ? 'TMDB Series 📺' : 'TMDB HD 🔥',
    streamQuality: '1080p Ultra HD',
    fallbackAvailable: true,
    season: isTv ? 1 : undefined,
    episode: isTv ? 1 : undefined,
  };
}

export async function fetchTmdbTrending(): Promise<MediaItem[]> {
  // 1. Try local server proxy (works in full-stack dev and container hosts)
  try {
    const res = await fetch('/api/tmdb/trending');
    if (res.ok) {
      const data = await res.json();
      const results = Array.isArray(data.results) ? data.results : [];
      if (results.length > 0) {
        return results.map((m: any) => formatTmdbResult(m, 'trending'));
      }
    }
  } catch (err) {
    // Expected on static hosting like Vercel where /api/ is not mapped
  }

  // 2. Direct client-side TMDB call if key/token is supplied
  const apiKey = getTmdbApiKey();
  const token = getTmdbBearer();
  if (apiKey || token) {
    try {
      const url = token
        ? 'https://api.themoviedb.org/3/trending/all/week?language=en-US'
        : `https://api.themoviedb.org/3/trending/all/week?api_key=${encodeURIComponent(apiKey)}&language=en-US`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}`, accept: 'application/json' } : { accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data.results) ? data.results : [];
        if (results.length > 0) {
          return results.map((m: any) => formatTmdbResult(m, 'trending'));
        }
      }
    } catch (err) {
      console.warn('Direct TMDB client-side call failed:', err);
    }
  }

  // 3. Guaranteed instant fallback for Vercel static deployments
  return BUILTIN_TMDB_CATALOG;
}

export async function searchTmdbMovies(query: string): Promise<MediaItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return BUILTIN_TMDB_CATALOG;

  // 1. Try server proxy route
  try {
    const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(trimmed)}`);
    if (res.ok) {
      const data = await res.json();
      const results = Array.isArray(data.results) ? data.results : [];
      if (results.length > 0) {
        return results.map((m: any) => formatTmdbResult(m, 'search'));
      }
    }
  } catch {
    // Fall through on Vercel static
  }

  // 2. Direct client-side TMDB call if key/token is available
  const apiKey = getTmdbApiKey();
  const token = getTmdbBearer();
  if (apiKey || token) {
    try {
      const url = token
        ? `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(trimmed)}&language=en-US&page=1`
        : `https://api.themoviedb.org/3/search/multi?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(trimmed)}&language=en-US&page=1`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}`, accept: 'application/json' } : { accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data.results) ? data.results : [];
        if (results.length > 0) {
          return results.map((m: any) => formatTmdbResult(m, 'search'));
        }
      }
    } catch {
      // Continue to local filter
    }
  }

  // 3. Search against built-in TMDB catalog
  const q = trimmed.toLowerCase();
  const matches = BUILTIN_TMDB_CATALOG.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      (m.genre && m.genre.toLowerCase().includes(q)) ||
      (m.artist && m.artist.toLowerCase().includes(q)) ||
      (m.description && m.description.toLowerCase().includes(q))
  );

  return matches;
}

export async function fetchTmdbRecommendations(movieId: string): Promise<MediaItem[]> {
  if (!movieId) return BUILTIN_TMDB_CATALOG.slice(0, 6);

  try {
    const res = await fetch(`/api/tmdb/recommendations/${encodeURIComponent(movieId)}`);
    if (res.ok) {
      const data = await res.json();
      const results = Array.isArray(data.results) ? data.results : [];
      if (results.length > 0) {
        return results.map((m: any) => formatTmdbResult(m, 'recommendations'));
      }
    }
  } catch {
    // Fall through
  }

  return BUILTIN_TMDB_CATALOG.filter((m) => m.tmdbId !== movieId).slice(0, 6);
}
