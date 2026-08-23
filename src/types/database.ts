import type { College, GithubData, Hackathon, HackathonSource, Notification, Profile, Team, TeamMember, TeamRequest } from '@/lib/db/schema/core';

export type { College, GithubData, Hackathon, HackathonSource, Notification, Profile, Team, TeamMember, TeamRequest };

export type PublicProfile = Pick<Profile, 'username' | 'fullName' | 'avatarUrl' | 'bio' | 'branch' | 'graduationYear' | 'skills' | 'rolePreference' | 'hackathonInterests' | 'availability' | 'portfolioUrl' | 'linkedinUrl' | 'profileComplete' | 'isOpenToTeam'> & {
  college: Pick<College, 'name' | 'shortName'> | null;
  github: Pick<GithubData, 'username' | 'profileUrl' | 'avatarUrl' | 'publicRepos' | 'followers' | 'languages' | 'syncedAt'> | null;
};
