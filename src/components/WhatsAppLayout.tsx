import React, { useState, useMemo } from 'react';
import { SafeAvatar } from './common/SafeAvatar';
import {
  MessageSquare,
  CircleDot,
  Phone,
  Video,
  Grid,
  Search,
  Settings,
  User,
  Image,
  Music,
  Film,
  Gamepad2,
  Mail,
  Heart,
  Palette,
  Lock,
  Shield,
  Compass,
  Clock,
  Sparkles,
  Moon,
  Sun,
  Mic,
  Send,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  CheckCheck,
  Check,
  Share2,
  Sliders,
  Eye,
  Camera,
  Tv,
  Flame,
  Zap,
  Dices,
  Fingerprint,
  Radio,
  Layers,
  Maximize2,
  Minimize2,
  Filter,
  Bell,
  Volume2,
  VolumeX,
  CheckCircle2,
  Info,
  Activity,
  QrCode,
  Smartphone,
  Sprout,
  Gift,
  HelpCircle,
  Menu,
  Swords,
  Play,
  UserPlus,
  Users,
  MessageSquarePlus,
  Trash2,
  LogOut,
  AlertTriangle,
  UserMinus,
} from 'lucide-react';
import { DecryptedMessage, SpaceType, UserProfile, FriendStatus, VoicemailGreeting, SavedSpaceRecord } from '../types';
import { ColorMode, ThemeConfig } from '../utils/theme';

export interface WhatsAppLayoutProps {
  // User & Partner
  partner: UserProfile | null;
  partnerName: string;
  partnerAvatar: string;
  currentUserName: string;
  currentUserAvatar: string;
  isPartnerOnline: boolean;
  isPartnerTyping: boolean;
  anniversaryDate?: string;
  isVerified?: boolean;
  spaceType?: SpaceType;
  groupName?: string;
  groupEmoji?: string;
  roomMembers?: UserProfile[];
  savedSpaces?: SavedSpaceRecord[];
  activeRoomId?: string;
  onSwitchSpace?: (record: SavedSpaceRecord) => void;
  onAddNewFriendChat?: (name: string, email?: string, avatar?: string) => void;
  onCreateFriendsGroup?: (groupName: string, groupEmoji?: string) => void;
  onLeaveGroup?: (roomId: string) => void;
  onDeleteGroup?: (roomId: string) => void;

  // Theme & Appearance
  colorMode: ColorMode;
  onToggleColorMode: (mode?: ColorMode) => void;
  themeConfig?: ThemeConfig;
  isChatFullscreen?: boolean;
  onToggleChatFullscreen?: () => void;

  // Messages & Activity
  messages: DecryptedMessage[];
  currentUserId: string;
  userMood?: any;
  onUpdateMood?: (mood: any) => void;
  onSendLovePing?: () => void;
  onTriggerLoveBuzz?: () => void;

  // Status & Media
  statuses?: FriendStatus[];
  hasUnreadStatus?: boolean;
  onOpenStatus?: () => void;
  voicemails?: VoicemailGreeting[];
  unreadVoicemailCount?: number;
  onOpenVoicemail?: () => void;
  isMusicPlaying?: boolean;
  currentMusicTitle?: string;

  // Calls
  onStartAudioCall: () => void;
  onStartVideoCall: () => void;

  // All 21+ Features Launchers
  onOpenAllFeatures: () => void;
  onOpenCanvas: () => void;
  onOpenMusicLounge: () => void;
  onOpenSoundboard: () => void;
  onOpenWatchTogether: () => void;
  onOpenGamesLounge: () => void;
  onOpenChess: () => void;
  onOpenDraughts?: () => void;
  onOpenLudo?: () => void;
  onOpenCandyCrush?: () => void;
  onOpenPolaroidVault: () => void;
  onOpenHorizon: () => void;
  onOpenTouchPulse: () => void;
  onOpenCareTracker: () => void;
  onOpenSleepSanctuary: () => void;
  onOpenTimeCapsule: () => void;
  onOpenDailySpark: () => void;
  onOpenBucketList: () => void;
  onOpenSharedBonsai?: () => void;
  onOpenTouchMelt?: () => void;
  onOpenBlindDilemma?: () => void;
  onOpenScratchCard?: () => void;
  onOpenWallpaperPicker: () => void;
  onOpenThemePicker: () => void;
  onOpenVibeSelector: () => void;
  onOpenSinglesLounge?: () => void;

  // Security & Spaces
  onOpenSecurity: () => void;
  onOpenSettings: () => void;
  onOpenActivityLog: () => void;
  onOpenQRPairing: () => void;
  onOpenSpacesManager: () => void;
  onOpenDiagnostics: () => void;
  onInviteSpouse: () => void;
  pendingInviteCount?: number;
  onAcceptPendingInvite?: () => void;
  pendingInvites?: any[];
  onAcceptInvite?: (invite: any) => void;
  onDeclineInvite?: (inviteId: string) => void;

  // Children: The Main Chat Workspace (<ChatArea>)
  children: React.ReactNode;
}

type WhatsAppNavTab = 'chats' | 'status' | 'features' | 'games' | 'watchparty' | 'calls' | 'media';
type FeatureFilter = 'all' | 'bond' | 'games' | 'media' | 'vault' | 'sanctuary';

