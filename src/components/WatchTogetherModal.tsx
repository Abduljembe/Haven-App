import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  Tv,
  Plus,
  Heart,
  Sparkles,
  Users,
  SkipForward,
  FastForward,
  SkipBack,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneCall,
  PhoneOff,
  Search,
  Film,
  Bookmark,
  BookmarkCheck,
  Send,
  MessageSquare,
  Maximize,
  Minimize,
  Maximize2,
  Minimize2,
  Sliders,
  Flame,
  Laugh,
  Eye,
  Info,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Copy,
  Loader2,
  Globe,
  Dices,
  Clapperboard,
  Sparkle,
  ChevronLeft,
  ChevronRight,
  Star,
  Check,
  EyeOff,
  Key,
  ShieldCheck,
  HelpCircle,
  Server,
  Palette,
  RefreshCw,
  Layers,
  Zap,
} from 'lucide-react';
import {
  MediaItem,
  MediaSyncState,
  UserProfile,
  InMovieComment,
  MovieWatchlistEntry,
  CallType,
  CallStatus,
} from '../types';
import { FEATURED_MOVIES, extractYouTubeId, searchOrFetchMovie, fetchOnlineMovies, searchOnlineMovies, getSurpriseMovie, fetchDirectYouTubeVideo, searchYouTubeDirect } from '../utils/movieCatalog';
import { fetchTmdbTrending, searchTmdbMovies, getTmdbStreamUrl, isTrailerOrClip } from '../utils/tmdbService';
import { VerifiedBadgeOverlay } from './common/VerifiedBadgeOverlay';
import { useHavenVoiceAssistant } from '../hooks/useHavenVoiceAssistant';
import { HavenVoiceControl } from './HavenVoiceControl';
import { SeriesSeasonPickerModal } from './SeriesSeasonPickerModal';
import { isSeriesItem, cleanSeriesTitle, getSeriesSeasons } from '../utils/seriesData';

interface WatchTogetherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  partner: UserProfile | null;
  partnerName: string;
  mediaSyncState: MediaSyncState | null;
  onSyncMedia: (state: MediaSyncState) => void;
  onSendLoveBurst: (emoji: string) => void;
  // Space Type & Squad Context
  spaceType?: 'couple' | 'friends';
  groupName?: string;
  groupEmoji?: string;
  roomMembers?: UserProfile[];
  // Voice & Video Call Integration for talking during movies
  activeCallType: CallType | null;
  callStatus: CallStatus;
  isMuted: boolean;
  isVideoEnabled: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onStartCall: (type: CallType) => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onSendInMovieComment?: (comment: InMovieComment) => void;
  incomingInMovieComment?: InMovieComment | null;
}

