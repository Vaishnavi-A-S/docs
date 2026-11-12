export type DocRole = 'owner' | 'editor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_color: string;
  role_title: string;
  department?: string;
}

export interface Collaborator {
  id: string;
  role: 'editor' | 'viewer';
  created_at: string;
  user_id: string;
  name: string;
  email: string;
  avatar_color: string;
  role_title: string;
  department?: string;
}

export interface Attachment {
  id: string;
  document_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  uploaded_by: string;
  uploader_name: string;
  created_at: string;
}

export interface VersionSnapshot {
  id: string;
  title: string;
  version_label: string;
  created_at: string;
  saved_by_name: string;
  saved_by_avatar: string;
}

export interface DocumentListItem {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerAvatarColor: string;
  userRole: DocRole;
  isOwner: boolean;
  collaboratorsCount: number;
  attachmentsCount: number;
  createdAt: string;
  updatedAt: string;
  snippet: string;
}

export interface DocumentDetail {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  owner: User;
  userRole: DocRole;
  isOwner: boolean;
  canEdit: boolean;
  collaborators: Collaborator[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}
