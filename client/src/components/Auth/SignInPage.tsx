import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import {
  FileText,
  ArrowRight,
  ShieldCheck,
  Mail,
  Key,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';

export const SignInPage: React.FC = () => {
  const { users, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePersonaLogin = async (user: User) => {
    try {
      setIsSubmitting(true);
      setError('');
      setSelectedPersonaId(user.id);
      await login({ userId: user.id });
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setSelectedPersonaId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your corporate email');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await login({ email: email.trim(), password });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00091f] text-[#f1f7ff] flex flex-col justify-between selection:bg-[#97c2f8] selection:text-[#001d6b] font-sans relative overflow-hidden">
      {/* Cosmic background radial glow matching ajaia.ai */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% -10%, rgba(0, 29, 107, 0.6) 0%, rgba(0, 9, 31, 0.95) 60%, #00060f 100%)'
        }}
      />
      <div
        className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
      />

      {/* Top Header Strip */}
      <header className="px-6 sm:px-12 py-5 flex items-center justify-between relative z-10 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Ajaia Logo with Sky Accent */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#001d6b] to-[#1a73e8] border border-[#97c2f8]/40 text-[#97c2f8] flex items-center justify-center shadow-lg shadow-blue-900/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">AJAIA</span>
              <span className="text-xs font-semibold text-[#97c2f8] tracking-widest uppercase">DOCS</span>
            </div>
            <p className="text-[10px] text-[#aebfe2] tracking-wide hidden sm:block">
              AI Strategy, Engineering & Enterprise Enablement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#97c2f8] font-medium bg-[#001244]/80 px-3 py-1.5 rounded-full border border-[#97c2f8]/20">
          <ShieldCheck className="w-4 h-4 text-[#97c2f8]" />
          <span>SOC 2 & HIPAA Secure</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-4xl bg-[#001244]/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#97c2f8]/20 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left: Quick 1-Click Persona Cards */}
          <div className="p-8 md:p-10 md:w-7/12 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#001d6b] text-[#97c2f8] text-xs font-semibold mb-4 border border-[#97c2f8]/30">
                <Sparkles className="w-3.5 h-3.5 text-[#97c2f8]" />
                <span>One-Click Enterprise SSO</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                Sign in to Ajaia Workspace
              </h1>
              <p className="text-xs text-[#aebfe2] mt-2 leading-relaxed">
                Experience Ajaia's collaborative AI-native documentation system. Select an internal persona or authenticate via corporate email.
              </p>

              {error && (
                <div className="mt-4 p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 4 Seeded Persona Cards */}
              <div className="mt-5 space-y-2.5">
                {users.map(u => {
                  const isLoggingThis = isSubmitting && selectedPersonaId === u.id;
                  const isCandidate = u.id === 'user-vaishnavi';

                  return (
                    <button
                      key={u.id}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handlePersonaLogin(u)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                        isCandidate
                          ? 'border-[#97c2f8]/50 bg-[#001d6b]/60 hover:bg-[#001d6b] hover:shadow-lg hover:shadow-blue-900/30'
                          : 'border-white/10 bg-[#00091f]/60 hover:bg-[#001d6b]/40 hover:border-[#97c2f8]/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0 border border-white/20"
                          style={{ backgroundColor: u.avatar_color }}
                        >
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-white group-hover:text-[#97c2f8] transition-colors">
                              {u.name}
                            </p>
                            {isCandidate && (
                              <span className="text-[10px] font-semibold bg-[#97c2f8] text-[#001d6b] px-2 py-0.2 rounded-full">
                                Candidate Author
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#aebfe2] font-medium">{u.role_title}</p>
                          <p className="text-[10px] text-[#8093c4]">{u.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-[#97c2f8] font-semibold pl-2">
                        {isLoggingThis ? (
                          <span className="text-[11px] text-[#97c2f8] animate-pulse">Entering...</span>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-[#001d6b] group-hover:bg-[#97c2f8] group-hover:text-[#001d6b] flex items-center justify-center transition-colors">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-[#8093c4] flex items-center justify-between">
              <span>Ajaia LLC • Assessment Build</span>
              <span className="text-[#97c2f8]">Candidate: Vaishnavi A S</span>
            </div>
          </div>

          {/* Right: Manual Credentials Form */}
          <div className="p-8 md:p-10 md:w-5/12 bg-[#00091f]/80 flex flex-col justify-center">
            <h2 className="text-sm font-bold text-white">
              Manual Corporate Sign-In
            </h2>
            <p className="text-xs text-[#aebfe2] mt-1 mb-5">
              Enter any seeded email address
            </p>

            <form onSubmit={handleFormLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#aebfe2] mb-1">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8093c4] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="vaishnavi@ajaia.io"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#001244] border border-[#97c2f8]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#97c2f8] text-white placeholder:text-[#8093c4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#aebfe2] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#8093c4] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="password123"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#001244] border border-[#97c2f8]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#97c2f8] text-white placeholder:text-[#8093c4]"
                  />
                </div>
                <p className="text-[10px] text-[#8093c4] mt-1">Default demo password: <code className="text-[#97c2f8]">password123</code></p>
              </div>

              {/* Authentic Ajaia CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#97c2f8] hover:bg-[#c4dcfb] text-[#001d6b] rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Enter Ajaia Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-3 bg-[#001244] rounded-xl border border-white/5 text-[11px] text-[#aebfe2] space-y-1">
              <p className="font-semibold text-[#97c2f8] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Ajaia Team Directory:
              </p>
              <p>• <strong>Vaishnavi:</strong> <code>vaishnavi@ajaia.io</code></p>
              <p>• <strong>Alex (Partner):</strong> <code>alex.rivera@ajaia.io</code></p>
              <p>• <strong>Priya (Client):</strong> <code>priya.sharma@ajaia.io</code></p>
              <p>• <strong>Marcus (Gov):</strong> <code>marcus.chen@ajaia.io</code></p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-5 text-xs text-[#8093c4] relative z-10 border-t border-white/5">
        © 2026 Ajaia LLC • Turning AI into Measurable Business Impact
      </footer>
    </div>
  );
};
