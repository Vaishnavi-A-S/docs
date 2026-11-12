import React, { useState } from 'react';
import { Collaborator, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { shareDocument, revokeShare } from '../../services/api';
import { X, UserPlus, Trash2, Shield, Copy, Check, Lock, Globe } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  docId: string;
  docTitle: string;
  owner: User;
  isOwner: boolean;
  collaborators: Collaborator[];
  onCollaboratorsUpdated: (collabs: Collaborator[]) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  docId,
  docTitle,
  owner,
  isOwner,
  collaborators,
  onCollaboratorsUpdated
}) => {
  const { users, currentUser } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // Filter out the owner and already added collaborators for quick selection
  const existingUserIds = new Set([owner.id, ...collaborators.map(c => c.user_id)]);
  const availableUsers = users.filter(u => !existingUserIds.has(u.id));

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedUserId && !customEmail.trim()) {
      setErrorMessage('Please select a team member or enter an email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: { userId?: string; email?: string; role: 'viewer' | 'editor' } = {
        role
      };

      if (selectedUserId) {
        payload.userId = selectedUserId;
      } else {
        payload.email = customEmail.trim();
      }

      const updated = await shareDocument(docId, payload);
      onCollaboratorsUpdated(updated);
      setSelectedUserId('');
      setCustomEmail('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to share document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (targetUserId: string) => {
    if (!window.confirm('Revoke access for this collaborator?')) return;
    try {
      const updated = await revokeShare(docId, targetUserId);
      onCollaboratorsUpdated(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to revoke access');
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: 'viewer' | 'editor') => {
    try {
      const updated = await shareDocument(docId, { userId: targetUserId, role: newRole });
      onCollaboratorsUpdated(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to change role');
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" /> Share "{docTitle}"
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage permissions and team access</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              {errorMessage}
            </div>
          )}

          {/* Add People Section (Owner only) */}
          {isOwner ? (
            <form onSubmit={handleShare} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Add collaborators</label>
              
              <div className="flex flex-col sm:flex-row gap-2">
                {availableUsers.length > 0 ? (
                  <select
                    value={selectedUserId}
                    onChange={e => {
                      setSelectedUserId(e.target.value);
                      if (e.target.value) setCustomEmail('');
                    }}
                    className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select team member...</option>
                    {availableUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) — {u.role_title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="email"
                    placeholder="Enter email (e.g. colleague@ajaia.io)"
                    value={customEmail}
                    onChange={e => setCustomEmail(e.target.value)}
                    className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}

                <select
                  value={role}
                  onChange={e => setRole(e.target.value as 'editor' | 'viewer')}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="editor">Editor (Can edit)</option>
                  <option value="viewer">Viewer (Read only)</option>
                </select>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Adding...' : 'Share'}</span>
                </button>
              </div>

              {availableUsers.length > 0 && (
                <div className="text-[11px] text-slate-400">
                  Or enter external email:{' '}
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={customEmail}
                    onChange={e => {
                      setCustomEmail(e.target.value);
                      if (e.target.value) setSelectedUserId('');
                    }}
                    className="ml-1 border-b border-slate-300 focus:outline-none focus:border-blue-500 px-1 py-0.5 text-slate-700"
                  />
                </div>
              )}
            </form>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
              Only the document owner (<strong>{owner.name}</strong>) can grant or alter access permissions.
            </div>
          )}

          {/* People with Access */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              People with access
            </h3>

            <div className="space-y-2 divide-y divide-slate-100">
              {/* Owner Item */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: owner.avatar_color }}
                  >
                    {owner.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      {owner.name}
                      {owner.id === currentUser?.id && (
                        <span className="text-[10px] text-slate-400">(you)</span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500">{owner.email}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  Owner
                </span>
              </div>

              {/* Collaborators Items */}
              {collaborators.map(c => (
                <div key={c.id} className="flex items-center justify-between pt-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: c.avatar_color }}
                    >
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        {c.name}
                        {c.user_id === currentUser?.id && (
                          <span className="text-[10px] text-slate-400">(you)</span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500">{c.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner ? (
                      <select
                        value={c.role}
                        onChange={e => handleRoleChange(c.user_id, e.target.value as 'viewer' | 'editor')}
                        className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700 font-medium"
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded capitalize">
                        {c.role}
                      </span>
                    )}

                    {isOwner && (
                      <button
                        onClick={() => handleRevoke(c.user_id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Revoke access"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {collaborators.length === 0 && (
                <p className="text-xs text-slate-400 py-3 text-center italic">
                  No other collaborators yet. This document is private to {owner.name}.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={copyShareLink}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg bg-white shadow-sm hover:bg-slate-50 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-medium px-4 py-1.5 rounded-lg text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
