import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import {
  Building2,
  Lock,
  User,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  HelpCircle,
  FileCheck2,
  Receipt,
  Scale
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, settings } = useFund();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both your username and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(username.trim(), password);
      if (!result.success) {
        setError(result.error || 'Invalid credentials. Please verify your username and password.');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during authentication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col justify-between selection:bg-neutral-800 selection:text-white">
      {/* Top Subtle Bar */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/40 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white text-neutral-950 flex items-center justify-center font-bold shadow-md">
              <Building2 className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <div className="font-bold text-white text-sm sm:text-base tracking-tight leading-tight">
                {settings.buildingName || 'Gulshan View Residency'}
              </div>
              <div className="text-[11px] text-neutral-400">
                Common Management Association (CMA) Portal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Secure Financial System
            </span>
          </div>
        </div>
      </header>

      {/* Main Hero & Login Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Association Governance & Value Props */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-800/80 border border-neutral-700/60 text-neutral-300 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official Association Transparency Portal</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Financial Clarity &amp; Shared Accountability
              </h1>
              <p className="text-sm text-neutral-400 leading-relaxed">
                A unified, audited accounting platform for the Gulshan View Residency Common Management Association. Track annual collections, maintenance expenditures, and individual unit ledgers with complete integrity.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-950/40 border border-neutral-800/70">
                <div className="w-8 h-8 rounded-md bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-white">Audited Unit Ledgers</h2>
                  <p className="text-[11px] text-neutral-400">
                    Transparent record of deposits, 10-share maintenance cost splits, and individual balance statements.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-950/40 border border-neutral-800/70">
                <div className="w-8 h-8 rounded-md bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-white">Itemized Expenditures &amp; Vouchers</h2>
                  <p className="text-[11px] text-neutral-400">
                    Every utility, repair, and operational cost verified with category codes, dates, and vendor details.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-950/40 border border-neutral-800/70">
                <div className="w-8 h-8 rounded-md bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Scale className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-white">Multi-Year Financial Archives</h2>
                  <p className="text-[11px] text-neutral-400">
                    Historical fiscal year records preserved with verified opening balances, net transfers, and closing audits.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-end Login Card */}
          <div className="lg:col-span-6">
            <div className="bg-white text-neutral-900 rounded-2xl shadow-2xl border border-neutral-200/80 p-7 sm:p-8 space-y-6">
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                    Sign In
                  </h2>
                  <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[10px] font-mono font-semibold uppercase tracking-wider">
                    Member Access
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  Enter your credentials to access your unit transparency portal.
                </p>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Username */}
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="Enter assigned username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 text-xs focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 text-xs focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-neutral-400 hover:text-neutral-700 transition-colors"
                      tabIndex={-1}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 active:bg-black text-white font-semibold rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Sign In to Portal</span>
                    </>
                  )}
                </button>
              </form>

              {/* Committee Information Box - Professional, Confidentiality Notice */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 text-[11px] text-neutral-600 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                  <HelpCircle className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Credential Distribution Notice</span>
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  Login credentials have been issued directly to registered flat owners by the Building Management Committee. For account issuance or password assistance, please contact the Committee Administrator:
                </p>
                <div className="pt-1 border-t border-neutral-200 flex flex-wrap items-center justify-between text-[11px]">
                  <span className="font-medium text-neutral-900">
                    {settings.adminName || 'Mahmudul Hasan (Admin)'}
                  </span>
                  <a
                    href={`mailto:${settings.adminEmail || 'mahmudul.ess@gmail.com'}`}
                    className="text-neutral-900 font-medium hover:underline font-mono"
                  >
                    {settings.adminEmail || 'mahmudul.ess@gmail.com'}
                  </a>
                </div>
              </div>

              {/* Security indicator */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected by role-based access control &amp; session verification</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 py-4 px-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {settings.buildingName || 'Gulshan View Residency'} • House 14, Road 28, Gulshan-1, Dhaka-1212
          </span>
          <span>
            Common Management Association (CMA) Financial Records
          </span>
        </div>
      </footer>
    </div>
  );
};
