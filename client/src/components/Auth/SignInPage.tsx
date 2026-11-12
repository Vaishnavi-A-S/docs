import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import {
  FileText,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  Key,
  Users,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const SignInPage: React.FC = () => {
  const { users, login, isLoading } = useAuth();
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
    <div className="min-h-screen bg-[#f0f4f9] flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* Top Header Strip */}
      <header className="px-6 sm:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#1a73e8] text-white flex items-center justify-center shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg text-slate-800 tracking-tight">Ajaia Docs</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Internal Workspace SSO</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left: Quick 1-Click Persona Cards */}
          <div className="p-8 md:p-10 md:w-7/12 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1a73e8] text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>One-Click Team Authentication</span>
              </div>

              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Sign in to your workspace
              </h1>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Choose one of the 4 seeded team members to test document editing and permissions, or use the email form.
              </p>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
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
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group hover:border-[#1a73e8] hover:shadow-md ${
                        isCandidate
                          ? 'border-blue-200 bg-blue-50/40 hover:bg-blue-50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0"
                          style={{ backgroundColor: u.avatar_color }}
                        >
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-900 group-hover:text-[#1a73e8] transition-colors">
                              {u.name}
                            </p>
                            {isCandidate && (
                              <span className="text-[10px] font-semibold bg-[#1a73e8] text-white px-2 py-0.2 rounded-full">
                                Candidate
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium">{u.role_title}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-[#1a73e8] font-semibold pl-2">
                        {isLoggingThis ? (
                          <span className="text-[11px] text-blue-600 animate-pulse">Entering...</span>
                        ) : (
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#1a73e8] group-hover:translate-x-0.5 transition-all" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Ajaia LLC • Assessment Build</span>
              <span>Candidate: Vaishnavi A S</span>
            </div>
          </div>

          {/* Right: Manual Credentials Form */}
          <div className="p-8 md:p-10 md:w-5/12 bg-slate-50/70 flex flex-col justify-center">
            <h2 className="text-sm font-bold text-slate-800">
              Or Sign In With Email
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Enter any of the team email addresses
            </p>

            <form onSubmit={handleFormLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="vaishnavi@ajaia.io"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="password123"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent text-slate-800"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Default demo password: <code>password123</code></p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign in to Docs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Reviewer Accounts:
              </p>
              <p>• <strong>Vaishnavi:</strong> <code>vaishnavi@ajaia.io</code></p>
              <p>• <strong>Alex (Lead):</strong> <code>alex.rivera@ajaia.io</code></p>
              <p>• <strong>Priya (Viewer):</strong> <code>priya.sharma@ajaia.io</code></p>
              <p>• <strong>Marcus (Sec):</strong> <code>marcus.chen@ajaia.io</code></p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400">
        © 2026 Ajaia LLC. All rights reserved. • AI-Native Collaborative Document Editor
      </footer>
    </div>
  );
};
