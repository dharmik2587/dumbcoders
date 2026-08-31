"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, GraduationCap, Globe, Sparkles } from "lucide-react";
import { mapProfileToBuilder, useApiStore } from "@/client/store/apiStore";
import { getUserProfile } from "@/client/lib/api/users";
import type { Builder } from "@/client/types";
import { Avatar, roleTone } from "@/components/shared";
import { Button, Chip, EmptyState, Panel, Reveal } from "@/components/ui";

export default function BuilderProfile() {
  const { id } = useParams();
  const router = useRouter();

  const builders = useApiStore((s) => s.builders);
  const [remoteBuilder, setRemoteBuilder] = useState<Builder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const existing = builders.find((b) => b.id === id);
    if (existing) {
      setLoading(false);
      return;
    }

    let active = true;
    void getUserProfile(String(id))
      .then((profile) => {
        if (active) setRemoteBuilder(mapProfileToBuilder(profile));
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [builders, id]);

  const builder = builders.find((b) => b.id === id) ?? remoteBuilder;

  if (!loading && (notFound || !builder)) {
    return (
      <div className="mx-auto max-w-4xl py-12">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 h-8 text-[11px]">
          <ArrowLeft size={12} className="mr-2" /> Back
        </Button>
        <EmptyState
          title="Builder not found"
          body={`We couldn't find a builder with the ID ${id}.`}
          action={
            <Button variant="outline" onClick={() => router.push('/discover')}>
              Return to Discover
            </Button>
          }
        />
      </div>
    );
  }

  if (!builder) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="mono-label animate-pulse text-fg3">loading profile…</div>
      </div>
    );
  }

  const tone = roleTone[builder.role];

  return (
    <div className="mx-auto max-w-3xl py-12 px-4 sm:px-0">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 h-8 text-[11px]">
        <ArrowLeft size={12} className="mr-2" /> Back
      </Button>

      <Reveal>
        <Panel className="p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-5">
              <Avatar b={builder} size={96} link={false} />
              <div className="pt-2">
                <h1 className="text-2xl font-medium tracking-tight text-fg">{builder.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-fg3">
                  <span className="flex items-center gap-1.5"><Sparkles size={12} /> {builder.role}</span>
                  {builder.college && <span className="flex items-center gap-1.5"><GraduationCap size={12} /> {builder.college}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-fg3">Bio</h2>
            <p className="mt-3 leading-relaxed text-fg2">{builder.bio || "This builder hasn't written a bio yet."}</p>
          </div>

          <div className="mt-8">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-fg3">Top Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {builder.skills && builder.skills.length > 0 ? (
                builder.skills.map((skill) => (
                  <Chip key={skill.id} tone={tone}>{skill.label}</Chip>
                ))
              ) : (
                <span className="text-sm text-fg3">No skills listed</span>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-fg3">Availability</h2>
              <div className="mt-3">
                <Chip tone="neutral">{builder.availability?.length ? "Available" : "Not specified"}</Chip>
              </div>
            </div>
            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-fg3">Links</h2>
              <div className="mt-3 flex gap-4">
                {builder.repos?.[0]?.url && (
                  <a href={builder.repos[0].url} target="_blank" rel="noreferrer" className="text-fg3 transition-colors hover:text-accent">
                    <Globe size={18} />
                  </a>
                )}
                {!builder.repos?.[0]?.url && (
                  <span className="text-sm text-fg3">No links provided</span>
                )}
              </div>
            </div>
          </div>
        </Panel>
      </Reveal>
    </div>
  );
}
