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
      setErrorMessage(err.message || 'Failed to share deliverable');
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
    <div className="fixed inset-0 bg-[#00060f]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 select-none">
      <div className="bg-[#001244] rounded-3xl shadow-2xl border border-[#97c2f8]/30 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] text-[#f1f7ff]">
        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-white/10">
          <div>
            <h2 className="text-[17px] font-bold text-[#f1f7ff] truncate max-w-md">
              Share "{docTitle}"
            </h2>
            <p className="text-[11px] text-[#aebfe2]">Manage RBAC permissions and team collaboration</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#aebfe2] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 rounded-xl text-xs">
              {errorMessage}
            </div>
          )}

          {/* Add People Input Box */}
          {isOwner ? (
            <form onSubmit={handleShare} className="space-y-2">
              <div className="flex items-center gap-2 border border-[#97c2f8]/30 focus-within:border-[#97c2f8] focus-within:ring-2 focus-within:ring-[#97c2f8]/20 rounded-xl px-3 py-1.5 bg-[#00091f] transition-all">
                {availableUsers.length > 0 ? (
                  <select
                    value={selectedUserId}
                    onChange={e => {
                      setSelectedUserId(e.target.value);
                      if (e.target.value) setCustomEmail('');
                    }}
                    className="flex-1 text-xs text-[#f1f7ff] bg-transparent focus:outline-none cursor-pointer py-1"
                  >
                    <option value="" className="bg-[#00091f] text-[#aebfe2]">Select team member or colleague...</option>
                    {availableUsers.map(u => (
                      <option key={u.id} value={u.id} className="bg-[#001244] text-[#f1f7ff]">
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
                    className="flex-1 text-xs text-[#f1f7ff] bg-transparent focus:outline-none py-1 placeholder:text-[#aebfe2]/50"
                  />
                )}

                <select
                  value={role}
                  onChange={e => setRole(e.target.value as 'editor' | 'viewer')}
                  className="text-xs font-semibold text-[#97c2f8] bg-[#001d6b] border border-[#97c2f8]/40 rounded-lg px-2.5 py-1 focus:outline-none"
                >
                  <option value="editor" className="bg-[#001244] text-[#f1f7ff]">Editor</option>
                  <option value="viewer" className="bg-[#001244] text-[#f1f7ff]">Viewer</option>
                </select>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#97c2f8] hover:bg-[#c4dcfb] text-[#00091f] text-xs font-bold px-3 py-1 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-[#00091f] border border-[#97c2f8]/20 rounded-xl text-xs text-[#aebfe2]">
              Only the document author (<strong>{owner.name}</strong>) can grant or revoke collaborator permissions.
            </div>
          )}

          {/* People with Access */}
          <div>
            <h3 className="text-xs font-bold text-[#97c2f8] uppercase tracking-wider mb-2">
              People with access
            </h3>

            <div className="space-y-2 divide-y divide-white/5">
              {/* Owner Item */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md border border-[#97c2f8]/40"
                    style={{ backgroundColor: owner.avatar_color }}
                  >
                    {owner.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#f1f7ff] flex items-center gap-1.5">
                      {owner.name}
                      {owner.id === currentUser?.id && (
                        <span className="text-[10px] text-[#97c2f8] font-normal">(you)</span>
                      )}
                    </p>
                    <p className="text-[11px] text-[#aebfe2]">{owner.email}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#97c2f8] bg-[#001d6b] px-2.5 py-0.5 rounded-full border border-[#97c2f8]/30">
                  Author
                </span>
              </div>

              {/* Collaborators */}
              {collaborators.map(c => (
                <div key={c.id} className="flex items-center justify-between pt-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md border border-[#97c2f8]/40"
                      style={{ backgroundColor: c.avatar_color }}
                    >
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#f1f7ff] flex items-center gap-1.5">
                        {c.name}
                        {c.user_id === currentUser?.id && (
                          <span className="text-[10px] text-[#97c2f8] font-normal">(you)</span>
                        )}
                      </p>
                      <p className="text-[11px] text-[#aebfe2]">{c.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner ? (
                      <select
                        value={c.role}
                        onChange={e => handleRoleChange(c.user_id, e.target.value as 'viewer' | 'editor')}
                        className="text-xs border border-[#97c2f8]/30 rounded-lg px-2 py-1 bg-[#00091f] text-[#f1f7ff] font-medium focus:outline-none"
                      >
                        <option value="editor" className="bg-[#001244] text-[#f1f7ff]">Editor</option>
                        <option value="viewer" className="bg-[#001244] text-[#f1f7ff]">Viewer</option>
                      </select>
                    ) : (
                      <span className="text-xs font-semibold text-[#97c2f8] bg-[#001d6b] px-2.5 py-0.5 rounded-full border border-[#97c2f8]/30 capitalize">
                        {c.role}
                      </span>
                    )}

                    {isOwner && (
                      <button
                        onClick={() => handleRevoke(c.user_id)}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
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

          {/* General Access Section */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-[#97c2f8] uppercase tracking-wider mb-2">
              Access Governance
            </h3>
            <div className="p-3 bg-[#00091f] rounded-2xl border border-[#97c2f8]/20 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#001d6b] text-[#97c2f8] border border-[#97c2f8]/30 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-[#f1f7ff]">Restricted Corporate Perimeter</p>
                <p className="text-[11px] text-[#aebfe2]">
                  Only verified members with explicit RBAC grants can view or edit this deliverable.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#00091f] border-t border-[#97c2f8]/20 flex items-center justify-between">
          <button
            onClick={copyShareLink}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#97c2f8] hover:text-white bg-[#001d6b] hover:bg-[#001d6b]/80 border border-[#97c2f8]/30 px-3.5 py-2 rounded-full transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <LinkIcon className="w-4 h-4" />}
            <span>{copiedLink ? 'Link copied' : 'Copy link'}</span>
          </button>

          <button
            onClick={onClose}
            className="bg-[#97c2f8] hover:bg-[#c4dcfb] text-[#00091f] font-bold px-5 py-2 rounded-full text-xs transition-colors shadow-md shadow-blue-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
