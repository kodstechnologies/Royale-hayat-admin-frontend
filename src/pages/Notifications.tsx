import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { notifications as notifData, Notification } from "@/data/mockDatabase";
import { Bell, Check, Trash2, Calendar, Globe, Upload, MessageSquare, AlertTriangle } from "lucide-react";

const typeIcons: Record<string, any> = {
  appointment: Calendar, request: Calendar, international: Globe,
  document: Upload, feedback: MessageSquare, system: AlertTriangle,
};
const typeStyles: Record<string, string> = {
  appointment: "bg-info/10 text-info", request: "bg-gold/10 text-gold",
  international: "bg-success/10 text-success", document: "bg-burgundy/10 text-burgundy",
  feedback: "bg-warning/10 text-warning", system: "bg-error/10 text-error",
};

const Notifications = () => {
  const [notifications, setNotifications] = useState(notifData);
  const markRead = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const remove = (id: number) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <AdminLayout title="Notifications">
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <p className="text-sm font-sans text-muted-foreground">{notifications.filter(n => !n.read).length} unread</p>
          <button onClick={markAllRead} className="text-xs font-sans text-burgundy hover:text-burgundy-deep font-medium">Mark all read</button>
        </div>
        <div className="divide-y divide-border">
          {notifications.map(notif => {
            const Icon = typeIcons[notif.type] || Bell;
            return (
              <div key={notif.id} className={`p-4 flex items-start gap-4 ${!notif.read ? "bg-section-bg/50" : ""}`}>
                <div className={`p-2 rounded-lg ${typeStyles[notif.type]}`}><Icon size={16} /></div>
                <div className="flex-1">
                  <p className={`text-sm font-sans ${!notif.read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>{notif.title}</p>
                  <p className="text-xs font-sans text-muted-foreground mt-0.5">{notif.message}</p>
                  <p className="text-xs font-sans text-muted-foreground/60 mt-1">{notif.time}</p>
                </div>
                <div className="flex gap-1">
                  {!notif.read && <button onClick={() => markRead(notif.id)} className="p-1.5 rounded hover:bg-section-bg text-muted-foreground hover:text-success"><Check size={14} /></button>}
                  <button onClick={() => remove(notif.id)} className="p-1.5 rounded hover:bg-section-bg text-muted-foreground hover:text-error"><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Notifications;
