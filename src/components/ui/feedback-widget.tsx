import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { soundService } from '@/services/soundService';
import { Check, Send, MessageSquarePlus, Lightbulb, HelpCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FeedbackWidgetProps {
  onSubmit?: (data: { category: string; content: string }) => void;
  className?: string;
  placeholder?: string;
}

const categories = [
  { id: 'paham', label: 'Paling Dipahami', icon: Lightbulb, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'tanya', label: 'Perlu Latihan', icon: HelpCircle, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'sulit', label: 'Kendala / Sulit', icon: AlertCircle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
];

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  onSubmit,
  className,
  placeholder = 'Tuliskan catatan atau refleksi belajarmu di sini...',
}) => {
  const [selectedCategory, setSelectedCategory] = useState('paham');
  const [content, setContent] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    soundService.click();
    if (onSubmit) {
      onSubmit({ category: selectedCategory, content: content.trim() });
    }
    setIsSubmitted(true);
    soundService.success();

    setTimeout(() => {
      setContent('');
      setIsSubmitted(false);
    }, 2500);
  };

  return (
    <div className={cn('bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
            <MessageSquarePlus size={16} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              Catatan Metakognitif & Umpan Balik
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Sampaikan progres pemahamanmu langsung ke guru
            </p>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                soundService.click();
                setSelectedCategory(cat.id);
              }}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer select-none',
                isActive
                  ? `${cat.color} ring-2 ring-brand-500/20 shadow-2xs font-black`
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <Icon size={13} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Area */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          disabled={isSubmitted}
          className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition resize-none font-medium"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400 font-medium">
            {content.length > 0 ? `${content.length} karakter` : 'Tersimpan otomatis'}
          </span>

          <Button
            type="submit"
            variant="accent"
            size="sm"
            disabled={!content.trim() || isSubmitted}
            className="font-bold text-xs"
          >
            {isSubmitted ? (
              <>
                <Check size={14} className="text-emerald-700" />
                <span>Tersimpan!</span>
              </>
            ) : (
              <>
                <Send size={13} />
                <span>Kirim Catatan</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
