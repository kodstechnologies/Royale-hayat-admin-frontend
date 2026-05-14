import { useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  X,
  Check,
  MessageSquare,
  Calendar,
  Globe,
  Upload,
  AlertTriangle,
  Settings as SettingsIcon,
} from "lucide-react";

import { notifications as notifData, Notification } from "@/data/mockDatabase";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import BreadCrumb from "./BreadCrumb";


interface HeaderProps {
  title: string;
  children?: ReactNode;
}

const typeIcons: Record<string, any> = {
  appointment: Calendar,
  request: Calendar,
  international: Globe,
  document: Upload,
  feedback: MessageSquare,
  system: AlertTriangle,
};

const typeStyles: Record<string, string> = {
  appointment: "bg-info/10 text-info",
  request: "bg-gold/10 text-gold",
  international: "bg-success/10 text-success",
  document: "bg-burgundy/10 text-burgundy",
  feedback: "bg-warning/10 text-warning",
  system: "bg-error/10 text-error",
};

const Header = ({ title, children }: HeaderProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifs, setNotifs] = useState<Notification[]>(notifData);

  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markRead = (id: number) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotifClick = (notif: Notification) => {
    markRead(notif.id);
    setShowNotifications(false);
    navigate(notif.link);
  };

  return (
    <header
      className="
        sticky top-3 z-20
        mx-3
        h-16
        bg-white/70
        backdrop-blur-2xl
        border border-white/30
        shadow-[0_20px_60px_rgba(0,0,0,0.08)]
        rounded-[32px]
        flex items-center justify-between
        px-6
        shrink-0
      "
    >
      {/* LEFT SECTION */}
      <div className="flex items-center gap-4">
        {children}

        {/* <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h2>

          <div className="mt-1">
            <BreadCrumb />
          </div>

        </div> */}
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3">
        {/* SEARCH */}
        <div className="relative hidden md:block">
          <Search
            size={18}
            className={`absolute ${isRTL ? "right-4" : "left-4"
              } top-1/2 -translate-y-1/2 text-muted-foreground`}
          />

          <input
            type="text"
            placeholder={t("Search...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`
              ${isRTL ? "pr-11 pl-5" : "pl-11 pr-5"}
              h-11 w-72
              rounded-2xl
              bg-white/80 dark:bg-sidebar-accent/40
              border border-border/50
              text-sm font-medium
              shadow-sm
              backdrop-blur-md
              transition-all duration-300
              focus:outline-none
              focus:ring-2 focus:ring-burgundy/20
              focus:border-burgundy
              placeholder:text-muted-foreground/70
            `}
          />
        </div>

        {/* LANGUAGE */}
        <div className="rounded-2xl border border-border/40 bg-white/70 dark:bg-sidebar-accent/40 p-1 shadow-sm">
          <LanguageToggle />
        </div>

        {/* NOTIFICATIONS */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="
              relative p-2.5 rounded-2xl
              bg-white/70 dark:bg-sidebar-accent/40
              border border-border/40
              hover:border-burgundy/30
              hover:bg-burgundy/5
              transition-all duration-300
              shadow-sm
            "
          >
            <Bell size={20} className="text-muted-foreground" />

            {unreadCount > 0 && (
              <span
                className="
                  absolute -top-1 -right-1
                  min-w-[20px] h-[20px]
                  flex items-center justify-center
                  bg-burgundy
                  rounded-full
                  text-[10px]
                  font-bold
                  text-white
                  shadow-md
                "
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATION DROPDOWN */}
          {showNotifications && (
            <div
              className={`
                absolute ${isRTL ? "left-0" : "right-0"}
                top-full mt-3
                w-[420px]
                bg-white/90 dark:bg-sidebar/95
                backdrop-blur-xl
                rounded-3xl
                shadow-2xl
                border border-border/40
                z-50
                max-h-[520px]
                overflow-hidden
                flex flex-col
                animate-fade-in
              `}
            >
              {/* HEADER */}
              <div className="p-5 border-b border-border/40 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {t("Notifications")}
                </h3>

                <div className="flex items-center gap-3">
                  <button
                    onClick={markAllRead}
                    className="
                      text-sm font-medium
                      text-burgundy
                      hover:text-burgundy/80
                      transition-colors
                    "
                  >
                    {t("Mark all read")}
                  </button>

                  <button
                    onClick={() => setShowNotifications(false)}
                    className="
                      p-1 rounded-lg
                      hover:bg-muted
                      transition-colors
                    "
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* NOTIFICATION LIST */}
              <div className="overflow-y-auto flex-1 p-2">
                {notifs.map((notif) => {
                  const Icon = typeIcons[notif.type] || Bell;

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`
                        flex items-start gap-4
                        p-4 mb-2
                        rounded-2xl
                        cursor-pointer
                        transition-all duration-300
                        hover:bg-section-bg/70
                        hover:translate-x-1
                        ${!notif.read
                          ? "bg-burgundy/5 border border-burgundy/10"
                          : "hover:border hover:border-border/40"
                        }
                      `}
                    >
                      {/* ICON */}
                      <div
                        className={`
                          p-2.5 rounded-2xl shrink-0
                          ${typeStyles[notif.type]}
                        `}
                      >
                        <Icon size={16} />
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`
                            text-sm
                            ${!notif.read
                              ? "font-semibold text-foreground"
                              : "font-medium text-muted-foreground"
                            }
                          `}
                        >
                          {notif.title}
                        </p>

                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notif.message}
                        </p>

                        <p className="text-[11px] text-muted-foreground/60 mt-2">
                          {notif.time}
                        </p>
                      </div>

                      {/* MARK READ */}
                      {!notif.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markRead(notif.id);
                          }}
                          className="
                            p-1.5 rounded-lg
                            hover:bg-success/10
                            text-muted-foreground
                            hover:text-success
                            transition-colors
                            shrink-0
                          "
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* SETTINGS */}
        <button
          onClick={() => navigate("/settings")}
          className="
            p-2.5 rounded-2xl
            bg-white/70 dark:bg-sidebar-accent/40
            border border-border/40
            hover:border-burgundy/30
            hover:bg-burgundy/5
            transition-all duration-300
            shadow-sm
          "
        >
          <SettingsIcon
            size={20}
            className="text-muted-foreground"
          />
        </button>
      </div>
    </header>
  );
};

export default Header;