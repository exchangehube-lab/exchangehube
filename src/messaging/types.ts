export interface ChannelMessage {
  id: string;
  channel_id: string;
  sender_uid: string;
  content: string;
  message_type?: 'text' | 'image' | 'file' | 'video' | 'audio' | 'voice';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  thumbnail_url?: string;
  voice_url?: string;
  voice_duration?: number;
  reactions?: Record<string, string[]>;
  reply_to?: string;
  created_at: string;
  updated_at?: string;
  edited?: boolean;
  edited_at?: string;
  deleted?: boolean;
  deleted_for_all?: boolean;
  forwarded_from?: string;
  pinned?: boolean;
}

export interface PersonalMessage {
  id: string;
  conversation_id: string;
  sender_uid: string;
  content: string;
  message_type?: 'text' | 'image' | 'file' | 'video' | 'audio' | 'voice';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  thumbnail_url?: string;
  voice_url?: string;
  voice_duration?: number;
  reactions?: Record<string, string[]>;
  reply_to?: string;
  created_at: string;
  updated_at?: string;
  edited?: boolean;
  edited_at?: string;
  deleted?: boolean;
  deleted_for_all?: boolean;
  forwarded_from?: string;
  pinned?: boolean;
  is_read: boolean;
  delivered?: boolean;
  delivered_at?: string;
  seen?: boolean;
  seen_at?: string;
}

export interface UserPresence {
  id: string;
  uid: string;
  is_online: boolean;
  last_seen: string;
}

export interface TypingStatus {
  id: string;
  channel_id?: string;
  conversation_id?: string;
  uid: string;
  is_typing: boolean;
  updated_at: string;
}

export interface Notification {
  id: string;
  uid: string;
  type: string;
  content: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}
