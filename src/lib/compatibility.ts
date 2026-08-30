import type { GithubData, Profile } from '@/lib/db/schema/core';

function overlap(left: string[], right: string[]) {
  const rightSet = new Set(right.map((item) => item.toLowerCase()));
  return left.filter((item) => rightSet.has(item.toLowerCase())).length;
}

export type TeamContext = {
  /** Roles the viewer's team is still missing (used to reward candidates who fill them). */
  missingRoles: string[];
};

export type CompatibilityInput = {
  current: Profile;
  candidate: Profile;
  /** Verified GitHub data for the candidate (used for stack-overlap signal). */
  candidateGithub?: GithubData | null;
  /** Verified GitHub data for the viewer (used for stack-overlap signal). */
  currentGithub?: GithubData | null;
  /** Optional team context: rewards candidates whose role fills a missing slot. */
  team?: TeamContext | null;
};

export function compatibilityScore(input: CompatibilityInput) {
  const { current, candidate, candidateGithub, currentGithub, team } = input;

  const currentSkills = current.skills ?? [];
  const candidateSkills = candidate.skills ?? [];
  const sharedSkills = overlap(currentSkills, candidateSkills);
  const complementarySkills = candidateSkills.filter(
    (skill) => !currentSkills.some((own) => own.toLowerCase() === skill.toLowerCase()),
  ).length;
  const interestScore = overlap(current.hackathonInterests ?? [], candidate.hackathonInterests ?? []);
  const roleScore = current.rolePreference && candidate.rolePreference && current.rolePreference !== candidate.rolePreference ? 1 : 0;
  const availabilityScore = current.availability && current.availability === candidate.availability ? 1 : 0;

  // --- Verified GitHub stack overlap (rewards shared languages, not just self-declared skills)
  const currentLangs = new Set(Object.keys(currentGithub?.languages ?? {}).map((l) => l.toLowerCase()));
  const candidateLangs = Object.keys(candidateGithub?.languages ?? {}).map((l) => l.toLowerCase());
  const sharedLangs = candidateLangs.filter((l) => currentLangs.has(l)).length;
  const hasGithubSignal = Boolean(currentGithub && candidateGithub);

  // --- Team gap (candidate's role fills a missing slot on the viewer's team)
  const fillsGap = team?.missingRoles.length
    ? candidate.rolePreference
      ? team.missingRoles.some((r) => r.toLowerCase() === candidate.rolePreference!.toLowerCase())
      : false
    : false;

  // Weights (sums to 100)
  // skills 40 · interests/role/availability 25 · github stack 20 · team gap 15
  const skillComponent = Math.min(40, sharedSkills * 6 + Math.min(2, complementarySkills) * 8);
  const interestComponent = Math.min(15, interestScore * 6);
  const roleComponent = roleScore * 5;
  const availabilityComponent = availabilityScore * 5;
  const githubComponent = hasGithubSignal ? Math.min(20, sharedLangs * 4) : 0;
  const gapComponent = fillsGap ? 15 : 0;

  const total = Math.min(
    100,
    skillComponent +
      interestComponent +
      roleComponent +
      availabilityComponent +
      githubComponent +
      gapComponent,
  );

  const reasons: string[] = [
    sharedSkills ? `${sharedSkills} shared skill${sharedSkills === 1 ? '' : 's'}` : null,
    complementarySkills ? `${complementarySkills} complementary skill${complementarySkills === 1 ? '' : 's'}` : null,
    sharedLangs ? `${sharedLangs} shared GitHub language${sharedLangs === 1 ? '' : 's'}` : null,
    interestScore ? 'shared hackathon interests' : null,
    roleScore ? 'different preferred roles' : null,
    availabilityScore ? 'matching availability' : null,
    fillsGap ? `fills your missing ${candidate.rolePreference} role` : null,
  ].filter(Boolean) as string[];

  return { score: total, reasons, fillsGap };
}
