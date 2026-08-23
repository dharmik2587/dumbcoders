import { getCoreDb } from '@/lib/db/core';
import { colleges, hackathonSources, hackathons } from '@/lib/db/schema/core';

const collegeSeed = [
  { name: 'Indian Institute of Technology Bombay', shortName: 'IIT Bombay', domain: 'iitb.ac.in' },
  { name: 'Birla Institute of Technology and Science Pilani', shortName: 'BITS Pilani', domain: 'pilani.bits-pilani.ac.in' },
  { name: 'Vellore Institute of Technology', shortName: 'VIT', domain: 'vit.ac.in' },
  { name: 'National Institute of Technology Trichy', shortName: 'NIT Trichy', domain: 'nitt.edu' },
  { name: 'IIIT Hyderabad', shortName: 'IIIT-H', domain: 'iiit.ac.in' },
];

const hackathonSeed = [
  {
    canonicalKey: 'manual:build-for-campus-2026',
    title: 'Build for Campus 2026',
    description: 'Create tools that make student life more connected, accessible, and useful.',
    organizer: 'HackMate Community',
    mode: 'online',
    timezone: 'Asia/Calcutta',
    themes: ['EdTech', 'Open Innovation'],
    techStack: ['Next.js', 'PostgreSQL'],
    prizeDisplay: '₹1,00,000 in prizes',
    prizeAmount: '100000',
    prizeCurrency: 'INR',
    registrationUrl: 'https://example.com/build-for-campus',
    sourceUrl: 'https://example.com/build-for-campus',
    startAt: new Date('2026-10-10T04:30:00.000Z'),
    endAt: new Date('2026-10-11T12:00:00.000Z'),
    registrationDeadlineAt: new Date('2026-10-08T18:29:59.000Z'),
    status: 'published',
  },
  {
    canonicalKey: 'manual:climate-code-sprint-2026',
    title: 'Climate Code Sprint',
    description: 'Use data, design, and software to make climate action easier to understand and execute.',
    organizer: 'Open Source India',
    mode: 'hybrid',
    timezone: 'Asia/Calcutta',
    themes: ['Climate', 'AI/ML'],
    techStack: ['Python', 'Data'],
    prizeDisplay: '₹75,000 in prizes',
    prizeAmount: '75000',
    prizeCurrency: 'INR',
    registrationUrl: 'https://example.com/climate-code-sprint',
    sourceUrl: 'https://example.com/climate-code-sprint',
    startAt: new Date('2026-11-07T04:30:00.000Z'),
    endAt: new Date('2026-11-08T12:00:00.000Z'),
    registrationDeadlineAt: new Date('2026-11-05T18:29:59.000Z'),
    status: 'published',
  },
];

async function main() {
  const db = getCoreDb();
  await db.insert(colleges).values(collegeSeed).onConflictDoNothing({ target: colleges.domain });
  for (const item of hackathonSeed) {
    const [hackathon] = await db.insert(hackathons).values(item).onConflictDoNothing({ target: hackathons.canonicalKey }).returning();
    if (hackathon) {
      await db.insert(hackathonSources).values({
        hackathonId: hackathon.id,
        source: 'manual',
        sourceId: item.canonicalKey.replace('manual:', ''),
        sourceUrl: item.sourceUrl,
        registrationUrl: item.registrationUrl,
      }).onConflictDoNothing();
    }
  }
  console.log('Seed completed');
}

main().catch((error) => {
  console.error('Seed failed', error);
  process.exitCode = 1;
});
