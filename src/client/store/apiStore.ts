import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as api from '../lib/api';
import * as auth from '../lib/auth';
import type { Builder, Hackathon, Team, Notification, CollabRequest, Project } from '../types';

export type Toast = {
  id: number;
  label: string;
  body: string;
  tone: 'info' | 'good' | 'warn' | 'bad';
  undo?: () => void;
};

export function mapProfileToBuilder(profile: any): Builder {
  if (!profile) return null as any;
  const name = profile.fullName || profile.username || 'Anonymous';
  const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  return {
    id: profile.id,
    studentCode: profile.studentCode,
    handle: profile.username || '',
    name,
    initials,
    college: profile.college?.shortName || profile.college?.name || 'Unknown',
    year: profile.graduationYear ? (profile.graduationYear - 2026 + 1) : 1,
    branch: profile.branch || '',
    city: 'Global',
    role: (profile.rolePreference || 'frontend') as any,
    secondary: [],
    avatar: profile.avatarUrl || undefined,
    avatarUrl: profile.avatarUrl || undefined,
    email: profile.email || undefined,
    goal: 'win',
    bio: profile.bio || '',
    skills: (profile.skills || []).map((s: string) => ({ id: s, label: s, cluster: 'interface', level: 2 })),
    repos: profile.github?.topRepos || [],
    projects: [],
    events: [],
    availability: profile.availability ? [{ day: 6, start: 9, end: 17 }] : [],
    weeklyHours: 10,
    openToTeams: !!profile.isOpenToTeam,
    verified: true,
    lastActive: profile.updatedAt || new Date().toISOString(),
    onboardingDone: !!profile.onboardingDone,
  } as any;
}

export type ConversationWithMessages = {
  conversationId: string;
  other: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
    studentCode?: string;
  };
  messages: Array<{
    id: string;
    senderId: string;
    content: string;
    readAt?: string;
    createdAt: string;
  }>;
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  studentCode?: string;
  college?: string;
  githubScore: number;
  participationScore: number;
  resultScore: number;
  composite: number;
};

type State = {
  // User state
  me: Builder | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Data state
  hackathons: Hackathon[];
  teams: Team[];
  builders: Builder[];
  projects: Project[];
  requests: CollabRequest[];
  notifications: Notification[];
  bookmarks: string[];
  activeTeamId: string | null;
  conversations: ConversationWithMessages[];
  leaderboard: LeaderboardEntry[];
  leaderboardLoading: boolean;

  // UI state
  toasts: Toast[];
  prefs: {
    notifyRequests: boolean;
    notifyDeadlines: boolean;
    notifyMatches: boolean;
    discoverable: boolean;
    showCollege: boolean;
    showRepos: boolean;
    allowRequests: boolean;
  };

  // Actions
  initializeAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: 'github' | 'google', redirectTo?: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, string>) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Record<string, any>) => Promise<any>;
  loadHackathons: (params?: any) => Promise<void>;
  refreshHackathons: () => Promise<void>;
  loadTeams: () => Promise<void>;
  loadBuilders: (params?: any) => Promise<void>;
  loadUser: () => Promise<void>;
  loadRequests: () => Promise<void>;
  loadConversations: () => Promise<void>;
  loadConversationMessages: (conversationId: string) => Promise<void>;
  sendConversationMessage: (conversationId: string, content: string) => Promise<void>;
  startConversation: (toUserId: string) => Promise<string | null>;
  loadLeaderboard: (params?: { scope?: 'global' | 'college' | 'batch'; window?: 'week' | 'month' | 'all' }) => Promise<void>;
  submitPlatformUsername: (platform: 'leetcode' | 'github', username: string) => Promise<boolean>;
  createTeam: (data: any) => Promise<string | null>;
  setActiveTeam: (id: string | null) => void;
  toggleBookmark: (id: string) => Promise<void>;
  sendRequest: (r: Omit<CollabRequest, 'id' | 'createdAt' | 'state'>) => void;
  acceptRequest: (id: string) => void;
  setRequestState: (id: string, state: CollabRequest['state']) => void;
  pushToast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
  setPref: (k: keyof State['prefs'], v: boolean) => void;
  readNotification: (id: string) => void;
  readAllNotifications: () => void;
  moveTask: (projectId: string, taskId: string, column: 'todo' | 'doing' | 'done') => void;
  addTask: (projectId: string, title: string) => void;
  toggleChecklist: (projectId: string, id: string) => void;
  setNotes: (projectId: string, notes: string) => void;
};

