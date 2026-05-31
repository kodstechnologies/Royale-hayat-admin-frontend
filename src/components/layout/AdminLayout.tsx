import { ReactNode, useCallback, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { LayoutControlsProvider } from "./LayoutControlsContext";

const MOBILE_BREAKPOINT = 1024;

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const update = () => {
      const mobile = media.matches;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
      }
    };

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isMobile || !mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobile, mobileOpen]);

  const closeMobileSidebar = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
      return;
    }
    setCollapsed((prev) => !prev);
  }, [isMobile]);

  const sidebarWidth = collapsed ? 80 : 300;
  const sidebarOffset = isMobile ? 0 : sidebarWidth + 12;

  return (
    <div className="flex min-h-screen bg-section-bg">
      <Sidebar
        collapsed={collapsed}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobileSidebar}
      />

      <div
        className="flex-1 flex flex-col min-w-0 w-full transition-[margin] duration-300"
        style={isRTL ? { marginRight: sidebarOffset } : { marginLeft: sidebarOffset }}
      >
        <div className="fixed top-0 left-0 right-0 z-[25] h-3 bg-section-bg pointer-events-none" />
        <LayoutControlsProvider
          value={{
            collapsed,
            toggleSidebar,
            isMobile,
            mobileOpen,
            setMobileOpen,
            closeMobileSidebar,
          }}
        >
          <Header title={t(title)} />
          <main className="flex-1 p-4 sm:p-6 pt-3 sm:pt-4 overflow-auto">{children}</main>
        </LayoutControlsProvider>
      </div>
    </div>
  );
};

export default AdminLayout;
