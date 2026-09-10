import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { soundService } from '@/services/soundService';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-xl'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        soundService.click();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              soundService.click();
              onClose();
            }}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className={`relative w-full ${maxWidth} bg-white dark:bg-[#111827] text-slate-950 dark:text-slate-100 rounded-2xl border-4 border-slate-900 dark:border-slate-700 shadow-[10px_10px_0px_0px_#0f172a] dark:shadow-[10px_10px_0px_0px_#000000] p-6 z-10 max-h-[90vh] overflow-y-auto`}
          >
            {title && (
              <div className="flex items-center justify-between pb-4 border-b-3 border-slate-900 dark:border-slate-700 mb-5 bg-amber-200 dark:bg-slate-800 -mx-6 -mt-6 p-4 rounded-t-[calc(1rem-4px)]">
                <h3 className="text-lg font-black text-slate-950 dark:text-slate-100 uppercase tracking-wide">{title}</h3>
                <button
                  onClick={() => {
                    soundService.click();
                    onClose();
                  }}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 border-2 border-slate-900 dark:border-slate-600 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000] text-slate-950 dark:text-slate-100 hover:bg-pink-300 dark:hover:bg-rose-500 transition flex items-center justify-center font-black cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
