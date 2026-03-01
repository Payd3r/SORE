import { useRef, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { getImageUrl } from "../../../api/images";
import ProfileDropdown from "../home/ProfileDropdown";
import PwaHeaderNotifications from "./PwaHeaderNotifications";

export default function ProfileHeader() {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);

  return (
    <header className="pwa-home-header">
      <div className="pwa-home-intro">
        <h1 className="pwa-home-title">Profilo</h1>
      </div>
      <div className="pwa-home-avatar-wrap">
        <PwaHeaderNotifications />
        <button
          ref={avatarRef}
          type="button"
          className="pwa-home-avatar"
          onClick={() => setDropdownOpen((o) => !o)}
          aria-label="Menu profilo"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          {user?.profile_picture_url ? (
            <img
              src={getImageUrl(user.profile_picture_url)}
              alt=""
              className="pwa-home-avatar-img"
            />
          ) : (
            <span className="pwa-home-avatar-initial">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </span>
          )}
        </button>
        <ProfileDropdown
          open={dropdownOpen}
          onClose={() => setDropdownOpen(false)}
          anchorRef={avatarRef}
        />
      </div>
    </header>
  );
}
