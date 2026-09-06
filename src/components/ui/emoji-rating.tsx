import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { soundService } from '@/services/soundService';

export interface RatingItem {
  emoji: string;
  label: string;
  description: string;
  color: string;
  bgLight: string;
  borderActive: string;
}

export interface EmojiRatingProps {
  value?: number;
  onChange?: (rating: number) => void;
  className?: string;
}

export const ratingOptions: RatingItem[] = [
  {
    emoji: '😣',
    label: 'Masih Bingung',
    description: 'Perlu bimbingan ulang dari konsep dasar pecahan',
    color: 'text-rose-600',
    bgLight: 'bg-rose-50 border-rose-200',
    borderActive: 'ring-rose-500/40 border-rose-500 bg-rose-50/80',
  },
  {
    emoji: '🤔',
    label: 'Cukup Paham',
    description: 'Mulai memahami sebagian pola dan rumus',
    color: 'text-amber-600',
    bgLight: 'bg-amber-50 border-amber-200',
    borderActive: 'ring-amber-500/40 border-amber-500 bg-amber-50/80',
  },
  {
    emoji: '🙂',
    label: 'Paham Baik',
    description: 'Bisa menyelesaikan soal latihan standar mandiri',
    color: 'text-blue-600',
    bgLight: 'bg-blue-50 border-blue-200',
    borderActive: 'ring-blue-500/40 border-blue-500 bg-blue-50/80',
  },
  {
    emoji: '😄',
    label: 'Sangat Paham',
    description: 'Lancar mengerjakan operasi hitung dan LKPD',
    color: 'text-emerald-600',
    bgLight: 'bg-emerald-50 border-emerald-200',
    borderActive: 'ring-emerald-500/40 border-emerald-500 bg-emerald-50/80',
  },
  {
    emoji: '🤩',
    label: 'Master / Percaya Diri',
    description: 'Siap membantu teman dan menuntaskan evaluasi!',
    color: 'text-teal-600',
    bgLight: 'bg-[#00ffc6]/10 border-[#00ffc6]/30',
    borderActive: 'ring-[#00ffc6]/50 border-[#00ffc6] bg-[#00ffc6]/15',
  },
];

export const EmojiRating: React.FC<EmojiRatingProps> = ({
  value = 4,
  onChange,
  className,
}) => {
  const [internalRating, setInternalRating] = useState(value);
  const [hoverRating, setHoverRating] = useState(0);

  const currentRating = hoverRating || internalRating;
  const activeItem = currentRating > 0 ? ratingOptions[currentRating - 1] : null;

  const handleSelect = (val: number) => {
    soundService.click();
    setInternalRating(val);
    if (onChange) onChange(val);
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Emoji Buttons Row */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 p-2 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80">
        {ratingOptions.map((item, idx) => {
          const ratingVal = idx + 1;
          const isSelected = internalRating === ratingVal;
          const isHovered = hoverRating === ratingVal;

          return (
            <button
              key={ratingVal}
              type="button"
              onClick={() => handleSelect(ratingVal)}
              onMouseEnter={() => setHoverRating(ratingVal)}
              onMouseLeave={() => setHoverRating(0)}
              className={cn(
                'group relative p-2.5 sm:p-3 rounded-xl transition-all duration-300 ease-out cursor-pointer focus:outline-hidden',
                isSelected
                  ? `scale-110 shadow-md ${item.bgLight} ring-2 ${item.borderActive}`
                  : 'hover:scale-105 hover:bg-white/80 dark:hover:bg-slate-700/80'
              )}
              aria-label={`Level ${ratingVal}: ${item.label}`}
            >
              <span
                className={cn(
                  'text-2xl sm:text-3xl transition-all duration-300 ease-out select-none block',
                  isSelected || isHovered
                    ? 'grayscale-0 drop-shadow-sm scale-110'
                    : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100'
                )}
              >
                {item.emoji}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Label & Description */}
      <div className="relative h-12 w-full max-w-sm text-center flex flex-col items-center justify-center">
        {activeItem && (
          <div className="animate-in fade-in zoom-in-95 duration-200 space-y-0.5">
            <span className={cn('text-xs sm:text-sm font-black tracking-wide', activeItem.color)}>
              {activeItem.label}
            </span>
            <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
              {activeItem.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
