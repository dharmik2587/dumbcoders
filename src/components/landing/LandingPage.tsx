'use client';

import { Footer, Nav, ScrollProgress } from "./Shell";
import { SectionRail } from "./SectionRail";
import { Hero } from "./sections/Hero";
import { PlatformStrip } from "./sections/PlatformStrip";
import { Problem } from "./sections/Problem";
import { Matching } from "./sections/Matching";
import { Discovery } from "./sections/Discovery";
import { Compatibility } from "./sections/Compatibility";
import { Composition } from "./sections/Composition";
import { Builder, FinalCTA } from "./sections/Builder";

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-ink-950 antialiased text-white">
      <a
        href="#problem"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-beam focus:px-4 focus:py-2 focus:font-mono focus:text-[11px] focus:uppercase focus:tracking-[0.16em] focus:text-white"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Nav />
      <SectionRail />

      <main>
        <Hero />
        <PlatformStrip />
        <Problem />
        <Matching />
        <Discovery />
        <Compatibility />
        <Composition />
        <Builder />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
