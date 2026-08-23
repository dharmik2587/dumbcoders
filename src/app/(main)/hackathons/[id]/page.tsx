import { HackathonDetail } from '@/components/hackathons/HackathonDetail';

export default async function HackathonPage({ params }: { params: Promise<{ id: string }> }) {
  return <div className="px-6 py-12"><HackathonDetail id={(await params).id} /></div>;
}