export const WatchTogetherModal: React.FC<WatchTogetherModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  partner,
  partnerName,
  mediaSyncState,
  onSyncMedia,
  onSendLoveBurst,
  spaceType = 'couple',
  groupName,
  groupEmoji,
  roomMembers,
  activeCallType,
  callStatus,
  isMuted,
  isVideoEnabled,
  localStream,
  remoteStream,
  onStartCall,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onSendInMovieComment,
  incomingInMovieComment,
}) => {
  const isFriends = spaceType === 'friends';
  const effectiveGroupName = groupName || 'Squad Hangout';
  const squadMembersCount = roomMembers && roomMembers.length > 0 ? roomMembers.length : 1;
  const [currentMedia, setCurrentMedia] = useState<MediaItem>(FEATURED_MOVIES[0]);
  const ytId = currentMedia.type === 'youtube' ? extractYouTubeId(currentMedia.url) : null;
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPlayerActive, setIsPlayerActive] = useState<boolean>(() => {
    return Boolean(mediaSyncState?.isPlaying);
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [movieVolume, setMovieVolume] = useState(0.85);
  const [isMutedMovie, setIsMutedMovie] = useState(false);
  const [lastSyncBy, setLastSyncBy] = useState<string>('');

  // Movie Fetcher & Search States (TMDB & YouTube Cinema)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'all' | 'tmdb' | 'youtube'>('tmdb');
  const [selectedCategory, setSelectedCategory] = useState<string>('tmdb');
  const [searchResults, setSearchResults] = useState<MediaItem[]>(FEATURED_MOVIES);
  const [isSearching, setIsSearching] = useState(false);
  const [showCatalog, setShowCatalog] = useState(true);
  const [showCustomLinkInput, setShowCustomLinkInput] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [ytFetchLoading, setYtFetchLoading] = useState(false);
  const [ytPreviewItem, setYtPreviewItem] = useState<MediaItem | null>(null);

  // TMDB & Series State
  const [showTmdbInfoModal, setShowTmdbInfoModal] = useState(false);
  const [userTmdbKey, setUserTmdbKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('haven_tmdb_api_key') || '';
    }
    return '';
  });
  const [seriesModalItem, setSeriesModalItem] = useState<MediaItem | null>(null);
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Showcase Spotlight & Screen Share States
  const [spotlightMovie, setSpotlightMovie] = useState<MediaItem>(FEATURED_MOVIES[0]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localScreenStream, setLocalScreenStream] = useState<MediaStream | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  // Shared Couple / Squad Watchlist
  const watchlistKey = isFriends ? 'haven_squad_watchlist' : 'haven_movie_watchlist';
  const [watchlist, setWatchlist] = useState<MovieWatchlistEntry[]>(() => {
    try {
      const saved = localStorage.getItem(isFriends ? 'haven_squad_watchlist' : 'haven_movie_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Talking / Voice Chat & Audio Ducking
  const [autoDucking, setAutoDucking] = useState(true);
  const [showCamPiP, setShowCamPiP] = useState(true);
  const [isPartnerSpeaking, setIsPartnerSpeaking] = useState(false);
  const [partnerVoiceVolume, setPartnerVoiceVolume] = useState(1.0);

  // In-Movie Live Bullet Comments (Danmaku)
  const [liveComments, setLiveComments] = useState<InMovieComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [showSideChat, setShowSideChat] = useState(false);
  const [isSideChatFullscreen, setIsSideChatFullscreen] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControlsInFullscreen, setShowControlsInFullscreen] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Autoplay & Next Video Management
  const [isAutoplayNext, setIsAutoplayNext] = useState<boolean>(true);
  const [nextCountdown, setNextCountdown] = useState<{
    active: boolean;
    secondsLeft: number;
    nextMovie: MediaItem;
  } | null>(null);
  const hasTriggeredEndedRef = useRef<boolean>(false);
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);
  const cinemaIframeRef = useRef<HTMLIFrameElement | null>(null);
  const isPlayingRef = useRef<boolean>(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Haven Cinema Ad Shield & Stop/Resume Protection States
  const [adShieldActive, setAdShieldActive] = useState<boolean>(false);
  const [isEmbedSuspended, setIsEmbedSuspended] = useState<boolean>(false);
  const [screenActionIndicator, setScreenActionIndicator] = useState<'play' | 'pause' | null>(null);
  const [blockedAdsCount, setBlockedAdsCount] = useState<number>(0);
  const [showShieldToast, setShowShieldToast] = useState<boolean>(false);
  const indicatorTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shieldToastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Global popup guard against unwanted ad popups & redirects outside the app
  useEffect(() => {
    if (!isOpen) return;
    const originalOpen = window.open;
    window.open = function (url?: string | URL, target?: string, features?: string) {
      console.warn('[Haven Cinema Ad Shield] Intercepted and blocked unwanted popup window:', url);
      setBlockedAdsCount((prev) => prev + 1);
      setShowShieldToast(true);
      if (shieldToastTimerRef.current) clearTimeout(shieldToastTimerRef.current);
      shieldToastTimerRef.current = setTimeout(() => {
        setShowShieldToast(false);
      }, 3500);
      return null;
    };
    return () => {
      window.open = originalOpen;
      if (shieldToastTimerRef.current) clearTimeout(shieldToastTimerRef.current);
      if (indicatorTimerRef.current) clearTimeout(indicatorTimerRef.current);
    };
  }, [isOpen]);

  // Send control commands to embedded YouTube iframe
  const sendYouTubeCommand = useCallback((func: string, args: any[] = []) => {
    if (ytIframeRef.current?.contentWindow) {
      try {
        ytIframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func,
            args,
          }),
          '*'
        );
        // Also post with empty string args if args is empty, ensuring universal YouTube embed compatibility
        if (args.length === 0) {
          ytIframeRef.current.contentWindow.postMessage(
            JSON.stringify({
              event: 'command',
              func,
              args: '',
            }),
            '*'
          );
        }
      } catch (err) {
        console.warn('Failed to post command to YouTube iframe:', err);
      }
    }
  }, []);

  // Send play/pause commands to embedded streaming cinema iframe
  const sendCinemaCommand = useCallback((action: 'play' | 'pause') => {
    const iframe = cinemaIframeRef.current;
    if (!iframe?.contentWindow) return;
    const targetFunc = action === 'play' ? 'playVideo' : 'pauseVideo';
    const payloads = [
      { event: 'command', func: targetFunc, args: [] },
      { event: 'command', func: action, args: [] },
      { action },
      { method: action },
      { type: action },
      { type: `player:${action}` },
      { type: 'PLAYER_EVENT', data: { event: action } },
      { event: action },
      { context: 'player.bi', action },
      action,
    ];
    payloads.forEach((payload) => {
      try {
        iframe.contentWindow?.postMessage(typeof payload === 'string' ? payload : JSON.stringify(payload), '*');
        if (typeof payload !== 'string') {
          iframe.contentWindow?.postMessage(payload, '*');
        }
      } catch {
        // Cross-origin message safety
      }
    });
  }, []);

  // Synchronized movie volume change handler (supports HTML5 video and YouTube)
  const handleMovieVolumeChange = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setMovieVolume(clamped);
    const muted = clamped === 0;
    setIsMutedMovie(muted);

    if (videoRef.current) {
      videoRef.current.volume = clamped;
      videoRef.current.muted = muted;
    }

    if (muted) {
      sendYouTubeCommand('mute');
    } else {
      sendYouTubeCommand('unMute');
      sendYouTubeCommand('setVolume', [Math.round(clamped * 100)]);
    }
  }, [sendYouTubeCommand]);

  // Synchronized mute toggle handler
  const handleToggleMovieMute = useCallback(() => {
    const nextMuted = !isMutedMovie;
    setIsMutedMovie(nextMuted);

    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      if (!nextMuted) {
        videoRef.current.volume = movieVolume > 0 ? movieVolume : 0.85;
      }
    }

    if (nextMuted) {
      sendYouTubeCommand('mute');
    } else {
      sendYouTubeCommand('unMute');
      const target = movieVolume > 0 ? movieVolume : 0.85;
      sendYouTubeCommand('setVolume', [Math.round(target * 100)]);
    }
  }, [isMutedMovie, movieVolume, sendYouTubeCommand]);

  const isCallActive = callStatus === 'connected';

  // Attach local and remote streams to video/audio tags
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, showCamPiP]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.volume = partnerVoiceVolume;
    }
  }, [remoteStream, showCamPiP, partnerVoiceVolume]);

  // Voice Activity Detection / Audio Ducking:
  // When partner voice stream has active audio, smoothly duck the movie volume
  useEffect(() => {
    if (!remoteStream || !isCallActive || !autoDucking) return;

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let animationFrameId: number;

    try {
      const audioTrack = remoteStream.getAudioTracks()[0];
      if (audioTrack) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContext = new AudioCtx();
        const source = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudioLevel = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          const speaking = average > 25; // voice threshold
          setIsPartnerSpeaking(speaking);

          // Duck movie volume if partner is speaking (supports both HTML5 and YouTube)
          const targetVol = isMutedMovie
            ? 0
            : speaking
            ? Math.max(0.15, movieVolume * 0.3)
            : movieVolume;

          if (videoRef.current) {
            videoRef.current.volume = targetVol;
          }
          if (ytId && !isMutedMovie) {
            sendYouTubeCommand('setVolume', [Math.round(targetVol * 100)]);
          }

          animationFrameId = requestAnimationFrame(checkAudioLevel);
        };

        checkAudioLevel();
      }
    } catch {
      // ignore web audio restrictions
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
    };
  }, [remoteStream, isCallActive, autoDucking, movieVolume, isMutedMovie]);

  // Listen for incoming in-movie bullet comments
  useEffect(() => {
    if (incomingInMovieComment) {
      setLiveComments((prev) => [...prev.slice(-25), incomingInMovieComment]);
    }
  }, [incomingInMovieComment]);

  // Sync state from incoming partner updates
  useEffect(() => {
    if (!mediaSyncState) return;

    // Ignore self-broadcasts to prevent race condition feedback loops
    if (mediaSyncState.updatedBy === currentUserId) return;

    if (mediaSyncState.currentMedia && mediaSyncState.currentMedia.id !== currentMedia.id) {
      setCurrentMedia(mediaSyncState.currentMedia);
      setIsPlayerActive(true);
    }

    if (mediaSyncState.isPlaying) {
      setIsPlayerActive(true);
    }

    setLastSyncBy(mediaSyncState.updatedByName || partnerName);

    if (videoRef.current && currentMedia.type === 'video') {
      const video = videoRef.current;
      const timeDiff = Math.abs(video.currentTime - mediaSyncState.currentTime);
      if (timeDiff > 2.5) {
        video.currentTime = mediaSyncState.currentTime;
      }

      if (mediaSyncState.isPlaying) {
        video.play().catch(() => {});
        setIsPlaying(true);
        isPlayingRef.current = true;
      } else {
        video.pause();
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
    } else {
      setIsPlaying(mediaSyncState.isPlaying);
      isPlayingRef.current = mediaSyncState.isPlaying;
      setCurrentTime(mediaSyncState.currentTime);

      const isYt = currentMedia.type === 'youtube' || Boolean(ytId);
      if (isYt) {
        sendYouTubeCommand(mediaSyncState.isPlaying ? 'playVideo' : 'pauseVideo');
      } else {
        sendCinemaCommand(mediaSyncState.isPlaying ? 'play' : 'pause');
      }
    }
  }, [mediaSyncState, currentMedia.id, currentMedia.type, partnerName, currentUserId, ytId, sendYouTubeCommand, sendCinemaCommand]);

  // Broadcast sync state helper
  const broadcastSync = useCallback(
    (newPlaying: boolean, newTime: number, media: MediaItem = currentMedia) => {
      onSyncMedia({
        currentMedia: media,
        isPlaying: newPlaying,
        currentTime: newTime,
        updatedAt: Date.now(),
        updatedBy: currentUserId,
        updatedByName: currentUserName,
      });
    },
    [currentMedia, currentUserId, currentUserName, onSyncMedia]
  );

  // Play / Pause Toggle (Supports HTML5 video, YouTube, TMDB cinema & embeds)
  const togglePlayPause = useCallback(
    (forceState?: boolean | React.MouseEvent | any) => {
      const isExplicitBool = typeof forceState === 'boolean';
      const currentState = isPlayingRef.current;
      const nextState = isExplicitBool ? forceState : !currentState;

      setIsPlaying(nextState);
      isPlayingRef.current = nextState;
      if (nextState) {
        setIsPlayerActive(true);
        setIsEmbedSuspended(false);
      }

      // Show on-screen action ripple/HUD
      setScreenActionIndicator(nextState ? 'play' : 'pause');
      if (indicatorTimerRef.current) clearTimeout(indicatorTimerRef.current);
      indicatorTimerRef.current = setTimeout(() => {
        setScreenActionIndicator(null);
      }, 900);

      const mediaType = currentMedia.type;
      const isYt = mediaType === 'youtube' || Boolean(ytId);

      if (mediaType === 'video' && videoRef.current) {
        if (nextState) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      } else if (isYt) {
        sendYouTubeCommand(nextState ? 'playVideo' : 'pauseVideo');
      } else {
        // TMDB & embedded streaming cinema: send command without destroying iframe
        sendCinemaCommand(nextState ? 'play' : 'pause');
      }

      broadcastSync(nextState, videoRef.current ? videoRef.current.currentTime : currentTime);
    },
    [currentMedia.type, ytId, sendYouTubeCommand, sendCinemaCommand, broadcastSync, currentTime]
  );

  // Dedicated Stop Movie & Silence Stream
  const handleStopMovie = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setIsEmbedSuspended(true);
    setScreenActionIndicator('pause');
    if (indicatorTimerRef.current) clearTimeout(indicatorTimerRef.current);
    indicatorTimerRef.current = setTimeout(() => {
      setScreenActionIndicator(null);
    }, 900);

    const mediaType = currentMedia.type;
    const isYt = mediaType === 'youtube' || Boolean(ytId);

    if (mediaType === 'video' && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    } else if (isYt) {
      sendYouTubeCommand('pauseVideo');
    } else {
      sendCinemaCommand('pause');
    }

    broadcastSync(false, 0);
  }, [currentMedia.type, ytId, sendYouTubeCommand, sendCinemaCommand, broadcastSync]);

  // Click on video screen handler (interception layer to prevent third-party ad popups)
  const handleScreenClick = useCallback(() => {
    togglePlayPause();
  }, [togglePlayPause]);

  // Screen Share Toggle (Watch Screen / Tab with Audio)
  const handleToggleScreenShare = async () => {
    if (isScreenSharing && localScreenStream) {
      localScreenStream.getTracks().forEach((t) => t.stop());
      setLocalScreenStream(null);
      setIsScreenSharing(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: true, // Captures tab and movie audio from browser tab, video, or YouTube
      });

      setLocalScreenStream(stream);
      setIsScreenSharing(true);

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }

      stream.getVideoTracks()[0].onended = () => {
        stream.getTracks().forEach((t) => t.stop());
        setLocalScreenStream(null);
        setIsScreenSharing(false);
      };
    } catch (err) {
      console.warn('Screen share cancelled or not supported:', err);
    }
  };

  useEffect(() => {
    if (screenVideoRef.current && localScreenStream) {
      screenVideoRef.current.srcObject = localScreenStream;
    }
  }, [localScreenStream, isScreenSharing]);

  // Change Movie or Stream (Excludes trailers; streams real 1080p full movie / episodes)
  const handleChangeMovie = useCallback((media: MediaItem) => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setNextCountdown(null);
    hasTriggeredEndedRef.current = false;

    // Ensure TMDB movies and shows stream the real 1080p full movie / full episode, NOT a trailer
    let resolvedMedia: MediaItem = { ...media };
    if (media.source === 'tmdb' || media.tmdbId || media.id.startsWith('tmdb-')) {
      const isTv = isSeriesItem(media);
      const cleanId = String(media.tmdbId || media.id).replace(/^tmdb-(movie|tv)-/, '');
      const srv = media.server || 1;
      const fullMovieEmbedUrl = getTmdbStreamUrl(cleanId, isTv, media.season || 1, media.episode || 1, srv);
      resolvedMedia = {
        ...resolvedMedia,
        type: 'embed',
        server: srv,
        url: fullMovieEmbedUrl,
        embedUrl: fullMovieEmbedUrl,
        streamQuality: '1080p Ultra HD Full Movie',
        badge: isTv ? 'Full HD Series 📺' : 'Full Movie 1080p 🎬',
        duration: resolvedMedia.duration && resolvedMedia.duration > 1800 ? resolvedMedia.duration : (isTv ? 3300 : 7200),
      };
    }

    setCurrentMedia(resolvedMedia);
    setSpotlightMovie(resolvedMedia);
    setIsPlayerActive(true);
    setIsPlaying(true);
    setIsEmbedSuspended(false);
    setCurrentTime(0);

    // Stop screen sharing if user selects a catalog movie
    if (isScreenSharing && localScreenStream) {
      localScreenStream.getTracks().forEach((t) => t.stop());
      setLocalScreenStream(null);
      setIsScreenSharing(false);
    }

    if (resolvedMedia.type === 'video' && videoRef.current) {
      videoRef.current.src = resolvedMedia.url;
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }

    broadcastSync(true, 0, resolvedMedia);
  }, [isScreenSharing, localScreenStream, broadcastSync]);

  // Resolve the next video in sequence: TV series auto-advances to next episode/season, or next movie in queue
  const getNextVideo = useCallback((): MediaItem => {
    // 0. TV Series Autoplay: Auto-advance to next episode or next season seamlessly
    if (isSeriesItem(currentMedia)) {
      const currentSeason = currentMedia.season || 1;
      const currentEp = currentMedia.episode || 1;
      const seasons = getSeriesSeasons(currentMedia);
      const seasonObj = seasons.find((s) => s.seasonNumber === currentSeason);
      const totalEpisodesInSeason = seasonObj?.episodeCount || 10;
      const maxSeason = seasons.length > 0 ? seasons[seasons.length - 1].seasonNumber : 1;

      let targetSeason = currentSeason;
      let targetEp = currentEp + 1;

      if (currentEp >= totalEpisodesInSeason) {
        // Current season has finished! Transition to the first episode of the next season
        if (currentSeason < maxSeason) {
          targetSeason = currentSeason + 1;
          targetEp = 1;
        } else {
          // Wrapped around the final season: loop back to Season 1 Episode 1
          targetSeason = 1;
          targetEp = 1;
        }
      }

      const isTmdb = currentMedia.source === 'tmdb' || Boolean(currentMedia.tmdbId) || currentMedia.id.startsWith('tmdb-');
      const cleanId = String(currentMedia.tmdbId || currentMedia.id).replace(/^tmdb-(movie|tv)-/, '');
      const srv = currentMedia.server || 1;
      const episodeStreamUrl = isTmdb
        ? getTmdbStreamUrl(cleanId, true, targetSeason, targetEp, srv)
        : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(cleanSeriesTitle(currentMedia.title) + ' season ' + targetSeason + ' episode ' + targetEp)}&autoplay=1`;

      return {
        ...currentMedia,
        season: targetSeason,
        episode: targetEp,
        title: `${cleanSeriesTitle(currentMedia.title)} (S${targetSeason}E${targetEp})`,
        type: isTmdb ? 'embed' : currentMedia.type,
        server: srv,
        url: episodeStreamUrl,
        embedUrl: episodeStreamUrl,
        badge: 'Real Full Episode 1080p 📺',
        streamQuality: '1080p Ultra HD Full Episode',
      };
    }

    // 1. If currently browsing/searching with multiple results, pick the next one in the shelf
    if (searchResults && searchResults.length > 1) {
      const idx = searchResults.findIndex((m) => m.id === currentMedia.id || m.url === currentMedia.url);
      if (idx !== -1) {
        return searchResults[(idx + 1) % searchResults.length];
      }
    }

    // 2. Check if currently watching something from the shared watchlist
    if (watchlist && watchlist.length > 1) {
      const wIdx = watchlist.findIndex((w) => w.movie.id === currentMedia.id || w.movie.url === currentMedia.url);
      if (wIdx !== -1) {
        return watchlist[(wIdx + 1) % watchlist.length].movie;
      }
    }

    // 3. Fallback to FEATURED_MOVIES sequence
    const vIdx = FEATURED_MOVIES.findIndex((m) => m.id === currentMedia.id || m.url === currentMedia.url);
    if (vIdx !== -1 && FEATURED_MOVIES.length > 1) {
      return FEATURED_MOVIES[(vIdx + 1) % FEATURED_MOVIES.length];
    }

    // 4. Default fallback to next available movie in catalog
    const remaining = FEATURED_MOVIES.filter((m) => m.id !== currentMedia.id);
    return remaining.length > 0 ? remaining[0] : FEATURED_MOVIES[0];
  }, [searchResults, currentMedia, watchlist]);

  // Triggered when any video (HTML5 or YouTube) finishes playing
  const handleVideoFinished = useCallback(() => {
    if (hasTriggeredEndedRef.current) return;
    hasTriggeredEndedRef.current = true;

    if (!isAutoplayNext) {
      setIsPlaying(false);
      return;
    }

    const nextMovie = getNextVideo();
    if (!nextMovie) {
      setIsPlaying(false);
      return;
    }

    // Start 3-second countdown to jump to next video with clear HUD banner
    setNextCountdown({ active: true, secondsLeft: 3, nextMovie });

    let count = 3;
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        setNextCountdown(null);
        hasTriggeredEndedRef.current = false;
        handleChangeMovie(nextMovie);
      } else {
        setNextCountdown((prev) => (prev ? { ...prev, secondsLeft: count } : null));
      }
    }, 1000);
  }, [isAutoplayNext, getNextVideo, handleChangeMovie]);

  // Manually jump to next video immediately
  const handlePlayNext = useCallback((immediate: boolean = true) => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setNextCountdown(null);

    const next = getNextVideo();
    if (next) {
      handleChangeMovie(next);
    }
  }, [getNextVideo, handleChangeMovie]);

  // Cancel next video countdown if user wants to stay on current screen
  const handleCancelNextCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setNextCountdown(null);
    setIsPlaying(false);
  };

  // YouTube iFrame API message listener for automatic next video progression
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      let data = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if (!data || typeof data !== 'object') return;

      // YouTube Player States: -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: cued
      if (data.event === 'onStateChange' || (data.event === 'infoDelivery' && data.info)) {
        const state = data.info?.playerState !== undefined ? data.info.playerState : data.info;
        if (state === 1) {
          setIsPlaying(true);
          isPlayingRef.current = true;
        } else if (state === 2) {
          setIsPlaying(false);
          isPlayingRef.current = false;
        } else if (state === 0) {
          setIsPlaying(false);
          isPlayingRef.current = false;
          handleVideoFinished();
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Periodically notify YouTube iframe that parent is listening for API events and ensure volume is synced
    const pingIframe = () => {
      if (ytIframeRef.current?.contentWindow) {
        ytIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'listening' }),
          '*'
        );
        ytIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onStateChange'] }),
          '*'
        );
        // Guarantee volume and mute match current settings
        if (isMutedMovie) {
          sendYouTubeCommand('mute');
        } else {
          sendYouTubeCommand('unMute');
          sendYouTubeCommand('setVolume', [Math.round(movieVolume * 100)]);
        }
      }
    };

    const intervalId = setInterval(pingIframe, 2500);
    pingIframe();

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(intervalId);
    };
  }, [handleVideoFinished]);

  // Cleanup countdown timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // HTML5 Video element event bindings
  useEffect(() => {
    const video = videoRef.current;
    if (!video || currentMedia.type !== 'video') return;

    const handlePlay = () => {
      setIsPlaying(true);
      isPlayingRef.current = true;
    };

    const handlePause = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // Extra safety check for video end
      if (video.duration && video.duration > 5 && video.currentTime >= video.duration - 0.4) {
        handleVideoFinished();
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration || currentMedia.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
      handleVideoFinished();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentMedia, handleVideoFinished]);

  // Seek
  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    if (currentMedia.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = seconds;
    } else {
      sendYouTubeCommand('seekTo', [seconds, true]);
    }
    broadcastSync(isPlaying, seconds);
  };

  // Skip relative (+/- 10s)
  const handleSkip = (deltaSeconds: number) => {
    const baseTime = videoRef.current ? videoRef.current.currentTime : currentTime;
    const next = Math.max(0, baseTime + deltaSeconds);
    handleSeek(next);
  };

  // Load TMDB trending cinema catalog on mount
  useEffect(() => {
    let isMounted = true;
    fetchTmdbTrending().then((trending) => {
      if (!isMounted) return;
      if (trending && trending.length > 0) {
        setSearchResults(trending);
        setSpotlightMovie(trending[0]);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Select Season & Episode from Series Picker Modal (Real 1080p Episodes)
  const handleSelectSeriesEpisode = useCallback(
    (series: MediaItem, seasonNum: number, episodeNum: number) => {
      const cleanId = String(series.tmdbId || series.id).replace(/^tmdb-(movie|tv)-/, '');
      const srv = series.server || 1;
      const episodeStreamUrl = getTmdbStreamUrl(cleanId, true, seasonNum, episodeNum, srv);
      const updated: MediaItem = {
        ...series,
        season: seasonNum,
        episode: episodeNum,
        type: 'embed',
        server: srv,
        title: `${cleanSeriesTitle(series.title)} (S${seasonNum}E${episodeNum})`,
        url: episodeStreamUrl,
        embedUrl: episodeStreamUrl,
        badge: 'Real Full Episode 1080p 📺',
        streamQuality: '1080p Ultra HD Full Episode',
      };
      handleChangeMovie(updated);
      setSeriesModalItem(null);
    },
    [handleChangeMovie]
  );

  // Switch TV Episode helper for player bar
  const handleSwitchEpisode = useCallback(
    (seasonNum: number, episodeNum: number) => {
      if (!currentMedia) return;
      handleSelectSeriesEpisode(currentMedia, seasonNum, episodeNum);
    },
    [currentMedia, handleSelectSeriesEpisode]
  );

  // Switch Stream Server helper (Server 1: AutoEmbed, Server 2: VidSrc, Server 3: EmbedSu, Server 4: MultiEmbed)
  const handleSwitchStreamServer = useCallback(
    (serverId: 1 | 2 | 3 | 4) => {
      const isTv = isSeriesItem(currentMedia);
      const cleanId = String(currentMedia.tmdbId || currentMedia.id).replace(/^tmdb-(movie|tv)-/, '');
      const newEmbedUrl = getTmdbStreamUrl(
        cleanId,
        isTv,
        currentMedia.season || 1,
        currentMedia.episode || 1,
        serverId
      );
      handleChangeMovie({
        ...currentMedia,
        server: serverId,
        type: 'embed',
        url: newEmbedUrl,
        embedUrl: newEmbedUrl,
      });
    },
    [currentMedia, handleChangeMovie]
  );

  // Stream server fallback switcher: cycles to the next working 1080p server for the same movie!
  const switchToFallbackStream = useCallback(() => {
    if (
      currentMedia.type === 'embed' ||
      currentMedia.source === 'tmdb' ||
      Boolean(currentMedia.tmdbId) ||
      currentMedia.id.startsWith('tmdb-')
    ) {
      const currentServer = currentMedia.server || 1;
      const nextServer = ((currentServer % 4) + 1) as 1 | 2 | 3 | 4;
      handleSwitchStreamServer(nextServer);
      return;
    }
    const fallback = FEATURED_MOVIES.find((m) => m.id !== currentMedia.id) || FEATURED_MOVIES[0];
    if (fallback) {
      handleChangeMovie(fallback);
    }
  }, [currentMedia, handleSwitchStreamServer, handleChangeMovie]);

  // Video embed listener: window.addEventListener("message", ...)
  useEffect(() => {
    const handleEmbedMessage = (event: MessageEvent) => {
      let data = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if (!data || typeof data !== 'object') return;

      // Handle video finished -> autoplay next
      if (
        data.type === 'ended' ||
        data.event === 'ended' ||
        data.event === 'onEnded' ||
        data.action === 'ended'
      ) {
        handleVideoFinished();
      }

      // Handle video unavailable / playback restrictions on host domain (e.g. YouTube error 150/101)
      if (
        data.event === 'onError' ||
        data.info === 101 ||
        data.info === 150 ||
        data.info === 100 ||
        data.info === 5 ||
        data.error === 'embedding_not_allowed'
      ) {
        console.warn('Video embed restricted or unavailable on current domain, switching to guaranteed HD stream...');
        switchToFallbackStream();
      }
    };

    window.addEventListener('message', handleEmbedMessage);
    return () => {
      window.removeEventListener('message', handleEmbedMessage);
    };
  }, [handleVideoFinished, switchToFallbackStream]);

  // Universal Search Handler (TMDB Cinema, Public Movies & YouTube)
  const handlePerformSearch = async (query: string) => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    const trimmed = query.trim();
    if (!trimmed) {
      if (selectedCategory === 'classics') {
        setSearchResults(FEATURED_MOVIES);
      } else if (selectedCategory === 'youtube') {
        const ytDefaults = await searchYouTubeDirect('trending relax 4k');
        setSearchResults(ytDefaults);
      } else {
        const trending = await fetchTmdbTrending();
        setSearchResults(trending);
      }
      return;
    }

    setIsSearching(true);
    try {
      if (selectedCategory === 'classics') {
        const q = trimmed.toLowerCase();
        setSearchResults(
          FEATURED_MOVIES.filter(
            (m) =>
              m.title.toLowerCase().includes(q) ||
              (m.genre && m.genre.toLowerCase().includes(q)) ||
              (m.artist && m.artist.toLowerCase().includes(q)) ||
              (m.description && m.description.toLowerCase().includes(q))
          )
        );
      } else if (selectedCategory === 'youtube') {
        const ytResults = await searchYouTubeDirect(trimmed);
        setSearchResults(ytResults);
      } else {
        // Multi-Source Search (Server Proxy -> TMDB Direct -> Public iTunes & TVMaze -> 100+ Catalog)
        const tmdbResults = await searchTmdbMovies(trimmed);
        setSearchResults(tmdbResults);
      }
    } catch (err) {
      console.warn('Movie search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced input change handler so typing feels fluid and doesn't fire redundant API calls
  const handleSearchInputChange = (val: string) => {
    setSearchQuery(val);
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    if (!val.trim()) {
      handlePerformSearch('');
      return;
    }
    searchDebounceRef.current = setTimeout(() => {
      handlePerformSearch(val);
    }, 250);
  };

  // Filter catalog by source: TMDB, Instant Classics, YouTube, or Watchlist
  const filterByCategory = async (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'watchlist') {
      setSearchResults(watchlist.map((w) => w.movie));
      return;
    }
    if (cat === 'classics') {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        setSearchResults(
          FEATURED_MOVIES.filter(
            (m) =>
              m.title.toLowerCase().includes(q) ||
              (m.genre && m.genre.toLowerCase().includes(q)) ||
              (m.artist && m.artist.toLowerCase().includes(q))
          )
        );
      } else {
        setSearchResults(FEATURED_MOVIES);
      }
      return;
    }
    if (cat === 'tmdb') {
      setIsSearching(true);
      try {
        if (searchQuery.trim()) {
          const results = await searchTmdbMovies(searchQuery.trim());
          setSearchResults(results);
        } else {
          const trending = await fetchTmdbTrending();
          setSearchResults(trending);
        }
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
      return;
    }
    if (cat === 'youtube') {
      setIsSearching(true);
      try {
        const query = searchQuery.trim() || 'trending music video relax 4k';
        const ytResults = await searchYouTubeDirect(query);
        setSearchResults(ytResults);
      } catch (err) {
        console.warn('YouTube category error:', err);
      } finally {
        setIsSearching(false);
      }
      return;
    }
  };

  // Directly fetch YouTube video details for instant preview
  const handleFetchYouTubePreview = async (urlOrId: string) => {
    const trimmed = urlOrId.trim();
    if (!trimmed) {
      setYtPreviewItem(null);
      return;
    }
    setYtFetchLoading(true);
    try {
      const direct = await fetchDirectYouTubeVideo(trimmed);
      if (direct) {
        setYtPreviewItem(direct);
      } else {
        const fetched = await searchOrFetchMovie(trimmed);
        if (fetched.length > 0) setYtPreviewItem(fetched[0]);
      }
    } catch (err) {
      console.warn('Direct preview error:', err);
    } finally {
      setYtFetchLoading(false);
    }
  };

  // Surprise random date night movie picker (TMDB or YouTube)
  const handlePickSurpriseMovie = async () => {
    setIsSearching(true);
    try {
      const surprise = await getSurpriseMovie(selectedCategory);
      if (surprise) {
        handleChangeMovie(surprise);
      }
    } catch (err) {
      console.warn('Surprise movie error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Add custom URL / Movie stream
  const handleAddCustomUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customUrlInput.trim() && !ytPreviewItem) return;

    setIsSearching(true);
    const targetItem = ytPreviewItem || (await searchOrFetchMovie(customUrlInput.trim()))[0];
    if (targetItem) {
      handleChangeMovie(targetItem);
      setCustomUrlInput('');
      setYtPreviewItem(null);
      setShowCustomLinkInput(false);
    }
    setIsSearching(false);
  };

  // Haven Voice Assistant for Watch Party (TMDB & YouTube Cinema)
  const handleVoicePlayVideo = useCallback(
    async (query: string, rawText?: string) => {
      setIsSearching(true);
      setSearchQuery(query);
      setShowCatalog(true);

      try {
        const cleanQuery = query
          .replace(/\b(on|from)?\s*(tmdb|youtube)(\.net)?\b/gi, '')
          .replace(/\b(the\s+)?(movie|film|series|show)\b/gi, '')
          .trim() || query;

        // Search TMDB first
        const tmdbResults = await searchTmdbMovies(cleanQuery);
        if (tmdbResults.length > 0) {
          setSelectedCategory('tmdb');
          setSearchResults(tmdbResults);
          handleChangeMovie(tmdbResults[0]);
          return;
        }

        // Search YouTube direct
        const ytResults = await searchYouTubeDirect(cleanQuery);
        if (ytResults.length > 0) {
          setSelectedCategory('youtube');
          setSearchResults(ytResults);
          handleChangeMovie(ytResults[0]);
          return;
        }
      } catch (err) {
        console.warn('Voice play video failed:', err);
      } finally {
        setIsSearching(false);
      }
    },
    [handleChangeMovie]
  );

  const voiceAssistant = useHavenVoiceAssistant({
    context: 'watch',
    onPlayVideoQuery: handleVoicePlayVideo,
    onPlayQuery: handleVoicePlayVideo,
    onPause: () => {
      togglePlayPause(false);
    },
    onResume: () => {
      togglePlayPause(true);
    },
    onNext: () => handlePlayNext(true),
    onVolumeUp: () => {
      handleMovieVolumeChange(Math.min(1, movieVolume + 0.15));
    },
    onVolumeDown: () => {
      handleMovieVolumeChange(Math.max(0, movieVolume - 0.15));
    },
    onMute: () => {
      if (!isMutedMovie) handleToggleMovieMute();
    },
    onUnmute: () => {
      if (isMutedMovie) handleToggleMovieMute();
    },
  });

  // Toggle Couple Watchlist
  const handleToggleWatchlist = (movie: MediaItem) => {
    const exists = watchlist.some((w) => w.movie.id === movie.id);
    let updated: MovieWatchlistEntry[];
    if (exists) {
      updated = watchlist.filter((w) => w.movie.id !== movie.id);
    } else {
      const newEntry: MovieWatchlistEntry = {
        id: `watch-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        movie,
        addedBy: currentUserId,
        addedByName: currentUserName,
        addedAt: Date.now(),
        isWatched: false,
      };
      updated = [newEntry, ...watchlist];
    }
    setWatchlist(updated);
    localStorage.setItem(watchlistKey, JSON.stringify(updated));
  };

  // Send In-Movie Live Danmaku Bullet Comment
  const handleSendBulletComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = newCommentText.trim();
    if (!text) return;

    const colors = ['#f43f5e', '#ec4899', '#38bdf8', '#fbbf24', '#a855f7', '#34d399', '#ffffff'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const comment: InMovieComment = {
      id: `comment-${Date.now()}-${Math.random()}`,
      userId: currentUserId,
      userName: currentUserName,
      text,
      color: randomColor,
      timestamp: Date.now(),
      videoTime: currentTime,
      yPercent: Math.floor(15 + Math.random() * 65), // randomized vertical lane
    };

    setLiveComments((prev) => [...prev.slice(-25), comment]);
    if (onSendInMovieComment) {
      onSendInMovieComment(comment);
    }
    setNewCommentText('');
  };

  // Quick Emoji Reaction inside Cinema
  const handleQuickMovieReaction = (emoji: string) => {
    onSendLoveBurst(emoji);
    handleSendBulletCommentDirect(emoji);
  };

  const handleSendBulletCommentDirect = (text: string) => {
    const comment: InMovieComment = {
      id: `comment-${Date.now()}-${Math.random()}`,
      userId: currentUserId,
      userName: currentUserName,
      text,
      color: '#f43f5e',
      timestamp: Date.now(),
      videoTime: currentTime,
      yPercent: Math.floor(20 + Math.random() * 55),
    };
    setLiveComments((prev) => [...prev.slice(-25), comment]);
    if (onSendInMovieComment) {
      onSendInMovieComment(comment);
    }
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Fullscreen listeners & state synchronization
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = Boolean(document.fullscreenElement);
      setIsFullscreen(isFS);
      if (isFS) {
        setShowCatalog(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcuts (F for Fullscreen, T for Theater, Space for Play/Pause, M for Mute, Esc to exit)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setTheaterMode((prev) => !prev);
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMutedMovie((prev) => {
          const next = !prev;
          if (videoRef.current) videoRef.current.muted = next;
          return next;
        });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSkip(10);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSkip(-10);
      } else if (e.key === 'Escape') {
        if (theaterMode && !document.fullscreenElement) {
          setTheaterMode(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isFullscreen, theaterMode, isPlaying, currentTime]);

  // Autohide controls during playback in fullscreen or theater mode
  const handleMouseMove = () => {
    setShowControlsInFullscreen(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if ((isFullscreen || theaterMode) && isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControlsInFullscreen(false);
      }, 3500);
    }
  };

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current) {
          if (containerRef.current.requestFullscreen) {
            await containerRef.current.requestFullscreen();
          } else if ((containerRef.current as any).webkitRequestFullscreen) {
            await (containerRef.current as any).webkitRequestFullscreen();
          }
        }
        setIsFullscreen(true);
        setShowCatalog(false);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen API unavailable or restricted in iframe, toggling theater mode instead:', err);
      setTheaterMode((prev) => !prev);
      setShowCatalog(false);
    }
  };

  /**
   * Reusable Movie & Video Showcase / Search component
   * Renders either as full-height Browse View (without video screen) or as expandable drawer below screen
   */
  const renderCatalogContent = (isBrowseMode: boolean) => (
    <div
      className={
        isBrowseMode
          ? 'p-4 sm:p-6 bg-slate-950 flex-1 w-full overflow-y-auto space-y-4 animate-in fade-in'
          : 'p-4 bg-slate-950/95 border-t border-slate-800/90 max-h-[68vh] sm:max-h-[74vh] overflow-y-auto z-20 space-y-3.5 animate-in fade-in'
      }
    >
      {/* If in Browse Mode and there is already a movie loaded/playing, show quick return strip */}
      {isBrowseMode && currentMedia && (isPlaying || currentTime > 0) && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-indigo-950/70 border border-rose-500/40 shadow-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-14 rounded-lg overflow-hidden shrink-0 border border-rose-500/30 shadow">
              <img
                src={currentMedia.thumbnailUrl || currentMedia.backdropUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500'}
                alt={currentMedia.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider flex items-center gap-1.5">
                <Radio className="w-2.5 h-2.5 text-rose-400 animate-pulse" />
                {isPlaying ? 'Currently Streaming' : 'Paused in Player'}
              </span>
              <h4 className="text-sm font-bold text-white truncate">{currentMedia.title}</h4>
              <p className="text-[11px] text-slate-400 truncate">{currentMedia.genre || currentMedia.rating || 'Cinema Stream'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isSeriesItem(currentMedia) && (
              <button
                type="button"
                id="btn-return-episodes"
                onClick={() => setSeriesModalItem(currentMedia)}
                className="px-3 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow"
                title="Browse and select another episode"
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Choose Episode</span>
              </button>
            )}

            <button
              type="button"
              id="btn-return-to-screen"
              onClick={() => {
                setIsPlayerActive(true);
                if (!isPlaying) togglePlayPause(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 cursor-pointer shrink-0 transition hover:scale-105 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Show Movie Screen</span>
            </button>
          </div>
        </div>
      )}

      {/* Haven Voice Control Banner */}
      <HavenVoiceControl
        isListening={voiceAssistant.isListening}
        isHandsFree={voiceAssistant.isHandsFree}
        transcript={voiceAssistant.transcript}
        interimTranscript={voiceAssistant.interimTranscript}
        lastActionMessage={voiceAssistant.lastActionMessage}
        errorNotice={voiceAssistant.errorNotice}
        isSpeaking={voiceAssistant.isSpeaking}
        isSupported={voiceAssistant.isSupported}
        onToggleHandsFree={voiceAssistant.toggleHandsFree}
        onTriggerPushToTalk={voiceAssistant.triggerPushToTalk}
        onQuickCommand={(cmd) => voiceAssistant.parseAndExecuteCommand(cmd)}
        context="watch"
        variant="banner"
        isBusy={voiceAssistant.isBusy}
        currentTask={voiceAssistant.currentTask}
        assistantStatus={voiceAssistant.assistantStatus}
      />

      {/* Haven Voice Command Quick Tips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] no-scrollbar">
        <span className="text-rose-400 font-bold whitespace-nowrap text-[10px] uppercase tracking-wider flex items-center gap-1">
          <Mic className="w-3 h-3 text-rose-400" />
          <span>Try Saying:</span>
        </span>
        {[
          { label: '“Play Deadpool on TMDB”', query: 'Deadpool' },
          { label: '“Play Titanic on TMDB”', query: 'Titanic' },
          { label: '“Watch Game of Thrones”', query: 'Game of Thrones' },
          { label: '“Play Inception”', query: 'Inception' },
          { label: '“Play Lofi Girl on YouTube”', query: 'lofi hip hop radio' },
          { label: '“Play Tokyo 4K on YouTube”', query: 'tokyo 4k rain walk' },
          { label: '“Hey Haven, pause”', query: '' },
        ].map((tip) => (
          <button
            key={tip.label}
            type="button"
            onClick={() => {
              if (tip.query) {
                setSearchQuery(tip.query);
                handlePerformSearch(tip.query);
              } else {
                togglePlayPause();
              }
            }}
            className="px-2 py-0.5 bg-slate-900/90 hover:bg-rose-950/40 text-slate-300 hover:text-rose-200 border border-slate-800 hover:border-rose-500/30 rounded-lg whitespace-nowrap transition-colors cursor-pointer text-[10px]"
          >
            {tip.label}
          </button>
        ))}
      </div>

      {/* Primary Source Navigation Tabs & TMDB Cinema Info Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-900">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => filterByCategory('tmdb')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              selectedCategory === 'tmdb'
                ? 'bg-rose-600 text-white shadow-rose-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>🎬 TMDB Cinema & Series</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-black/40 rounded-md font-mono text-rose-200">
              TMDB HD
            </span>
          </button>

          <button
            type="button"
            onClick={() => filterByCategory('classics')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              selectedCategory === 'classics'
                ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5 text-indigo-300" />
            <span>🍿 Instant Classics</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950/80 text-emerald-300 font-semibold rounded-md border border-emerald-500/30">
              Instant
            </span>
          </button>

          <button
            type="button"
            onClick={() => filterByCategory('youtube')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              selectedCategory === 'youtube'
                ? 'bg-red-600 text-white shadow-red-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span>🔴 YouTube</span>
          </button>

          {watchlist.length > 0 && (
            <button
              type="button"
              onClick={() => filterByCategory('watchlist')}
              className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedCategory === 'watchlist'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Watchlist ({watchlist.length})</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePickSurpriseMovie}
            disabled={isSearching}
            className="px-3 py-1.5 bg-gradient-to-r from-rose-600/30 to-amber-600/30 hover:from-rose-600/50 hover:to-amber-600/50 text-rose-200 hover:text-white text-xs font-semibold rounded-xl border border-rose-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Pick a random movie or video"
          >
            <Dices className="w-3.5 h-3.5 text-amber-300" />
            <span>Surprise Me 🎲</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTmdbInfoModal(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-1.5 transition cursor-pointer"
            title="TMDB Cinema & Multi-Source HD Player"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">TMDB Cinema</span>
          </button>
        </div>
      </div>

      {/* Context Search Bar & Options */}
      {selectedCategory === 'classics' ? (
        <div className="space-y-2.5 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePerformSearch(searchQuery);
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <div className="relative flex-1">
              <Clapperboard className="w-4 h-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                placeholder="Search fast classics (e.g. His Girl Friday, Charade, My Man Godfrey, Cary Grant, Romance, Comedy)..."
                className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    handlePerformSearch('');
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Classics</span>
            </button>
          </form>
          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Zero Buffering:</span>
            </span>
            <span>Direct HD streams from Internet Archive & remastered classics. Loads in milliseconds.</span>
          </div>
        </div>
      ) : selectedCategory === 'tmdb' ? (
        <div className="space-y-2.5 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePerformSearch(searchQuery);
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <div className="relative flex-1">
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2 animate-spin" />
              ) : (
                <Film className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                placeholder="Search any movie or series (e.g. Titanic, Avatar, Spider-Man, Deadpool, Batman, Inception, Anime)..."
                className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    handlePerformSearch('');
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="submit"
                id="btn-search-tmdb"
                disabled={isSearching}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/25 transition cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Search TMDB</span>
              </button>

              <button
                type="button"
                onClick={() => filterByCategory('youtube')}
                className="px-3 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
                title="Switch to YouTube Search"
              >
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="hidden sm:inline">Switch to YouTube</span>
              </button>
            </div>
          </form>

          {/* Quick Genre Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-800/60 text-[11px] no-scrollbar">
            <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap">
              Genres:
            </span>
            {[
              { label: 'All Movies', q: '' },
              { label: '🔥 Trending', q: 'trending' },
              { label: '🦸 Action & Sci-Fi', q: 'action' },
              { label: '🍿 Blockbusters', q: 'blockbuster' },
              { label: '🎨 Animation', q: 'animation' },
              { label: '😂 Comedy', q: 'comedy' },
              { label: '❤️ Romance', q: 'romance' },
              { label: '📺 TV Series', q: 'series' },
            ].map((genre) => (
              <button
                key={genre.label}
                type="button"
                onClick={() => {
                  setSearchQuery(genre.q);
                  handlePerformSearch(genre.q);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  searchQuery === genre.q
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800/80 hover:text-white'
                }`}
              >
                {genre.label}
              </button>
            ))}
          </div>

          {/* TMDB Engine Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/30">
                TMDB Cinema HD
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                100% Ad-Free • Instant Playback
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Synced Real-time Playback
            </span>
          </div>
        </div>
      ) : selectedCategory === 'youtube' ? (
        <div className="space-y-2.5 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePerformSearch(searchQuery);
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <div className="relative flex-1">
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-red-400 absolute left-3 top-1/2 -translate-y-1/2 animate-spin" />
              ) : (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 text-xs font-bold select-none">🔴</span>
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                placeholder="Search YouTube (e.g. Music, Podcasts, Trailers, Gaming, Documentaries, Lofi)..."
                className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    handlePerformSearch('');
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="submit"
                id="btn-search-youtube"
                disabled={isSearching}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/25 transition cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Search YouTube</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCustomLinkInput(!showCustomLinkInput)}
                className="px-3 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
                title="Paste YouTube link or direct video URL"
              >
                <Plus className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Paste URL</span>
              </button>
            </div>
          </form>

          {/* YouTube Suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-800/60 text-[11px] no-scrollbar">
            <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap">
              Suggestions:
            </span>
            {[
              { label: '🔥 Trending 2025', q: 'trending music video 2025' },
              { label: '☕ Lofi Girl Radio', q: 'lofi hip hop radio beats to relax' },
              { label: '🍿 Movie Trailers 4K', q: 'official movie trailers 4k' },
              { label: '🗼 Tokyo Rain 4K', q: 'tokyo 4k rain walk ambience' },
              { label: '😂 Stand-Up Comedy', q: 'stand up comedy best clips' },
              { label: '🌌 Space & Earth 4K', q: 'earth from orbit ISS 4K' },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setSearchQuery(chip.q);
                  handlePerformSearch(chip.q);
                }}
                className="px-2 py-0.5 bg-slate-950 hover:bg-red-950/40 text-slate-300 hover:text-red-200 border border-slate-800 hover:border-red-500/30 rounded-lg whitespace-nowrap transition cursor-pointer text-[10px]"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Direct YouTube Link Fetch Drawer */}
          {showCustomLinkInput && (
            <div className="p-3 bg-slate-950 rounded-xl border border-rose-500/30 space-y-2 mt-2 animate-in fade-in">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-rose-400" />
                  <span>Paste Direct YouTube Video Link</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomLinkInput(false);
                    setYtPreviewItem(null);
                  }}
                  className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleAddCustomUrl} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customUrlInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomUrlInput(val);
                      if (val.includes('youtube.com') || val.includes('youtu.be') || /^[a-zA-Z0-9_-]{11}$/.test(val.trim())) {
                        handleFetchYouTubePreview(val);
                      }
                    }}
                    placeholder="Paste YouTube watch URL (e.g. https://www.youtube.com/watch?v=... or youtu.be/...)"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                  />
                  {ytFetchLoading && (
                    <Loader2 className="w-3.5 h-3.5 text-rose-400 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!customUrlInput.trim() && !ytPreviewItem}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Stream Video</span>
                </button>
              </form>
            </div>
          )}
        </div>
      ) : null}

      {/* Results Grid Header */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-white font-serif tracking-tight flex items-center gap-1.5">
            {selectedCategory === 'tmdb' ? (
              <>
                <span>🎬 TMDB Cinema & Series (HD Streams)</span>
                <span className="text-[10px] font-semibold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-500/30">
                  {searchResults.length} {searchResults.length === 1 ? 'title' : 'titles'}
                </span>
              </>
            ) : selectedCategory === 'classics' ? (
              <>
                <span>🍿 Fast Classics (Instant Play)</span>
                <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  {searchResults.length} {searchResults.length === 1 ? 'title' : 'titles'}
                </span>
              </>
            ) : selectedCategory === 'youtube' ? (
              <>
                <span>🔴 YouTube Results</span>
                <span className="text-[10px] font-semibold text-red-300 bg-red-950/60 px-2 py-0.5 rounded-full border border-red-500/30">
                  {searchResults.length} {searchResults.length === 1 ? 'video' : 'videos'}
                </span>
              </>
            ) : (
              <>
                <span>⭐ Shared Watchlist</span>
                <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {searchResults.length}
                </span>
              </>
            )}
          </span>
        </div>

        <span className="text-[10px] text-slate-400 hidden sm:inline">
          {selectedCategory === 'tmdb'
            ? 'TMDB Cinema HD • 100% Ad-Free • Instant Playback'
            : selectedCategory === 'classics'
            ? 'Zero-buffering direct streaming HD'
            : selectedCategory === 'youtube'
            ? 'Real-time synchronized YouTube HD'
            : 'Saved for movie night'}
        </span>
      </div>

      {/* Empty State */}
      {searchResults.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <Clapperboard className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">
            No {selectedCategory === 'classics' ? 'classic movies' : selectedCategory === 'youtube' ? 'YouTube videos' : 'movies'} found {searchQuery ? `for "${searchQuery}"` : ''}
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {selectedCategory === 'classics'
              ? 'Try searching for Cary Grant, Audrey Hepburn, romantic comedy, Charlie Chaplin, or screwball romance.'
              : selectedCategory === 'youtube'
              ? 'Try searching for music videos, podcast channels, video clips, or gaming highlights.'
              : 'Try searching by title (e.g. Deadpool, Titanic, Inception, Interstellar), or pick from featured categories above.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              if (selectedCategory === 'classics') {
                setSearchResults(FEATURED_MOVIES);
              } else if (selectedCategory === 'youtube') {
                searchYouTubeDirect('trending relax 4k').then(setSearchResults);
              } else {
                fetchTmdbTrending().then((res) => {
                  setSearchResults(res.length > 0 ? res : FEATURED_MOVIES);
                });
              }
            }}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow transition cursor-pointer"
          >
            {selectedCategory === 'classics' ? 'Reset to Fast Classics' : selectedCategory === 'youtube' ? 'Load Trending YouTube' : 'Reset to TMDB Trending'}
          </button>
        </div>
      ) : (
        <>
          {searchResults.length > 0 && (
            <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-t from-slate-950 via-slate-900 to-slate-900 border border-slate-800 shadow-2xl mb-6 group">
              <div className="absolute inset-0">
                <img
                  src={searchResults[0].backdropUrl || searchResults[0].thumbnailUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200'}
                  alt={searchResults[0].title}
                  className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              </div>

              <div className="relative z-10 p-6 sm:p-10 max-w-xl flex flex-col justify-center space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] tracking-wider uppercase shadow">
                    REAL FULL MOVIE (1080p HD)
                  </span>
                  <span className="text-amber-400 font-bold text-xs">★ {searchResults[0].rating || '9.4/10'}</span>
                  <span className="text-slate-300 text-xs">{searchResults[0].year || '2026'}</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-white tracking-tight">
                  {searchResults[0].title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                  {searchResults[0].description || searchResults[0].genre || 'Stream in ultra HD cinema quality together with your partner in real-time sync.'}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleChangeMovie(searchResults[0])}
                    className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-600/40 active:scale-95 transition cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Watch Full Movie (1080p)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleWatchlist(searchResults[0])}
                    className="px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-slate-700 active:scale-95 transition cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>+ My List</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Movie & Video Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {searchResults.map((movie, idx) => {
              const isActive = currentMedia.id === movie.id;
              const isInWatchlist = watchlist.some((w) => w.movie.id === movie.id);
              const isTmdbItem = movie.source === 'tmdb' || selectedCategory === 'tmdb' || Boolean(movie.tmdbId);
            const isSeries = isSeriesItem(movie);

            return (
              <div
                key={`card-${movie.id}-${idx}`}
                className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 bg-slate-900 flex flex-col shadow-md hover:shadow-xl hover:-translate-y-0.5 ${
                  isActive
                    ? 'border-rose-500 ring-2 ring-rose-500/40 shadow-rose-500/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Media Thumbnail / Poster */}
                <div
                  onClick={() => {
                    if (isSeries) {
                      setSeriesModalItem(movie);
                    } else {
                      handleChangeMovie(movie);
                    }
                  }}
                  className={`relative w-full overflow-hidden bg-slate-950 cursor-pointer ${isTmdbItem ? 'aspect-[2/3]' : 'aspect-video'}`}
                >
                  <img
                    src={movie.thumbnailUrl || movie.backdropUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500'}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Play Button Overlay (Visible on Touch, High-Intent on Hover) */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                    <div className={`px-3 py-1.5 rounded-full ${isSeries ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-rose-600/90 hover:bg-rose-500'} text-white flex items-center gap-1.5 shadow-xl shadow-rose-600/40 transform scale-90 group-hover:scale-100 transition-transform text-xs font-bold`}>
                      {isSeries ? (
                        <>
                          <Layers className="w-3.5 h-3.5" />
                          <span>Choose Episode</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                          <span>Play 1080p</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 flex flex-wrap items-center gap-1.5 z-10">
                    {movie.source === 'archive' || movie.type === 'video' ? (
                      <span className="bg-indigo-950/90 border border-indigo-500/40 text-[9px] font-bold text-indigo-300 px-2 py-0.5 rounded-md shadow-sm">
                        🍿 Instant HD
                      </span>
                    ) : isTmdbItem ? (
                      <span className={`${isSeries ? 'bg-purple-950/90 border-purple-500/40 text-purple-200' : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'} border text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1`}>
                        {isSeries ? (
                          <>
                            <Tv className="w-2.5 h-2.5 text-purple-400" />
                            <span>1080p Series 📺</span>
                          </>
                        ) : (
                          <span>1080p Full Movie 🎬</span>
                        )}
                      </span>
                    ) : (
                      <span className="bg-red-950/90 border border-red-500/40 text-[9px] font-bold text-red-300 px-2 py-0.5 rounded-md shadow-sm">
                        🔴 Full HD Stream
                      </span>
                    )}
                  </div>

                  {/* Rating or Duration Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    {movie.rating ? (
                      <span className="bg-black/80 backdrop-blur-xs text-[9px] font-bold text-amber-300 px-1.5 py-0.5 rounded shadow">
                        ★ {movie.rating}
                      </span>
                    ) : movie.duration ? (
                      <span className="bg-black/80 backdrop-blur-xs text-[9px] font-bold text-slate-200 px-1.5 py-0.5 rounded shadow">
                        {typeof movie.duration === 'number'
                          ? `${Math.floor(movie.duration / 60)}m`
                          : movie.duration}
                      </span>
                    ) : null}
                  </div>

                  {/* Watchlist Toggle Bookmark */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleWatchlist(movie);
                    }}
                    className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/75 hover:bg-black text-slate-300 hover:text-amber-400 transition cursor-pointer shadow z-10"
                    title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    {isInWatchlist ? (
                      <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Card Content & Actions */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h5
                      onClick={() => {
                        if (isSeries) {
                          setSeriesModalItem(movie);
                        } else {
                          handleChangeMovie(movie);
                        }
                      }}
                      className="text-xs font-bold text-white line-clamp-1 group-hover:text-rose-300 transition-colors cursor-pointer"
                      title={movie.title}
                    >
                      {isSeries ? cleanSeriesTitle(movie.title) : movie.title}
                    </h5>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      {movie.year && <span>{movie.year}</span>}
                      {movie.year && (movie.artist || movie.genre) && <span>•</span>}
                      {(movie.artist || movie.genre) && (
                        <span className="truncate">{movie.artist || movie.genre}</span>
                      )}
                    </div>

                    {/* TV Show season & episode metadata */}
                    {isSeries && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] px-1.5 py-0.5 bg-purple-950/80 text-purple-300 border border-purple-500/30 rounded font-semibold flex items-center gap-1">
                          <Layers className="w-2.5 h-2.5 text-purple-400" />
                          <span>
                            {movie.season ? `Season ${movie.season} • Episode ${movie.episode || 1}` : 'All Seasons & Episodes'}
                          </span>
                        </span>
                      </div>
                    )}

                    {movie.description && (
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {movie.description}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
                    {isSeries ? (
                      <button
                        type="button"
                        id={`btn-choose-episodes-${movie.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSeriesModalItem(movie);
                        }}
                        className="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-600/25 active:scale-95"
                        title="View all seasons and choose an episode"
                      >
                        <Layers className="w-3.5 h-3.5 text-purple-200" />
                        <span>{isActive ? `S${movie.season || 1}:E${movie.episode || 1} • Episodes` : 'Choose Episode'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleChangeMovie(movie)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm ${
                          isActive
                            ? 'bg-rose-500 text-white shadow-rose-500/30'
                            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>
                          {isActive ? 'Now Playing' : isFriends ? 'Stream with Squad' : 'Stream Together'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </>
      )}
    </div>
  );

  if (!isOpen) return null;

  const isCustomMovie = currentMedia.category === 'custom';
  const isImmersive = isFullscreen || theaterMode;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isImmersive ? 'p-0 bg-black' : 'p-0 sm:p-4 bg-black/90 backdrop-blur-md'
      } animate-in fade-in select-none`}
    >
      {/* Hidden Partner Remote Audio Playback Element */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="fixed -top-96 -left-96 w-1 h-1 opacity-0 pointer-events-none" />

      <div
        className={`relative w-full ${
          isImmersive ? 'h-full max-w-none rounded-none border-0' : 'max-w-5xl rounded-none sm:rounded-3xl h-[100dvh] sm:h-auto sm:max-h-[95vh] border-0 sm:border border-slate-800'
        } bg-slate-900 shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}
      >
        {/* =========================================================================
            CINEMA HEADER & TALK / VOICE OVERLAY STATUS
        ========================================================================= */}
        <div
          className={`flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 shrink-0 z-30 transition-all duration-300 ${
            isImmersive
              ? `absolute top-0 left-0 right-0 bg-gradient-to-b from-black/95 via-black/70 to-transparent ${
                  !showControlsInFullscreen && isPlaying ? 'opacity-0 pointer-events-none -translate-y-3' : 'opacity-100 translate-y-0'
                }`
              : 'bg-slate-900/95 border-b border-slate-800 sticky top-0'
          }`}
        >
          {/* Left: Movie & Room Info */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Haven-Style Mobile Back Button */}
            <button
              id="btn-cinema-mobile-back"
              onClick={onClose}
              className="p-1.5 -ml-1 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-xl transition flex items-center gap-1 text-xs font-bold shrink-0 sm:hidden"
              title="Back to Chat"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              <span>Back</span>
            </button>

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
              <Film className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white font-serif tracking-tight truncate max-w-[130px] sm:max-w-xs">
                  {isPlayerActive ? currentMedia.title : (isFriends ? 'Squad Cinema Showcase' : 'Couple Cinema Lounge')}
                </h3>
                <span className="hidden xs:inline-flex px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-semibold border border-rose-500/30 items-center gap-1 shrink-0">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-rose-400" />
                  <span>
                    {isPlayerActive
                      ? (isImmersive ? 'Full Screen Cinema' : isFriends ? 'Squad Cinema' : 'Synced Cinema')
                      : 'Movie Lounge'}
                  </span>
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-rose-400" />
                <span>
                  {isPlayerActive
                    ? (isFriends
                        ? `Watching with ${groupEmoji ? `${groupEmoji} ` : ''}${effectiveGroupName} (${squadMembersCount} in squad)`
                        : `Watching with ${partner ? partner.name : partnerName}`)
                    : 'Search YouTube & TMDB or pick any movie below'}
                </span>
                {isPlayerActive && currentMedia.genre && (
                  <span className="hidden sm:inline text-slate-500">• {currentMedia.genre}</span>
                )}
              </p>
            </div>
          </div>

          {/* Right: Movie Talking Voice Bar & Theater Actions */}
          <div className="flex items-center gap-2">
            {/* Live Movie Talk / Voice Call Controls */}
            {isCallActive ? (
              <div className="flex items-center gap-1.5 bg-slate-800/90 border border-rose-500/40 rounded-2xl px-2.5 py-1 shadow-sm">
                {/* Partner Talking Audio Wave Indicator */}
                <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700">
                  <div className="relative">
                    <img
                      src={
                        partner?.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={partnerName}
                      className={`w-6 h-6 rounded-full object-cover border ${
                        isPartnerSpeaking
                          ? 'border-emerald-400 ring-2 ring-emerald-400/50 animate-pulse'
                          : 'border-slate-600'
                      }`}
                    />
                    {isPartnerSpeaking && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-slate-900" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-200 hidden md:inline">
                    {isPartnerSpeaking ? `${partnerName} talking...` : 'Voice Live'}
                  </span>
                </div>

                {/* Local Mic Toggle */}
                <button
                  id="btn-movie-toggle-mic"
                  onClick={onToggleMute}
                  className={`p-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isMuted
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                  }`}
                  title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>

                {/* Local Cam Toggle */}
                <button
                  id="btn-movie-toggle-cam"
                  onClick={onToggleVideo}
                  className={`p-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isVideoEnabled
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30'
                      : 'bg-slate-700/60 text-slate-400 hover:text-white'
                  }`}
                  title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                  {isVideoEnabled ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                </button>

                {/* Cam PiP Bubble Toggle */}
                <button
                  onClick={() => setShowCamPiP(!showCamPiP)}
                  className={`p-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    showCamPiP ? 'text-rose-400' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Reaction Cam PiP"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                {/* Hang up Movie Call */}
                <button
                  id="btn-movie-end-voice"
                  onClick={onEndCall}
                  className="p-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                  title="End Movie Voice Chat"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="btn-start-movie-voice"
                onClick={() => onStartCall('audio')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-2xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer animate-pulse"
                title="Talk to partner while watching movie"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Talk During Movie</span>
              </button>
            )}

            {/* Side Chat Drawer Toggle */}
            <button
              onClick={() => setShowSideChat(!showSideChat)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                showSideChat
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-800 border-slate-700/60 text-slate-400 hover:text-white'
              }`}
              title="Toggle Whisper Chat & Danmaku"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* If Series Active: All Seasons & Episodes Header Trigger */}
            {isPlayerActive && isSeriesItem(currentMedia) && (
              <button
                type="button"
                id="btn-movie-header-episodes"
                onClick={() => setSeriesModalItem(currentMedia)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 border border-purple-500/40 text-xs font-bold transition cursor-pointer shadow-sm"
                title="Browse all seasons and select an episode"
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Episodes (S{currentMedia.season || 1}:E{currentMedia.episode || 1})</span>
                <span className="sm:hidden">S{currentMedia.season || 1}:E{currentMedia.episode || 1}</span>
              </button>
            )}

            {/* Browse Movies / Return to Playing Movie Button */}
            {isPlayerActive ? (
              <button
                type="button"
                id="btn-movie-header-browse"
                onClick={() => setIsPlayerActive(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition cursor-pointer shadow-sm"
                title="Browse and search movies without closing"
              >
                <Film className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Browse Movies</span>
              </button>
            ) : (
              (isPlaying || currentTime > 0) && (
                <button
                  type="button"
                  id="btn-movie-header-resume"
                  onClick={() => {
                    setIsPlayerActive(true);
                    if (!isPlaying) togglePlayPause(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition cursor-pointer"
                  title={`Return to movie screen: ${currentMedia.title}`}
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span className="hidden sm:inline">Resume:</span>
                  <span className="truncate max-w-[110px]">{currentMedia.title}</span>
                </button>
              )
            )}

            {/* Alexa-style Voice Assistant Pill */}
            <HavenVoiceControl
              isListening={voiceAssistant.isListening}
              isHandsFree={voiceAssistant.isHandsFree}
              transcript={voiceAssistant.transcript}
              interimTranscript={voiceAssistant.interimTranscript}
              lastActionMessage={voiceAssistant.lastActionMessage}
              errorNotice={voiceAssistant.errorNotice}
              isSpeaking={voiceAssistant.isSpeaking}
              isSupported={voiceAssistant.isSupported}
              onToggleHandsFree={voiceAssistant.toggleHandsFree}
              onTriggerPushToTalk={voiceAssistant.triggerPushToTalk}
              context="watch"
              variant="pill"
              isBusy={voiceAssistant.isBusy}
              currentTask={voiceAssistant.currentTask}
              assistantStatus={voiceAssistant.assistantStatus}
            />

            {/* Fullscreen Toggle Button in Header */}
            <button
              id="btn-header-toggle-fullscreen"
              onClick={handleToggleFullscreen}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                isImmersive
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-sm'
                  : 'bg-slate-800 border-slate-700/60 text-slate-400 hover:text-white'
              }`}
              title={isImmersive ? 'Exit Full Screen (F / Esc)' : 'Watch in Full Screen (F)'}
            >
              {isImmersive ? <Minimize2 className="w-4 h-4 text-rose-400" /> : <Maximize2 className="w-4 h-4 text-slate-300" />}
              <span className="hidden md:inline text-xs font-semibold">{isImmersive ? 'Exit Full Screen' : 'Full Screen'}</span>
            </button>

            {/* Close Modal */}
            <button
              id="btn-close-cinema-modal"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            CINEMA STAGE: MOVIE PLAYER + FLOATING DANMAKU + WEBRTC REACTION CAM PIP
        ========================================================================= */}
        {isPlayerActive ? (
          <>
            <div
              onDoubleClick={handleToggleFullscreen}
              className={`relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden select-none group/player ${
                isImmersive ? 'h-full min-h-0' : 'min-h-[300px] sm:min-h-[420px]'
              }`}
            >
          {/* Quick Floating Fullscreen / Exit Hint Pill in Top Corner */}
          <div className="absolute top-4 right-4 z-20 opacity-90 sm:opacity-0 sm:group-hover/player:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFullscreen();
              }}
              className="px-3 py-1.5 bg-black/75 hover:bg-black/90 backdrop-blur-md rounded-full border border-white/20 text-white text-xs font-medium flex items-center gap-1.5 shadow-xl cursor-pointer transition-transform hover:scale-105"
              title={isImmersive ? 'Exit Full Screen (Esc)' : 'Watch Full Screen (F)'}
            >
              {isImmersive ? <Minimize2 className="w-3.5 h-3.5 text-rose-400" /> : <Maximize2 className="w-3.5 h-3.5 text-rose-400" />}
              <span>{isImmersive ? 'Exit Full Screen (Esc)' : 'Full Screen (F)'}</span>
            </button>
          </div>

          {/* 0. Real-time Screen Streaming (Any Browser Tab or Screen) */}
          {isScreenSharing && localScreenStream ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-contain ${isImmersive ? 'max-h-full' : 'max-h-[62vh]'}`}
              />
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600/95 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-xl animate-pulse z-20">
                <Tv className="w-3.5 h-3.5" />
                <span>Streaming Screen / Tab with Audio</span>
                <button
                  onClick={handleToggleScreenShare}
                  className="ml-2 bg-black/40 hover:bg-black/60 px-2 py-0.5 rounded-full text-[10px] text-white cursor-pointer"
                >
                  Stop
                </button>
              </div>
            </div>
          ) : currentMedia.type === 'video' ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                src={currentMedia.url}
                className={`w-full h-full object-contain cursor-pointer ${isImmersive ? 'max-h-full' : 'max-h-[62vh]'}`}
                playsInline
                preload="auto"
                onClick={togglePlayPause}
                onEnded={handleVideoFinished}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleToggleFullscreen();
                }}
              />
              {/* Big Center Play/Pause Overlay */}
              {!isPlaying && (
                <div
                  onClick={togglePlayPause}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs cursor-pointer z-10 transition-all hover:bg-black/30"
                >
                  <button className="w-18 h-18 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-2xl transition-all scale-100 hover:scale-110 cursor-pointer">
                    <Play className="w-8 h-8 ml-1 fill-white" />
                  </button>
                </div>
              )}
            </div>
          ) : ytId ? (
            /* 2. Embedded Synced YouTube Player */
            <div className={`w-full h-full aspect-video ${isImmersive ? 'max-h-full' : 'max-h-[62vh]'} relative flex items-center justify-center`}>
              <iframe
                ref={ytIframeRef}
                id="yt-cinema-iframe"
                src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&iv_load_policy=3&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                title={currentMedia.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() => {
                  if (isMutedMovie) {
                    sendYouTubeCommand('mute');
                  } else {
                    sendYouTubeCommand('unMute');
                    sendYouTubeCommand('setVolume', [Math.round(movieVolume * 100)]);
                  }
                  if (!isPlayingRef.current) {
                    sendYouTubeCommand('pauseVideo');
                  }
                }}
              />

              {/* Fallback / YouTube bypass helper overlay */}
              <div className="absolute top-3 right-3 z-30">
                <button
                  type="button"
                  onClick={() => switchToFallbackStream()}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-2xl border border-rose-400/40 flex items-center gap-1.5 transition cursor-pointer"
                  title="Switch to guaranteed HD cinema stream"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>🎬 Switch to HD Stream</span>
                </button>
              </div>
              {/* YouTube Paused Overlay */}
              {!isPlaying && (
                <div
                  onClick={() => togglePlayPause(true)}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-xs cursor-pointer z-10 animate-in fade-in select-none"
                  title="Click to resume playback"
                >
                  <button
                    type="button"
                    className="w-18 h-18 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-2xl transition-all scale-100 hover:scale-110 mb-3 cursor-pointer"
                  >
                    <Play className="w-8 h-8 ml-1 fill-white" />
                  </button>
                  <div className="px-4 py-1.5 rounded-full bg-slate-950/90 border border-slate-700 text-white text-xs font-semibold shadow-xl flex items-center gap-2">
                    <Pause className="w-3.5 h-3.5 text-rose-400" />
                    <span>Paused • Click or Press Space to Resume</span>
                  </div>
                </div>
              )}
            </div>
          ) : (currentMedia.type === 'embed' || currentMedia.source === 'tmdb' || Boolean(currentMedia.embedUrl)) ? (
            /* 3. Embedded Synced TMDB Cinema Player */
            <div className={`w-full h-full aspect-video ${isImmersive ? 'max-h-full' : 'max-h-[62vh]'} relative bg-black flex items-center justify-center overflow-hidden`}>
              {isEmbedSuspended ? (
                <div
                  onClick={() => togglePlayPause(true)}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 cursor-pointer z-20 animate-in fade-in select-none"
                >
                  <button
                    type="button"
                    className="w-20 h-20 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-2xl transition-all scale-100 hover:scale-110 mb-3 cursor-pointer"
                  >
                    <Play className="w-9 h-9 ml-1 fill-white" />
                  </button>
                  <span className="text-white text-xs font-semibold">Stream Stopped • Click to Resume</span>
                </div>
              ) : (
                <iframe
                  ref={cinemaIframeRef}
                  id="tmdb-cinema-iframe"
                  src={currentMedia.embedUrl || currentMedia.url}
                  title={currentMedia.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                />
              )}

              {/* Fallback helper overlay */}
              <div className="absolute top-3 right-3 z-30">
                <button
                  type="button"
                  onClick={() => switchToFallbackStream()}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-2xl border border-rose-400/40 flex items-center gap-1.5 transition cursor-pointer"
                  title="Switch to guaranteed HD stream"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>🎬 Switch to HD Stream</span>
                </button>
              </div>

              {/* Animated HUD Indicator on Action (Play / Pause / Resume) */}
              {screenActionIndicator && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                  <div className="w-22 h-22 rounded-full bg-black/85 backdrop-blur-md border border-rose-500/40 text-white flex flex-col items-center justify-center shadow-2xl animate-out fade-out zoom-out duration-700">
                    {screenActionIndicator === 'play' ? (
                      <Play className="w-10 h-10 ml-1 fill-white text-white" />
                    ) : (
                      <Pause className="w-10 h-10 fill-white text-white" />
                    )}
                    <span className="text-[10px] font-bold mt-1 uppercase tracking-wider text-rose-300">
                      {screenActionIndicator === 'play' ? 'Resumed' : 'Paused'}
                    </span>
                  </div>
                </div>
              )}

              {/* TMDB Cinema Paused Overlay */}
              {!isPlaying && (
                <div
                  onClick={() => togglePlayPause(true)}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm cursor-pointer z-20 animate-in fade-in select-none"
                  title="Click to resume playback"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlayPause(true);
                    }}
                    className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white flex items-center justify-center shadow-2xl transition-all scale-100 hover:scale-110 mb-3 border border-rose-300/40 cursor-pointer"
                    title="Resume movie playback"
                  >
                    <Play className="w-9 h-9 ml-1 fill-white" />
                  </button>
                  <div className="px-4 py-2 rounded-2xl bg-slate-950/90 border border-slate-700 text-white text-xs font-semibold shadow-xl flex items-center gap-2 backdrop-blur-md mb-2">
                    <Pause className="w-3.5 h-3.5 text-rose-400" />
                    <span>Cinema Paused • Click or Press Space to Resume</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStopMovie();
                    }}
                    className="px-3 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 shadow"
                    title="Stop movie and pause stream"
                  >
                    <VolumeX className="w-3 h-3 text-rose-400" />
                    <span>Stop Movie</span>
                  </button>
                </div>
              )}

              {/* Toast when ad popup is blocked */}
              {showShieldToast && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ad popup blocked! You stay securely inside Haven.</span>
                </div>
              )}

              {/* TMDB Cinema Floating Top Control Bar */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20 pointer-events-auto flex-wrap">
                {/* Left: Source Badge & Current Server */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-950/90 backdrop-blur-md rounded-xl border border-rose-500/30 text-[10px] text-rose-300 shadow-xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="font-bold text-white tracking-wide">
                    {currentMedia.server === 2 ? 'VidSrc To 1080p' : currentMedia.server === 3 ? 'VidSrc VIP 1080p' : currentMedia.server === 4 ? 'MultiEmbed 1080p' : 'VidLink Pro 1080p HD'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[9px] border border-emerald-500/30">
                    REAL FULL MOVIE 1080p
                  </span>
                  <span className="text-slate-400 border-l border-slate-700 pl-1.5">
                    Server {currentMedia.server || 1}
                  </span>
                  {isSeriesItem(currentMedia) && (
                    <button
                      type="button"
                      onClick={() => setSeriesModalItem(currentMedia)}
                      className="bg-purple-950/90 hover:bg-purple-900 text-purple-200 px-2 py-0.5 rounded-lg border border-purple-500/40 font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition shadow-sm"
                      title="View all seasons and choose an episode"
                    >
                      <Layers className="w-2.5 h-2.5 text-purple-400" />
                      <span>S{currentMedia.season || 1}:E{currentMedia.episode || 1}</span>
                    </button>
                  )}
                </div>

                {/* Center: Ad Shield Toggle & Stop Quick Action */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAdShieldActive(!adShieldActive)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md ${
                      adShieldActive
                        ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/90'
                        : 'bg-amber-950/90 text-amber-300 border border-amber-500/40 hover:bg-amber-900/90'
                    }`}
                    title={adShieldActive ? 'Ad Shield is ON: Screen clicks trigger play/pause and external ad popups are blocked' : 'Ad Shield is OFF: Direct screen clicks touch player'}
                  >
                    <ShieldCheck className={`w-3.5 h-3.5 ${adShieldActive ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <span>{adShieldActive ? 'Ad Shield: Active' : 'Ad Shield: Off'}</span>
                    {blockedAdsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px]">
                        {blockedAdsCount} blocked
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleStopMovie}
                    className="px-2 py-1 rounded-xl bg-slate-900/90 hover:bg-rose-950/80 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/40 text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                    title="Stop movie and silence stream"
                  >
                    <VolumeX className="w-3 h-3 text-rose-400" />
                    <span className="hidden sm:inline">Stop & Silence</span>
                  </button>
                </div>

                {/* Right: Multi-Server Switcher & Episode Controls */}
                <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-xl">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 px-1 hidden sm:inline">
                    Server:
                  </span>
                  {[
                    { id: 1, label: 'S1 VidLink 1080p', title: 'VidLink Pro 1080p Ultra HD (Fast, Clean, Recommended)' },
                    { id: 2, label: 'S2 VidSrc HD', title: 'VidSrc To 1080p Ultra HD CDN' },
                    { id: 3, label: 'S3 VidSrc VIP', title: 'VidSrc VIP Direct Stream Mirror' },
                    { id: 4, label: 'S4 MultiHD', title: 'MultiEmbed 1080p Mirror' },
                  ].map((srv) => {
                    const isActive = (currentMedia.server || 1) === srv.id;
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => handleSwitchStreamServer(srv.id as 1 | 2 | 3 | 4)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40 ring-1 ring-rose-400'
                            : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                        title={srv.title}
                      >
                        {srv.label}
                      </button>
                    );
                  })}

                  {/* TV Episode Navigator (if TV show) */}
                  {isSeriesItem(currentMedia) && (
                    <div className="flex items-center gap-1 pl-1 border-l border-slate-700/80">
                      <button
                        type="button"
                        onClick={() => {
                          const currSeason = currentMedia.season || 1;
                          const currEp = currentMedia.episode || 1;
                          if (currEp > 1) {
                            handleSwitchEpisode(currSeason, currEp - 1);
                          } else if (currSeason > 1) {
                            // Jump to previous season's last episode
                            const seasons = getSeriesSeasons(currentMedia);
                            const prevSeasonObj = seasons.find((s) => s.seasonNumber === currSeason - 1);
                            const prevEpCount = prevSeasonObj?.episodeCount || 10;
                            handleSwitchEpisode(currSeason - 1, prevEpCount);
                          }
                        }}
                        disabled={(currentMedia.season || 1) <= 1 && (currentMedia.episode || 1) <= 1}
                        className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 hover:text-white disabled:opacity-30 text-[9px] font-semibold cursor-pointer"
                        title="Previous Episode / Season"
                      >
                        ◀ Ep
                      </button>

                      {/* All Seasons & Episodes Button */}
                      <button
                        type="button"
                        id="btn-series-picker-player-bar"
                        onClick={() => setSeriesModalItem(currentMedia)}
                        className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 transition"
                        title="Browse all seasons and choose an episode"
                      >
                        <Layers className="w-3 h-3" />
                        <span>S{currentMedia.season || 1}:E{currentMedia.episode || 1}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const currSeason = currentMedia.season || 1;
                          const currEp = currentMedia.episode || 1;
                          const seasons = getSeriesSeasons(currentMedia);
                          const seasonObj = seasons.find((s) => s.seasonNumber === currSeason);
                          const totalEpisodesInSeason = seasonObj?.episodeCount || 10;
                          const maxSeason = seasons.length > 0 ? seasons[seasons.length - 1].seasonNumber : 1;

                          if (currEp < totalEpisodesInSeason) {
                            handleSwitchEpisode(currSeason, currEp + 1);
                          } else if (currSeason < maxSeason) {
                            handleSwitchEpisode(currSeason + 1, 1);
                          } else {
                            handleSwitchEpisode(1, 1);
                          }
                        }}
                        className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 hover:text-white text-[9px] font-semibold cursor-pointer"
                        title="Next Episode / Next Season"
                      >
                        Ep ▶
                      </button>
                    </div>
                  )}

                  {/* Quick Fallback Switcher */}
                  <button
                    type="button"
                    onClick={() => switchToFallbackStream()}
                    className="px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 text-[10px] font-medium border border-slate-700 transition cursor-pointer flex items-center gap-1"
                    title="If stream is buffering, switch to cinema fallback"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span className="hidden sm:inline">Fallback</span>
                  </button>

                  {/* Pop-out Stream */}
                  <a
                    href={currentMedia.embedUrl || currentMedia.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 shadow"
                    title="Open Stream in a new tab"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    <span className="hidden sm:inline">Pop-out</span>
                  </a>
                </div>
              </div>





            </div>
          ) : (
            /* 4. Audio / Visualizer Stream */
            <div className="relative w-full h-full flex flex-col items-center justify-center p-8 bg-radial from-rose-950/40 to-slate-950">
              <div className="relative w-40 h-40 rounded-3xl overflow-hidden border-2 border-rose-500/30 shadow-2xl mb-4 group">
                <img
                  src={currentMedia.thumbnailUrl || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500'}
                  alt={currentMedia.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-xl font-bold text-white font-serif">{currentMedia.title}</h4>
              <p className="text-xs text-rose-300 mt-1">{currentMedia.artist}</p>
            </div>
          )}

          {/* Autoplay Next Video Countdown Overlay */}
          {nextCountdown && nextCountdown.active && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
              <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-2xl p-5 text-center shadow-2xl space-y-4">
                <div className="flex items-center justify-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span>
                    {isSeriesItem(nextCountdown.nextMovie) && nextCountdown.nextMovie.season !== currentMedia.season
                      ? `Season ${currentMedia.season || 1} Complete • Next Season in ${nextCountdown.secondsLeft}s`
                      : isSeriesItem(nextCountdown.nextMovie)
                      ? `Episode Finished • Next Episode in ${nextCountdown.secondsLeft}s`
                      : `Video Finished • Playing Next in ${nextCountdown.secondsLeft}s`}
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-slate-800/90 p-3 rounded-xl border border-slate-700 text-left">
                  <img
                    src={nextCountdown.nextMovie.thumbnailUrl || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=300'}
                    alt={nextCountdown.nextMovie.title}
                    className="w-16 h-12 object-cover rounded-lg border border-slate-600 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white truncate font-serif">{nextCountdown.nextMovie.title}</h4>
                    <p className="text-xs text-rose-300/80 truncate mt-0.5">
                      {isSeriesItem(nextCountdown.nextMovie)
                        ? `Season ${nextCountdown.nextMovie.season || 1} • Episode ${nextCountdown.nextMovie.episode || 1}`
                        : nextCountdown.nextMovie.artist || nextCountdown.nextMovie.genre || 'Up Next'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleCancelNextCountdown}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer transition-colors"
                  >
                    Stay on Screen
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlayNext(true)}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-lg shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {isSeriesItem(nextCountdown.nextMovie) && nextCountdown.nextMovie.season !== currentMedia.season
                        ? 'Start Next Season'
                        : 'Play Next Episode'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Floating Bullet Comments (Danmaku) Overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {liveComments.map((comment) => (
              <div
                key={comment.id}
                style={{ top: `${comment.yPercent || 30}%` }}
                className="absolute whitespace-nowrap text-sm sm:text-base font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-danmaku-slide"
              >
                <span
                  style={{ color: comment.color || '#ffffff' }}
                  className="bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-xs font-serif"
                >
                  <span className="text-white/70 text-xs mr-1.5 font-sans font-normal">{comment.userName}:</span>
                  {comment.text}
                </span>
              </div>
            ))}
          </div>

          {/* Floating Picture-in-Picture (PiP) Couple Reaction Cam Bubble */}
          {isCallActive && showCamPiP && (
            <div className={`absolute z-30 flex gap-2 p-2 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-2xl transition-all ${
              isImmersive ? 'bottom-20 right-4 sm:bottom-24' : 'bottom-4 right-4'
            }`}>
              {/* Partner Video Cam */}
              <div className="relative w-28 h-20 sm:w-36 sm:h-24 bg-slate-800 rounded-xl overflow-hidden border border-rose-500/40">
                {remoteStream && remoteStream.getVideoTracks().length > 0 ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-2">
                    <img
                      src={partner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={partnerName}
                      className="w-8 h-8 rounded-full object-cover border border-rose-400 mb-1"
                    />
                    <span className="text-[10px] text-slate-300 truncate">{partnerName}</span>
                  </div>
                )}
                {isPartnerSpeaking && (
                  <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                )}
                <span className="absolute bottom-1 left-1.5 text-[9px] font-semibold text-white/90 bg-black/60 px-1.5 py-0.5 rounded">
                  {partnerName}
                </span>
              </div>

              {/* Local User Cam */}
              {isVideoEnabled && (
                <div className="relative w-24 h-20 sm:w-28 sm:h-24 bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                  <VerifiedBadgeOverlay
                    videoRef={localVideoRef}
                    isVideoOff={!isVideoEnabled}
                    position="top-right"
                    size="sm"
                  />
                  <span className="absolute bottom-1 left-1.5 text-[9px] font-semibold text-white/90 bg-black/60 px-1.5 py-0.5 rounded">
                    You
                  </span>
                </div>
              )}
            </div>
          )}

          {/* In-Movie Whisper / Danmaku Side Drawer */}
          {showSideChat && (
            <div className={`absolute top-0 right-0 bottom-0 ${
              isSideChatFullscreen ? 'left-0 w-full z-40 bg-slate-950/98' : 'w-72 sm:w-80 bg-slate-900/95'
            } backdrop-blur-md border-l border-slate-800 z-30 flex flex-col p-3 shadow-2xl animate-in slide-in-from-right`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                  <span>Movie Whispers & Reactions</span>
                  {isSideChatFullscreen && (
                    <span className="text-[10px] text-rose-400 font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                      Full Screen Chat
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsSideChatFullscreen(!isSideChatFullscreen)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title={isSideChatFullscreen ? "Restore sidebar chat" : "Extend chat area to full screen"}
                  >
                    {isSideChatFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-rose-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSideChat(false);
                      setIsSideChatFullscreen(false);
                    }}
                    className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Close chat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Comments Feed */}
              <div className={`flex-1 overflow-y-auto py-2 space-y-2 text-xs ${isSideChatFullscreen ? 'max-w-2xl mx-auto w-full' : ''}`}>
                {liveComments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                    <Sparkles className="w-6 h-6 text-rose-400/40 mb-2" />
                    <p>No whispers yet.</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Send a message or reaction to float it across the cinema screen!
                    </p>
                  </div>
                ) : (
                  liveComments.map((c) => (
                    <div
                      key={c.id}
                      className={`p-2 rounded-xl text-xs ${
                        c.userId === currentUserId
                          ? 'bg-rose-500/15 border border-rose-500/30 text-rose-200 ml-3'
                          : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 mr-3'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                        <span className="font-semibold">{c.userName}</span>
                        {c.videoTime !== undefined && (
                          <span className="font-mono">{formatTime(c.videoTime)}</span>
                        )}
                      </div>
                      <p className="font-medium break-words">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Reaction Tray */}
              <div className={`flex items-center justify-around py-1.5 border-t border-slate-800 bg-slate-900/50 ${isSideChatFullscreen ? 'max-w-2xl mx-auto w-full' : ''}`}>
                {['💖', '🍿', '😂', '🥺', '😭', '🔥', '👏'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleQuickMovieReaction(emoji)}
                    className="p-1 text-base hover:scale-125 transition-transform cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendBulletComment} className={`flex gap-1.5 pt-2 ${isSideChatFullscreen ? 'max-w-2xl mx-auto w-full' : ''}`}>
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Whisper during movie..."
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* =========================================================================
            CINEMA CONTROLS BAR: TIMELINE, VOLUME DUCKING, PLAY/PAUSE, SYNC
        ========================================================================= */}
        <div
          className={`p-3 sm:p-4 shrink-0 space-y-2.5 z-30 transition-all duration-300 ${
            isImmersive
              ? `absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent ${
                  !showControlsInFullscreen && isPlaying ? 'opacity-0 pointer-events-none translate-y-3' : 'opacity-100 translate-y-0'
                }`
              : 'bg-slate-900 border-t border-slate-800'
          }`}
        >
          {/* Progress Timeline Slider */}
          {currentMedia.type === 'video' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{formatTime(currentTime)}</span>
                {lastSyncBy && (
                  <span className="text-[10px] text-rose-300/80 bg-rose-950/30 px-2 py-0.5 rounded-full border border-rose-500/20">
                    Synced by {lastSyncBy}
                  </span>
                )}
                <span>{formatTime(duration || currentMedia.duration || 3600)}</span>
              </div>
              <input
                id="slider-movie-progress"
                type="range"
                min="0"
                max={duration || currentMedia.duration || 3600}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          )}

          {/* Master Controls & Live Voice Balancing */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
            {/* Left: Movie & Partner Audio Controls */}
            <div className="flex items-center gap-3">
              {/* Movie Sound Volume with % feedback */}
              <div className="flex items-center gap-1.5 text-slate-400">
                <button
                  onClick={handleToggleMovieMute}
                  className="p-1.5 hover:text-white transition-colors cursor-pointer"
                  title={isMutedMovie ? 'Unmute movie' : 'Mute movie'}
                >
                  {isMutedMovie ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  id="slider-movie-volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMutedMovie ? 0 : movieVolume}
                  onChange={(e) => handleMovieVolumeChange(Number(e.target.value))}
                  className="w-14 sm:w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  title="Movie volume"
                />
                <span className="text-[10px] text-slate-400 font-mono w-7 text-right select-none">
                  {isMutedMovie ? '0%' : `${Math.round(movieVolume * 100)}%`}
                </span>
              </div>

              {/* Auto Voice Ducking Toggle */}
              {isCallActive && (
                <button
                  onClick={() => setAutoDucking(!autoDucking)}
                  className={`px-2 py-1 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                    autoDucking
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Auto-duck movie audio when you or your partner speaks"
                >
                  <Sliders className="w-3 h-3" />
                  <span className="hidden sm:inline">Voice Ducking: {autoDucking ? 'ON' : 'OFF'}</span>
                </button>
              )}
            </div>

            {/* Center: Playback Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                id="btn-movie-rewind-10"
                onClick={() => handleSkip(-10)}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                title="Rewind 10s"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="btn-movie-play-pause"
                onClick={togglePlayPause}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 active:scale-95 transition-all cursor-pointer"
                title={isPlaying ? 'Pause / Stop movie for both (Space)' : 'Resume / Play movie for both (Space)'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </button>



              <button
                id="btn-movie-forward-10"
                onClick={() => handleSkip(10)}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                title="Forward 10s"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Jump to Next Video */}
              <button
                id="btn-movie-next-video"
                onClick={() => handlePlayNext(true)}
                className="p-2 text-slate-400 hover:text-rose-300 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                title={`Jump to next video (${getNextVideo()?.title || 'Next'})`}
              >
                <FastForward className="w-4 h-4" />
              </button>

              {/* Autoplay Next Toggle */}
              <button
                id="btn-movie-autoplay-toggle"
                onClick={() => setIsAutoplayNext(!isAutoplayNext)}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                  isAutoplayNext
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
                title={isAutoplayNext ? 'Autoplay is ON: advances to next video when finished' : 'Autoplay is OFF'}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isAutoplayNext ? 'bg-rose-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>Auto-Next</span>
              </button>
            </div>

            {/* Right: Quick Danmaku / Whisper Input + Screen Share + Catalog + Fullscreen */}
            <div className="flex items-center gap-2">
              <form onSubmit={handleSendBulletComment} className="hidden sm:flex items-center gap-1.5">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Whisper on screen..."
                  className="w-32 md:w-44 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-colors cursor-pointer"
                  title="Send flying comment"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>

              {/* Stream Screen / Tab Button */}
              <button
                onClick={handleToggleScreenShare}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isScreenSharing
                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/25 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:text-white'
                }`}
                title="Stream your browser tab or desktop screen with synchronized audio"
              >
                <Tv className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden md:inline">{isScreenSharing ? 'Stop Screen Stream' : 'Stream Screen / Tab'}</span>
                <span className="md:hidden">{isScreenSharing ? 'Stop' : 'Screen'}</span>
              </button>

              {/* Toggle Movie Catalog / Search */}
              <button
                onClick={() => setShowCatalog(!showCatalog)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showCatalog
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>{showCatalog ? 'Hide Movies' : 'Browse Movies'}</span>
              </button>

              {/* If TV Series: Browse All Seasons & Episodes */}
              {isSeriesItem(currentMedia) && (
                <button
                  type="button"
                  id="btn-movie-bottom-episodes"
                  onClick={() => setSeriesModalItem(currentMedia)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-purple-500/40 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
                  title="Browse all seasons and select an episode"
                >
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Episodes ({currentMedia.season || 1}:{currentMedia.episode || 1})</span>
                </button>
              )}

              {/* Fullscreen Button */}
              <button
                id="btn-movie-toggle-fullscreen"
                onClick={handleToggleFullscreen}
                className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isImmersive
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title={isImmersive ? 'Exit Full Screen (F / Esc)' : 'Watch in Full Screen (F)'}
              >
                {isImmersive ? <Minimize2 className="w-3.5 h-3.5 text-rose-400" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-300" />}
                <span className="hidden sm:inline">{isImmersive ? 'Exit Full Screen' : 'Full Screen'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            DISCOVER MOVIES DRAWER: TMDB CINEMA MOVIES, YOUTUBE SEARCH & HAVEN VOICE ONLY
        ========================================================================= */}
        {showCatalog && renderCatalogContent(false)}
      </>
    ) : (
      renderCatalogContent(true)
    )}

        {/* =========================================================================
            SERIES ALL SEASONS & EPISODES PICKER MODAL
        ========================================================================= */}
        <SeriesSeasonPickerModal
          isOpen={Boolean(seriesModalItem)}
          onClose={() => setSeriesModalItem(null)}
          series={seriesModalItem}
          currentActiveMedia={currentMedia}
          onSelectEpisode={handleSelectSeriesEpisode}
          currentServer={(currentMedia.server || 1) as 1 | 2 | 3 | 4}
          onServerChange={(srv) => {
            if (currentMedia) {
              handleSwitchStreamServer(srv);
            }
          }}
          isFriends={isFriends}
        />

        {/* =========================================================================
            TMDB CINEMA INFO & STREAMING MODAL
        ========================================================================= */}
        {showTmdbInfoModal && (
          <div
            id="modal-tmdb-info"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          >
            <div className="bg-slate-900 border border-rose-500/40 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
              {/* Modal Header */}
              <div className="p-4 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">TMDB Cinema Streaming Engine</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> 100% Ad-Free Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Live TMDB catalog integration with seamless real-time synchronized playback
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTmdbInfoModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-300">
                <div className="p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>How TMDB Cinema Works</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    All movies and series are loaded directly from TMDB’s vast catalog. Playback starts immediately with zero ads, no external popups, and real-time playback synchronization between you and your partner.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-white text-[11px] mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Zero Popups & Zero Ads
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Haven Cinema Shield blocks external ad redirects, keeping playback smooth and safe.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-white text-[11px] mb-1 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-rose-400" />
                      Synced Watch Parties
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Play, pause, seek, and episode selection sync instantly with your partner.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-[11px]">Featured TMDB Quick Picks:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Inception',
                      'Interstellar',
                      'Spirited Away',
                      'Breaking Bad',
                      'Stranger Things',
                      'Spider-Man',
                    ].map((title) => (
                      <button
                        key={title}
                        type="button"
                        onClick={() => {
                          setSearchQuery(title);
                          handlePerformSearch(title);
                          setShowTmdbInfoModal(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-slate-200 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                      >
                        <Search className="w-3 h-3 text-rose-400" />
                        <span>{title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-[11px] flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-rose-400" />
                      <span>Custom TMDB API Key (Optional)</span>
                    </h4>
                    {userTmdbKey && (
                      <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Key Active
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Built-in blockbusters work automatically without a key. To query millions of additional titles live on Vercel, paste your free TMDB API Read Token or API Key below:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={userTmdbKey}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        setUserTmdbKey(val);
                        if (val) {
                          localStorage.setItem('haven_tmdb_api_key', val);
                        } else {
                          localStorage.removeItem('haven_tmdb_api_key');
                        }
                      }}
                      placeholder="Paste TMDB API Key or Read Token..."
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono placeholder:text-slate-600 focus:outline-hidden focus:border-rose-500"
                    />
                    {userTmdbKey && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserTmdbKey('');
                          localStorage.removeItem('haven_tmdb_api_key');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold cursor-pointer transition"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTmdbInfoModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-xs shadow-lg shadow-rose-500/25 flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Back to Cinema</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
