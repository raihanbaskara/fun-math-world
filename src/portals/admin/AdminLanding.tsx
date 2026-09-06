import React from 'react';
import { RobotHero } from '@/components/ui/robot-hero';
import { TubelightNavbar } from '@/components/ui/tubelight-navbar';
import { GlassmorphismCTA } from '@/components/ui/glass-cta';
import { soundService } from '@/services/soundService';
import { Users, ShieldCheck, Database, Settings } from 'lucide-react';

export interface AdminLandingProps {
  onNavigate: (route: string) => void;
}

export const AdminLanding: React.FC<AdminLandingProps> = ({ onNavigate }) => {
  const handlePortalNavigate = (route: string) => {
    soundService.click();
    onNavigate(route);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#bebebe] text-slate-900 selection:bg-purple-400 selection:text-slate-950 font-sans">
      
      {/* Top Floating 1-Row Navigation Header */}
      <header className="fixed top-5 inset-x-0 z-50 pointer-events-none px-4 sm:px-8">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between pointer-events-auto">
          {/* Left: 3-Item Tubelight Navbar */}
          <TubelightNavbar
            items={[
              { name: "Manajemen Akun", icon: Users },
              { name: "1-Device Lock", icon: ShieldCheck },
              { name: "Backup Database", icon: Database },
            ]}
            onTabChange={() => handlePortalNavigate('admin/login')}
          />

          {/* Right Corner: Masuk Admin CTA Button */}
          <div className="flex items-center gap-3">
            <GlassmorphismCTA
              onClick={() => handlePortalNavigate('admin/login')}
              variant="purple"
              size="md"
              className="shadow-xl"
            >
              Portal Admin
            </GlassmorphismCTA>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION: 3D ROBOT MASCOT FOR ADMIN */}
      <RobotHero
        backgroundText="FUN MATH"
        showNavbar={false}
        ctaText="Masuk Portal Admin"
        onCtaClick={() => handlePortalNavigate('admin/login')}
        pantallaColor="#a855f7"
        pantallaBrillo={1.4}
        color="#c4c4c4"
      />

    </div>
  );
};
