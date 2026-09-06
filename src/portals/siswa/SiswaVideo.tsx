import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { storageService } from '@/services/storageService';
import { Video, Clock } from 'lucide-react';

export const SiswaVideo: React.FC = () => {
  const [videos, setVideos] = useState(storageService.getState().videos);

  useEffect(() => {
    return storageService.subscribe(newState => {
      setVideos(newState.videos);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
          <Video className="text-amber-500" />
          <span>Video Pembelajaran Interaktif</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
          Tonton penjelasan konsep untuk memperdalam pemahaman dan penalaran matematikamu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map(v => (
          <Card key={v.id} className="p-4 space-y-3 overflow-hidden border border-slate-200 shadow-xs">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
              <iframe
                className="w-full h-full"
                src={v.url}
                title={v.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="space-y-1 p-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600">
                <Clock size={14} />
                <span>Durasi: {v.duration} Menit</span>
              </div>
              <h3 className="font-black text-base sm:text-lg text-slate-900">
                {v.title}
              </h3>
              {v.desc && (
                <p className="text-xs text-slate-600 font-medium">
                  {v.desc}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

