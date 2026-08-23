import Link from 'next/link';
import { hasCoreDatabase } from '@/lib/db/core';
import { getTeamById, isTeamMember } from '@/lib/db/queries/teams';
import { getOptionalUserId } from '@/lib/auth/server';
import { TeamChat } from '@/components/chat/TeamChat';
import { notFound } from 'next/navigation';

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasCoreDatabase()) {
    return <div className="px-6 py-20 text-center text-slate-500">Database is not configured.</div>;
  }

  const teamId = (await params).id;
  const team = await getTeamById(teamId);
  if (!team) notFound();

  const userId = await getOptionalUserId();
  const isMember = userId ? await isTeamMember(teamId, userId) : false;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-8">
      <Link href="/teams/my" className="text-sm font-semibold text-blue-700 hover:underline">
        ← My teams
      </Link>

      <section className="rounded-3xl bg-slate-950 px-8 py-10 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-blue-500/20 px-3 py-1 font-mono text-xs text-blue-300 uppercase tracking-wider">
            {team.team.status}
          </span>
          <span className="text-sm text-slate-400">
            {team.team.isOpen ? '• Open to applications' : '• Closed roster'}
          </span>
        </div>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight">{team.team.name}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          {team.team.description ?? 'This team has not added a description yet.'}
        </p>
      </section>

      {/* Team Members */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Roster Members</h2>
          <span className="text-xs font-semibold text-slate-500">
            {team.members.length} of {team.team.maxMembers} slots filled
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {team.members.map(({ member, profile }) => (
            <Link
              href={`/profile/${profile.username}`}
              key={member.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <div>
                <p className="font-bold text-slate-900">{profile.fullName ?? profile.username}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {member.role ?? 'Member'} · @{profile.username}
                </p>
              </div>
              {profile.studentCode && (
                <span className="font-mono text-[11px] rounded bg-blue-50 border border-blue-200/60 px-2 py-0.5 font-semibold text-blue-700">
                  {profile.studentCode}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Team Realtime Chat (Neon Database) */}
      {isMember && userId && (
        <section className="pt-2">
          <TeamChat teamId={teamId} currentUserId={userId} />
        </section>
      )}
    </div>
  );
}
