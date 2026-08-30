import { get, post, ApiResponse } from './client';

export interface Conversation {
  conversationId: string;
  other: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
    studentCode?: string;
  };
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt?: string;
  createdAt: string;
}

export async function listConversations(): Promise<Conversation[]> {
  return get<ApiResponse<Conversation[]>>('/api/messages').then(res => res.data!);
}

export async function startConversation(toUserId: string): Promise<{ conversationId: string }> {
  return post<ApiResponse<{ conversationId: string }>>('/api/messages', { toUserId }).then(res => res.data!);
}

export async function getConversationMessages(conversationId: string): Promise<DirectMessage[]> {
  return get<ApiResponse<DirectMessage[]>>(`/api/messages/${conversationId}`).then(res => res.data!);
}

export async function sendMessage(conversationId: string, content: string): Promise<void> {
  return post(`/api/messages/${conversationId}`, { content });
}