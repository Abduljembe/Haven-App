import React, { useState, useEffect } from 'react';
import {
  Heart,
  Mail,
  Send,
  Check,
  Copy,
  Share2,
  X,
  Users,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  UserCheck,
  Plus,
  Trash2,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { SpaceType, SpaceEmailInvite } from '../types';
import {
  inviteSpouseByEmail,
  lookupUserByEmail,
  getRoomInvites,
  cancelSpaceInvite,
} from '../utils/authService';

export interface InviteSpouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  passkey: string;
  spaceType?: SpaceType;
  spaceName?: string;
  senderName: string;
  senderEmail?: string;
  existingPartnerName?: string;
  hasExistingPartner?: boolean;
  pendingInvites?: SpaceEmailInvite[];
  onAcceptInvite?: (invite: SpaceEmailInvite) => void;
  onDeclineInvite?: (inviteId: string) => void;
}

export const InviteSpouseModal: React.FC<InviteSpouseModalProps> = ({
  isOpen,
  onClose,
  roomId,
  passkey,
  spaceType = 'couple' as SpaceType,
  spaceName,
  senderName,
  senderEmail,
  existingPartnerName,
  hasExistingPartner = false,
  pendingInvites = [],
  onAcceptInvite,
  onDeclineInvite,
}) => {
  const isFriends = spaceType === 'friends';
  const [modalTab, setModalTab] = useState<'send' | 'inbox'>('send');

  // State for single (spouse) or multi (friends) emails
  const [spouseEmail, setSpouseEmail] = useState('');
  const [friendsInput, setFriendsInput] = useState('');
  const [friendEmailList, setFriendEmailList] = useState<string[]>([]);

  // Existing active invite for couple space
  const [activeCoupleInvite, setActiveCoupleInvite] = useState<SpaceEmailInvite | null>(null);
  const [isLoadingExistingInvite, setIsLoadingExistingInvite] = useState(false);
  const [isRevokingInvite, setIsRevokingInvite] = useState(false);

  const [customMessage, setCustomMessage] = useState(
    isFriends
      ? `Hey! Come join our private Haven squad room for hangout, movies, games, and voice calls 🎉`
      : `Hey my love! Come join our private Haven sanctuary for our romantic movie nights, calls, and secret notes 💕`
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookupStatus, setLookupStatus] = useState<{
    checked: boolean;
    loading: boolean;
    registered: boolean;
    user?: { name: string; email: string; avatar?: string };
  }>({ checked: false, loading: false, registered: false });

  const [successInfo, setSuccessInfo] = useState<{
    inviteLink: string;
    message: string;
    count: number;
    invitedEmails: string[];
    registeredFriends?: { name: string; email: string }[];
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch active invite for couple space on modal open
  useEffect(() => {
    if (!isOpen || isFriends) return;

    let isMounted = true;
    setIsLoadingExistingInvite(true);
    getRoomInvites(roomId)
      .then((invites) => {
        if (isMounted && Array.isArray(invites) && invites.length > 0) {
          const active = invites.find((i) => i.status === 'pending' || i.status === 'accepted') || invites[0];
          setActiveCoupleInvite(active || null);
        } else if (isMounted) {
          setActiveCoupleInvite(null);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingExistingInvite(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, roomId, isFriends]);

  // Debounced lookup of spouse email or partner name when in couple space
  useEffect(() => {
    if (isFriends) return;

    const trimmed = spouseEmail.trim().toLowerCase();
    if (!trimmed || trimmed.length < 2) {
      setLookupStatus({ checked: false, loading: false, registered: false });
      return;
    }

    setLookupStatus((prev) => ({ ...prev, loading: true }));
    const timer = setTimeout(async () => {
      try {
        const res = await lookupUserByEmail(trimmed);
        if (res.exists && res.user) {
          setLookupStatus({
            checked: true,
            loading: false,
            registered: true,
            user: res.user,
          });
          setError(null);
        } else {
          setLookupStatus({
            checked: true,
            loading: false,
            registered: false,
          });
        }
      } catch {
        setLookupStatus({ checked: true, loading: false, registered: false });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [spouseEmail, isFriends]);

  if (!isOpen) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleAddFriendEmail = () => {
    const raw = friendsInput.trim();
    if (!raw) return;
    const parts = raw.split(/[\s,;]+/).filter(Boolean);
    const valid = parts.filter((p) => emailRegex.test(p.toLowerCase()));
    const invalid = parts.filter((p) => !emailRegex.test(p.toLowerCase()));

    if (invalid.length > 0 && valid.length === 0) {
      setError(`Invalid email address format: "${invalid[0]}"`);
      return;
    }

    const uniqueNew = valid
      .map((e) => e.toLowerCase())
      .filter((e) => !friendEmailList.includes(e));

    if (uniqueNew.length > 0) {
      setFriendEmailList((prev) => [...prev, ...uniqueNew]);
      setFriendsInput('');
      setError(null);
    } else if (parts.length > 0 && valid.length > 0) {
      setError('These emails are already added to your invite list.');
    }
  };

  const removeFriendEmail = (emailToRemove: string) => {
    setFriendEmailList((prev) => prev.filter((e) => e !== emailToRemove));
  };

  const handleRevokeCoupleInvite = async () => {
    if (!activeCoupleInvite && !roomId) return;
    setIsRevokingInvite(true);
    setError(null);
    try {
      await cancelSpaceInvite({
        inviteId: activeCoupleInvite?.id,
        roomId,
      });
      setActiveCoupleInvite(null);
      setSuccessInfo(null);
    } catch (err: any) {
      setError(err.message || 'Failed to revoke invite');
    } finally {
      setIsRevokingInvite(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let targetEmails: string[] = [];

    if (isFriends) {
      const pendingText = friendsInput.trim();
      const pendingParts = pendingText ? pendingText.split(/[\s,;]+/).filter(Boolean) : [];
      const pendingValid = pendingParts.filter((p) => emailRegex.test(p.toLowerCase()));
      const combined = Array.from(new Set([...friendEmailList, ...pendingValid.map((e) => e.toLowerCase())]));

      if (combined.length === 0) {
        setError('Please enter at least one friend’s email address.');
        return;
      }
      targetEmails = combined;
    } else {
      const rawText = spouseEmail.trim();
      if (!rawText) {
        setError('Please enter your partner’s registered email address or name.');
        return;
      }

      const multipleCheck = rawText.split(/[\s,;]+/).filter(Boolean);
      if (multipleCheck.length > 1) {
        setError('Spouse Sanctuary is strictly for two (you and 1 partner). Please enter a single partner email address.');
        return;
      }

      let cleanEmail = rawText.toLowerCase();

      if (!emailRegex.test(cleanEmail)) {
        if (lookupStatus.registered && lookupStatus.user?.email) {
          cleanEmail = lookupStatus.user.email.toLowerCase();
        } else {
          try {
            const lookup = await lookupUserByEmail(cleanEmail);
            if (lookup.exists && lookup.user?.email) {
              cleanEmail = lookup.user.email.toLowerCase();
            } else {
              setError(`Could not find a registered user named "${spouseEmail.trim()}". Please enter their registered email address.`);
              return;
            }
          } catch {
            setError('Please provide a valid email address for your partner.');
            return;
          }
        }
      }
      targetEmails = [cleanEmail];
    }

    setIsLoading(true);
    try {
      const res = await inviteSpouseByEmail({
        roomId,
        passkey,
        emails: targetEmails,
        spouseEmail: targetEmails[0],
        senderName,
        senderEmail,
        spaceName: spaceName || (isFriends ? 'Squad Hangout' : 'Private Sanctuary'),
        spaceType,
        message: customMessage.trim(),
      });

      setSuccessInfo({
        inviteLink: res.inviteLink || (res as any).generalInviteLink,
        message: res.message,
        count: targetEmails.length,
        invitedEmails: targetEmails,
        registeredFriends: (res as any).registeredFriends || [],
      });

      if (!isFriends && res.invite) {
        setActiveCoupleInvite(res.invite);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = (link?: string) => {
    const targetLink = link || successInfo?.inviteLink;
    if (!targetLink) return;
    navigator.clipboard.writeText(targetLink).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const shareViaHaven = (link?: string) => {
    const targetLink = link || successInfo?.inviteLink;
    if (!targetLink) return;
    const text = encodeURIComponent(
      `${customMessage}\n\nJoin our private space on Haven: ${targetLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const openMailClient = (link?: string, recipientEmail?: string) => {
    const targetLink = link || successInfo?.inviteLink;
    if (!targetLink) return;
    const subject = encodeURIComponent(
      isFriends
        ? `${senderName} invited you to join their Haven Squad!`
        : `${senderName} invited you to your private Haven sanctuary 💕`
    );
    const body = encodeURIComponent(
      `${customMessage}\n\nJoin our private space with this secure link:\n${targetLink}\n\n(Encrypted with Haven)`
    );
    const recipient = recipientEmail || (successInfo?.invitedEmails || []).join(',');
    window.open(`mailto:${recipient}?subject=${subject}&body=${body}`);
  };

  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
  const existingInviteLink = `${protocol}//${host}/?room=${encodeURIComponent(roomId)}&key=${encodeURIComponent(passkey)}&type=${isFriends ? 'friends' : 'couple'}${activeCoupleInvite?.spouseEmail ? `&invitedEmail=${encodeURIComponent(activeCoupleInvite.spouseEmail)}` : ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div
        id="invite-space-modal-card"
        className="w-full max-w-lg bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 [color-scheme:light]"
        style={{ colorScheme: 'light' }}
      >
        {/* Header */}
        <div
          className={`relative px-6 pt-6 pb-5 text-white overflow-hidden ${
            isFriends
              ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700'
              : 'bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-2">
            {isFriends ? (
              <>
                <Users className="w-3.5 h-3.5" />
                <span>Friends Space &bull; Multi-Invite (No Limit)</span>
              </>
            ) : (
              <>
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>Spouse Sanctuary &bull; Strictly 1 Partner Only</span>
              </>
            )}
          </div>

          <h2 className="text-xl font-bold font-serif tracking-tight">
            {isFriends ? 'Invite Friends to Space' : 'Invite Your Partner to Sanctuary'}
          </h2>
          <p className="text-white/90 text-xs mt-1 max-w-sm">
            {isFriends
              ? 'Invite as many friends as you like to hang out, watch videos, voice chat, and play party games.'
              : 'Spouse Sanctuary is an intimate space strictly for two people. You can only invite one partner—no one else can ever enter.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setModalTab('send')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              modalTab === 'send'
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>📤 Send Invite</span>
          </button>
          <button
            type="button"
            onClick={() => setModalTab('inbox')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 relative ${
              modalTab === 'inbox'
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>📥 Pending Invites Inbox</span>
            {pendingInvites && pendingInvites.filter((i) => i.status === 'pending').length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingInvites.filter((i) => i.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        <div className="p-6">
          {modalTab === 'inbox' && (
            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {!pendingInvites || pendingInvites.filter((i) => i.status === 'pending').length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <span className="text-4xl block">📭</span>
                  <p className="text-sm font-semibold text-slate-700">No pending invitations right now.</p>
                  <p className="text-xs text-slate-500">When partners or friends invite you to a sanctuary, they will appear here instantly.</p>
                </div>
              ) : (
                pendingInvites.filter((i) => i.status === 'pending').map((inv) => (
                  <div key={inv.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          {inv.spaceType === 'friends' ? '👥 Squad Friend Invite' : '💖 Couple Sanctuary Invite'}
                        </span>
                        <h4 className="text-sm font-bold mt-1 text-slate-900">{inv.spaceName}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">Invited by <strong className="text-rose-600">{inv.senderName}</strong></p>
                      </div>
                    </div>

                    {inv.message && (
                      <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 italic">
                        "{inv.message}"
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (onAcceptInvite) onAcceptInvite(inv);
                          onClose();
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer transition"
                      >
                        ✓ Accept & Join
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onDeclineInvite) onDeclineInvite(inv.id);
                        }}
                        className="py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer transition"
                      >
                        ✕ Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {modalTab === 'send' && (
            <div>
              {error && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* SPOUSE SANCTUARY: Active Partner Slot Already Filled Card */}
              {!isFriends && !successInfo && activeCoupleInvite && (
                <div className="mb-5 p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-rose-900">
                      <Lock className="w-4 h-4 text-rose-600" />
                      <span>Partner Slot Filled (1 of 1)</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      activeCoupleInvite.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {activeCoupleInvite.status === 'accepted' ? 'Partner Connected' : 'Invitation Pending'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-rose-100 space-y-1">
                    <div className="text-slate-500 text-[11px]">Invited Spouse Email:</div>
                    <div className="font-semibold text-slate-900 text-xs truncate">
                      {activeCoupleInvite.spouseEmail}
                    </div>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Spouse Sanctuary is strictly limited to <strong>one partner</strong>. Only <strong>{activeCoupleInvite.spouseEmail}</strong> can join this private room.
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(existingInviteLink)}
                      className="flex-1 py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Magic Link'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => shareViaHaven(existingInviteLink)}
                      className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="Share via Haven"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Haven</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRevokeCoupleInvite}
                      disabled={isRevokingInvite}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="Revoke this invite to invite a different person"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>{isRevokingInvite ? 'Revoking...' : 'Change Partner'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Form to invite spouse or friends (only if no active couple invite or if friends space) */}
              {!successInfo && (isFriends || !activeCoupleInvite) && (
                <form onSubmit={handleSendInvite} className="space-y-4">
                  {isFriends ? (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          Add Friends by Email (No Limit)
                        </label>
                        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                          {friendEmailList.length} friend{friendEmailList.length === 1 ? '' : 's'} added
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            id="input-friends-email"
                            value={friendsInput}
                            onChange={(e) => setFriendsInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ',') {
                                e.preventDefault();
                                handleAddFriendEmail();
                              }
                            }}
                            placeholder="friend@example.com (Press Enter or comma)"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 [color-scheme:light]"
                            style={{ color: '#0f172a', colorScheme: 'light' }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddFriendEmail}
                          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add</span>
                        </button>
                      </div>

                      {friendEmailList.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-xl bg-slate-50 border border-slate-200">
                          {friendEmailList.map((em) => (
                            <span
                              key={em}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100/80 text-indigo-900 text-xs font-medium border border-indigo-200"
                            >
                              <span>{em}</span>
                              <button
                                type="button"
                                onClick={() => removeFriendEmail(em)}
                                className="w-3.5 h-3.5 rounded-full hover:bg-indigo-200 text-indigo-700 flex items-center justify-center text-[10px] cursor-pointer"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Partner's Registered Email or Name
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          id="input-spouse-email"
                          value={spouseEmail}
                          onChange={(e) => setSpouseEmail(e.target.value)}
                          placeholder="partner@example.com"
                          required
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 [color-scheme:light]"
                          style={{ color: '#0f172a', colorScheme: 'light' }}
                        />
                      </div>

                      {lookupStatus.loading && (
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full border-2 border-rose-500/30 border-t-rose-500 animate-spin" />
                          <span>Checking registered members directory...</span>
                        </p>
                      )}

                      {lookupStatus.checked && lookupStatus.registered && lookupStatus.user && (
                        <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {lookupStatus.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-emerald-900 truncate flex items-center gap-1">
                              <span>{lookupStatus.user.name}</span>
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            </p>
                            <p className="text-[10px] text-emerald-700 truncate">{lookupStatus.user.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Personal Note / Invitation Message
                    </label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={3}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 resize-none [color-scheme:light]"
                      style={{ color: '#0f172a', colorScheme: 'light' }}
                    />
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed">
                      <strong className="text-slate-800">Password-Protected Space:</strong> Only invited friends or partners with matching credentials can join. All communications remain end-to-end encrypted.
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      id="btn-send-space-invite"
                      disabled={isLoading}
                      className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition active:scale-[0.99] disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs ${
                        isFriends
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 shadow-indigo-500/20'
                          : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:opacity-95 shadow-rose-500/20'
                      }`}
                    >
                      {isLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{isFriends ? 'Send Squad Invites' : 'Send Partner Invite'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Success View */}
              {successInfo && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                    <div className="font-semibold text-sm mb-1 flex items-center gap-1.5 text-emerald-800">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>
                        {isFriends
                          ? `Invites Sent to ${successInfo.count} Friend${successInfo.count === 1 ? '' : 's'}!`
                          : `Invitation Ready for Your Partner (${successInfo.invitedEmails[0]})!`}
                      </span>
                    </div>
                    <p className="text-emerald-700 leading-relaxed">{successInfo.message}</p>
                    {!isFriends && (
                      <p className="text-emerald-800 font-semibold mt-1 text-[11px]">
                        Spouse Sanctuary is now locked exclusively for you and this partner.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Direct Magic Join Link
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={successInfo.inviteLink}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono text-slate-900 select-all outline-none font-medium [color-scheme:light]"
                        style={{ color: '#0f172a', colorScheme: 'light' }}
                      />
                      <button
                        type="button"
                        id="btn-copy-space-link"
                        onClick={() => handleCopyLink()}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          copiedLink
                            ? 'bg-emerald-600 text-white'
                            : isFriends
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-rose-500 text-white hover:bg-rose-600'
                        }`}
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Instant Share Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => shareViaHaven()}
                      className="py-2.5 px-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>Send via Haven</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openMailClient()}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Mail className="w-4 h-4 text-slate-600" />
                      <span>Open in Email App</span>
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    {isFriends ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSuccessInfo(null);
                          setFriendEmailList([]);
                          setFriendsInput('');
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                      >
                        + Invite more friends
                      </button>
                    ) : (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                        <span>Single partner invite active</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer ml-auto"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