let toastSeq = 1;

export const useApiStore = create<State>()(
  persist(
    (set, get) => ({
      // Initial state
      me: null,
      isAuthenticated: false,
      isLoading: true,
      hackathons: [],
      teams: [],
      builders: [],
      projects: [],
      requests: [],
      notifications: [],
      bookmarks: [],
      activeTeamId: null,
      conversations: [],
      leaderboard: [],
      leaderboardLoading: false,
      toasts: [],
      prefs: {
        notifyRequests: true,
        notifyDeadlines: true,
        notifyMatches: true,
        discoverable: true,
        showCollege: true,
        showRepos: true,
        allowRequests: true,
      },

      // Initialize auth on app load
      initializeAuth: async () => {
        try {
          const authState = await auth.getCurrentAuthState();
          if (authState.user) {
            set({
              isAuthenticated: true,
              isLoading: false,
              me: authState.user as Builder,
            });
            try {
              await get().loadUser();
              await get().loadTeams();
              await get().loadConversations();
            } catch (e) {
              // Data loading errors shouldn't block auth init
            }
          } else {
            set({ isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ isAuthenticated: false, isLoading: false });
        }
      },

      // Sign up
      signUp: async (email: string, password: string, metadata?: Record<string, string>) => {
        try {
          await auth.signUp(email, password, metadata);
          const authState = await auth.getCurrentAuthState();
          if (authState.user) {
            set({
              isAuthenticated: true,
              me: authState.user as Builder,
            });
            get().pushToast({
              label: 'Success',
              body: 'Account created successfully',
              tone: 'good',
            });
          }
        } catch (error) {
          console.error('Sign up error:', error);
          get().pushToast({
            label: 'Error',
            body: error instanceof Error ? error.message : 'Failed to sign up',
            tone: 'bad',
          });
          throw error;
        }
      },

      // Sign in
      signIn: async (email: string, password: string) => {
        try {
          await auth.signIn(email, password);
          const authState = await auth.getCurrentAuthState();
          if (authState.user) {
            set({
              isAuthenticated: true,
              me: authState.user as Builder,
            });
            await get().loadUser();
            await get().loadTeams();
            await get().loadConversations();
            get().pushToast({
              label: 'Success',
              body: 'Signed in successfully',
              tone: 'good',
            });
          }
        } catch (error) {
          console.error('Sign in error:', error);
          get().pushToast({
            label: 'Error',
            body: error instanceof Error ? error.message : 'Failed to sign in',
            tone: 'bad',
          });
          throw error;
        }
      },

      // Sign in with OAuth
      signInWithOAuth: async (provider: 'github' | 'google', redirectTo?: string) => {
        try {
          if (provider === 'github') {
            await auth.signInWithGitHub(redirectTo);
          } else {
            await auth.signInWithGoogle(redirectTo);
          }
        } catch (error) {
          console.error('OAuth Sign in error:', error);
          get().pushToast({
            label: 'Error',
            body: error instanceof Error ? error.message : 'OAuth sign in failed',
            tone: 'bad',
          });
          throw error;
        }
      },

      // Sign out
      signOut: async () => {
        try {
          await auth.signOut();
          set({
            isAuthenticated: false,
            me: null,
            teams: [],
            builders: [],
            projects: [],
            requests: [],
            bookmarks: [],
            activeTeamId: null,
            conversations: [],
            leaderboard: [],
          });
          get().pushToast({
            label: 'Success',
            body: 'Signed out successfully',
            tone: 'info',
          });
        } catch (error) {
          console.error('Sign out error:', error);
        }
      },

      // Update user profile in Supabase & database
      updateProfile: async (data: Record<string, any>) => {
        try {
          const updated = await api.updateCurrentUser(data);
          set((s) => ({
            me: s.me ? { ...s.me, ...updated } : updated,
          }));
          get().pushToast({
            label: 'Profile saved',
            body: 'Your profile has been updated.',
            tone: 'good',
          });
          return updated;
        } catch (error) {
          console.error('Failed to update profile:', error);
          get().pushToast({
            label: 'Error',
            body: error instanceof Error ? error.message : 'Failed to update profile',
            tone: 'bad',
          });
          throw error;
        }
      },

      // Load hackathons
      loadHackathons: async (params) => {
        params = { pageSize: 200, status: "published", ...params };
        try {
          const response = await api.listHackathons(params);
          set({ hackathons: response.data || [] });
        } catch (error) {
          console.error('Failed to load hackathons:', error);
        }
      },

      // Refresh hackathons from upstream sources
      refreshHackathons: async () => {
        try {
          await api.refreshHackathons();
          await get().loadHackathons();
          get().pushToast({ label: 'Success', body: 'Hackathon index refreshed.', tone: 'good' });
        } catch (error) {
          console.error('Failed to refresh hackathons:', error);
          get().pushToast({ label: 'Error', body: 'Failed to refresh hackathons.', tone: 'bad' });
        }
      },


      // Load teams
      loadTeams: async () => {
        try {
          const rawTeams = await api.listMyTeams();
          const mappedTeams = (rawTeams || []).map((t: any) => ({
            id: t.id,
            name: t.name,
            hackathonId: t.hackathonId,
            ownerId: t.ownerId || t.leaderId,
            members: t.members || [],
            openSlots: t.openSlots || (t.rolesNeeded || []).map((role: any) => ({ role, note: '' })),
            project: t.project || t.projectName,
            visibility: t.visibility || (t.isOpen ? 'discoverable' : 'private'),
            ...t
          }));
          set({ teams: mappedTeams as any[] });
          if (mappedTeams.length > 0 && !get().activeTeamId) {
            set({ activeTeamId: mappedTeams[0].id });
          }
        } catch (error) {
          console.error('Failed to load teams:', error);
        }
      },

      // Load builders / partner search
      loadBuilders: async (params) => {
        try {
          const response = await api.searchPartners(params);
          set({ builders: (response.data || []).map(mapProfileToBuilder) });
        } catch (error) {
          console.error('Failed to load builders:', error);
        }
      },

      // Load current user
      loadUser: async () => {
        try {
          const user = await api.getCurrentUser();
          set({ me: mapProfileToBuilder(user) });
        } catch (error) {
          console.error('Failed to load user:', error);
        }
      },
      
      loadRequests: async () => {
        try {
          const res = await api.requestsApi.list();
          set({ requests: res.data || [] });
        } catch (error) {
          console.error('Failed to load requests:', error);
        }
      },

      // Load conversations
      loadConversations: async () => {
        try {
          const convs = await api.listConversations();
          set({
            conversations: convs.map((c: any) => ({ ...c, messages: [] })),
          });
        } catch (error) {
          console.error('Failed to load conversations:', error);
        }
      },

      // Load conversation messages
      loadConversationMessages: async (conversationId: string) => {
        try {
          const messages = await api.getConversationMessages(conversationId);
          set((s) => ({
            conversations: s.conversations.map((c) =>
              c.conversationId === conversationId ? { ...c, messages } : c
            ),
          }));
        } catch (error) {
          console.error('Failed to load messages:', error);
        }
      },

      // Send conversation message
      sendConversationMessage: async (conversationId: string, content: string) => {
        try {
          await api.sendMessage(conversationId, content);
          await get().loadConversationMessages(conversationId);
        } catch (error) {
          console.error('Failed to send message:', error);
          get().pushToast({ label: 'Error', body: 'Failed to send message', tone: 'bad' });
        }
      },

      // Start new conversation
      startConversation: async (toUserId: string) => {
        try {
          const result = await api.startConversation(toUserId);
          await get().loadConversations();
          return result.conversationId;
        } catch (error) {
          console.error('Failed to start conversation:', error);
          return null;
        }
      },

      // Load leaderboard
      loadLeaderboard: async (params) => {
        try {
          set({ leaderboardLoading: true });
          const response = await api.getLeaderboard(params);
          set({ leaderboard: response.data, leaderboardLoading: false });
        } catch (error) {
          console.error('Failed to load leaderboard:', error);
          set({ leaderboardLoading: false });
        }
      },

      // Submit platform username (LeetCode / GitHub)
      submitPlatformUsername: async (platform, username) => {
        try {
          const result = await api.submitPlatformUsername(platform, username);
          get().pushToast({ label: 'Linked', body: result.message, tone: 'good' });
          // Refresh leaderboard to show updated scores
          await get().loadLeaderboard();
          return true;
        } catch (error: any) {
          console.error('Failed to submit platform username:', error);
          get().pushToast({
            label: 'Error',
            body: error?.message || `Could not link ${platform} account.`,
            tone: 'bad',
          });
          return false;
        }
      },

      // Create team
      createTeam: async (data) => {
        try {
          const team = await api.createTeam(data);
          await get().loadTeams();
          set({ activeTeamId: team.id });
          get().pushToast({ label: 'Success', body: `Team "${team.name}" created`, tone: 'good' });
          return team.id;
        } catch (error) {
          console.error('Failed to create team:', error);
          get().pushToast({ label: 'Error', body: 'Failed to create team', tone: 'bad' });
          return null;
        }
      },

      // Set active team
      setActiveTeam: (id) => set({ activeTeamId: id }),

      // Toggle bookmark
      toggleBookmark: async (id) => {
        try {
          await api.bookmarkHackathon(id);
          set((s) => ({
            bookmarks: s.bookmarks.includes(id)
              ? s.bookmarks.filter((b) => b !== id)
              : [...s.bookmarks, id],
          }));
        } catch (error) {
          console.error('Failed to toggle bookmark:', error);
        }
      },

      // Send collaboration request (local optimistic update)
      sendRequest: (r) => {
        set((s) => ({
          requests: [
            {
              ...r,
              id: `REQ-${2300 + s.requests.length}`,
              state: 'new',
              createdAt: new Date().toISOString(),
            },
            ...s.requests,
          ],
        }));
      },

      // Set request state
      setRequestState: (id, state) =>
        set((s) => ({
          requests: s.requests.map((r) => (r.id === id ? { ...r, state } : r)),
        })),

      // Accept request
      acceptRequest: (id) => {
        const req = get().requests.find((r) => r.id === id);
        if (!req) return;
        set((s) => ({
          requests: s.requests.map((r) => (r.id === id ? { ...r, state: 'accepted' } : r)),
        }));
      },

      // Toast actions
      pushToast: (t) => {
        const id = toastSeq++;
        set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
        setTimeout(() => get().dismissToast(id), t.undo ? 6000 : 4200);
      },

      dismissToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
        
      setPref: (k, v) =>
        set((s) => ({ prefs: { ...s.prefs, [k]: v } })),

      readNotification: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),

      readAllNotifications: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      moveTask: (projectId, taskId, column) =>
        set((s) => {
          return {
            projects: s.projects.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    tasks: p.tasks.map((t) =>
                      t.id === taskId ? { ...t, column } : t,
                    ),
                  }
                : p,
            ),
          };
        }),

      addTask: (projectId, title) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  tasks: [
                    ...p.tasks,
                    {
                      id: `tk-${Date.now()}`,
                      projectId,
                      title,
                      ownerId: null,
                      column: 'todo' as const,
                    },
                  ],
                }
              : p,
          ),
        })),

      toggleChecklist: (projectId, id) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  checklist: p.checklist.map((c) =>
                    c.id === id ? { ...c, done: !c.done } : c,
                  ),
                }
              : p,
          ),
        })),

      setNotes: (projectId, notes) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === projectId ? { ...p, notes } : p)),
        })),
    }),
    {
      name: 'hackmate.api.state.v1',
      partialize: (s) => {
        const { toasts, hackathons, builders, conversations, leaderboard, ...rest } = s;
        return {
          ...rest,
          teams: s.teams,
          notifications: s.notifications,
        } as never;
      },
    },
  ),
);

