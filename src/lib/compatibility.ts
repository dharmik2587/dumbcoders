import type { Profile } from '@/lib/db/schema/core';

function overlap(left: string[], right: string[]) {
  const rightSet = new Set(right.map((item) => item.toLowerCase()));
  return left.filter((item) => rightSet.has(item.toLowerCase())).length;
}

export function compatibilityScore(current: Profile, candidate: Profile) {
  const currentSkills = current.skills ?? [];
  const candidateSkills = candidate.skills ?? [];
  const sharedSkills = overlap(currentSkills, candidateSkills);
  const complementarySkills = candidateSkills.filter(
    (skill) => !currentSkills.some((own) => own.toLowerCase() === skill.toLowerCase()),
  ).length;
  const interestScore = overlap(current.hackathonInterests ?? [], candidate.hackathonInterests ?? []);
  const roleScore = current.rolePreference && candidate.rolePreference && current.rolePreference !== candidate.rolePreference ? 1 : 0;
  const availabilityScore = current.availability && current.availability === candidate.availability ? 1 : 0;

  const skillComponent = Math.min(50, sharedSkills * 8 + Math.min(2, complementarySkills) * 9);
  const interestComponent = Math.min(25, interestScore * 8);
  const roleComponent = roleScore * 15;
  const availabilityComponent = availabilityScore * 10;
  const total = Math.min(100, skillComponent + interestComponent + roleComponent + availabilityComponent);

  return {
    score: total,
    reasons: [
      sharedSkills ? `${sharedSkills} shared skill${sharedSkills === 1 ? '' : 's'}` : null,
      complementarySkills ? `${complementarySkills} complementary skill${complementarySkills === 1 ? '' : 's'}` : null,
      interestScore ? 'shared hackathon interests' : null,
      roleScore ? 'different preferred roles' : null,
      availabilityScore ? 'matching availability' : null,
    ].filter(Boolean) as string[],
  };
}
