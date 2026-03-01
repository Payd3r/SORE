import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useBottomSheetDrag } from "../../gestures/useBottomSheetDrag";

type PwaBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  overlayClassName?: string;
  panelClassName?: string;
  contentClassName?: string;
};

export default function PwaBottomSheet({
  open,
  onClose,
  children,
  overlayClassName,
  panelClassName,
  contentClassName,
}: PwaBottomSheetProps) {
  const {
    translateY,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  } = useBottomSheetDrag({ closeThreshold: 80, onClose, open });

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={["pwa-bottom-sheet-overlay", overlayClassName]
            .filter(Boolean)
            .join(" ")}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={["pwa-bottom-sheet-panel", panelClassName]
              .filter(Boolean)
              .join(" ")}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: translateY }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: translateY > 0 ? 35 : 30,
              stiffness: translateY > 0 ? 400 : 300,
            }}
            style={{ touchAction: "none" }}
          >
            <div
              className="pwa-bottom-sheet-handle"
              aria-hidden
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onTouchCancel={onTouchEnd}
            >
              <span className="pwa-bottom-sheet-handle-bar" />
            </div>
            <div
              className={["pwa-bottom-sheet-content", contentClassName]
                .filter(Boolean)
                .join(" ")}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
