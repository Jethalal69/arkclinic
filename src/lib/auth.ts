import { supabase } from './supabase';
import { Session, User } from '@supabase/supabase-js';

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
      return {
        success: false,
        session: null,
        user: null,
        error: 'Access Denied: Authenticated account does not have Admin privileges.',
      };
    }

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
 * Get current authenticated admin session if valid.
 */
export async function getAdminSession(): Promise<{
  session: Session | null;
  user: User | null;
  isAuthorized: boolean;
}> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session || !session.user) {
      return { session: null, user: null, isAuthorized: false };
    }

    if (isAuthorizedAdminEmail(session.user.email)) {
      return { session, user: session.user, isAuthorized: true };
    }

    // If a session exists for an unauthorized user, sign them out immediately
    await supabase.auth.signOut();
    return { session: null, user: null, isAuthorized: false };
  } catch {
    return { session: null, user: null, isAuthorized: false };
  }
}

/**
 * Sign out the admin user from Supabase.
 */
export async function logoutAdmin(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err?.message || 'Error during sign out' };
  }
}
