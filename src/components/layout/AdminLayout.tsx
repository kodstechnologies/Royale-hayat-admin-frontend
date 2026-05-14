import { ReactNode, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
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
  const { t, isRTL } = useLanguage();

  return (
    <div className="flex min-h-screen bg-section-bg">
      <Sidebar collapsed={collapsed} />
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={isRTL ? { marginRight: sidebarWidth } : { marginLeft: sidebarWidth }}
      >
        <Header title={t(title)}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-burgundy hover:bg-section-bg transition-colors mr-2"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isRTL
              ? (collapsed ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />)
              : (collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />)
            }
          </button>
        </Header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
