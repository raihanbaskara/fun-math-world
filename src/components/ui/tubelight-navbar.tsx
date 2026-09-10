import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { soundService } from '@/services/soundService';

export interface NavItem {
  name: string;
  icon: LucideIcon;
  id?: string;
  badge?: string;
}

export interface TubelightNavbarProps {
  items: NavItem[];
  activeTab?: string;
  onTabChange?: (tabName: string) => void;
  className?: string;
}

export function TubelightNavbar({
  items,
  activeTab: controlledActiveTab,
  onTabChange,
  className,
}: TubelightNavbarProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(items[0]?.name || '');
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelect = (name: string) => {
    soundService.click();
    setInternalActiveTab(name);
    if (onTabChange) onTabChange(name);
  };

  return (
    <div className={cn('z-40 flex items-center justify-center', className)}>
      <div className="flex items-center gap-1 sm:gap-1.5 bg-white/85 dark:bg-slate-900/85 border border-white/70 dark:border-slate-800/80 backdrop-blur-2xl p-1 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => handleSelect(item.name)}
              className={cn(
                'relative cursor-pointer text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-full transition-colors select-none flex items-center gap-2 h-10',
                'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100',
                isActive && 'text-slate-950 dark:text-white font-black'
              )}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive ? 'text-brand-600 dark:text-[#00ffc6]' : 'text-slate-500 dark:text-slate-400')} />
              <span className="hidden sm:inline">{item.name}</span>
              {item.badge && (
                <span className="hidden md:inline-block text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 bg-[#00ffc6]/20 text-slate-900 dark:text-[#00ffc6] border border-yellow-300 dark:border-[#00ffc6]/40 rounded-full">
                  {item.badge}
                </span>
              )}

              {isActive && (
                <motion.div
                  layoutId="tubelight-lamp"
                  className="absolute inset-0 w-full bg-slate-100/90 dark:bg-white/15 rounded-full -z-10 shadow-2xs"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 28,
                  }}
                >
                  {/* Glowing Tubelight Top Cap */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#00ffc6] rounded-t-full shadow-[0_0_12px_#00ffc6]">
                    <div className="absolute w-12 h-4 bg-[#00ffc6]/40 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-3 bg-[#00ffc6]/60 rounded-full blur-sm -top-1 left-0" />
                  </div>
                </motion.div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
