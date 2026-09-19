import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock, Mail, User, Phone, Building2,
  Briefcase, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Data Analyst');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { setAuthToken } = useAuth();
  const navigate = useNavigate();

  const roles = [
    'Student',
    'Data Analyst',
    'Business Analyst',
    'Data Scientist',
    'Manager',
    'Admin'
  ];

  // Password Strength Calculation
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);
  const getStrengthLabel = () => {
    if (password.length === 0) return { label: '', color: 'bg-slate-200 dark:bg-slate-800' };
    if (strength <= 2) return { label: 'Weak', color: 'bg-rose-500' };
    if (strength <= 3) return { label: 'Medium', color: 'bg-amber-500' };
    return { label: 'Strong', color: 'bg-emerald-500' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Terms & Privacy Policy to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register({
        name,
        email,
        mobile_number: mobileNumber,
        company: company || 'Enterprise',
        role,
        password
      });

      // Send OTP to mobile or email for verification
      const target = mobileNumber || email;
      await authApi.sendOtp({ target, purpose: 'registration' });

      // Save token & redirect to OTP Verification page
      setAuthToken(res.access_token, res.user);
      navigate('/verify-otp', { state: { target, purpose: 'registration' } });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 lg:p-8 transition-colors">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-10">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
            <Logo size="lg" />
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Create Your Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Join the AI-native predictive analytics platform
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@company.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Mobile Number & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number (for OTP SMS)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+1 (800) 555-0199"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company / Organization
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Apex Corp / University"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Role Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Your Role *
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 appearance-none"
              >
                {roles.map((r) => (
                  <option key={r} value={r} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Password Strength</span>
                <span className="font-bold">{getStrengthLabel().label}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-full flex-1 transition-colors ${
                      strength >= level ? getStrengthLabel().color : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Terms Checkbox */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
            />
            <label htmlFor="terms" className="ml-2 text-xs text-slate-600 dark:text-slate-400">
              I agree to the <a href="#terms" className="text-indigo-600 dark:text-indigo-400 underline">Terms of Service</a> and <a href="#privacy" className="text-indigo-600 dark:text-indigo-400 underline">Privacy Policy</a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            {loading ? "Creating & Sending OTP..." : "Register & Verify OTP"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
