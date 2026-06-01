import {
  Menu,
} from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { isCallCenterUser } from "@/lib/userRole";
import { useLayoutControls } from "./LayoutControlsContext";

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const { isRTL } = useLanguage();
  const isCallCenter = isCallCenterUser();
  const layoutControls = useLayoutControls();

  if (isCallCenter || !layoutControls?.isMobile) {
    return null;
  }

  return (
    <div
      className={`
        fixed top-3 z-40
        ${isRTL ? "right-3 left-3 sm:left-auto" : "left-3 right-3 sm:right-3 sm:left-auto"}
        flex items-center justify-between sm:justify-end gap-2
        px-3 py-2
        bg-white/90 backdrop-blur-2xl
        border border-white/30
        rounded-[32px]
        shadow-lg
        max-w-[calc(100vw-1.5rem)]
      `}
    >
      {layoutControls?.isMobile && (
        <button
          type="button"
          onClick={layoutControls.toggleSidebar}
          className="
            p-2.5 rounded-2xl
            bg-white/70
            border border-border/40
            hover:border-burgundy/30
            hover:bg-burgundy/5
            transition-all duration-300
            shadow-sm
          "
          aria-label={layoutControls.mobileOpen ? "Close menu" : "Open menu"}
        >
          <Menu size={18} className="text-burgundy" />
        </button>
      )}

    </div>
  );
};

export default Header;