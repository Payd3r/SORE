import type { HTMLAttributes, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from './cn';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
}

export default function BottomSheet({
  open,
  onClose,
  children,
  className,
  contentClassName,
  dragHandleProps,
}: BottomSheetProps) {
  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className={cn('fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm', className)}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className={cn(
              'absolute bottom-0 left-0 right-0 max-h-[88dvh] rounded-t-ios-xl bg-white dark:bg-[#1C1C1E]',
              contentClassName
            )}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 28, opacity: 0.98 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <button
              type="button"
              className="flex w-full justify-center py-2"
              aria-label="Drag handle"
              {...dragHandleProps}
            >
              <span className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
