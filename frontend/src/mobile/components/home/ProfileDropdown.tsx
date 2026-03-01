import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

type ProfileDropdownProps = {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
};

export default function ProfileDropdown({
  open,
  onClose,
  anchorRef,
}: ProfileDropdownProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: Event) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open, onClose, anchorRef]);

  const handleProfilo = () => {
    onClose();
    navigate("/profilo");
  };

  const handleImpostazioni = () => {
    onClose();
    navigate("/impostazioni");
  };

  const handleEsci = () => {
    onClose();
    logout();
  };

  if (!open) return null;

  return (
    <div
      ref={dropdownRef}
      className="pwa-profile-dropdown"
      role="menu"
      aria-label="Menu profilo"
    >
      <button
        type="button"
        className="pwa-profile-dropdown-item"
        onClick={handleProfilo}
        role="menuitem"
      >
        <span className="material-symbols-outlined">person</span>
        Profilo
      </button>
      <button
        type="button"
        className="pwa-profile-dropdown-item"
        onClick={handleImpostazioni}
        role="menuitem"
      >
        <span className="material-symbols-outlined">settings</span>
        Impostazioni
      </button>
      <button
        type="button"
        className="pwa-profile-dropdown-item"
        onClick={handleEsci}
        role="menuitem"
      >
        <span className="material-symbols-outlined">logout</span>
        Esci
      </button>
    </div>
  );
}
