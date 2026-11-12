import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, ChevronDown, UserCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export const UserSwitcher: React.FC = () => {
  const { currentUser, users, switchUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors bg-white shadow-sm"
        title="Switch simulated user account"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-inner"
          style={{ backgroundColor: currentUser.avatar_color }}
        >
          {currentUser.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1">
            {currentUser.name}
            {currentUser.id === 'user-vaishnavi' && (
              <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.2 rounded font-medium">Candidate</span>
            )}
          </p>
          <p className="text-[10px] text-slate-500 leading-tight">{currentUser.role_title}</p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3.5 py-2 border-b border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Test Persona Switcher
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Switch persona to test permissions and the distinction between owned and shared docs:
            </p>
          </div>

          <div className="py-1">
            {users.map(u => {
              const isSelected = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    isSelected ? 'bg-blue-50/60' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: u.avatar_color }}
                    >
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                        {u.name}
                      </p>
                      <p className="text-[11px] text-slate-500">{u.role_title}</p>
                      <p className="text-[10px] text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              );
            })}
          </div>

          <div className="px-3.5 py-2 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">Reviewer tip:</span> Switching to Alex or Priya verifies View-only and Editor role enforcement.
          </div>
        </div>
      )}
    </div>
  );
};
