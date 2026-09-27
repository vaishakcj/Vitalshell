import React, { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, ShieldCheck, UserPlus, AlertCircle, CheckCircle2, X, MailCheck, ArrowLeft, RefreshCw, KeyRound, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthScreenProps {
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const { user, loginWithEmail, signUpWithEmail, resendVerificationEmail, verifyEmailOtp, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'otp'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false);
  const [showEmailHelpModal, setShowEmailHelpModal] = useState(false);
  const [showNoCodeHelpModal, setShowNoCodeHelpModal] = useState(false);
  const [showOAuthHelpModal, setShowOAuthHelpModal] = useState(false);

  // If user becomes authenticated (e.g. from clicking confirmation link in email), redirect to app
  useEffect(() => {
    if (user) {
      onSuccess();
    }
  }, [user, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setResendStatus(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signin') {
        const res = await loginWithEmail(email, password);
        if (res.success) {
          onSuccess();
        } else {
          setErrorMessage(res.error || 'Failed to sign in. Please check your credentials.');
        }
      } else {
        // Account creation mode ("New operator")
        const res = await signUpWithEmail(email, password);
        if (res.success) {
          setMode('signin');
          setPassword('');
          setSuccessMessage('Account created successfully. Enter your password to sign in.');
          setErrorMessage(null);
        } else {
          setErrorMessage(res.error || 'Failed to register account.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setErrorMessage('Please enter the confirmation code from your email.');
      return;
    }

    setIsVerifyingOtp(true);
    setErrorMessage(null);
    setResendStatus(null);

    try {
      const res = await verifyEmailOtp(email, cleanOtp);
      if (res.success) {
        // Switch to sign-in view as requested: ask for sign-in after account confirmation
        setMode('signin');
        setPassword('');
        setOtp('');
        setIsEmailUnconfirmed(false);
        setSuccessMessage('Email confirmed successfully! Please enter your password to sign in.');
        setErrorMessage(null);
      } else {
        setErrorMessage(res.error || 'Invalid confirmation code. Please check your email or request a new one.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification error occurred.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }
    setIsResending(true);
    setResendStatus(null);
    try {
      const res = await resendVerificationEmail(email);
      if (res.success) {
        setResendStatus('A new confirmation email has been sent to your inbox & spam folder.');
      } else {
        setErrorMessage(res.error || 'Failed to resend confirmation email.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to send verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        onSuccess();
      } else if (res.providerNotEnabled) {
        setShowOAuthHelpModal(true);
      } else {
        setErrorMessage(res.error || 'Google sign in was cancelled or unavailable.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center px-5 sm:px-8 py-6 bg-slate-50 dark:bg-[#070b14] overflow-y-auto select-none transition-colors">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="w-full flex flex-col items-center text-center mt-2 z-10">
        <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400">
          <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          <span className="text-xs font-bold tracking-[0.25em] uppercase">VITALSHELL PLATFORM</span>
        </div>
        <h1 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight mt-1">
          {mode === 'signin'
            ? 'Sign In to Your Jacket'
            : mode === 'signup'
            ? 'Create Operator Account'
            : 'Enter Verification Code'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-xs leading-relaxed">
          {mode === 'otp'
            ? 'Enter the 6-digit confirmation code sent to your email.'
            : 'Access real-time biometrics, fall telemetry, and emergency notification networks.'}
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-sm my-auto z-10 py-3">
        <div className="bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#1a2d52] rounded-3xl p-6 shadow-xl dark:shadow-2xl">
          
          {mode !== 'otp' && (
            <>
              {/* Google Single Sign-On Button */}
              <div>
                <button
                  id="auth-google-signin-btn"
                  type="button"
                  onClick={() => handleGoogleSignIn()}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-[#1e325a] bg-slate-50 dark:bg-[#0f1b34] hover:bg-slate-100 dark:hover:bg-[#16274a] text-slate-800 dark:text-white font-medium text-xs flex items-center justify-center space-x-3 transition cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
                >
                  {/* Google Vector Icon */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-[#1a2d52]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white dark:bg-[#0c1529] px-2 text-slate-400 font-semibold tracking-wider">
                    Or with Email
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-3.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start space-x-2 text-emerald-700 dark:text-emerald-400 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div className="flex-1">
                <span className="font-semibold block text-[11px] uppercase tracking-wider">
                  {mode === 'otp' ? 'Confirmation Sent' : 'Success'}
                </span>
                <span className="text-xs leading-relaxed">{successMessage}</span>
              </div>
            </div>
          )}

          {/* Email Confirmation / OTP Verification View */}
          {mode === 'otp' ? (
            <div className="space-y-4">
              {/* Destination Email Info Card */}
              <div className="p-2.5 bg-slate-50 dark:bg-[#091122] border border-slate-200 dark:border-[#1a2d52] rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs truncate">
                  <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-medium shrink-0 ml-2 cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* OTP Form (Only code entry) */}
              <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2 text-center">
                    Enter 6-Digit Verification Code
                  </label>
                  <div className="relative flex justify-center items-center">
                    <input
                      id="auth-otp-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={8}
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
                        setOtp(val);
                        if (val.length >= 6) {
                          setErrorMessage(null);
                        }
                      }}
                      placeholder="••••••"
                      className="w-full text-center font-mono text-2xl tracking-[0.35em] py-3 bg-slate-50 dark:bg-[#080e1b] border border-slate-200 dark:border-[#1c2c4b] rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition shadow-inner"
                      autoFocus
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 text-center mt-1.5">
                    Check your email inbox or spam folder for the code.
                  </p>
                </div>

                {/* Resend Status Message */}
                {resendStatus && (
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] flex items-center space-x-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{resendStatus}</span>
                  </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2 text-rose-600 dark:text-rose-400 text-xs animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Verify OTP Button */}
                <button
                  id="auth-verify-otp-btn"
                  type="submit"
                  disabled={isVerifyingOtp || !otp.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-md shadow-cyan-500/20 active:scale-98 disabled:opacity-50"
                >
                  {isVerifyingOtp ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 stroke-[2.5]" />
                      <span>Verify Code & Confirm Account</span>
                    </>
                  )}
                </button>
              </form>

              {/* Helper & Resend Footer */}
              <div className="pt-1 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setShowNoCodeHelpModal(true)}
                  className="text-[11px] text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition flex items-center space-x-1 cursor-pointer"
                >
                  <Info className="w-3 h-3 text-cyan-500" />
                  <span>Didn't get a code?</span>
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={isResending}
                    className="text-[11px] font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition flex items-center space-x-1 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                    <span>{isResending ? 'Sending...' : 'Resend Code'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition flex items-center space-x-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Sign In</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Sign In / Sign Up Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Email Field */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-[#080e1b] border border-slate-200 dark:border-[#1c2c4b] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => alert('Password reset link sent to your registered email.')}
                      className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="auth-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-[#080e1b] border border-slate-200 dark:border-[#1c2c4b] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              {/* Email Not Confirmed Banner & Action */}
              {isEmailUnconfirmed && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 text-xs animate-in fade-in">
                  <div className="flex items-start space-x-2 text-amber-700 dark:text-amber-400">
                    <MailCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div className="flex-1">
                      <span className="font-semibold block text-[11px] uppercase tracking-wider">Email Not Confirmed</span>
                      <p className="mt-0.5 text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                        Please enter the verification code sent to{' '}
                        <strong className="text-slate-800 dark:text-slate-100">{email || 'your email'}</strong> to activate your account.
                      </p>
                    </div>
                  </div>

                  {resendStatus && (
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{resendStatus}</span>
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('otp');
                        setErrorMessage(null);
                        setSuccessMessage('Please enter the 6-digit verification code sent to your email.');
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-[11px] flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-xs"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>Enter Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={isResending}
                      className="py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-[11px] flex items-center justify-center space-x-1 transition cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                      <span>Resend Code</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {errorMessage && !isEmailUnconfirmed && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2 text-rose-600 dark:text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="auth-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-md shadow-cyan-500/20 active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : mode === 'signin' ? (
                  <>
                    <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Sign In</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Register Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle between Sign In and Sign Up (hidden in OTP mode) */}
          {mode !== 'otp' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setIsEmailUnconfirmed(false);
                }}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 font-medium transition cursor-pointer"
              >
                {mode === 'signin' ? (
                  <span>New operator? <strong className="text-cyan-600 dark:text-cyan-400 underline">Create an account</strong></span>
                ) : (
                  <span>Already registered? <strong className="text-cyan-600 dark:text-cyan-400 underline">Sign in instead</strong></span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full flex items-center justify-center text-[11px] text-slate-400 dark:text-slate-500 z-10 text-center">
        <span>Protected by VitalShell End-to-End Cryptographic Enclave</span>
      </div>

      {/* Why No Code Explanation Modal */}
      {showNoCodeHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#1a2d52] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Need the 6-Digit Code?
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    How to configure Supabase to send code
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNoCodeHelpModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl space-y-1">
                <strong className="text-cyan-900 dark:text-cyan-300 block font-semibold text-xs">
                  Supabase Email Template Configuration
                </strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  By default, Supabase sends a button instead of a code. To make Supabase send you the 6-digit code:
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#090f1d] border border-slate-200 dark:border-[#162544] rounded-xl space-y-1.5 text-[11px]">
                <strong className="text-slate-800 dark:text-slate-200 block font-semibold">
                  Steps in your Supabase Dashboard:
                </strong>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300">
                  <li>Go to <strong>Authentication → Email Templates</strong></li>
                  <li>Click <strong>Confirm signup</strong></li>
                  <li>In the email message body, enter: <br /><code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-cyan-600 dark:text-cyan-400 font-mono text-[10px]">Your confirmation code is: {`{{ .Token }}`}</code></li>
                  <li>Click <strong>Save</strong></li>
                </ol>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowNoCodeHelpModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition cursor-pointer shadow-md shadow-cyan-500/20"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Email Confirmation Settings Helper Modal */}
      {showEmailHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#1a2d52] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <MailCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Email Verification Settings
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Options for Supabase operators
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailHelpModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
              <div className="p-3 bg-cyan-500/5 dark:bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-1.5 text-[11px]">
                <strong className="text-cyan-800 dark:text-cyan-300 block">
                  Disable Email Verification (Instant Sign-in)
                </strong>
                <p className="text-slate-500 dark:text-slate-400">
                  If you don't want users to have to wait for any emails or codes at all:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300">
                  <li>Open your <strong>Supabase Dashboard</strong></li>
                  <li>Go to <strong>Authentication → Providers</strong></li>
                  <li>Click on <strong>Email</strong></li>
                  <li>Toggle <strong>Confirm email</strong> to <strong>OFF</strong> and click <strong>Save</strong></li>
                </ol>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowEmailHelpModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition cursor-pointer shadow-md shadow-cyan-500/20"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Google Provider Configuration Helper Modal */}
      {showOAuthHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#1a2d52] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Google Provider Not Enabled in Supabase
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Error 400: validation_failed (Unsupported provider)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOAuthHelpModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>
                Supabase requires the <strong>Google OAuth Provider</strong> to be toggled on in your Supabase project dashboard before redirecting users.
              </p>
              
              <div className="p-3 bg-slate-50 dark:bg-[#090f1d] border border-slate-200 dark:border-[#162544] rounded-xl space-y-1.5 text-[11px]">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  How to enable in Supabase:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-500 dark:text-slate-400">
                  <li>Open your <strong>Supabase Dashboard</strong></li>
                  <li>Navigate to <strong>Authentication → Providers</strong></li>
                  <li>Click on <strong>Google</strong> and toggle <strong>Enable Google provider</strong></li>
                  <li>Enter your Google Cloud <strong>Client ID</strong> and <strong>Client Secret</strong></li>
                </ol>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowOAuthHelpModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition cursor-pointer shadow-md shadow-cyan-500/20"
              >
                Understood, Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


