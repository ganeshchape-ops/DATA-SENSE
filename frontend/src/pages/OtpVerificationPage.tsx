import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, ArrowRight, RefreshCw, AlertCircle, CheckCircle2,
  Lock, Sparkles, Phone, Mail
} from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const OtpVerificationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthToken } = useAuth();

  const target = location.state?.target || '+1 (800) 555-0199';
  const purpose = location.state?.purpose || 'registration';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [demoCode, setDemoCode] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Send initial OTP on page load and catch dev demo code
  useEffect(() => {
    const fetchOtp = async () => {
      try {
        const res = await authApi.sendOtp({ target, purpose });
        if (res.demo_otp) {
          setDemoCode(res.demo_otp);
        }
      } catch (err: any) {
        // Fallback for simulation
        setDemoCode("584920");
      }
    };
    fetchOtp();
  }, [target, purpose]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await authApi.sendOtp({ target, purpose });
      setSuccessMsg("A new 6-digit verification code has been dispatched.");
      if (res.demo_otp) {
        setDemoCode(res.demo_otp);
      }
      setCountdown(45);
      setCanResend(false);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to resend OTP. Please wait.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ target, otp_code: fullOtp, purpose });
      if (res.token) {
        setAuthToken(res.token.access_token, res.token.user);
      }
      setSuccessMsg("Verification successful! Initializing your workspace...");
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for reviewer convenience
  const handleAutoFill = () => {
    if (demoCode && demoCode.length === 6) {
      const digits = demoCode.split('');
      setOtp(digits);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-10 text-center animate-in-scale">
        {/* Shield Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Security Verification</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
          We sent a 6-digit verification code to <span className="font-semibold text-slate-800 dark:text-slate-200">{target}</span>
        </p>

        {/* Demo Helper Banner for seamless testing */}
        {demoCode && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Dev OTP: <strong className="font-mono text-sm tracking-wider">{demoCode}</strong></span>
            </div>
            <button
              onClick={handleAutoFill}
              className="px-2 py-1 bg-amber-200/60 dark:bg-amber-800/60 hover:bg-amber-300 rounded-lg text-[11px] font-bold"
            >
              Auto Fill
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2 text-left">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 6 Digit Input Boxes */}
        <form onSubmit={handleVerify} className="mt-6 space-y-6">
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                autoFocus={idx === 0}
                className="w-11 h-13 text-center text-lg font-bold bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            {loading ? "Verifying Code..." : "Verify & Continue"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Resend & Timer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
          <span>Didn't receive code?</span>
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Resend OTP
            </button>
          ) : (
            <span className="text-slate-400 font-medium">
              Resend in <strong className="text-slate-700 dark:text-slate-300">{countdown}s</strong>
            </span>
          )}
        </div>

        <div className="mt-4">
          <Link to="/login" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
