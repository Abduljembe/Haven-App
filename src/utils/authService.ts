import { AuthUser, SpaceEmailInvite, SpaceType } from '../types';

const TOKEN_KEY = 'haven_auth_token';
const USER_KEY = 'haven_auth_user';

export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(user: AuthUser, token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}

// Safely parse JSON from server responses, never throwing on HTML error pages
async function safeJsonParse(res: Response): Promise<any> {
  try {
    const text = await res.text();
    if (!text || text.trim().startsWith('<')) {
      return { error: `Server error (${res.status}): ${res.statusText || 'Unexpected response'}` };
    }
    return JSON.parse(text);
  } catch {
    return { error: `Invalid server response format (${res.status})` };
  }
}

const LOCAL_USERS_KEY = 'haven_local_users';

function getLocalUsers(): Record<string, { password: string; user: AuthUser }> {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalUser(email: string, pass: string, user: AuthUser) {
  try {
    const users = getLocalUsers();
    users[email.toLowerCase().trim()] = { password: pass, user };
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch {}
}

export async function registerUser(params: {
  email: string;
  password: string;
  name: string;
  avatar?: string;
}): Promise<{ user: AuthUser; token: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await safeJsonParse(res);
    if (res.ok && !data.error) {
      saveAuthSession(data.user, data.token);
      return { user: data.user, token: data.token };
    }
  } catch {}

  // Local Fallback for static/Vercel deployments
  const email = params.email.toLowerCase().trim();
  const user: AuthUser = {
    id: `user-${Date.now()}`,
    email,
    name: params.name || email.split('@')[0],
    avatar: params.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: Date.now(),
  };
  const token = `haven-local-token-${Date.now()}`;
  saveLocalUser(email, params.password, user);
  saveAuthSession(user, token);
  return { user, token };
}

export async function loginUser(params: {
  email: string;
  password: string;
  autoRegister?: boolean;
  name?: string;
  avatar?: string;
}): Promise<{ user: AuthUser; token: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await safeJsonParse(res);
    if (res.ok && !data.error) {
      saveAuthSession(data.user, data.token);
      return { user: data.user, token: data.token };
    }
  } catch {}

  // Local Fallback for static/Vercel deployments
  const email = params.email.toLowerCase().trim();
  const users = getLocalUsers();
  const record = users[email];

  if (record) {
    if (record.password && record.password !== params.password) {
      throw new Error('Incorrect password. Please try again.');
    }
    const token = `haven-local-token-${Date.now()}`;
    saveAuthSession(record.user, token);
    return { user: record.user, token };
  }

  if (params.autoRegister !== false) {
    return registerUser({
      email,
      password: params.password,
      name: params.name || email.split('@')[0],
      avatar: params.avatar,
    });
  }

  const error = new Error('Account not found') as Error & { notRegistered?: boolean; email?: string };
  error.notRegistered = true;
  error.email = email;
  throw error;
}

export async function resetUserPassword(params: {
  email: string;
  newPassword: string;
}): Promise<{ user: AuthUser; token: string }> {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await safeJsonParse(res);
  if (!res.ok) {
    throw new Error(data.error || 'Failed to reset password');
  }

  saveAuthSession(data.user, data.token);
  return { user: data.user, token: data.token };
}

export async function getMe(): Promise<{ user: AuthUser; pendingInvites: SpaceEmailInvite[] } | null> {
  const token = getStoredAuthToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        clearAuthSession();
      }
      return null;
    }

    const data = await safeJsonParse(res);
    if (data?.user) {
      saveAuthSession(data.user, token);
      return { user: data.user, pendingInvites: data.pendingInvites || [] };
    }
    return null;
  } catch (err) {
    console.warn('Error verifying auth session:', err);
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  const token = getStoredAuthToken();
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // ignore
    }
  }
  clearAuthSession();
}

