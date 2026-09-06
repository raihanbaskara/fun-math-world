import React from 'react';
import { RobotHero } from '@/components/ui/robot-hero';
import { TubelightNavbar } from '@/components/ui/tubelight-navbar';
import { GlassmorphismCTA } from '@/components/ui/glass-cta';
import { soundService } from '@/services/soundService';
import { BookOpen, FileText, BarChart3, GraduationCap } from 'lucide-react';

export interface GuruLandingProps {
  onNavigate: (route: string) => void;
}

export const GuruLanding: React.FC<GuruLandingProps> = ({ onNavigate }) => {
  const handlePortalNavigate = (route: string) => {
    soundService.click();
    onNavigate(route);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#bebebe] text-slate-900 selection:bg-emerald-400 selection:text-slate-950 font-sans">
      
      {/* Top Floating 1-Row Navigation Header */}
      <header className="fixed top-5 inset-x-0 z-50 pointer-events-none px-4 sm:px-8">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between pointer-events-auto">
          {/* Left: 3-Item Tubelight Navbar */}
          <TubelightNavbar
            items={[
              { name: "Kurikulum Pecahan", icon: BookOpen },
              { name: "Validasi LKPD", icon: FileText },
              { name: "Rekapitulasi Excel", icon: BarChart3 },
            ]}
            onTabChange={() => handlePortalNavigate('guru/login')}
          />

          {/* Right Corner: Masuk Guru CTA Button */}
          <div className="flex items-center gap-3">
            <GlassmorphismCTA
              onClick={() => handlePortalNavigate('guru/login')}
              variant="mint"
              size="md"
              className="shadow-xl"
            >
              Portal Guru
            </GlassmorphismCTA>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION: 3D ROBOT MASCOT FOR GURU */}
      <RobotHero
        backgroundText="FUN MATH"
        showNavbar={false}
        ctaText="Masuk Portal Guru"
        onCtaClick={() => handlePortalNavigate('guru/login')}
        pantallaColor="#10b981"
        pantallaBrillo={1.4}
        color="#c4c4c4"
      />

    </div>
  );
};
