import { User, DocumentListItem, DocumentDetail, Collaborator, Attachment, VersionSnapshot } from '../types';

let currentUserId = localStorage.getItem('ajaia_active_user_id') || 'user-vaishnavi';

export function setActiveUserHeader(userId: string) {
  currentUserId = userId;
  localStorage.setItem('ajaia_active_user_id', userId);
}

export function getActiveUserId(): string {
  return currentUserId;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
  const headers = new Headers(options.headers || {});
  headers.set('x-user-id', currentUserId);

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || (data.details ? data.details[0]?.message : 'Request failed');
    throw new Error(errorMsg);
  }

  return data;
}

// Users & Auth
export async function getUsers(): Promise<User[]> {
  const data = await fetchWithAuth('/api/users');
  return data.users;
}

export async function loginUser(credentials: { email?: string; password?: string; userId?: string }): Promise<User> {
  const res = await fetchWithAuth('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  if (res.user) {
    setActiveUserHeader(res.user.id);
  }
  return res.user;
}

export async function logoutUser(): Promise<void> {
  await fetchWithAuth('/api/auth/logout', { method: 'POST' }).catch(() => {});
  localStorage.removeItem('ajaia_active_user_id');
}

// Documents
export async function getDocuments(tab: string = 'all', search: string = ''): Promise<DocumentListItem[]> {
  const params = new URLSearchParams();
  if (tab && tab !== 'all') params.set('tab', tab);
  if (search) params.set('search', search);

  const url = `/api/documents?${params.toString()}`;
  const data = await fetchWithAuth(url);
  return data.documents;
}

export async function getDocument(id: string): Promise<DocumentDetail> {
  const data = await fetchWithAuth(`/api/documents/${id}`);
  return data.document;
}

export async function createDocument(data: { title: string; content?: string }): Promise<DocumentDetail> {
  const res = await fetchWithAuth('/api/documents', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res.document;
}

export async function updateDocument(
  id: string,
  data: { title?: string; content?: string; createSnapshot?: boolean; snapshotLabel?: string }
): Promise<{ title?: string; content?: string; updatedAt: string }> {
  const res = await fetchWithAuth(`/api/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return res.document;
}

export async function deleteDocument(id: string): Promise<void> {
  await fetchWithAuth(`/api/documents/${id}`, {
    method: 'DELETE'
  });
}

// Sharing
export async function shareDocument(
  id: string,
  payload: { userId?: string; email?: string; role: 'viewer' | 'editor' }
): Promise<Collaborator[]> {
  const res = await fetchWithAuth(`/api/documents/${id}/share`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res.collaborators;
}

export async function revokeShare(id: string, targetUserId: string): Promise<Collaborator[]> {
  const res = await fetchWithAuth(`/api/documents/${id}/share/${targetUserId}`, {
    method: 'DELETE'
  });
  return res.collaborators;
}

// Files & Imports
export async function importFileAsDocument(file: File): Promise<DocumentDetail> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetchWithAuth('/api/files/import', {
    method: 'POST',
    body: formData
  });
  return res.document;
}

export async function uploadAttachment(docId: string, file: File): Promise<Attachment[]> {
  const formData = new FormData();
  formData.append('attachment', file);

  const res = await fetchWithAuth(`/api/files/documents/${docId}/attachments`, {
    method: 'POST',
    body: formData
  });
  return res.attachments;
}

export async function deleteAttachment(docId: string, attachmentId: string): Promise<Attachment[]> {
  const res = await fetchWithAuth(`/api/files/documents/${docId}/attachments/${attachmentId}`, {
    method: 'DELETE'
  });
  return res.attachments;
}

export function getAttachmentDownloadUrl(docId: string, attachmentId: string): string {
  return `/api/files/documents/${docId}/attachments/${attachmentId}/download?userId=${currentUserId}`;
}

// Versions
export async function getDocumentVersions(docId: string): Promise<VersionSnapshot[]> {
  const res = await fetchWithAuth(`/api/documents/${docId}/versions`);
  return res.versions;
}

export async function restoreDocumentVersion(docId: string, versionId: string): Promise<{ title: string; content: string }> {
  const res = await fetchWithAuth(`/api/documents/${docId}/versions/${versionId}/restore`, {
    method: 'POST'
  });
  return res;
}