export const WhatsAppLayout: React.FC<WhatsAppLayoutProps> = ({
  partner,
  partnerName,
  partnerAvatar,
  currentUserName,
  currentUserAvatar,
  isPartnerOnline,
  isPartnerTyping,
  anniversaryDate,
  isVerified = true,
  spaceType = 'couple',
  groupName,
  groupEmoji = '🎉',
  roomMembers = [],
  savedSpaces = [],
  activeRoomId,
  onSwitchSpace,
  onAddNewFriendChat,
  onCreateFriendsGroup,
  onLeaveGroup,
  onDeleteGroup,
  colorMode,
  onToggleColorMode,
  themeConfig,
  isChatFullscreen = false,
  onToggleChatFullscreen,
  messages,
  currentUserId,
  userMood,
  onUpdateMood,
  onSendLovePing,
  onTriggerLoveBuzz,
  statuses = [],
  hasUnreadStatus = false,
  onOpenStatus,
  voicemails = [],
  unreadVoicemailCount = 0,
  onOpenVoicemail,
  isMusicPlaying = false,
  currentMusicTitle,
  onStartAudioCall,
  onStartVideoCall,
  onOpenAllFeatures,
  onOpenCanvas,
  onOpenMusicLounge,
  onOpenSoundboard,
  onOpenWatchTogether,
  onOpenGamesLounge,
  onOpenChess,
  onOpenDraughts,
  onOpenLudo,
  onOpenCandyCrush,
  onOpenPolaroidVault,
  onOpenHorizon,
  onOpenTouchPulse,
  onOpenCareTracker,
  onOpenSleepSanctuary,
  onOpenTimeCapsule,
  onOpenDailySpark,
  onOpenBucketList,
  onOpenSharedBonsai,
  onOpenTouchMelt,
  onOpenBlindDilemma,
  onOpenScratchCard,
  onOpenWallpaperPicker,
  onOpenThemePicker,
  onOpenVibeSelector,
  onOpenSinglesLounge,
  onOpenSecurity,
  onOpenSettings,
  onOpenActivityLog,
  onOpenQRPairing,
  onOpenSpacesManager,
  onOpenDiagnostics,
  onInviteSpouse,
  pendingInviteCount = 0,
  onAcceptPendingInvite,
  pendingInvites = [],
  onAcceptInvite,
  onDeclineInvite,
  children,
}) => {
  const isDark = colorMode === 'dark';

  // Navigation tab state (Desktop rail / Mobile tabs)
  const [activeTab, setActiveTab] = useState<WhatsAppNavTab>('chats');
  
  // Mobile responsive view state: 'list' shows WhatsApp directory/tabs, 'chat' shows full conversation
  const [mobileScreen, setMobileScreen] = useState<'list' | 'chat'>('chat');
  
  // Tablet sidebar collapse state
  const [isTabletSidebarOpen, setIsTabletSidebarOpen] = useState(true);

  // Right-side WhatsApp Contact / Partner Info panel
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);

  // In-chat message search drawer
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [featureFilter, setFeatureFilter] = useState<FeatureFilter>('all');
  const [chatsFilter, setChatsFilter] = useState<'all' | 'spouse' | 'friends' | 'groups' | 'unread'>('all');

  // WhatsApp Menu Dropdown
  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false);
  const [isInvitesModalOpen, setIsInvitesModalOpen] = useState(false);

  // New Chat Modal & Quick Friends Flow
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatTab, setNewChatTab] = useState<'friend' | 'group' | 'spouse'>('friend');
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendAvatar, setNewFriendAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupEmoji, setNewGroupEmoji] = useState('🎉');

  // Upper Features Ribbon & Header more menu
  const [isQuickFeaturesVisible, setIsQuickFeaturesVisible] = useState(true);
  const [showChatMoreFeatures, setShowChatMoreFeatures] = useState(false);

  // Confirm Leave or Delete Group / Chat modal state
  const [groupActionModal, setGroupActionModal] = useState<{
    type: 'leave' | 'delete';
    roomId: string;
    targetName: string;
    isGroup: boolean;
  } | null>(null);

  // Quick menu for specific chat in the left list
  const [openChatRowMenuId, setOpenChatRowMenuId] = useState<string | null>(null);

  // Matching messages for in-chat search
  const matchingChatMessages = useMemo(() => {
    if (!chatSearchQuery.trim()) return [];
    const q = chatSearchQuery.toLowerCase();
    return messages.filter((m) => m.content && m.content.toLowerCase().includes(q));
  }, [messages, chatSearchQuery]);

  // Recent shared media (photos / polaroids)
  const recentSharedMedia = useMemo(() => {
    if (!messages) return [];
    return messages
      .filter((m) => m.type === 'image' || m.type === 'polaroid' || (m.mediaUrl && m.mediaUrl.startsWith('data:image')))
      .slice(-6)
      .reverse();
  }, [messages]);

  // Last Message summary
  const lastMessage = useMemo(() => {
    if (!messages || messages.length === 0) return null;
    return messages[messages.length - 1];
  }, [messages]);

  const lastMessageText = useMemo(() => {
    if (!lastMessage) return 'Tap to start your romantic sanctuary conversation...';
    if (lastMessage.type === 'image') return '📷 Photo';
    if (lastMessage.type === 'video') return '🎥 Video clip';
    if (lastMessage.type === 'audio') return '🎤 Voice message';
    if (lastMessage.type === 'love_ping') return '💓 Love Ping';
    if (lastMessage.type === 'call_log') return '📞 Call';
    return lastMessage.content || 'Message';
  }, [lastMessage]);

  const lastMessageTime = useMemo(() => {
    if (!lastMessage?.timestamp) return '';
    const date = new Date(lastMessage.timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [lastMessage]);

  const isLastMessageFromMe = lastMessage?.senderId === currentUserId;

  // Unread messages count (messages from partner not yet marked read)
  const unreadMessagesCount = useMemo(() => {
    return messages.filter((m) => m.senderId !== currentUserId && !m.isRead).length;
  }, [messages, currentUserId]);

  // Days together calculation
  const daysTogether = useMemo(() => {
    if (!anniversaryDate) return null;
    const start = new Date(anniversaryDate).getTime();
    const now = new Date().getTime();
    return Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  }, [anniversaryDate]);

  // Unified WhatsApp Conversations (Spouse + 1-on-1 Friends + Squad Groups)
  const unifiedChatList = useMemo(() => {
    // Strictly deduplicate savedSpaces by normalized roomId
    const seenRooms = new Set<string>();
    const list: SavedSpaceRecord[] = [];
    for (const item of (savedSpaces || [])) {
      if (!item || !item.roomId) continue;
      const key = item.roomId.toLowerCase().trim();
      if (!key || seenRooms.has(key)) continue;
      seenRooms.add(key);
      list.push({ ...item, roomId: key });
    }

    // Ensure currently active room is always in the list and reflects live state
    if (activeRoomId) {
      const activeKey = activeRoomId.toLowerCase().trim();
      const activeIdx = list.findIndex((s) => s.roomId.toLowerCase().trim() === activeKey);
      const currentTitle = spaceType === 'friends' ? (groupName || 'Squad Space') : (partner ? partner.name : partnerName);
      const currentAvatar = spaceType === 'friends' ? (groupEmoji || '🎉') : (partner ? partner.avatar : partnerAvatar);
      
      if (activeIdx >= 0) {
        list[activeIdx] = {
          ...list[activeIdx],
          title: currentTitle,
          partnerOrGroupName: currentTitle,
          partnerOrGroupAvatar: currentAvatar,
          lastMessageText: lastMessageText,
          lastVisitedAt: Date.now(),
        };
      } else {
        seenRooms.add(activeKey);
        list.unshift({
          roomId: activeKey,
          passkey: '',
          spaceType: (spaceType || 'couple') as SpaceType,
          title: currentTitle,
          partnerOrGroupName: currentTitle,
          partnerOrGroupAvatar: currentAvatar,
          myRole: 'member',
          myName: currentUserName || 'You',
          myAvatar: currentUserAvatar || '',
          lastVisitedAt: Date.now(),
          unreadCount: 0,
          lastMessageText: lastMessageText,
        });
      }
    }

    // Filter conversations based on current filter & search
    return list.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (item.title || item.partnerOrGroupName || '').toLowerCase().includes(q);
        const matchesSnippet = (item.lastMessageText || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesSnippet) return false;
      }

      if (chatsFilter === 'spouse') {
        return item.spaceType === 'couple';
      }
      if (chatsFilter === 'friends') {
        // Individual friend (not a squad group emoji)
        return item.spaceType === 'friends' && !['🎉', '🎮', '🍕', '🚀', '🏕️', '🍿', '🔥', '💫', '🎧', '🎬'].includes(item.partnerOrGroupAvatar);
      }
      if (chatsFilter === 'groups') {
        return item.spaceType === 'friends' && (
          ['🎉', '🎮', '🍕', '🚀', '🏕️', '🍿', '🔥', '💫', '🎧', '🎬'].includes(item.partnerOrGroupAvatar) ||
          (item.title || '').toLowerCase().includes('squad') ||
          (item.title || '').toLowerCase().includes('group')
        );
      }
      if (chatsFilter === 'unread') {
        return (item.unreadCount || 0) > 0;
      }
      return true;
    });
  }, [
    savedSpaces,
    activeRoomId,
    spaceType,
    groupName,
    groupEmoji,
    partner,
    partnerName,
    partnerAvatar,
    currentUserName,
    currentUserAvatar,
    lastMessageText,
    searchQuery,
    chatsFilter,
  ]);

  // All 21+ Features Catalog with WhatsApp metadata
  const allFeaturesList = useMemo(() => [
    {
      id: 'canvas',
      name: 'Live Love Canvas',
      category: 'bond' as FeatureFilter,
      desc: 'Real-time drawing, finger sketches & touch canvas',
      icon: Palette,
      color: 'bg-rose-500 text-white',
      badge: 'Realtime',
      action: onOpenCanvas,
    },
    {
      id: 'touch_pulse',
      name: 'Touch Pulse & Haptics',
      category: 'bond' as FeatureFilter,
      desc: 'Send vibration pulses and live heartbeat rhythms',
      icon: Zap,
      color: 'bg-amber-500 text-white',
      badge: 'Haptic',
      action: onOpenTouchPulse,
    },
    {
      id: 'music_lounge',
      name: 'Synced Music Lounge',
      category: 'media' as FeatureFilter,
      desc: 'Listen together synchronously with lofi beats & custom audio',
      icon: Music,
      color: 'bg-emerald-500 text-white',
      badge: isMusicPlaying ? 'Playing' : 'Audio',
      action: onOpenMusicLounge,
    },
    {
      id: 'watch_together',
      name: 'Movie Watchparty (Viduki)',
      category: 'media' as FeatureFilter,
      desc: 'Synchronized movie player, YouTube & cinema streams',
      icon: Tv,
      color: 'bg-purple-500 text-white',
      badge: 'Cinema',
      action: onOpenWatchTogether,
    },
    {
      id: 'soundboard',
      name: 'Romantic Soundboard',
      category: 'media' as FeatureFilter,
      desc: 'Send instant audio kisses, chimes, giggles & love reactions',
      icon: Volume2,
      color: 'bg-pink-500 text-white',
      badge: 'SFX',
      action: onOpenSoundboard,
    },
    {
      id: 'games_hearts',
      name: 'Connect Hearts 4-in-a-Row',
      category: 'games' as FeatureFilter,
      desc: 'Play turn-based couple connect game in real-time',
      icon: Heart,
      color: 'bg-red-500 text-white',
      badge: '2-Player',
      action: () => {
        if (onOpenGamesLounge) onOpenGamesLounge();
      },
    },
    {
      id: 'games_chess',
      name: 'Sanctuary Chess Master',
      category: 'games' as FeatureFilter,
      desc: 'Full chess board with timers, takebacks & live moves',
      icon: Swords,
      color: 'bg-indigo-600 text-white',
      badge: 'Strategy',
      action: onOpenChess,
    },
    {
      id: 'games_draughts',
      name: 'Checkers & Draughts',
      category: 'games' as FeatureFilter,
      desc: 'Classic checkers duel across the love board',
      icon: Dices,
      color: 'bg-amber-600 text-white',
      badge: 'Classic',
      action: onOpenDraughts || onOpenGamesLounge,
    },
    {
      id: 'games_ludo',
      name: 'Couple Ludo Royale',
      category: 'games' as FeatureFilter,
      desc: 'Dice roll race to bring hearts safely home',
      icon: Gamepad2,
      color: 'bg-teal-500 text-white',
      badge: 'Fun',
      action: onOpenLudo || onOpenGamesLounge,
    },
    {
      id: 'games_candy',
      name: 'Candy Crush Match-3',
      category: 'games' as FeatureFilter,
      desc: 'Match hearts and gems in addictive couple puzzles',
      icon: Flame,
      color: 'bg-orange-500 text-white',
      badge: 'Arcade',
      action: onOpenCandyCrush || onOpenGamesLounge,
    },
    {
      id: 'games_scratch',
      name: 'Secret Scratch Cards',
      category: 'games' as FeatureFilter,
      desc: 'Scratch to reveal romantic coupons & surprises',
      icon: Sparkles,
      color: 'bg-yellow-500 text-white',
      badge: 'Surprise',
      action: onOpenScratchCard || onOpenGamesLounge,
    },
    {
      id: 'polaroid_vault',
      name: 'Secret Polaroid Vault',
      category: 'vault' as FeatureFilter,
      desc: 'Biometric protected photos, albums & encrypted snapshots',
      icon: Camera,
      color: 'bg-slate-700 text-white',
      badge: 'Encrypted',
      action: onOpenPolaroidVault,
    },
    {
      id: 'horizon_radar',
      name: 'Long Distance Horizon',
      category: 'bond' as FeatureFilter,
      desc: 'Live partner distance radar, battery indicator & local weather',
      icon: Compass,
      color: 'bg-blue-500 text-white',
      badge: 'Radar',
      action: onOpenHorizon,
    },
    {
      id: 'time_capsule',
      name: 'Love Time Capsule',
      category: 'vault' as FeatureFilter,
      desc: 'Seal letters and voice memories to unlock in the future',
      icon: Clock,
      color: 'bg-violet-600 text-white',
      badge: 'Future',
      action: onOpenTimeCapsule,
    },
    {
      id: 'daily_spark',
      name: 'Daily Spark Questions',
      category: 'bond' as FeatureFilter,
      desc: 'Deep conversation prompts and questions for couples every day',
      icon: Sparkles,
      color: 'bg-pink-600 text-white',
      badge: 'Daily',
      action: onOpenDailySpark,
    },
    {
      id: 'sleep_sanctuary',
      name: 'Sleep Sanctuary & Sounds',
      category: 'sanctuary' as FeatureFilter,
      desc: 'White noise, rain ambiance & partner sleep detection',
      icon: Moon,
      color: 'bg-slate-900 text-slate-100',
      badge: 'Night',
      action: onOpenSleepSanctuary,
    },
    {
      id: 'shared_bonsai',
      name: 'Living Couple Bonsai Tree',
      category: 'bond' as FeatureFilter,
      desc: 'Water and nurture your shared digital bonsai as love blooms',
      icon: Sprout,
      color: 'bg-emerald-600 text-white',
      badge: 'Growth',
      action: onOpenSharedBonsai || onOpenAllFeatures,
    },
    {
      id: 'touch_melt',
      name: 'Touch Melt Resonance',
      category: 'bond' as FeatureFilter,
      desc: 'Touch the screen simultaneously to melt the heart barrier',
      icon: Heart,
      color: 'bg-rose-600 text-white',
      badge: 'Simultaneous',
      action: onOpenTouchMelt || onOpenTouchPulse,
    },
    {
      id: 'blind_dilemma',
      name: 'Blind Dilemma Game',
      category: 'games' as FeatureFilter,
      desc: 'Answer hilarious couple scenarios and reveal matching choices',
      icon: HelpCircle,
      color: 'bg-fuchsia-600 text-white',
      badge: 'Quiz',
      action: onOpenBlindDilemma || onOpenGamesLounge,
    },
    {
      id: 'bucket_list',
      name: 'Couple Bucket List',
      category: 'bond' as FeatureFilter,
      desc: 'Curate life goals, travel dreams & shared adventures',
      icon: CheckCircle2,
      color: 'bg-teal-600 text-white',
      badge: 'Goals',
      action: onOpenBucketList,
    },
    {
      id: 'care_tracker',
      name: 'Intimate Care Tracker',
      category: 'bond' as FeatureFilter,
      desc: 'Cycle tracking, gentle care notifications & wellness diary',
      icon: Activity,
      color: 'bg-rose-400 text-white',
      badge: 'Care',
      action: onOpenCareTracker,
    },
    {
      id: 'wallpapers',
      name: 'Sanctuary Dynamic Wallpapers',
      category: 'sanctuary' as FeatureFilter,
      desc: 'Animated constellations, sunset skies, rain & custom photos',
      icon: Image,
      color: 'bg-cyan-600 text-white',
      badge: 'Aesthetic',
      action: onOpenWallpaperPicker,
    },
    {
      id: 'themes',
      name: 'Theme Presets & Palette',
      category: 'sanctuary' as FeatureFilter,
      desc: 'Midnight Velvet, Rose Gold, Emerald Sanctuary & Cyber Neon',
      icon: Palette,
      color: 'bg-indigo-500 text-white',
      badge: 'Style',
      action: onOpenThemePicker,
    },
    {
      id: 'security',
      name: '256-bit Security & Biometrics',
      category: 'sanctuary' as FeatureFilter,
      desc: 'Emergency panic lock, disguise mode & auto-destruct timers',
      icon: Shield,
      color: 'bg-emerald-700 text-white',
      badge: 'Privacy',
      action: onOpenSecurity,
    },
  ], [
    onOpenCanvas,
    onOpenTouchPulse,
    onOpenMusicLounge,
    isMusicPlaying,
    onOpenWatchTogether,
    onOpenSoundboard,
    onOpenGamesLounge,
    onOpenChess,
    onOpenDraughts,
    onOpenLudo,
    onOpenCandyCrush,
    onOpenScratchCard,
    onOpenPolaroidVault,
    onOpenHorizon,
    onOpenTimeCapsule,
    onOpenDailySpark,
    onOpenSleepSanctuary,
    onOpenSharedBonsai,
    onOpenTouchMelt,
    onOpenBlindDilemma,
    onOpenBucketList,
    onOpenCareTracker,
    onOpenWallpaperPicker,
    onOpenThemePicker,
    onOpenSecurity,
    onOpenAllFeatures,
  ]);

  // Filtered features based on search and category
  const filteredFeatures = useMemo(() => {
    return allFeaturesList.filter((f) => {
      const matchesSearch = searchQuery.trim() === '' ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = featureFilter === 'all' || f.category === featureFilter;
      return matchesSearch && matchesCategory;
    });
  }, [allFeaturesList, searchQuery, featureFilter]);

  // Pinned Feature Channels for the WhatsApp Chats Tab
  const pinnedChannels = useMemo(() => [
    {
      id: 'chan_canvas',
      title: 'Live Love Canvas',
      desc: 'Shared touch sketchbook & drawing board',
      icon: Palette,
      badge: 'Interactive',
      action: onOpenCanvas,
      color: 'bg-rose-500',
    },
    {
      id: 'chan_watchparty',
      title: 'Movie Watch Party (Viduki & YouTube)',
      desc: 'Synchronized cinema room, streaming movies & YouTube playlists',
      icon: Tv,
      badge: 'Cinema 🍿',
      action: onOpenWatchTogether,
      color: 'bg-purple-600',
    },
    {
      id: 'chan_music',
      title: 'Synced Music Lounge',
      desc: isMusicPlaying ? `Now playing: ${currentMusicTitle || 'Synced Track'}` : 'Synchronized playlist & mood tunes',
      icon: Music,
      badge: isMusicPlaying ? 'Playing' : 'Audio',
      action: onOpenMusicLounge,
      color: 'bg-emerald-500',
    },
    {
      id: 'chan_games',
      title: 'Couple Games Arcade',
      desc: 'Chess, Connect Hearts, Ludo & Candy Crush',
      icon: Gamepad2,
      badge: 'Games',
      action: onOpenGamesLounge,
      color: 'bg-indigo-500',
    },
    {
      id: 'chan_vault',
      title: 'Polaroid Memory Vault',
      desc: 'Encrypted memories & private albums',
      icon: Camera,
      badge: 'Private',
      action: onOpenPolaroidVault,
      color: 'bg-slate-700',
    },
    {
      id: 'chan_horizon',
      title: 'Horizon Radar & Touch Pulse',
      desc: 'Live partner distance & heartbeat sync',
      icon: Compass,
      badge: 'Radar',
      action: onOpenHorizon,
      color: 'bg-blue-500',
    },
    {
      id: 'chan_spark',
      title: 'Daily Spark & Time Capsule',
      desc: 'Daily couple questions & future letters',
      icon: Sparkles,
      badge: 'Daily',
      action: onOpenDailySpark,
      color: 'bg-amber-500',
    },
  ], [onOpenCanvas, onOpenWatchTogether, isMusicPlaying, currentMusicTitle, onOpenMusicLounge, onOpenGamesLounge, onOpenPolaroidVault, onOpenHorizon, onOpenDailySpark]);

  return (
    <div className={`flex h-full h-[100dvh] min-h-[100dvh] w-full overflow-hidden font-sans select-none ${
      isDark ? 'bg-[#0c1317] text-[#e9edef]' : 'bg-[#efeae2] text-[#111b21]'
    }`}>

      {/* =========================================================================
          1. WHATSAPP ACTIVITY RAIL (Desktop / Laptop only: lg:flex, 64px width)
          ========================================================================= */}
      {!isChatFullscreen && (
        <aside className={`hidden lg:flex flex-col items-center justify-between w-16 py-3 shrink-0 border-r z-30 transition-colors ${
          isDark
            ? 'bg-[#202c33] border-[#222e35] text-[#aebac1]'
            : 'bg-[#f0f2f5] border-[#d1d7db] text-[#54656f]'
        }`}>
          {/* Top Section: App Brand & Navigation Tabs */}
          <div className="flex flex-col items-center gap-3 w-full">
            {/* WhatsApp Haven Logo Brand Button */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('chats');
                setMobileScreen('chat');
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#00a884] text-white shadow-md hover:scale-105 transition-transform cursor-pointer relative"
              title="WhatsApp Sanctuary"
            >
              <MessageSquare className="w-5 h-5 fill-current" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#202c33]">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            <div className="w-8 h-[1px] bg-slate-300 dark:bg-slate-700 my-1" />

            {/* Tab: Chats */}
            <button
              type="button"
              onClick={() => setActiveTab('chats')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeTab === 'chats'
                  ? isDark ? 'bg-[#374248] text-[#00a884]' : 'bg-[#e2e5e9] text-[#008069]'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'
              }`}
              title="Chats & Conversations"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadMessagesCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#25d366]" />
              )}
            </button>

            {/* Tab: Status & Updates */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('status');
                if (onOpenStatus) onOpenStatus();
              }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeTab === 'status'
                  ? isDark ? 'bg-[#374248] text-[#00a884]' : 'bg-[#e2e5e9] text-[#008069]'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'
              }`}
              title="Status & Stories"
            >
              <CircleDot className="w-5 h-5" />
              {hasUnreadStatus && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#25d366] animate-pulse" />
              )}
            </button>

            {/* Tab: Features Directory Hub */}
            <button
              type="button"
              onClick={() => setActiveTab('features')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeTab === 'features'
                  ? isDark ? 'bg-[#374248] text-[#00a884]' : 'bg-[#e2e5e9] text-[#008069]'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'
              }`}
              title="All 21+ Features Hub"
            >
              <Grid className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1 rounded-full">
                21+
              </span>
            </button>



            {/* Tab: Couple Games Lounge */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('games');
                onOpenGamesLounge();
              }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeTab === 'games'
                  ? isDark ? 'bg-[#374248] text-[#00a884]' : 'bg-[#e2e5e9] text-[#008069]'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'
              }`}
              title="Games Lounge (Chess, Ludo, Hearts, Candy)"
            >
              <Gamepad2 className="w-5 h-5" />
            </button>

            {/* Tab: Watch Party & Cinema (Viduki Streams) */}
            <button
              type="button"
              id="rail-tab-watchparty"
              onClick={() => {
                setActiveTab('watchparty');
                onOpenWatchTogether();
              }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
                activeTab === 'watchparty'
                  ? isDark ? 'bg-[#374248] text-purple-400 ring-2 ring-purple-500/40' : 'bg-[#e2e5e9] text-purple-600 ring-2 ring-purple-400/40'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'
              }`}
              title="Movie Watch Party & Cinema (Viduki)"
            >
              <Tv className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 text-[8px] bg-purple-600 text-white font-black px-1 py-0.2 rounded-full shadow-xs">
                CINEMA
              </span>
            </button>

            {/* Tab: Music Lounge */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('media');
                onOpenMusicLounge();
              }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeTab === 'media'
                  ? isDark ? 'bg-[#374248] text-[#00a884]' : 'bg-[#e2e5e9] text-[#008069]'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'
              }`}
              title="Music Lounge & Synced Audio"
            >
              <Music className={`w-5 h-5 ${isMusicPlaying ? 'text-emerald-400 animate-pulse' : ''}`} />
            </button>

            {/* Tab: Invite Hub */}
            <button
              type="button"
              onClick={onInviteSpouse}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 group"
              title="Invite & Pending Invites Hub"
            >
              <Mail className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
              {pendingInvites && pendingInvites.filter((i) => i.status === 'pending').length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                  {pendingInvites.filter((i) => i.status === 'pending').length}
                </span>
              )}
            </button>

            {/* Tab: Calls */}
            <button
              type="button"
              onClick={() => setActiveTab('calls')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeTab === 'calls'
                  ? isDark ? 'bg-[#374248] text-[#00a884]' : 'bg-[#e2e5e9] text-[#008069]'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'
              }`}
              title="Voice & Video Calls"
            >
              <Phone className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Section: Theme, Settings & Profile */}
          <div className="flex flex-col items-center gap-2.5 w-full">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => onToggleColorMode()}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title={isDark ? 'Switch to WhatsApp Light Mode' : 'Switch to WhatsApp Dark Mode'}
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>

            {/* Wallpapers */}
            <button
              type="button"
              onClick={onOpenWallpaperPicker}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Chat Wallpapers & Sanctuary Backgrounds"
            >
              <Palette className="w-5 h-5 text-indigo-400" />
            </button>

            {/* Security */}
            <button
              type="button"
              onClick={onOpenSecurity}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Security & Biometric Lock"
            >
              <Shield className="w-5 h-5 text-emerald-400" />
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* User Profile Avatar */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#00a884] ring-1 ring-black/20 hover:opacity-90 transition-opacity cursor-pointer relative"
              title={`Logged in as ${currentUserName || 'You'}`}
            >
              <img
                src={currentUserAvatar || partnerAvatar}
                alt="My Profile"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </aside>
      )}

      {/* =========================================================================
          2. WHATSAPP DIRECTORY / SIDEBAR
             - Desktop/Laptop: always visible (width 360px - 400px)
             - Tablet: collapsible or side-by-side (width 320px)
             - Mobile: full width when mobileScreen === 'list', hidden when mobileScreen === 'chat'
          ========================================================================= */}
      {!isChatFullscreen && (
        <section
          className={`flex flex-col shrink-0 border-r transition-all duration-300 z-20 ${
            // Desktop view
            'lg:w-[380px] xl:w-[410px] lg:flex ' +
            // Tablet view
            (isTabletSidebarOpen ? 'md:w-[320px] md:flex ' : 'md:hidden ') +
            // Mobile view
            (mobileScreen === 'list' ? 'w-full flex h-full' : 'hidden md:flex')
          } ${
            isDark
              ? 'bg-[#111b21] border-[#222e35]'
              : 'bg-[#ffffff] border-[#e9edef]'
          }`}
        >
          {/* WhatsApp Sidebar Top Header Bar */}
          <header className={`h-16 min-h-[64px] px-4 flex items-center justify-between shrink-0 border-b ${
            isDark ? 'bg-[#202c33] border-[#222e35]' : 'bg-[#f0f2f5] border-[#d1d7db]'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Partner/User Avatar on mobile or sidebar title */}
              <div
                onClick={onOpenSettings}
                className="w-9 h-9 rounded-full overflow-hidden border border-emerald-500/60 cursor-pointer hover:opacity-90 shrink-0"
                title="Profile & Settings"
              >
                <img
                  src={currentUserAvatar || partnerAvatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <h2 className="text-base font-bold truncate flex items-center gap-1.5">
                  <span>
                    {activeTab === 'chats' && 'Chats'}
                    {activeTab === 'status' && 'Updates & Status'}
                    {activeTab === 'features' && 'Sanctuary Features'}
                    {activeTab === 'games' && 'Couple Games'}
                    {activeTab === 'watchparty' && 'Watch Party & Cinema'}
                    {activeTab === 'calls' && 'Calls'}
                    {activeTab === 'media' && 'Media & Lounge'}
                  </span>
                  {activeTab === 'features' && (
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                      {allFeaturesList.length} Active
                    </span>
                  )}
                </h2>
              </div>
            </div>

            {/* Quick Action Buttons in WhatsApp Sidebar Header */}
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-300">
              {/* New Chat Button (Message Friend / Create Group) */}
              <button
                type="button"
                onClick={() => setIsNewChatOpen(true)}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-[#00a884]"
                title="Start New Friend Chat or Squad Group"
              >
                <MessageSquarePlus className="w-5 h-5" />
              </button>

              {/* Invite Partner / QR Code */}
              <button
                type="button"
                onClick={onOpenQRPairing || onInviteSpouse}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Pair with Spouse via QR Code or Link"
              >
                <QrCode className="w-5 h-5 text-emerald-500" />
              </button>



              {/* All Features Catalog Modal */}
              <button
                type="button"
                onClick={onOpenAllFeatures}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Open All Features Grid"
              >
                <Grid className="w-5 h-5 text-indigo-400" />
              </button>

              {/* WhatsApp 3-dots Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowWhatsAppMenu(!showWhatsAppMenu)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  title="Menu"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {showWhatsAppMenu && (
                  <div className={`absolute right-0 top-10 w-56 rounded-2xl shadow-2xl py-2 z-50 border text-sm font-medium ${
                    isDark
                      ? 'bg-[#233138] border-[#222e35] text-[#d1d7db]'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWhatsAppMenu(false);
                        onOpenSettings();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-emerald-500" /> Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWhatsAppMenu(false);
                        onOpenAllFeatures();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-400" /> All 21+ Features Hub
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWhatsAppMenu(false);
                        onOpenWallpaperPicker();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 cursor-pointer"
                    >
                      <Palette className="w-4 h-4 text-pink-400" /> Wallpaper & Chat Theme
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWhatsAppMenu(false);
                        onOpenSecurity();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-amber-400" /> Privacy & Incognito
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWhatsAppMenu(false);
                        onOpenDiagnostics();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 cursor-pointer"
                    >
                      <Activity className="w-4 h-4 text-teal-400" /> Connection Health
                    </button>
                    <div className="h-[1px] bg-slate-200 dark:bg-slate-700 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setShowWhatsAppMenu(false);
                        onToggleColorMode();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 cursor-pointer"
                    >
                      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                      {isDark ? 'Light Theme' : 'Dark Theme'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* WhatsApp Mobile Top Tabs (Visible on mobile screens < 768px) */}
          <div className={`flex md:hidden items-center overflow-x-auto no-scrollbar gap-1 border-b px-2 py-1 shrink-0 ${
            isDark ? 'bg-[#202c33] border-[#222e35]' : 'bg-[#f0f2f5] border-[#d1d7db]'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab('chats')}
              className={`px-3 py-2 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap relative transition-colors ${
                activeTab === 'chats'
                  ? 'text-[#00a884] border-b-2 border-[#00a884]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Chats
              {unreadMessagesCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-[#25d366] text-white text-[10px] rounded-full">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('status')}
              className={`px-3 py-2 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap relative transition-colors ${
                activeTab === 'status'
                  ? 'text-[#00a884] border-b-2 border-[#00a884]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Updates
              {hasUnreadStatus && (
                <span className="ml-1.5 w-2 h-2 inline-block rounded-full bg-[#25d366]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('features')}
              className={`px-3 py-2 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap relative transition-colors ${
                activeTab === 'features'
                  ? 'text-[#00a884] border-b-2 border-[#00a884]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Features
              <span className="ml-1 text-[10px] text-emerald-400 font-bold">21+</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('games');
                if (onOpenGamesLounge) onOpenGamesLounge();
              }}
              className={`px-3 py-2 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap relative transition-colors ${
                activeTab === 'games'
                  ? 'text-amber-400 border-b-2 border-amber-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Games</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('watchparty')}
              className={`px-3 py-2 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap relative transition-colors ${
                activeTab === 'watchparty'
                  ? 'text-purple-400 border-b-2 border-purple-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <Tv className="w-3.5 h-3.5" />
                <span>Watch</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calls')}
              className={`px-3 py-2 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap relative transition-colors ${
                activeTab === 'calls'
                  ? 'text-[#00a884] border-b-2 border-[#00a884]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Calls
            </button>
          </div>

          {/* Search Bar (Iconic WhatsApp Pill) */}
          <div className={`p-2.5 shrink-0 border-b ${
            isDark ? 'bg-[#111b21] border-[#222e35]' : 'bg-[#ffffff] border-[#e9edef]'
          }`}>
            <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
              isDark ? 'bg-[#202c33] text-slate-200' : 'bg-[#f0f2f5] text-slate-900'
            }`}>
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'features'
                    ? 'Search 21+ couple features...'
                    : activeTab === 'games'
                    ? 'Search couple games...'
                    : 'Search or start new chat'
                }
                className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:text-rose-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter Chips (WhatsApp Style) */}
            {activeTab === 'chats' && (
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5 no-scrollbar text-xs">
                {([
                  { id: 'all', label: 'All' },
                  { id: 'spouse', label: 'Spouse ❤️' },
                  { id: 'friends', label: 'Friends 👤' },
                  { id: 'groups', label: 'Groups 👥' },
                  { id: 'unread', label: 'Unread' },
                ] as const).map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setChatsFilter(id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      chatsFilter === id
                        ? isDark ? 'bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40 font-semibold' : 'bg-[#008069]/15 text-[#008069] border border-[#008069]/30 font-semibold'
                        : isDark ? 'bg-[#202c33] text-slate-300 hover:bg-[#2a3942]' : 'bg-[#f0f2f5] text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'features' && (
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5 no-scrollbar text-xs">
                {(['all', 'bond', 'games', 'media', 'vault', 'sanctuary'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFeatureFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer capitalize ${
                      featureFilter === cat
                        ? isDark ? 'bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40 font-semibold' : 'bg-[#008069]/15 text-[#008069] border border-[#008069]/30 font-semibold'
                        : isDark ? 'bg-[#202c33] text-slate-300 hover:bg-[#2a3942]' : 'bg-[#f0f2f5] text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'bond' ? '💖 Intimacy' : cat === 'games' ? '🎮 Games' : cat === 'media' ? '🎵 Media' : cat === 'vault' ? '📸 Vault' : cat === 'sanctuary' ? '🌙 Sanctuary' : '✨ All Features'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Directory Content List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40 relative">

            {/* TAB 1: UNIFIED CHATS LIST (WhatsApp All-In-One Chats: Spouse + Friends + Groups) */}
            {activeTab === 'chats' && (
              <div className="py-1">
                {/* Header Action Banner: Quick New Chat / Add Friend */}
                <div className="px-3 pt-2 pb-2 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Chats ({unifiedChatList.length})
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setNewChatTab('friend');
                        setIsNewChatOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-[#00a884] border border-emerald-500/30 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      title="Add a friend to chat"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Friend</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewChatTab('group');
                        setIsNewChatOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/30 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      title="Create a new Squad group"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>+ Group</span>
                    </button>
                  </div>
                </div>

                {/* Empty State when filter or search has no matches */}
                {unifiedChatList.length === 0 && (
                  <div className="p-6 text-center text-slate-400 space-y-3">
                    <p className="text-xs">No conversations found under this filter.</p>
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setChatsFilter('all');
                          setSearchQuery('');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
                      >
                        Reset Filter
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewChatTab('friend');
                          setIsNewChatOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#00a884] text-white hover:bg-[#009170] cursor-pointer"
                      >
                        + Add Friend
                      </button>
                    </div>
                  </div>
                )}

                {/* Conversation Rows: All In One WhatsApp Space */}
                {unifiedChatList.map((chat, chatIndex) => {
                  const isActive = (chat.roomId || '').toLowerCase() === (activeRoomId || '').toLowerCase();
                  const isSpouse = chat.spaceType === 'couple';
                  const isGroup = chat.spaceType === 'friends' && (
                    ['🎉', '🎮', '🍕', '🚀', '🏕️', '🍿', '🔥', '💫', '🎧', '🎬'].includes(chat.partnerOrGroupAvatar) ||
                    (chat.title || '').toLowerCase().includes('squad') ||
                    (chat.title || '').toLowerCase().includes('group')
                  );
                  const isSingleFriend = chat.spaceType === 'friends' && !isGroup;
                  const isAvatarEmoji = ['🎉', '🎮', '🍕', '🚀', '🏕️', '🍿', '🔥', '💫', '🎧', '🎬'].includes(chat.partnerOrGroupAvatar);

                  return (
                    <div
                      key={`${chat.roomId}-${chatIndex}`}
                      onClick={() => {
                        if (!isActive && onSwitchSpace) {
                          onSwitchSpace(chat);
                        }
                        setMobileScreen('chat');
                      }}
                      className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors relative border-l-4 ${
                        isActive
                          ? isDark
                            ? 'border-[#00a884] bg-[#202c33]/80 hover:bg-[#202c33]'
                            : 'border-[#008069] bg-[#f0f2f5] hover:bg-slate-100'
                          : isDark
                          ? 'border-transparent hover:bg-[#202c33]/40'
                          : 'border-transparent hover:bg-slate-50'
                      }`}
                    >
                      {/* Avatar with Online Ring / Emoji Badge */}
                      <div className="relative shrink-0">
                        {isAvatarEmoji ? (
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/50 shadow-sm">
                            {chat.partnerOrGroupAvatar}
                          </div>
                        ) : (
                          <div className={`w-12 h-12 rounded-full overflow-hidden border-2 shadow-sm ${
                            isSpouse
                              ? 'border-rose-500/70 ring-1 ring-rose-400/40'
                              : 'border-emerald-500/70'
                          }`}>
                            <img
                              src={chat.partnerOrGroupAvatar || (isSpouse ? partnerAvatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80')}
                              alt={chat.title || 'Chat'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Online Presence Dot */}
                        {isActive ? (
                          isPartnerOnline ? (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#25d366] border-2 border-[#111b21] ring-1 ring-white/20 animate-pulse" />
                          ) : (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-slate-400 border-2 border-[#111b21]" />
                          )
                        ) : (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500/80 border-2 border-[#111b21]" />
                        )}
                      </div>

                      {/* Chat Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h3 className="text-sm font-semibold truncate flex items-center gap-1.5">
                            <span className={isDark ? 'text-white' : 'text-slate-900'}>
                              {chat.partnerOrGroupName || chat.title}
                            </span>
                            
                            {/* Role / Space Type Tag */}
                            {isSpouse && (
                              <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded-full border border-rose-500/30 font-medium">
                                ❤️ Spouse
                              </span>
                            )}
                            {isGroup && (
                              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.2 rounded-full border border-indigo-500/30 font-medium">
                                👥 Squad
                              </span>
                            )}
                            {isSingleFriend && (
                              <span className="text-[10px] bg-emerald-500/20 text-[#00a884] px-1.5 py-0.2 rounded-full border border-emerald-500/30 font-medium">
                                👤 Friend
                              </span>
                            )}

                            {isSpouse && daysTogether && (
                              <span className="text-[10px] text-rose-400 font-normal">
                                ({daysTogether}d)
                              </span>
                            )}
                          </h3>

                          <span className="text-[11px] text-slate-400 font-medium shrink-0">
                            {isActive
                              ? (lastMessageTime || 'Now')
                              : chat.lastMessageTime
                              ? new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'Recent'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs truncate flex items-center gap-1 text-slate-400">
                            {isActive && isPartnerTyping ? (
                              <span className="text-[#25d366] font-semibold animate-pulse">
                                typing...
                              </span>
                            ) : (
                              <>
                                {isActive && isLastMessageFromMe && (
                                  <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] shrink-0 inline" />
                                )}
                                <span className="truncate">
                                  {isActive ? lastMessageText : (chat.lastMessageText || 'Tap to chat...')}
                                </span>
                              </>
                            )}
                          </p>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {((isActive ? unreadMessagesCount : (chat.unreadCount || 0)) > 0) && (
                              <span className="w-5 h-5 rounded-full bg-[#25d366] text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                                {isActive ? unreadMessagesCount : chat.unreadCount}
                              </span>
                            )}

                            {/* Chat row quick action options for non-spouse (friend / group) chats */}
                            {!isSpouse && (
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenChatRowMenuId((prev) => (prev === chat.roomId ? null : chat.roomId));
                                  }}
                                  className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                                  title="Chat options"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {openChatRowMenuId === chat.roomId && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className={`absolute right-0 top-6 w-44 rounded-2xl shadow-2xl py-1.5 z-50 border text-xs font-medium animate-in fade-in zoom-in-95 duration-100 ${
                                      isDark
                                        ? 'bg-[#233138] border-[#222e35] text-slate-200'
                                        : 'bg-white border-slate-200 text-slate-800'
                                    }`}
                                  >
                                    {isGroup ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenChatRowMenuId(null);
                                            setGroupActionModal({
                                              type: 'leave',
                                              roomId: chat.roomId,
                                              targetName: chat.partnerOrGroupName || chat.title || 'Group',
                                              isGroup: true,
                                            });
                                          }}
                                          className="w-full text-left px-3 py-2 hover:bg-rose-500/10 text-rose-500 flex items-center gap-2.5 cursor-pointer"
                                        >
                                          <LogOut className="w-3.5 h-3.5 shrink-0" />
                                          <span>Leave Group</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenChatRowMenuId(null);
                                            setGroupActionModal({
                                              type: 'delete',
                                              roomId: chat.roomId,
                                              targetName: chat.partnerOrGroupName || chat.title || 'Group',
                                              isGroup: true,
                                            });
                                          }}
                                          className="w-full text-left px-3 py-2 hover:bg-red-600/10 text-red-600 flex items-center gap-2.5 cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                          <span>Delete Group</span>
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenChatRowMenuId(null);
                                          setGroupActionModal({
                                            type: 'delete',
                                            roomId: chat.roomId,
                                            targetName: chat.partnerOrGroupName || chat.title || 'Friend',
                                            isGroup: false,
                                          });
                                        }}
                                        className="w-full text-left px-3 py-2 hover:bg-red-600/10 text-red-600 flex items-center gap-2.5 cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                        <span>Delete Chat</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Floating Action Button for New Chat */}
                <div className="fixed bottom-6 right-6 lg:absolute lg:bottom-6 lg:right-6 z-20">
                  <button
                    type="button"
                    onClick={() => setIsNewChatOpen(true)}
                    className="w-13 h-13 rounded-full bg-[#00a884] hover:bg-[#009170] active:scale-95 text-white shadow-xl flex items-center justify-center transition-all cursor-pointer group"
                    title="Start New Friend Chat or Squad Group"
                  >
                    <MessageSquarePlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                {/* 2. PINNED SANCTUARY CHANNELS (Quick Feature Access as WhatsApp Chats) */}
                <div className="px-3 pt-3 pb-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    Pinned Sanctuary Features & Hubs
                  </p>
                </div>

                {pinnedChannels.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <div
                      key={channel.id}
                      onClick={() => {
                        channel.action();
                        setMobileScreen('chat');
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                        isDark ? 'hover:bg-[#202c33]/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-full ${channel.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className={`text-xs sm:text-sm font-semibold truncate ${
                            isDark ? 'text-slate-200' : 'text-slate-800'
                          }`}>
                            {channel.title}
                          </h4>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-medium shrink-0">
                            {channel.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          {channel.desc}
                        </p>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: FEATURES DIRECTORY (Complete WhatsApp 21+ Feature Grid) */}
            {activeTab === 'features' && (
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-1">
                  <span>Showing {filteredFeatures.length} features</span>
                  <button
                    type="button"
                    onClick={onOpenAllFeatures}
                    className="text-[#00a884] font-semibold hover:underline"
                  >
                    Open Hub Modal ↗
                  </button>
                </div>

                {filteredFeatures.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={feat.id}
                      onClick={() => {
                        feat.action();
                        setMobileScreen('chat');
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 group hover:scale-[1.01] ${
                        isDark
                          ? 'bg-[#202c33] border-[#222e35] hover:border-[#00a884]/40 hover:bg-[#233138]'
                          : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl ${feat.color} flex items-center justify-center shrink-0 shadow-sm group-hover:rotate-3 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-sm font-bold truncate">
                            {feat.name}
                          </h4>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full font-semibold shrink-0">
                            {feat.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          {feat.desc}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#00a884] text-white hover:bg-[#008f6f] shrink-0"
                      >
                        Open
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: STATUS & UPDATES (WhatsApp Status, Stories & Live Mood Ring) */}
            {activeTab === 'status' && (
              <div className="p-3 space-y-3.5 overflow-y-auto">
                {/* My Status */}
                <div
                  onClick={onOpenStatus}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                    isDark ? 'bg-[#202c33] border-[#222e35] hover:bg-[#233138]' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={currentUserAvatar || partnerAvatar}
                      alt="My Status"
                      className="w-13 h-13 rounded-full object-cover border-2 border-emerald-500/80"
                    />
                    <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#00a884] text-white flex items-center justify-center border-2 border-white dark:border-[#202c33] shadow-xs">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">My Status</h4>
                    <p className="text-xs text-slate-400 truncate">
                      Tap to post romantic photo story or note
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#00a884]">
                    Add
                  </span>
                </div>

                {/* Partner Status Updates */}
                <div>
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
                    Partner Stories
                  </h5>
                  <div
                    onClick={onOpenStatus}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors group ${
                      isDark ? 'bg-[#202c33] border-[#222e35] hover:bg-[#233138]' : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-13 h-13 rounded-full p-0.5 border-2 border-[#00a884] ring-2 ring-emerald-500/20">
                        <img
                          src={partnerAvatar}
                          alt={partnerName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      {hasUnreadStatus && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#25d366] rounded-full border-2 border-[#111b21] animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#00a884] transition-colors truncate">
                        {partnerName}'s Stories
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        {hasUnreadStatus ? '✨ New romantic story update available!' : 'View couple memories & photos'}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#00a884] text-white shrink-0 group-hover:scale-105 transition-transform"
                    >
                      View
                    </button>
                  </div>
                </div>

                {/* Live Couple Mood Ring & Atmosphere Widget */}
                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-[#202c33]/70 border-[#222e35]' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Live Couple Mood Ring</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                      Live Synced
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-3">
                    Tap to set how you're feeling right now:
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: 'Deeply in Love', icon: '💖', val: 'Deeply in love with you 💖' },
                      { label: 'Missing You', icon: '🥰', val: 'Missing you so much 🥰' },
                      { label: 'Cozy & Warm', icon: '☕', val: 'Cozy & relaxed ☕' },
                      { label: 'Needs Hugs', icon: '🫂', val: 'Need cuddles right now 🫂' },
                      { label: 'Playful Vibe', icon: '⚡', val: 'Full of energy & playful ⚡' },
                      { label: 'Sleepy / Dreamy', icon: '😴', val: 'Drifting off to sleep 😴' },
                      { label: 'Movie Time', icon: '🍿', val: 'Ready for movie watchparty 🍿' },
                      { label: 'At Work / Busy', icon: '💼', val: 'Working, but thinking of you 💼' },
                    ].map((mood, idx) => {
                      const isSelected = userMood === mood.val;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onUpdateMood && onUpdateMood(mood.val)}
                          className={`p-2 rounded-xl text-left border flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#00a884]/20 border-[#00a884] text-[#00a884] font-bold shadow-xs scale-102'
                              : isDark
                              ? 'bg-[#111b21] border-[#222e35] text-slate-300 hover:bg-[#233138]'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-base shrink-0">{mood.icon}</span>
                          <span className="truncate text-[11px] font-medium">{mood.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Days Together Milestone Badge */}
                {daysTogether && (
                  <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                    isDark ? 'bg-gradient-to-r from-rose-950/30 via-[#202c33] to-purple-950/30 border-rose-500/30' : 'bg-gradient-to-r from-rose-50 via-white to-purple-50 border-rose-200'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black shadow-xs">
                        <Heart className="w-5 h-5 fill-white" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          Together {daysTogether} Days
                        </h5>
                        <p className="text-[11px] text-slate-400">
                          {anniversaryDate ? `Anniversary: ${anniversaryDate}` : 'Every day is a milestone'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenPolaroidVault}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
                    >
                      Vault
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: COUPLE GAMES ARCADE */}
            {activeTab === 'games' && (
              <div className="p-3 space-y-2">
                <p className="text-xs text-slate-400 px-1 mb-1">
                  Play interactive games together across devices:
                </p>

                {[
                  { name: 'Connect Hearts 4-in-a-Row', desc: 'Turn-based connection match in real-time', icon: Heart, action: () => onOpenGamesLounge(), color: 'bg-rose-500', badge: 'Popular' },
                  { name: 'Sanctuary Chess Master', desc: 'Full chess board duel with clocks & live moves', icon: Swords, action: onOpenChess, color: 'bg-indigo-600', badge: 'Strategy' },
                  { name: 'Couple Draughts (Checkers)', desc: 'Jump, crown kings & capture diagonal pieces', icon: Dices, action: onOpenDraughts || onOpenGamesLounge, color: 'bg-amber-600', badge: 'PvP' },
                  { name: 'Ludo Royale Duo', desc: 'Roll dice & race your hearts to home sanctuary', icon: Gamepad2, action: onOpenLudo || onOpenGamesLounge, color: 'bg-teal-500', badge: 'Live' },
                  { name: 'Sweet Candy Crush Match-3', desc: 'Swap romantic hearts & delicious candy combos', icon: Flame, action: onOpenCandyCrush || onOpenGamesLounge, color: 'bg-orange-500', badge: 'Arcade' },
                  { name: 'Secret Scratch Cards', desc: 'Scratch to reveal romantic coupons & surprises', icon: Sparkles, action: onOpenScratchCard || onOpenGamesLounge, color: 'bg-yellow-500', badge: 'Surprise' },
                  { name: 'Blind Dilemma Game', desc: 'Hilarious couple scenarios with matching choices', icon: HelpCircle, action: onOpenBlindDilemma || onOpenGamesLounge, color: 'bg-fuchsia-600', badge: 'Quiz' },
                  { name: 'Touch Melt Resonance', desc: 'Touch screens simultaneously to melt the heart', icon: Zap, action: onOpenTouchMelt || onOpenTouchPulse, color: 'bg-pink-600', badge: 'Haptic' },
                  { name: 'Living Couple Bonsai Tree', desc: 'Nurture your shared digital bonsai together', icon: Sprout, action: onOpenSharedBonsai || onOpenAllFeatures, color: 'bg-emerald-600', badge: 'Growth' },
                ].map((game, i) => {
                  const Icon = game.icon;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        game.action();
                        setMobileScreen('chat');
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 group hover:scale-[1.01] ${
                        isDark ? 'bg-[#202c33] border-[#222e35] hover:bg-[#233138] hover:border-emerald-500/40' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-emerald-300'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl ${game.color} text-white flex items-center justify-center shrink-0 shadow-sm group-hover:rotate-3 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-sm font-bold truncate">{game.name}</h4>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full font-semibold shrink-0">
                            {game.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{game.desc}</p>
                      </div>
                      <button
                        type="button"
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#00a884] text-white hover:bg-[#008f6f] shrink-0"
                      >
                        Play
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 5: CALLS (WhatsApp Voice & Video Calls) */}
            {activeTab === 'calls' && (
              <div className="p-3 space-y-3">
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isDark ? 'bg-[#202c33] border-[#222e35]' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <img
                      src={partnerAvatar}
                      alt={partnerName}
                      className="w-12 h-12 rounded-full object-cover border border-emerald-500"
                    />
                    <div>
                      <h4 className="text-sm font-bold">{partnerName}</h4>
                      <p className="text-xs text-slate-400">
                        {isPartnerOnline ? 'Online now' : 'Offline / Waiting'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onStartAudioCall}
                      className="p-2.5 rounded-full bg-emerald-500/20 text-[#00a884] hover:bg-emerald-500/30 transition-colors"
                      title="Audio Call"
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={onStartVideoCall}
                      className="p-2.5 rounded-full bg-emerald-500/20 text-[#00a884] hover:bg-emerald-500/30 transition-colors"
                      title="Video Call"
                    >
                      <Video className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div
                  onClick={onOpenDiagnostics}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between ${
                    isDark ? 'bg-[#202c33] border-[#222e35]' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-5 h-5 text-teal-400" />
                    <div>
                      <h5 className="text-xs font-bold">Network & Call Diagnostics</h5>
                      <p className="text-[11px] text-slate-400">Test WebRTC latency & microphone</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            )}

            {/* TAB: DEDICATED WATCH PARTY & CINEMA LOUNGE */}
            {activeTab === 'watchparty' && (
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                {/* Hero Cinema Card */}
                <div className={`p-4 sm:p-5 rounded-2xl border relative overflow-hidden ${
                  isDark
                    ? 'bg-gradient-to-br from-purple-950/50 via-[#202c33] to-[#111b21] border-purple-500/30'
                    : 'bg-gradient-to-br from-purple-50 via-white to-pink-50 border-purple-200 shadow-xs'
                }`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                      <Tv className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      Live Synced 🍿
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black tracking-tight mb-1 text-slate-900 dark:text-white">
                    Movie Watch Party & Cinema
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    Stream synchronized movies, YouTube videos, series & clips in real-time with {partnerName || 'partner'}. Play/pause and seeking stay locked together.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenWatchTogether();
                      setMobileScreen('chat');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Launch Watch Party Room</span>
                  </button>
                </div>

                {/* Quick Stream Categories & Presets */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                    Watch Party Channels
                  </p>

                  {[
                    {
                      title: 'YouTube Direct Sync',
                      desc: 'Search & play any YouTube video, clip or trailer directly in sync',
                      badge: 'YouTube',
                      color: 'bg-red-500 text-white',
                      icon: Film,
                    },
                    {
                      title: 'Viduki Cinema Stream',
                      desc: 'Stream full movies & trending series with synchronized subtitles',
                      badge: 'Movies',
                      color: 'bg-purple-600 text-white',
                      icon: Tv,
                    },
                    {
                      title: 'Romantic Date Night',
                      desc: 'Curated romantic films, comedies & cozy streaming picks',
                      badge: 'Romance',
                      color: 'bg-rose-500 text-white',
                      icon: Heart,
                    },
                    {
                      title: 'Lofi & Ambient Cinema',
                      desc: 'Relaxing ambient backgrounds with synchronized chillhop & visuals',
                      badge: 'Cozy',
                      color: 'bg-indigo-500 text-white',
                      icon: Music,
                    },
                    {
                      title: 'Custom Stream / MP4 URL',
                      desc: 'Paste custom direct video link or livestream URL for both to watch',
                      badge: 'Direct URL',
                      color: 'bg-teal-600 text-white',
                      icon: Video,
                    },
                  ].map((stream, idx) => {
                    const StreamIcon = stream.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          onOpenWatchTogether();
                          setMobileScreen('chat');
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 group hover:scale-[1.01] ${
                          isDark
                            ? 'bg-[#202c33] border-[#222e35] hover:border-purple-500/40 hover:bg-[#25323a]'
                            : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/30'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl ${stream.color} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                          <StreamIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="text-xs sm:text-sm font-bold truncate text-slate-800 dark:text-slate-200">
                              {stream.title}
                            </h4>
                            <span className="text-[10px] text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-full font-semibold shrink-0">
                              {stream.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {stream.desc}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-600 text-white group-hover:bg-purple-500 shrink-0"
                        >
                          Open
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 6: MEDIA & MUSIC LOUNGE */}
            {activeTab === 'media' && (
              <div className="p-3 space-y-3">
                <div
                  onClick={onOpenMusicLounge}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 ${
                    isDark ? 'bg-[#202c33] border-[#222e35]' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Music className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold">Synced Music Lounge</h4>
                    <p className="text-xs text-slate-400 truncate">
                      {isMusicPlaying ? `Playing: ${currentMusicTitle || 'Music'}` : 'Listen to playlists & lo-fi together'}
                    </p>
                  </div>
                  <button type="button" className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#00a884] text-white">
                    Listen
                  </button>
                </div>

                <div
                  onClick={onOpenWatchTogether}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 ${
                    isDark ? 'bg-[#202c33] border-[#222e35]' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <Tv className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold">Movie Watchparty (Viduki)</h4>
                    <p className="text-xs text-slate-400 truncate">
                      Synchronized movies & YouTube stream
                    </p>
                  </div>
                  <button type="button" className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#00a884] text-white">
                    Watch
                  </button>
                </div>
              </div>
            )}

          </div>
        </section>
      )}

      {/* =========================================================================
          3. MAIN CHAT & FEATURE WORKSPACE (Center/Right Area)
             - Fits all screen sizes: desktop, tablet, and full mobile chat view
          ========================================================================= */}
      <main
        className={`flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden relative ${
          // On mobile: show chat when mobileScreen === 'chat', hide when mobileScreen === 'list'
          mobileScreen === 'chat' ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* WhatsApp Top Chat Header Bar */}
        {!isChatFullscreen && (
          <header className={`h-16 min-h-[64px] px-3 sm:px-4 shrink-0 flex items-center justify-between border-b z-20 transition-colors ${
            isDark
              ? 'bg-[#202c33] border-[#222e35] text-[#e9edef]'
              : 'bg-[#f0f2f5] border-[#d1d7db] text-[#111b21]'
          }`}>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Mobile Back Button: returns to WhatsApp chats/features list */}
              <button
                type="button"
                onClick={() => setMobileScreen('list')}
                className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
                title="Back to WhatsApp list"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Tablet Sidebar Toggle */}
              <button
                type="button"
                onClick={() => setIsTabletSidebarOpen(!isTabletSidebarOpen)}
                className="hidden md:flex lg:hidden p-1.5 -ml-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title={isTabletSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Partner Avatar with Status Ring */}
              <div
                onClick={() => setIsContactInfoOpen((prev) => !prev)}
                className="relative shrink-0 cursor-pointer hover:opacity-90"
                title="View partner profile & sanctuary info"
              >
                <div className="shrink-0">
                  <SafeAvatar
                    src={partner ? partner.avatar : partnerAvatar}
                    name={partner ? partner.name : partnerName}
                    className="w-10 h-10 border-2 border-emerald-500/80 shadow-xs"
                  />
                </div>
                {isPartnerOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#25d366] border-2 border-[#202c33]" />
                )}
              </div>

              {/* Partner Name & Live Status Subtitle */}
              <div
                onClick={() => setIsContactInfoOpen((prev) => !prev)}
                className="min-w-0 cursor-pointer group"
                title="View contact info"
              >
                <h3 className="text-sm sm:text-base font-bold truncate flex items-center gap-1.5 group-hover:text-[#00a884] transition-colors">
                  <span>{spaceType === 'friends' ? (groupName || 'Squad Space') : (partner ? partner.name : partnerName)}</span>
                  {isVerified && (
                    <span className="text-[#00a884] text-xs font-bold" title="Verified Sanctuary">
                      ✓
                    </span>
                  )}
                </h3>
                <p className="text-[11px] truncate text-slate-400">
                  {isPartnerTyping ? (
                    <span className="text-[#25d366] font-semibold animate-pulse">
                      typing...
                    </span>
                  ) : isPartnerOnline ? (
                    <span className="text-[#25d366] font-medium">online</span>
                  ) : (
                    <span>last seen recently</span>
                  )}
                </p>
              </div>
            </div>

            {/* Right Chat Action Buttons (Calls, Watch Party, All Features, Search, Info, More Menu) */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Watch Party Quick Launcher Button */}
              {onOpenWatchTogether && (
                <button
                  type="button"
                  id="chat-header-btn-watchparty"
                  onClick={onOpenWatchTogether}
                  className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer group shadow-xs hover:scale-105 active:scale-95"
                  title="Watch Party: Stream movies & YouTube together in sync"
                >
                  <Tv className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline font-bold">Watch Party</span>
                </button>
              )}

              {/* Video Call */}
              <button
                type="button"
                onClick={onStartVideoCall}
                className="p-2 sm:p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Start Video Call"
              >
                <Video className="w-5 h-5 text-emerald-500" />
              </button>

              {/* Voice Call */}
              <button
                type="button"
                onClick={onStartAudioCall}
                className="p-2 sm:p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Start Audio Call"
              >
                <Phone className="w-5 h-5 text-emerald-500" />
              </button>

              {/* Search in Chat Button */}
              <button
                type="button"
                id="chat-header-btn-search"
                onClick={() => setIsChatSearchOpen((prev) => !prev)}
                className={`p-2 sm:p-2.5 rounded-full transition-colors cursor-pointer ${
                  isChatSearchOpen
                    ? 'bg-emerald-500/20 text-[#00a884]'
                    : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-white'
                }`}
                title="Search Messages in Conversation"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* All Features Catalog Launcher */}
              <button
                type="button"
                onClick={onOpenAllFeatures}
                className="p-2 sm:p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Launch Any of 21+ Features"
              >
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </button>

              {/* Header More Features Dropdown Menu */}
              <div className="relative">
                <button
                  type="button"
                  id="chat-header-btn-more"
                  onClick={() => setShowChatMoreFeatures((prev) => !prev)}
                  className="p-2 sm:p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="More actions and features"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {showChatMoreFeatures && (
                  <div className={`absolute right-0 top-11 w-64 rounded-2xl shadow-2xl py-2 z-50 border text-xs font-medium animate-in fade-in zoom-in-95 duration-150 ${
                    isDark
                      ? 'bg-[#233138] border-[#222e35] text-[#d1d7db]'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    {/* Send Love Ping / Buzz */}
                    {onTriggerLoveBuzz && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowChatMoreFeatures(false);
                          onTriggerLoveBuzz();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 cursor-pointer text-rose-400"
                      >
                        <Zap className="w-4 h-4 text-amber-400" /> Send Instant Love Buzz
                      </button>
                    )}

                    {/* Contact / Space Profile Info */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowChatMoreFeatures(false);
                        setIsContactInfoOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 cursor-pointer"
                    >
                      <Info className="w-4 h-4 text-emerald-500" /> View Contact / Space Info
                    </button>

                    {/* Toggle Upper Features Ribbon */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickFeaturesVisible((prev) => !prev);
                        setShowChatMoreFeatures(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span>{isQuickFeaturesVisible ? 'Hide Upper Features Ribbon' : 'Show Upper Features Ribbon'}</span>
                    </button>

                    {/* Spotify Music Lounge */}
                    {onOpenMusicLounge && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowChatMoreFeatures(false);
                          onOpenMusicLounge();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 cursor-pointer"
                      >
                        <Music className="w-4 h-4 text-emerald-400" /> Synced Spotify Lounge
                      </button>
                    )}

                    {/* Live Love Canvas */}
                    {onOpenCanvas && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowChatMoreFeatures(false);
                          onOpenCanvas();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 cursor-pointer"
                      >
                        <Palette className="w-4 h-4 text-rose-400" /> Live Love Canvas
                      </button>
                    )}

                    {/* Couple & Squad Games */}
                    {onOpenGamesLounge && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowChatMoreFeatures(false);
                          onOpenGamesLounge();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 cursor-pointer"
                      >
                        <Gamepad2 className="w-4 h-4 text-amber-400" /> Games Lounge (Chess, Ludo)
                      </button>
                    )}

                    {/* Secret Vault */}
                    {onOpenPolaroidVault && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowChatMoreFeatures(false);
                          onOpenPolaroidVault();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-pink-400" /> Polaroid Secret Vault
                      </button>
                    )}

                    {/* All 21+ Features Hub Modal */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowChatMoreFeatures(false);
                        onOpenAllFeatures();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 cursor-pointer font-bold text-[#00a884] border-t border-slate-200 dark:border-slate-700/60 mt-1"
                    >
                      <Grid className="w-4 h-4" /> All 21+ Features Hub
                    </button>

                    {/* Fullscreen toggle */}
                    {onToggleChatFullscreen && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowChatMoreFeatures(false);
                          onToggleChatFullscreen();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 cursor-pointer border-t border-slate-200 dark:border-slate-700/60"
                      >
                        {isChatFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        <span>{isChatFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
                      </button>
                    )}

                    {/* Friends Group or Friend Chat: Leave / Delete Options */}
                    {spaceType === 'friends' && (
                      <div className="border-t border-slate-200 dark:border-slate-700/60 pt-1 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowChatMoreFeatures(false);
                            setGroupActionModal({
                              type: 'leave',
                              roomId: activeRoomId || '',
                              targetName: groupName || partnerName || 'Squad Group',
                              isGroup: !!groupName || groupEmoji !== '👤',
                            });
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-rose-500/10 text-rose-500 flex items-center gap-3 cursor-pointer font-medium"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Leave Group Permanently</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowChatMoreFeatures(false);
                            setGroupActionModal({
                              type: 'delete',
                              roomId: activeRoomId || '',
                              targetName: groupName || partnerName || 'Squad Group',
                              isGroup: !!groupName || groupEmoji !== '👤',
                            });
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-red-600/10 text-red-600 flex items-center gap-3 cursor-pointer font-medium"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                          <span>{groupName || groupEmoji !== '👤' ? 'Delete Group' : 'Delete Chat'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Upper Workspace Quick Features Ribbon (Prominently visible features at the top of chat) */}
        {isQuickFeaturesVisible && !isChatFullscreen && (
          <div className={`px-2.5 sm:px-4 py-1.5 border-b flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 z-10 transition-colors shadow-2xs ${
            isDark ? 'bg-[#182229] border-[#222e35]' : 'bg-[#f7f8fa] border-[#e9edef]'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#00a884]" />
              <span className="hidden sm:inline">Features:</span>
            </span>

            {/* Watch Party & Cinema */}
            {onOpenWatchTogether && (
              <button
                type="button"
                onClick={onOpenWatchTogether}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 border border-purple-500/30 shrink-0 transition cursor-pointer"
                title="Stream movies & YouTube videos together"
              >
                <Tv className="w-3.5 h-3.5 text-purple-400" />
                <span>Watch Party</span>
              </button>
            )}

            {/* Spotify Synced Music Lounge */}
            {onOpenMusicLounge && (
              <button
                type="button"
                onClick={onOpenMusicLounge}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-[#00a884] border border-emerald-500/30 shrink-0 transition cursor-pointer"
                title="Listen to music & DJ together"
              >
                <Music className="w-3.5 h-3.5 text-emerald-400" />
                <span>Music Lounge</span>
              </button>
            )}



            {/* Live Love Canvas */}
            {onOpenCanvas && (
              <button
                type="button"
                onClick={onOpenCanvas}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 shrink-0 transition cursor-pointer"
                title="Real-time drawing & touch canvas"
              >
                <Palette className="w-3.5 h-3.5 text-rose-400" />
                <span>Love Canvas</span>
              </button>
            )}

            {/* Games Lounge (Chess, Ludo, Connect Hearts) */}
            {onOpenGamesLounge && (
              <button
                type="button"
                onClick={onOpenGamesLounge}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 shrink-0 transition cursor-pointer"
                title="Play Chess, Ludo, Candy and Connect Hearts"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Games</span>
              </button>
            )}

            {/* Polaroid Secret Vault */}
            {onOpenPolaroidVault && (
              <button
                type="button"
                onClick={onOpenPolaroidVault}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-500/15 hover:bg-pink-500/25 text-pink-400 border border-pink-500/30 shrink-0 transition cursor-pointer"
                title="Encrypted photo safe & polaroid memories"
              >
                <Camera className="w-3.5 h-3.5 text-pink-400" />
                <span>Secret Vault</span>
              </button>
            )}

            {/* Touch Pulse */}
            {onOpenTouchPulse && (
              <button
                type="button"
                onClick={onOpenTouchPulse}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 shrink-0 transition cursor-pointer"
                title="Instant haptic touch pulse & heartbeat"
              >
                <Zap className="w-3.5 h-3.5 text-red-400" />
                <span>Touch Pulse</span>
              </button>
            )}

            {/* Shared Bonsai Tree */}
            {onOpenSharedBonsai && (
              <button
                type="button"
                onClick={onOpenSharedBonsai}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/30 shrink-0 transition cursor-pointer"
                title="Nurture your shared bonsai plant together"
              >
                <Sprout className="w-3.5 h-3.5 text-green-400" />
                <span>Bonsai</span>
              </button>
            )}

            {/* Sleep Sanctuary */}
            {onOpenSleepSanctuary && (
              <button
                type="button"
                onClick={onOpenSleepSanctuary}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/30 shrink-0 transition cursor-pointer"
                title="Ambient white noise & sleep together"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sleep Sanctuary</span>
              </button>
            )}

            {/* Long Distance Horizon Bridge */}
            {onOpenHorizon && (
              <button
                type="button"
                onClick={onOpenHorizon}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 shrink-0 transition cursor-pointer"
                title="Distance bridge & partner timezones"
              >
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                <span>Distance Bridge</span>
              </button>
            )}

            {/* Care Tracker */}
            {onOpenCareTracker && (
              <button
                type="button"
                onClick={onOpenCareTracker}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 border border-teal-500/30 shrink-0 transition cursor-pointer"
                title="Mutual care, water, medicine & check-ins"
              >
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                <span>Care Tracker</span>
              </button>
            )}

            {/* Time Capsule */}
            {onOpenTimeCapsule && (
              <button
                type="button"
                onClick={onOpenTimeCapsule}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/30 shrink-0 transition cursor-pointer"
                title="Lock future letters and photos"
              >
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span>Time Capsule</span>
              </button>
            )}

            {/* Daily Spark */}
            {onOpenDailySpark && (
              <button
                type="button"
                onClick={onOpenDailySpark}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-400 border border-yellow-500/30 shrink-0 transition cursor-pointer"
                title="Daily spark connection questions"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>Daily Spark</span>
              </button>
            )}

            {/* Bucket List */}
            {onOpenBucketList && (
              <button
                type="button"
                onClick={onOpenBucketList}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 shrink-0 transition cursor-pointer"
                title="Shared adventures & bucket list"
              >
                <Gift className="w-3.5 h-3.5 text-cyan-400" />
                <span>Bucket List</span>
              </button>
            )}

            {/* Soundboard */}
            {onOpenSoundboard && (
              <button
                type="button"
                onClick={onOpenSoundboard}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/15 hover:bg-violet-500/25 text-violet-400 border border-violet-500/30 shrink-0 transition cursor-pointer"
                title="Real-time synchronized funny soundboard"
              >
                <Volume2 className="w-3.5 h-3.5 text-violet-400" />
                <span>Soundboard</span>
              </button>
            )}

            {/* All Features Catalog Modal */}
            <button
              type="button"
              onClick={onOpenAllFeatures}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#00a884] text-white hover:bg-[#009170] shrink-0 transition shadow-xs cursor-pointer"
              title="Open catalog with all 21+ features"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>All 21+ Features</span>
            </button>
          </div>
        )}

        {/* In-Chat Message Search Drawer */}
        {isChatSearchOpen && (
          <div className={`px-3 sm:px-4 py-2 border-b flex items-center justify-between gap-3 shrink-0 animate-fade-in ${
            isDark ? 'bg-[#111b21] border-[#222e35]' : 'bg-[#ffffff] border-[#e9edef]'
          }`}>
            <div className={`flex items-center gap-2 flex-1 px-3 py-1.5 rounded-lg ${
              isDark ? 'bg-[#202c33]' : 'bg-[#f0f2f5]'
            }`}>
              <Search className="w-4 h-4 text-emerald-500 shrink-0" />
              <input
                type="text"
                autoFocus
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                placeholder="Search messages in conversation..."
                className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-slate-400"
              />
              {chatSearchQuery && (
                <button
                  type="button"
                  onClick={() => setChatSearchQuery('')}
                  className="text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 shrink-0">
              {chatSearchQuery ? (
                <span className="text-[#00a884]">
                  {matchingChatMessages.length} {matchingChatMessages.length === 1 ? 'match' : 'matches'}
                </span>
              ) : (
                <span>Type to search</span>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsChatSearchOpen(false);
                  setChatSearchQuery('');
                }}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                title="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* The Chat Workspace Child Component */}
        <div className="flex-1 flex flex-col w-full h-full min-h-0 overflow-hidden relative">
          {children}
        </div>
      </main>

      {/* =========================================================================
          4. WHATSAPP CONTACT / PARTNER SANCTUARY INFO DRAWER (Right Pane)
             - Desktop/Laptop: side-by-side right column (w-[380px] - w-[410px])
             - Mobile: full-screen overlay with back button
          ========================================================================= */}
      {isContactInfoOpen && (
        <aside
          id="whatsapp-contact-info-panel"
          className={`flex flex-col shrink-0 border-l z-30 transition-all duration-300 overflow-y-auto ${
            isDark ? 'bg-[#111b21] border-[#222e35] text-[#e9edef]' : 'bg-[#f0f2f5] border-[#d1d7db] text-[#111b21]'
          } ${
            // Desktop & Laptop: right pane
            'lg:w-[380px] xl:w-[410px] lg:flex ' +
            // Mobile & Tablet: full screen or sliding overlay
            'fixed inset-0 lg:static'
          }`}
        >
          {/* Contact Info Header */}
          <header className={`px-4 py-3 flex items-center justify-between shrink-0 border-b sticky top-0 z-10 ${
            isDark ? 'bg-[#202c33] border-[#222e35]' : 'bg-[#ffffff] border-[#e9edef]'
          }`}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsContactInfoOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                title="Close Contact Info"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-bold text-base">Contact info</h3>
            </div>
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              title="Sanctuary Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </header>

          {/* Profile Avatar & Hero */}
          <div className={`p-6 flex flex-col items-center text-center border-b ${
            isDark ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-[#e9edef]'
          }`}>
            <div className="relative mb-3.5 group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/80 shadow-lg">
                <img
                  src={partner ? partner.avatar : partnerAvatar}
                  alt={partner ? partner.name : partnerName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              {isPartnerOnline && (
                <span className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-[#25d366] border-3 border-[#111b21] shadow-md animate-pulse" />
              )}
            </div>

            <h2 className="text-xl font-black flex items-center gap-1.5 mb-0.5">
              <span>{spaceType === 'friends' ? (groupName || 'Squad Space') : (partner ? partner.name : partnerName)}</span>
              {isVerified && (
                <span className="text-[#00a884] text-sm" title="Verified Haven Sanctuary">✓</span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mb-3">
              {isPartnerOnline ? (
                <span className="text-[#25d366] font-semibold">Online now in Haven</span>
              ) : (
                <span>Last active recently</span>
              )}
            </p>

            {/* Quick Action Shortcuts */}
            <div className="flex items-center justify-center gap-2.5 w-full mt-1">
              <button
                type="button"
                onClick={onStartAudioCall}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-[#202c33] transition cursor-pointer flex-1"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-[#00a884] flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold">Audio</span>
              </button>

              <button
                type="button"
                onClick={onStartVideoCall}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-[#202c33] transition cursor-pointer flex-1"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-[#00a884] flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold">Video</span>
              </button>

              <button
                type="button"
                onClick={onOpenWatchTogether}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-[#202c33] transition cursor-pointer flex-1"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center">
                  <Tv className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold">Watch</span>
              </button>

              <button
                type="button"
                onClick={onOpenGamesLounge}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-[#202c33] transition cursor-pointer flex-1"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold">Games</span>
              </button>
            </div>
          </div>

          {/* About / Sanctuary Status */}
          <div className={`p-4 border-b ${
            isDark ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-[#e9edef]'
          }`}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">About & Sanctuary Mood</h4>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {userMood || 'Connected with you 💕'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Haven Sanctuary • Encrypted Space
            </p>
          </div>

          {/* Media, Links and Docs */}
          <div className={`p-4 border-b ${
            isDark ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-[#e9edef]'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Media, links and docs
              </h4>
              <button
                type="button"
                onClick={onOpenPolaroidVault}
                className="text-xs font-bold text-[#00a884] hover:underline cursor-pointer"
              >
                View all ({recentSharedMedia.length})
              </button>
            </div>

            {recentSharedMedia.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {recentSharedMedia.map((m, idx) => (
                  <div
                    key={idx}
                    onClick={onOpenPolaroidVault}
                    className="aspect-square rounded-xl overflow-hidden bg-slate-800 border border-slate-700/60 cursor-pointer hover:opacity-90 transition"
                  >
                    <img
                      src={m.mediaUrl || m.content}
                      alt="Media"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={onOpenPolaroidVault}
                className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                <Camera className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                <p className="text-xs text-slate-400">Share memories & photos in Polaroid Vault</p>
              </div>
            )}
          </div>

          {/* Security & Encryption Verification */}
          <div
            onClick={onOpenSecurity}
            className={`p-4 border-b flex items-start gap-3.5 cursor-pointer transition-colors ${
              isDark ? 'bg-[#111b21] border-[#222e35] hover:bg-[#202c33]' : 'bg-white border-[#e9edef] hover:bg-slate-50'
            }`}
          >
            <Lock className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Encryption & Safety Shield
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                Messages and calls are end-to-end encrypted. Tap to verify security QR code & safety numbers.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
          </div>

          {/* Wallpaper & Chat Customization */}
          <div
            onClick={onOpenWallpaperPicker}
            className={`p-4 border-b flex items-center justify-between cursor-pointer transition-colors ${
              isDark ? 'bg-[#111b21] border-[#222e35] hover:bg-[#202c33]' : 'bg-white border-[#e9edef] hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-pink-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Wallpaper & Atmosphere Theme
                </h4>
                <p className="text-xs text-slate-400">Customize WhatsApp background & accents</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {/* Sanctuary Features & Games Launcher */}
          <div
            onClick={onOpenAllFeatures}
            className={`p-4 border-b flex items-center justify-between cursor-pointer transition-colors ${
              isDark ? 'bg-[#111b21] border-[#222e35] hover:bg-[#202c33]' : 'bg-white border-[#e9edef] hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  All 21+ Couple Features
                </h4>
                <p className="text-xs text-slate-400">Bonsai, Canvas, Time Capsule & Radar</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {/* QR Pairing / Partner Link */}
          <div
            onClick={onOpenQRPairing || onInviteSpouse}
            className={`p-4 border-b flex items-center justify-between cursor-pointer transition-colors ${
              isDark ? 'bg-[#111b21] border-[#222e35] hover:bg-[#202c33]' : 'bg-white border-[#e9edef] hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <QrCode className="w-5 h-5 text-[#00a884] shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Pairing QR Code & Space Key
                </h4>
                <p className="text-xs text-slate-400">Share secure invite code or scan QR</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {/* Group Participants (for Friends Space / Group) */}
          {spaceType === 'friends' && (
            <div className={`p-4 border-b ${
              isDark ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-[#e9edef]'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Group Participants</span>
                </h4>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400">
                  {roomMembers.length > 0 ? roomMembers.length + 1 : '3'} members
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentUserAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt="You"
                      className="w-8 h-8 rounded-full object-cover border border-emerald-500/50"
                    />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                        <span>{currentUserName || 'You'}</span>
                        <span className="text-[10px] text-emerald-500 font-semibold">(You)</span>
                      </p>
                      <p className="text-[10px] text-slate-400">Member • Online</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#00a884] font-bold">Admin</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
                      alt="Maya"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">Maya Lin</p>
                      <p className="text-[10px] text-slate-400">Squad Member</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                      alt="Omar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">Omar Vance</p>
                      <p className="text-[10px] text-slate-400">Squad Member</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Group & Chat Danger Zone Actions */}
          {spaceType === 'friends' && (
            <div className={`p-4 border-b space-y-2.5 ${
              isDark ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-[#e9edef]'
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Group & Chat Management</span>
              </h4>

              {/* Leave Group Permanently */}
              <button
                type="button"
                onClick={() => {
                  setGroupActionModal({
                    type: 'leave',
                    roomId: activeRoomId || '',
                    targetName: groupName || partnerName || 'Squad Group',
                    isGroup: !!groupName || groupEmoji !== '👤',
                  });
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/25 transition cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <LogOut className="w-4 h-4 shrink-0" />
                  <div>
                    <p className="font-bold">Leave Group Permanently</p>
                    <p className="text-[10px] opacity-80">Remove yourself from members list</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>

              {/* Delete Group or Friend Chat */}
              <button
                type="button"
                onClick={() => {
                  setGroupActionModal({
                    type: 'delete',
                    roomId: activeRoomId || '',
                    targetName: groupName || partnerName || 'Squad Group',
                    isGroup: !!groupName || groupEmoji !== '👤',
                  });
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-red-600/15 hover:bg-red-600/25 text-red-600 dark:text-red-400 border border-red-500/30 transition cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <div>
                    <p className="font-bold">{groupName || groupEmoji !== '👤' ? 'Delete Group for Everyone' : 'Delete Friend Chat'}</p>
                    <p className="text-[10px] opacity-80">Permanently erase chat history & room</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          )}
        </aside>
      )}

      {/* =========================================================================
          5. WHATSAPP NEW CHAT & ADD FRIEND MODAL (All-In-One Unified Space)
          ========================================================================= */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90dvh] ${
            isDark ? 'bg-[#202c33] border-[#222e35] text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className={`px-5 py-4 flex items-center justify-between shrink-0 border-b ${
              isDark ? 'bg-[#111b21] border-[#222e35]' : 'bg-[#008069] text-white border-[#008069]'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-[#00a884] dark:text-emerald-400 flex items-center justify-center">
                  <MessageSquarePlus className="w-5 h-5 text-current" />
                </div>
                <div>
                  <h3 className="font-bold text-base">New WhatsApp Chat</h3>
                  <p className="text-[11px] opacity-80">Chat with friends & spouse in one space</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewChatOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer text-slate-400 hover:text-white"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Switcher */}
            <div className={`grid grid-cols-3 border-b text-xs font-bold shrink-0 ${
              isDark ? 'bg-[#182229] border-[#222e35]' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setNewChatTab('friend')}
                className={`py-3 text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  newChatTab === 'friend'
                    ? 'text-[#00a884] border-b-2 border-[#00a884] bg-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Friend</span>
              </button>
              <button
                type="button"
                onClick={() => setNewChatTab('group')}
                className={`py-3 text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  newChatTab === 'group'
                    ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>New Group</span>
              </button>
              <button
                type="button"
                onClick={() => setNewChatTab('spouse')}
                className={`py-3 text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  newChatTab === 'spouse'
                    ? 'text-rose-400 border-b-2 border-rose-500 bg-rose-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>Spouse</span>
              </button>
            </div>

            {/* Tab 1: Direct 1-on-1 Friend Chat */}
            {newChatTab === 'friend' && (
              <div className="p-5 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Friend's Name
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    placeholder="e.g. Maya, Alex, Jordan, David..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newFriendName.trim()) {
                        if (onAddNewFriendChat) {
                          onAddNewFriendChat(newFriendName.trim(), undefined, newFriendAvatar);
                          setIsNewChatOpen(false);
                          setNewFriendName('');
                          setMobileScreen('chat');
                        }
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition ${
                      isDark
                        ? 'bg-[#111b21] border-[#222e35] focus:border-[#00a884] text-white'
                        : 'bg-slate-50 border-slate-200 focus:border-[#00a884] text-slate-900'
                    }`}
                  />
                </div>

                {/* Avatar Picker for Friend */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Select Avatar
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {[
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
                    ].map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewFriendAvatar(av)}
                        className={`w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                          newFriendAvatar === av
                            ? 'border-[#00a884] scale-110 shadow-md ring-2 ring-[#00a884]/40'
                            : 'border-transparent hover:opacity-80'
                        }`}
                      >
                        <img src={av} alt="Avatar option" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Registered Members on Haven (Directory) */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Registered Members on Haven</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Online & Ready</span>
                  </label>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto no-scrollbar">
                    {(roomMembers && roomMembers.length > 0 ? roomMembers : [
                      { id: 'user-maya', name: 'Maya Vance', email: 'maya@haven.app', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: 'Online 💫' },
                      { id: 'user-alex', name: 'Alex Rivera', email: 'alex@haven.app', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', status: 'Listening to music 🎧' },
                      { id: 'user-jordan', name: 'Jordan Lee', email: 'jordan@haven.app', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', status: 'Watching movie 🍿' },
                      { id: 'user-david', name: 'David Kim', email: 'david@haven.app', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', status: 'Available ✨' },
                      { id: 'user-sam', name: 'Sam Taylor', email: 'sam@haven.app', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', status: 'Hanging out 🎉' },
                    ]).map((member) => (
                      <div
                        key={member.id || member.name}
                        onClick={() => {
                          if (onAddNewFriendChat) {
                            onAddNewFriendChat(member.name, member.email, member.avatar);
                            setIsNewChatOpen(false);
                            setMobileScreen('chat');
                          }
                        }}
                        className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition border ${
                          isDark ? 'bg-[#111b21]/70 border-[#222e35] hover:bg-[#111b21]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <SafeAvatar src={member.avatar} name={member.name} className="w-9 h-9" />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold truncate">{member.name}</h4>
                            <p className="text-[10px] text-slate-400 truncate">{member.email || member.status || 'Registered Member'}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[#00a884] shrink-0 bg-emerald-500/10 px-2 py-1 rounded-lg">
                          + Message
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  disabled={!newFriendName.trim()}
                  onClick={() => {
                    if (onAddNewFriendChat && newFriendName.trim()) {
                      onAddNewFriendChat(newFriendName.trim(), undefined, newFriendAvatar);
                      setIsNewChatOpen(false);
                      setNewFriendName('');
                      setMobileScreen('chat');
                    }
                  }}
                  className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                    newFriendName.trim()
                      ? 'bg-[#00a884] hover:bg-[#009170] text-white'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Start Chatting with Friend</span>
                </button>
              </div>
            )}

            {/* Tab 2: Create Friends Group / Squad */}
            {newChatTab === 'group' && (
              <div className="p-5 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Squad Group Name
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Best Friends Squad, Game Night Crew..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newGroupName.trim()) {
                        if (onCreateFriendsGroup) {
                          onCreateFriendsGroup(newGroupName.trim(), newGroupEmoji);
                          setIsNewChatOpen(false);
                          setNewGroupName('');
                          setMobileScreen('chat');
                        }
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition ${
                      isDark
                        ? 'bg-[#111b21] border-[#222e35] focus:border-indigo-500 text-white'
                        : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'
                    }`}
                  />
                </div>

                {/* Group Emoji Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Squad Emoji Icon
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {['🎉', '🎮', '🍕', '🚀', '🏕️', '🍿', '🔥', '💫', '🎧', '🎬'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setNewGroupEmoji(em)}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border-2 transition cursor-pointer ${
                          newGroupEmoji === em
                            ? 'border-indigo-500 bg-indigo-500/20 scale-110 shadow-md'
                            : 'border-transparent bg-slate-800/40 hover:bg-slate-800'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Group Features Preview */}
                <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                  isDark ? 'bg-[#111b21]/70 border-[#222e35] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <p className="font-bold text-indigo-400">✨ Squad Features Included:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400">
                    <li>Group video & voice calls with screen share</li>
                    <li>Synchronized movie watchparty (YouTube & Cinema)</li>
                    <li>Multiplayer chess, ludo, and trivia</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  disabled={!newGroupName.trim()}
                  onClick={() => {
                    if (onCreateFriendsGroup && newGroupName.trim()) {
                      onCreateFriendsGroup(newGroupName.trim(), newGroupEmoji);
                      setIsNewChatOpen(false);
                      setNewGroupName('');
                      setMobileScreen('chat');
                    }
                  }}
                  className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                    newGroupName.trim()
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Create Squad Group Chat</span>
                </button>
              </div>
            )}

            {/* Tab 3: Spouse Sanctuary Quick Switch */}
            {newChatTab === 'spouse' && (
              <div className="p-5 space-y-4 overflow-y-auto">
                <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                  isDark ? 'bg-rose-950/20 border-rose-900/40 text-slate-200' : 'bg-rose-50 border-rose-200 text-slate-800'
                }`}>
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-rose-500/70 shrink-0">
                    <img
                      src={partner ? partner.avatar : partnerAvatar}
                      alt={partner ? partner.name : partnerName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold truncate flex items-center gap-1.5">
                      <span>{partner ? partner.name : partnerName}</span>
                      <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded-full font-normal">
                        ❤️ Spouse
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 truncate">
                      {isPartnerOnline ? 'Online now • Connected' : 'End-to-end encrypted sanctuary'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Find spouse record in savedSpaces if any */}
                  {savedSpaces.find((s) => s.spaceType === 'couple') && (
                    <button
                      type="button"
                      onClick={() => {
                        const spouseSpace = savedSpaces.find((s) => s.spaceType === 'couple');
                        if (spouseSpace && onSwitchSpace) {
                          onSwitchSpace(spouseSpace);
                        }
                        setIsNewChatOpen(false);
                        setMobileScreen('chat');
                      }}
                      className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                    >
                      <Heart className="w-4 h-4 fill-white" />
                      <span>Switch to Spouse Chat Now</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsNewChatOpen(false);
                      onInviteSpouse();
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Invite / Pair with Spouse via QR</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          6. CONFIRM LEAVE / DELETE GROUP OR FRIEND CONVERSATION MODAL
          ========================================================================= */}
      {groupActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className={`w-full max-w-sm rounded-3xl border shadow-2xl p-6 animate-in zoom-in-95 duration-150 ${
            isDark ? 'bg-[#202c33] border-[#222e35] text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3.5 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                groupActionModal.type === 'leave'
                  ? 'bg-amber-500/15 text-amber-500'
                  : 'bg-red-500/15 text-red-500'
              }`}>
                {groupActionModal.type === 'leave' ? (
                  <LogOut className="w-6 h-6" />
                ) : (
                  <Trash2 className="w-6 h-6" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold truncate">
                  {groupActionModal.type === 'leave'
                    ? 'Leave Group?'
                    : groupActionModal.isGroup
                    ? 'Delete Group?'
                    : 'Delete Chat?'}
                </h3>
                <p className="text-xs text-slate-400 truncate font-medium">
                  {groupActionModal.targetName}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed mb-6">
              {groupActionModal.type === 'leave'
                ? `Are you sure you want to permanently remove yourself from "${groupActionModal.targetName}"? You will be removed from group participants and will no longer receive any messages, group calls, or activities.`
                : groupActionModal.isGroup
                ? `Are you sure you want to permanently delete "${groupActionModal.targetName}"? All chat history, shared media, voice notes, and games data will be wiped for everyone. This action cannot be undone.`
                : `Are you sure you want to permanently delete this conversation with "${groupActionModal.targetName}"? All chat history and cached media will be erased from this device.`}
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setGroupActionModal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                id="btn-confirm-group-action"
                onClick={() => {
                  const targetId = groupActionModal.roomId;
                  const isLeave = groupActionModal.type === 'leave';
                  setGroupActionModal(null);
                  setIsContactInfoOpen(false);

                  if (isLeave) {
                    if (onLeaveGroup) {
                      onLeaveGroup(targetId);
                    } else if (onDeleteGroup) {
                      onDeleteGroup(targetId);
                    }
                  } else {
                    if (onDeleteGroup) {
                      onDeleteGroup(targetId);
                    }
                  }
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition cursor-pointer flex items-center gap-1.5 ${
                  groupActionModal.type === 'leave'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {groupActionModal.type === 'leave' ? (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Leave Group</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete {groupActionModal.isGroup ? 'Group' : 'Chat'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}



    </div>
  );
};