const EMPTY_BUILDER: Builder = {
  id: '',
  name: '',
  handle: '',
  initials: '',
  college: '',
  year: 1,
  branch: '',
  city: '',
  role: 'frontend',
  secondary: [],
  goal: 'learn',
  bio: '',
  skills: [],
  repos: [],
  projects: [],
  events: [],
  availability: [],
  weeklyHours: 0,
  openToTeams: false,
  verified: false,
  lastActive: '',
};

export function byIdMap<T extends { id: string }>(items: T[]): Map<string, T> {
  const map = new Map<string, T>();
  items.forEach((item) => map.set(item.id, item));
  return map;
}

export function useMe(): Builder {
  return useApiStore((s) => s.me) ?? EMPTY_BUILDER;
}

export function useActiveTeam(): Team | undefined {
  const id = useApiStore((s) => s.activeTeamId);
  const teams = useApiStore((s) => s.teams);
  return teams.find((t) => t.id === id) ?? teams[0];
}

export function useHackathon(id: string | undefined): Hackathon | undefined {
  const list = useApiStore((s) => s.hackathons);
  return list.find((h) => h.id === id);
}

export function useBuilder(id: string | undefined): Builder | undefined {
  const builders = useApiStore((s) => s.builders);
  return builders.find((b) => b.id === id);
}

