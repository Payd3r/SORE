import type { HTMLAttributes, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from './cn';
import { useBottomSheetDrag } from '../../mobile/gestures';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
  closeThreshold?: number;
  enableDragToClose?: boolean;
}

export default function BottomSheet({
  open,
  onClose,
  children,
  className,
  contentClassName,
  dragHandleProps,
  closeThreshold = 110,
  enableDragToClose = true,
}: BottomSheetProps) {
  const dragState = useBottomSheetDrag({ closeThreshold, onClose });

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className={cn('fixed inset-0 z-[9999] bg-[var(--glass-overlay)] backdrop-blur-sm', className)}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className={cn(
              'absolute bottom-0 left-0 right-0 flex max-h-[90dvh] flex-col bg-[var(--bg-card)]',
              contentClassName
            )}
            style={{
              borderTopLeftRadius: 'var(--bottom-sheet-radius, 2.5rem)',
              borderTopRightRadius: 'var(--bottom-sheet-radius, 2.5rem)',
              boxShadow: 'var(--bottom-sheet-shadow)',
              y: enableDragToClose ? dragState.translateY : 0,
            }}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 28, opacity: 0.98 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0.98 }}
            transition={{ duration: dragState.isDragging ? 0 : 0.3, ease: 'easeOut' }}
          >
            <button
              type="button"
              className="flex w-full shrink-0 justify-center py-2.5"
              style={{ background: 'var(--bg-card)' }}
              aria-label="Trascina per chiudere"
              {...dragHandleProps}
              onTouchStart={(e) => {
                if (enableDragToClose) {
                  dragState.onTouchStart(e);
                }
                dragHandleProps?.onTouchStart?.(e);
              }}
              onTouchMove={(e) => {
                if (enableDragToClose) {
                  dragState.onTouchMove(e);
                }
                dragHandleProps?.onTouchMove?.(e);
              }}
              onTouchEnd={(e) => {
                if (enableDragToClose) {
                  dragState.onTouchEnd();
                }
                dragHandleProps?.onTouchEnd?.(e);
              }}
            >
              <span
                className="h-1 w-10 rounded-full"
                style={{ backgroundColor: 'var(--bottom-sheet-handle-bg, var(--border-default, #D1D5DB))' }}
              />
            </button>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
