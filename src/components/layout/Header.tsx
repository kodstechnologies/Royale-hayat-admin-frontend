import { useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, X, Check, MessageSquare, Calendar, Globe, Upload, AlertTriangle, Settings as SettingsIcon } from "lucide-react";
import { notifications as notifData, Notification } from "@/data/mockDatabase";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

interface HeaderProps {
  title: string;
  children?: ReactNode;
}

const typeIcons: Record<string, any> = {
  appointment: Calendar, request: Calendar, international: Globe,
  document: Upload, feedback: MessageSquare, system: AlertTriangle,
};

const typeStyles: Record<string, string> = {
  appointment: "bg-info/10 text-info", request: "bg-gold/10 text-gold",
  international: "bg-success/10 text-success", document: "bg-burgundy/10 text-burgundy",
  feedback: "bg-warning/10 text-warning", system: "bg-error/10 text-error",
};

const Header = ({ title, children }: HeaderProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifs, setNotifs] = useState<Notification[]>(notifData);
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  const unreadCount = notifs.filter(n => !n.read).length;
  const markRead = (id: number) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const handleNotifClick = (notif: Notification) => { markRead(notif.id); setShowNotifications(false); navigate(notif.link); };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center">
        {children}
        <h2 className="text-xl font-serif font-semibold text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={16} className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-muted-foreground`} />
          <input type="text" placeholder={t("Search...")} value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${isRTL ? "pr-9 pl-4" : "pl-9 pr-4"} py-2 rounded-lg bg-section-bg border border-border text-sm font-sans w-64 focus:outline-none focus:ring-1 focus:ring-gold placeholder:text-muted-foreground`} />
        </div>

        <LanguageToggle />

        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-section-bg transition-colors">
            <Bell size={20} className="text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-error rounded-full text-[10px] font-sans font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className={`absolute ${isRTL ? "left-0" : "right-0"} top-full mt-2 w-96 bg-card rounded-lg shadow-lg border border-border z-50 max-h-[500px] overflow-hidden flex flex-col animate-fade-in`}>
              <div className="p-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-serif font-semibold text-foreground">{t("Notifications")}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={markAllRead} className="text-xs font-sans text-burgundy hover:text-burgundy-deep font-medium">{t("Mark all read")}</button>
                  <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                {notifs.map(notif => {
                  const Icon = typeIcons[notif.type] || Bell;
                  return (
                    <div key={notif.id} onClick={() => handleNotifClick(notif)}
                      className={`p-3 flex items-start gap-3 border-b border-border cursor-pointer hover:bg-section-bg/50 transition-colors ${!notif.read ? "bg-section-bg/30" : ""}`}>
                      <div className={`p-1.5 rounded-lg shrink-0 ${typeStyles[notif.type]}`}><Icon size={14} /></div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-sans ${!notif.read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>{notif.title}</p>
                        <p className="text-xs font-sans text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] font-sans text-muted-foreground/60 mt-1">{notif.time}</p>
                      </div>
                      {!notif.read && (
                        <button onClick={(e) => { e.stopPropagation(); markRead(notif.id); }}
                          className="p-1 rounded hover:bg-success/10 text-muted-foreground hover:text-success shrink-0"><Check size={12} /></button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button onClick={() => navigate("/settings")} className="p-2 rounded-lg hover:bg-section-bg transition-colors">
          <SettingsIcon size={20} className="text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};

export default Header;
