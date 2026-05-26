import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 80 : 320;
  // Sidebar is fixed with left-3 (12px) gap, so content must clear sidebarWidth + 12px
  const sidebarOffset = sidebarWidth + 12;
  const { t, isRTL } = useLanguage();

  return (
    <div className="flex min-h-screen bg-section-bg">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={isRTL ? { marginRight: sidebarOffset } : { marginLeft: sidebarOffset }}
      >
        {/* Fixed gap cover */}
        <div className="fixed top-0 left-0 right-0 z-[25] h-3 bg-section-bg pointer-events-none" />
        <Header title={t(title)} />
        <main className="flex-1 p-6 pt-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
