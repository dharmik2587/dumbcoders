import { get, post, ApiResponse } from './client';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  studentCode?: string;
  college?: string;
  githubUsername?: string;
  leetcodeUsername?: string;
  githubScore: number;
  leetcodeScore: number;
  participationScore: number;
  resultScore: number;
  composite: number;
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
  meta: {
    scope: string;
    window: string;
    total: number;
  };
}

export interface SubmitPlatformResponse {
  platform: 'leetcode' | 'github';
  stats: Record<string, unknown>;
  message: string;
}

export async function getLeaderboard(params?: {
  scope?: 'global' | 'college' | 'batch';
  window?: 'week' | 'month' | 'all';
}): Promise<LeaderboardResponse> {
  const searchParams = new URLSearchParams();
  if (params?.scope) searchParams.set('scope', params.scope);
  if (params?.window) searchParams.set('window', params.window);

  const query = searchParams.toString();
  const endpoint = `/api/leaderboard${query ? `?${query}` : ''}`;

  return get<ApiResponse<LeaderboardResponse>>(endpoint).then(res => res.data!);
}

export async function submitPlatformUsername(
  platform: 'leetcode' | 'github',
  username: string,
): Promise<SubmitPlatformResponse> {
  return post<ApiResponse<SubmitPlatformResponse>>('/api/leaderboard/submit', {
    platform,
    username,
  }).then(res => res.data!);
}