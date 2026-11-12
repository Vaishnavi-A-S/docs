import React, { useState } from 'react';
import { Collaborator, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { shareDocument, revokeShare } from '../../services/api';
import { X, Lock, Link as LinkIcon, Check, Trash2, Shield, UserPlus, Globe, HelpCircle } from 'lucide-react';

interface GoogleDocsShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  docId: string;
  docTitle: string;
  owner: User;
  isOwner: boolean;
  collaborators: Collaborator[];
  onCollaboratorsUpdated: (collabs: Collaborator[]) => void;
}

export const GoogleDocsShareDialog: React.FC<GoogleDocsShareDialogProps> = ({
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
    if (!window.confirm('Remove access for this collaborator?')) return;
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 select-none">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-[#1f1f1f] truncate max-w-md">
            Share "{docTitle}"
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-2 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {errorMessage}
            </div>
          )}

          {/* Add People Input Box */}
          {isOwner ? (
            <form onSubmit={handleShare} className="space-y-2">
              <div className="flex items-center gap-2 border border-slate-300 focus-within:border-[#1a73e8] focus-within:ring-2 focus-within:ring-blue-100 rounded-xl px-3 py-1.5 bg-white transition-all">
                {availableUsers.length > 0 ? (
                  <select
                    value={selectedUserId}
                    onChange={e => {
                      setSelectedUserId(e.target.value);
                      if (e.target.value) setCustomEmail('');
                    }}
                    className="flex-1 text-xs text-[#1f1f1f] bg-transparent focus:outline-none cursor-pointer py-1"
                  >
                    <option value="">Select team member or colleague...</option>
                    {availableUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) — {u.role_title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="email"
                    placeholder="Add by email (e.g. alex.rivera@ajaia.io)"
                    value={customEmail}
                    onChange={e => setCustomEmail(e.target.value)}
                    className="flex-1 text-xs text-[#1f1f1f] bg-transparent focus:outline-none py-1"
                  />
                )}

                <select
                  value={role}
                  onChange={e => setRole(e.target.value as 'editor' | 'viewer')}
                  className="text-xs font-semibold text-[#1f1f1f] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
              Only the document owner (<strong>{owner.name}</strong>) can grant or revoke collaborator permissions.
            </div>
          )}

          {/* People with Access */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              People with access
            </h3>

            <div className="space-y-2 divide-y divide-slate-100">
              {/* Owner Item */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs"
                    style={{ backgroundColor: owner.avatar_color }}
                  >
                    {owner.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      {owner.name}
                      {owner.id === currentUser?.id && (
                        <span className="text-[10px] text-slate-400 font-normal">(you)</span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500">{owner.email}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  Owner
                </span>
              </div>

              {/* Collaborators */}
              {collaborators.map(c => (
                <div key={c.id} className="flex items-center justify-between pt-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs"
                      style={{ backgroundColor: c.avatar_color }}
                    >
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        {c.name}
                        {c.user_id === currentUser?.id && (
                          <span className="text-[10px] text-slate-400 font-normal">(you)</span>
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
                        className="text-xs border border-slate-300 rounded-lg px-2 py-1 bg-white text-slate-800 font-medium focus:outline-none"
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
                        title="Remove access"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Google Docs General Access Section */}
          <div className="pt-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              General access
            </h3>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-800">Restricted</p>
                <p className="text-[11px] text-slate-500">
                  Only people with granted access can open with the link
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={copyShareLink}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1a73e8] hover:bg-blue-50 border border-slate-300 px-3.5 py-2 rounded-full bg-white transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <LinkIcon className="w-4 h-4" />}
            <span>{copiedLink ? 'Link copied' : 'Copy link'}</span>
          </button>

          <button
            onClick={onClose}
            className="bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold px-5 py-2 rounded-full text-xs transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