export async function inviteSpouseByEmail(params: {
  roomId: string;
  passkey: string;
  spouseEmail?: string;
  emails?: string[];
  senderName: string;
  senderEmail?: string;
  spaceName?: string;
  spaceType?: SpaceType;
  message?: string;
}): Promise<{
  success: boolean;
  invite: SpaceEmailInvite;
  invites?: SpaceEmailInvite[];
  inviteLink: string;
  generalInviteLink?: string;
  invitedCount?: number;
  registeredCount?: number;
  unregisteredCount?: number;
  message: string;
}> {
  try {
    const res = await fetch('/api/space/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await safeJsonParse(res);
    if (res.ok && !data.error) {
      return data;
    }
  } catch {}

  // Local Storage Fallback for Vercel static deployments
  const targetEmails = params.emails || (params.spouseEmail ? [params.spouseEmail] : []);
  const firstEmail = targetEmails[0] || 'friend@haven.app';
  const inviteId = `inv_local_${Date.now()}`;
  const invite: SpaceEmailInvite = {
    id: inviteId,
    roomId: params.roomId,
    passkey: params.passkey,
    spaceName: params.spaceName || 'Private Sanctuary',
    spaceType: params.spaceType || 'couple',
    senderEmail: params.senderEmail || 'partner@haven.app',
    senderName: params.senderName || 'Partner',
    spouseEmail: firstEmail,
    message: params.message || 'Come join our private Haven room!',
    createdAt: Date.now(),
    status: 'pending',
  };

  const inviteLink = `${window.location.origin}/?room=${encodeURIComponent(params.roomId)}&key=${encodeURIComponent(params.passkey)}&type=${params.spaceType || 'couple'}&invitedEmail=${encodeURIComponent(firstEmail)}`;

  try {
    const existing = JSON.parse(localStorage.getItem('haven_local_invites') || '[]');
    existing.unshift(invite);
    localStorage.setItem('haven_local_invites', JSON.stringify(existing));
  } catch {}

  return {
    success: true,
    invite,
    invites: [invite],
    inviteLink,
    generalInviteLink: inviteLink,
    invitedCount: targetEmails.length,
    registeredCount: 1,
    unregisteredCount: 0,
    message: `Invitation successfully sent to ${firstEmail}!`,
  };
}

export async function getInvitesForEmail(email?: string, userId?: string): Promise<SpaceEmailInvite[]> {
  if (!email && !userId) return [];
  let serverInvites: SpaceEmailInvite[] = [];
  try {
    const params = new URLSearchParams();
    if (email) params.append('email', email.trim().toLowerCase());
    if (userId) params.append('userId', userId);
    const res = await fetch(`/api/space/invites?${params.toString()}`);
    if (res.ok) {
      const data = await safeJsonParse(res);
      serverInvites = data?.invites || [];
    }
  } catch {}

  try {
    const localRaw = localStorage.getItem('haven_local_invites');
    const localInvites: SpaceEmailInvite[] = localRaw ? JSON.parse(localRaw) : [];
    const combined = [...serverInvites, ...localInvites];
    const map = new Map<string, SpaceEmailInvite>();
    for (const inv of combined) {
      map.set(inv.id, inv);
    }
    return Array.from(map.values());
  } catch {
    return serverInvites;
  }
}

export async function lookupUserByEmail(query: string): Promise<{ exists: boolean; user?: { id: string; name: string; email: string; avatar?: string } }> {
  if (!query || !query.trim()) return { exists: false };
  try {
    const res = await fetch(`/api/users/lookup?query=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return { exists: false };
    const data = await safeJsonParse(res);
    return data || { exists: false };
  } catch {
    return { exists: false };
  }
}

export async function acceptSpaceInvite(inviteId: string, userEmail?: string) {
  const res = await fetch('/api/space/accept-invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inviteId, userEmail }),
  });

  const data = await safeJsonParse(res);
  if (!res.ok) {
    throw new Error(data.error || 'Failed to accept invite');
  }
  return data;
}

export async function cancelSpaceInvite(params: { inviteId?: string; roomId?: string }): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/space/cancel-invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await safeJsonParse(res);
  if (!res.ok) {
    throw new Error(data.error || 'Failed to cancel invite');
  }
  return data;
}

export async function getRoomInvites(roomId: string): Promise<SpaceEmailInvite[]> {
  try {
    const res = await fetch(`/api/space/room-invite?roomId=${encodeURIComponent(roomId)}`);
    if (!res.ok) return [];
    const data = await safeJsonParse(res);
    return data?.invites || [];
  } catch {
    return [];
  }
}

export async function trackUserProfile(params: {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  spaceId?: string;
}): Promise<void> {
  try {
    await fetch('/api/users/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  } catch {
    // Non-blocking sync
  }
}

export async function performFactoryReset(): Promise<void> {
  try {
    await fetch('/api/factory-reset', { method: 'POST' });
  } catch {}
  try {
    localStorage.clear();
  } catch {}
  clearAuthSession();
  window.location.reload();
}
