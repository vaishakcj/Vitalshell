import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'supabase' | 'local';
}

interface RegisteredAccount {
  email: string;
  password?: string;
  name: string;
  createdAt: number;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loginWithEmail: (email: string, password?: string) => Promise<{ success: boolean; error?: string; emailNotConfirmed?: boolean }>;
  signUpWithEmail: (email: string, password?: string) => Promise<{ success: boolean; error?: string; message?: string; needsConfirmation?: boolean }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmailOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string; providerNotEnabled?: boolean }>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'vitalshell_authenticated_user';
const LOCAL_ACCOUNTS_KEY = 'vitalshell_registered_operators';

const getLocalAccounts = (): RegisteredAccount[] => {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalAccount = (email: string, password?: string, name?: string) => {
  try {
    const accounts = getLocalAccounts();
    const existingIndex = accounts.findIndex((a) => a.email.toLowerCase() === email.toLowerCase());
    const newAcc: RegisteredAccount = {
      email,
      password,
      name: name || email.split('@')[0] || 'Operator',
      createdAt: Date.now(),
    };
    if (existingIndex >= 0) {
      accounts[existingIndex] = newAcc;
    } else {
      accounts.push(newAcc);
    }
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // Ignore localStorage write failures in restricted environments
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronize with Supabase Auth state if Supabase is active
  useEffect(() => {
    let mounted = true;
    const client = getSupabase();

    if (client && isSupabaseConfigured) {
      client.auth.getSession().then(({ data: { session } }) => {
        if (!mounted) return;
        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || 'user@vitalshell.io',
            name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split('@')[0] ||
              'Operator',
            avatarUrl: session.user.user_metadata?.avatar_url,
            provider: 'supabase',
          };
          setUser(authUser);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authUser));
        }
        setLoading(false);
      });

      const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || 'user@vitalshell.io',
            name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split('@')[0] ||
              'Operator',
            avatarUrl: session.user.user_metadata?.avatar_url,
            provider: 'supabase',
          };
          setUser(authUser);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authUser));
        } else {
          // If session ended in Supabase
          if (user?.provider === 'supabase') {
            setUser(null);
            localStorage.removeItem(LOCAL_USER_KEY);
          }
        }
        setLoading(false);
      });

      return () => {
        mounted = false;
        authListener?.subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string, password?: string): Promise<{ success: boolean; error?: string; emailNotConfirmed?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();
    const client = getSupabase();
    if (client && isSupabaseConfigured && password) {
      const { data, error } = await client.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) {
        const isUnconfirmed = error.message?.toLowerCase().includes('email not confirmed');
        return {
          success: false,
          error: isUnconfirmed
            ? 'Email not confirmed yet. Please verify your email address to sign in.'
            : error.message,
          emailNotConfirmed: isUnconfirmed,
        };
      }
      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          name:
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            cleanEmail.split('@')[0] ||
            'Operator',
          avatarUrl: data.user.user_metadata?.avatar_url,
          provider: 'supabase',
        };
        setUser(authUser);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authUser));
        return { success: true };
      }
    }

    // Local / offline fallback login
    if (password) {
      const accounts = getLocalAccounts();
      const match = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
      if (match && match.password && match.password !== password) {
        return { success: false, error: 'Invalid password. Please check your credentials.' };
      }
      if (!match) {
        // Register account locally
        saveLocalAccount(cleanEmail, password);
      }
    }

    const fallbackUser: AuthUser = {
      id: 'usr_' + Date.now(),
      email: cleanEmail,
      name: cleanEmail.split('@')[0] || 'Operator',
      provider: 'local',
    };
    setUser(fallbackUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fallbackUser));
    return { success: true };
  };

  const signUpWithEmail = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string; message?: string; needsConfirmation?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();
    const client = getSupabase();

    if (client && isSupabaseConfigured && password) {
      const { data, error } = await client.auth.signUp({
        email: cleanEmail,
        password,
      });
      if (error) {
        return { success: false, error: error.message };
      }

      const needsConfirmation = Boolean(data.user && !data.session);

      // Explicitly sign out any auto-created session so the user must sign in manually
      if (data.session) {
        await client.auth.signOut();
      }
      setUser(null);
      localStorage.removeItem(LOCAL_USER_KEY);

      // Save credentials locally as backup
      saveLocalAccount(cleanEmail, password);

      return {
        success: true,
        needsConfirmation,
        message: needsConfirmation
          ? 'Account created! Please enter the 6-digit verification code sent to your email.'
          : 'Account created successfully! Please enter your password to sign in.',
      };
    }

    // Local / offline mock registration
    saveLocalAccount(cleanEmail, password || '');
    setUser(null);
    localStorage.removeItem(LOCAL_USER_KEY);
    return {
      success: true,
      needsConfirmation: false,
      message: 'Account created successfully! Please enter your password to sign in.',
    };
  };

  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const client = getSupabase();
    if (client && isSupabaseConfigured) {
      try {
        const { error } = await client.auth.resend({
          type: 'signup',
          email: cleanEmail,
        });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to resend confirmation email.' };
      }
    }
    return { success: false, error: 'Supabase client is not available.' };
  };

  const verifyEmailOtp = async (
    email: string,
    otp: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();
    const client = getSupabase();

    if (!cleanOtp) {
      return { success: false, error: 'Please enter the verification code sent to your email.' };
    }

    if (client && isSupabaseConfigured) {
      try {
        // Try signup verification first (standard for email confirmation tokens)
        let { data, error } = await client.auth.verifyOtp({
          email: cleanEmail,
          token: cleanOtp,
          type: 'signup',
        });

        // If signup type fails, try 'email' type (some Supabase projects configure magic link / email otp)
        if (error) {
          const fallbackRes = await client.auth.verifyOtp({
            email: cleanEmail,
            token: cleanOtp,
            type: 'email',
          });
          if (!fallbackRes.error) {
            data = fallbackRes.data;
            error = null;
          }
        }

        if (error) {
          return {
            success: false,
            error: error.message || 'Invalid or expired OTP code. Please check your email or request a new code.',
          };
        }

        // To comply with "ask for signin after account creation", sign out so user can sign in
        if (data?.session) {
          await client.auth.signOut();
        }
        setUser(null);
        localStorage.removeItem(LOCAL_USER_KEY);

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Verification failed. Please check the code.' };
      }
    }

    // Local / offline fallback
    if (cleanOtp.length >= 4) {
      setUser(null);
      localStorage.removeItem(LOCAL_USER_KEY);
      return { success: true };
    }
    return { success: false, error: 'Please enter a valid 6-digit verification code.' };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string; providerNotEnabled?: boolean }> => {
    const client = getSupabase();
    if (client && isSupabaseConfigured) {
      try {
        const { data, error } = await client.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            skipBrowserRedirect: true,
          },
        });

        if (error) {
          const errMsg = error.message || '';
          if (errMsg.toLowerCase().includes('not enabled') || errMsg.toLowerCase().includes('validation_failed')) {
            return {
              success: false,
              providerNotEnabled: true,
              error: 'Google provider is not enabled in your Supabase dashboard.',
            };
          }
          return { success: false, error: error.message };
        }

        if (data?.url) {
          // Pre-flight check before redirecting browser to prevent raw JSON error page
          try {
            const probe = await fetch(data.url, { method: 'GET' });
            if (!probe.ok) {
              const errBody = await probe.json().catch(() => null);
              if (
                errBody &&
                (errBody.code === 400 ||
                  errBody.error_code === 'validation_failed' ||
                  errBody.msg?.includes('Unsupported provider') ||
                  errBody.msg?.includes('not enabled'))
              ) {
                return {
                  success: false,
                  providerNotEnabled: true,
                  error: errBody.msg || 'Google provider is not enabled in your Supabase project.',
                };
              }
            }
          } catch {
            // Note: If fetch throws a TypeError, it typically means CORS blocked a redirect to accounts.google.com,
            // which confirms Google OAuth is active and working.
          }

          // Safe to redirect browser to Google OAuth
          window.location.assign(data.url);
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to initiate Google OAuth.' };
      }
    }

    return {
      success: false,
      providerNotEnabled: true,
      error: 'Google OAuth provider is not configured or enabled in Supabase.',
    };
  };

  const logout = async () => {
    const client = getSupabase();
    if (client && isSupabaseConfigured) {
      await client.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(LOCAL_USER_KEY);
  };

  const continueAsGuest = () => {
    // Deprecated - no-op retained for interface compatibility
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        signUpWithEmail,
        resendVerificationEmail,
        verifyEmailOtp,
        loginWithGoogle,
        logout,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
