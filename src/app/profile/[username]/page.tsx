import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { hasCoreDatabase } from '@/lib/db/core';
import { getStudentByAnyKey } from '@/lib/profile/student';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  if (!hasCoreDatabase()) return { title: username };
  const result = await getStudentByAnyKey(username);
  return { title: result?.profile.fullName ?? username, description: result?.profile.bio ?? 'HackMate profile' };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  if (!hasCoreDatabase()) notFound();
  const result = await getStudentByAnyKey(username);
  if (!result) notFound();

  const { profile, college, github } = result;
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
        <div className="bg-slate-950 px-8 py-12 text-white sm:px-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt="" width={96} height={96} className="h-24 w-24 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-500 text-3xl font-bold">
                  {(profile.fullName ?? profile.username).slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-blue-300">@{profile.username}</p>
                  {profile.studentCode && (
                    <span className="font-mono text-xs rounded-md bg-blue-500/20 border border-blue-400/40 px-2 py-0.5 font-bold text-blue-200 uppercase">
                      Code: {profile.studentCode}
                    </span>
                  )}
                </div>
                <h1 className="mt-2 text-4xl font-bold">{profile.fullName ?? 'HackMate builder'}</h1>
                <p className="mt-2 text-slate-300">{college?.name ?? profile.branch ?? 'Student builder'}</p>
              </div>
            </div>

            {profile.rolePreference && (
              <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center sm:text-right">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Preferred Role</span>
                <p className="text-base font-bold text-white mt-0.5">{profile.rolePreference}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-10 px-8 py-10 sm:px-12 md:grid-cols-[1fr_280px]">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">About</h2>
            <p className="mt-4 leading-7 text-slate-600">{profile.bio || 'This builder has not added a bio yet.'}</p>

            <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-slate-400">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.length ? (
                profile.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">No skills listed yet.</span>
              )}
            </div>

            {profile.hackathonInterests.length > 0 && (
              <>
                <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-slate-400">Hackathon Interests</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.hackathonInterests.map((interest) => (
                    <span key={interest} className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
                      {interest}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <aside className="rounded-2xl bg-slate-50 p-5 space-y-6">
            <div>
              <p className="text-sm font-semibold text-slate-500">Profile completeness</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{profile.profileComplete}%</p>
            </div>

            {profile.availability && (
              <div className="border-t border-slate-200 pt-5">
                <p className="text-sm font-semibold text-slate-500">Availability</p>
                <p className="mt-1 text-sm font-medium text-slate-800">{profile.availability}</p>
              </div>
            )}

            {github && (
              <div className="border-t border-slate-200 pt-5">
                <p className="text-sm font-semibold text-slate-500">GitHub</p>
                <a href={github.profileUrl ?? '#'} target="_blank" rel="noreferrer" className="mt-2 block font-semibold text-blue-700 hover:underline">
                  @{github.username}
                </a>
                <p className="mt-1 text-xs text-slate-600">{github.publicRepos} repos · {github.followers} followers</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
