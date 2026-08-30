import { fetcher } from './client';
import type { CollabRequest } from '@/client/types';

export const requestsApi = {
  list: (direction?: 'sent' | 'received') => 
    fetcher.get<{ data: CollabRequest[] }>(`/api/requests${direction ? `?direction=${direction}` : ''}`),
    
  create: (data: { toUserId: string; teamId?: string; hackathonId?: string; message?: string; roleOffered?: string }) => 
    fetcher.post<{ data: CollabRequest }>('/api/requests', data),
    
  respond: (id: string, action: 'accept' | 'decline') => 
    fetcher.post<{ data: CollabRequest }>(`/api/requests/${id}`, { action }),
};
