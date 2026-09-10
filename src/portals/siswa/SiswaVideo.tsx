import React, { useState, useEffect } from 'react';
import { storageService } from '@/services/storageService';
import { Video, Clock, Sparkles } from 'lucide-react';

export const SiswaVideo: React.FC = () => {
  const [videos, setVideos] = useState(storageService.getState().videos);

  useEffect(() => {
    return storageService.subscribe(newState => {
      setVideos(newState.videos);
    });
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 font-sans">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-[#ffe600] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] overflow-hidden text-slate-950">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none">
          VIDEO
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
                MULTIMEDIA INTERAKTIF
              </span>
              <span className="px-3 py-1 bg-white/90 text-slate-900 border-2 border-slate-950 rounded-xl text-xs font-bold font-mono">
                Audio-Visual Pecahan
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono leading-tight">
              Video Pembelajaran Interaktif
            </h1>

            <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
              Tonton penjelasan konsep untuk memperdalam pemahaman dan penalaran matematikamu secara visual dan runtut.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-[#38bdf8] border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#0f172a]">
            <Video size={36} />
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map(v => (
          <div
            key={v.id}
            className="p-5 rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] space-y-4 transition-all"
          >
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border-3 border-slate-950 dark:border-slate-700 shadow-inner">
              <iframe
                className="w-full h-full"
                src={v.url}
                title={v.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-slate-950 dark:border-slate-700 w-fit">
                <Clock size={14} />
                <span>Durasi: {v.duration} Menit</span>
              </div>
              <h3 className="font-mono font-black text-base sm:text-lg text-slate-950 dark:text-slate-100">
                {v.title}
              </h3>
              {v.desc && (
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                  {v.desc}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

