import { supabase } from './supabase';
import { Session, User } from '@supabase/supabase-js';

/**
 * 30-minute inactivity timeout & 12-hour maximum session lifetime configuration
 */
export const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const MAX_SESSION_LIFETIME_MS = 12 * 60 * 60 * 1000; // 12 hours

export const STORAGE_KEYS = {
  LAST_ACTIVITY: 'ark_admin_last_activity',
  SESSION_START: 'ark_admin_session_start',
  EXPIRY_MESSAGE: 'ark_admin_expiry_message',
} as const;

/**
 * Returns the configured authorized admin email in lowercase.
 */
export const getAuthorizedAdminEmail = (): string => {
  const envEmail = import.meta.env.VITE_ADMIN_EMAIL;
  if (envEmail && typeof envEmail === 'string' && envEmail.trim()) {
    return envEmail.trim().toLowerCase();
  }
  return 'taranjeetap82@gmail.com';
};

/**
 * Check if the given email matches the authorized admin email.
 */
export const isAuthorizedAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return email.trim().toLowerCase() === getAuthorizedAdminEmail();
};

/**
 * Record user activity timestamp in localStorage (throttled across tabs)
 */
export const recordAdminActivity = (): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
  } catch {}
};

/**
 * Initialize session start & last activity timestamp
 */
export const initAdminSessionTimestamps = (): void => {
  try {
    const now = Date.now();
    const existingStart = localStorage.getItem(STORAGE_KEYS.SESSION_START);
    if (!existingStart) {
      localStorage.setItem(STORAGE_KEYS.SESSION_START, now.toString());
    }
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());
  } catch {}
};

/**
 * Clear session tracking timestamps upon logout
 */
export const clearAdminSessionTimestamps = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION_START);
    localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
  } catch {}
};

/**
 * Retrieve and consume any pending session expiry message
 */
export const getSessionExpiryMessage = (): string | null => {
  try {
    const msg = localStorage.getItem(STORAGE_KEYS.EXPIRY_MESSAGE);
    if (msg) {
      localStorage.removeItem(STORAGE_KEYS.EXPIRY_MESSAGE);
      return msg;
    }
  } catch {}
  return null;
};

/**
 * Store a session expiry message to display on the login screen
 */
export const setSessionExpiryMessage = (message: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPIRY_MESSAGE, message);
  } catch {}
};

/**
 * Check if the session has exceeded 30 minutes of inactivity or 12 hours max lifetime
 */
export const checkAdminSessionExpiry = (): { isExpired: boolean; reason: string | null } => {
  try {
    const now = Date.now();
    const sessionStartStr = localStorage.getItem(STORAGE_KEYS.SESSION_START);
    const lastActivityStr = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);

    // If no timestamps recorded yet, session is fresh
    if (!sessionStartStr && !lastActivityStr) {
      return { isExpired: false, reason: null };
    }

    const sessionStart = Number(sessionStartStr || 0);
    const lastActivity = Number(lastActivityStr || 0);

    // 1. Max session lifetime: 12 hours
    if (sessionStart > 0 && now - sessionStart > MAX_SESSION_LIFETIME_MS) {
      return {
        isExpired: true,
        reason: 'Your session has reached its maximum 12-hour duration. Please sign in again.',
      };
    }

    // 2. Inactivity timeout: 30 minutes
    if (lastActivity > 0 && now - lastActivity > INACTIVITY_TIMEOUT_MS) {
      return {
        isExpired: true,
        reason: 'Your session expired due to inactivity. Please sign in again.',
      };
    }

    return { isExpired: false, reason: null };
  } catch {
    return { isExpired: false, reason: null };
  }
};

/**
 * Send an OTP code to the authorized admin email using Supabase Auth.
 */
export async function sendAdminOtp(email: string): Promise<{ success: boolean; error: string | null }> {
  const sanitizedEmail = email.trim().toLowerCase();

  // Strict email authorization check
  if (!isAuthorizedAdminEmail(sanitizedEmail)) {
    return {
      success: false,
      error: 'Access Denied: This email is not authorized for Admin access. Please enter the configured clinic administrator email.',
    };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: sanitizedEmail,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to send verification code. Please try again.',
      };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error while requesting verification code.',
    };
  }
}

/**
 * Verify the 6-digit OTP code using Supabase Auth.
 */
export async function verifyAdminOtp(
  email: string,
  token: string
): Promise<{ success: boolean; session: Session | null; user: User | null; error: string | null }> {
  const sanitizedEmail = email.trim().toLowerCase();
  const sanitizedToken = token.trim();

  if (!isAuthorizedAdminEmail(sanitizedEmail)) {
    return {
      success: false,
      session: null,
      user: null,
      error: 'Access Denied: This email is not authorized for Admin access.',
    };
  }

  if (!sanitizedToken || sanitizedToken.length < 6) {
    return {
      success: false,
      session: null,
      user: null,
      error: 'Please enter the complete 6-digit verification code.',
    };
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: sanitizedEmail,
      token: sanitizedToken,
      type: 'email',
    });

    if (error) {
      return {
        success: false,
        session: null,
        user: null,
        error: error.message || 'Invalid or expired verification code. Please try again.',
      };
    }

    // Double check that the authenticated user's email is the authorized admin
    if (!data.user || !isAuthorizedAdminEmail(data.user.email)) {
      await supabase.auth.signOut();
      clearAdminSessionTimestamps();
      return {
        success: false,
        session: null,
        user: null,
        error: 'Access Denied: Authenticated account does not have Admin privileges.',
      };
    }

    // Initialize session start & activity timestamps for the new authenticated session
    initAdminSessionTimestamps();
    try {
      localStorage.removeItem(STORAGE_KEYS.EXPIRY_MESSAGE);
    } catch {}

    return {
      success: true,
      session: data.session,
      user: data.user,
      error: null,
    };
  } catch (err: any) {
    return {
      success: false,
      session: null,
      user: null,
      error: err?.message || 'Network error while verifying code.',
    };
  }
}

/**
 * Get current authenticated admin session if valid and not expired.
 */
export async function getAdminSession(): Promise<{
  session: Session | null;
  user: User | null;
  isAuthorized: boolean;
}> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session || !session.user) {
      clearAdminSessionTimestamps();
      return { session: null, user: null, isAuthorized: false };
    }

    if (!isAuthorizedAdminEmail(session.user.email)) {
      await supabase.auth.signOut();
      clearAdminSessionTimestamps();
      return { session: null, user: null, isAuthorized: false };
    }

    // Verify session has not expired while page was idle/refreshed
    const expiry = checkAdminSessionExpiry();
    if (expiry.isExpired) {
      if (expiry.reason) {
        setSessionExpiryMessage(expiry.reason);
      }
      await logoutAdmin();
      return { session: null, user: null, isAuthorized: false };
    }

    // Keep session active & maintain timestamps
    initAdminSessionTimestamps();

    return { session, user: session.user, isAuthorized: true };
  } catch {
    return { session: null, user: null, isAuthorized: false };
  }
}

/**
 * Sign out the admin user from Supabase and clear session tracking.
 */
export async function logoutAdmin(): Promise<{ error: string | null }> {
  try {
    clearAdminSessionTimestamps();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err?.message || 'Error during sign out' };
  }
}
