import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { inboxItems as mockItems, exportToExcel, InboxItem } from "@/data/mockDatabase";
import { Eye, CheckCircle, Clock, Filter, Download, Phone, MessageSquare, MoreVertical, ChevronLeft, X, AlertTriangle } from "lucide-react";
import MessageModal from "@/components/MessageModal";

const statusColors: Record<string, string> = {
  new: "bg-info/10 text-info", in_progress: "bg-warning/10 text-warning", resolved: "bg-success/10 text-success",
};
const priorityColors: Record<string, string> = {
  high: "bg-error/10 text-error", medium: "bg-warning/10 text-warning", low: "bg-success/10 text-success",
};

const UnifiedInbox = () => {
  const [items, setItems] = useState(mockItems);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ item: InboxItem; action: string; status: InboxItem["status"] } | null>(null);
  const [msgModal, setMsgModal] = useState<{ open: boolean; name: string; phone: string; type: "SMS" | "WhatsApp" }>({ open: false, name: "", phone: "", type: "SMS" });

  const filtered = items.filter(i => {
    const matchType = filter === "all" || i.type.toLowerCase().includes(filter);
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const updateStatus = (id: number, status: InboxItem["status"]) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    if (selectedItem?.id === id) setSelectedItem(prev => prev ? { ...prev, status } : null);
    setConfirmAction(null);
  };

  if (selectedItem) {
    return (
      <AdminLayout title="Unified Inbox">
        <button onClick={() => setSelectedItem(null)}
          className="flex items-center gap-1 text-sm font-sans text-burgundy hover:text-burgundy-deep mb-4">
          <ChevronLeft size={14} /> Back to Inbox
        </button>
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-serif font-semibold text-foreground">{selectedItem.name}</h2>
              <p className="text-sm font-sans text-muted-foreground">{selectedItem.type} · {selectedItem.date}</p>
              <p className="text-xs font-sans text-muted-foreground mt-1">{selectedItem.contact}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${statusColors[selectedItem.status]}`}>{selectedItem.status.replace("_", " ")}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${priorityColors[selectedItem.priority]}`}>{selectedItem.priority}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-4">
          <h3 className="text-sm font-serif font-semibold text-foreground mb-2">Message</h3>
          <p className="text-sm font-sans text-muted-foreground">{selectedItem.message}</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setConfirmAction({ item: selectedItem, action: "Mark as In Progress", status: "in_progress" })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-warning/10 text-warning text-xs font-sans font-medium hover:bg-warning/20"><Clock size={13} /> In Progress</button>
          <button onClick={() => setConfirmAction({ item: selectedItem, action: "Resolve", status: "resolved" })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-success/10 text-success text-xs font-sans font-medium hover:bg-success/20"><CheckCircle size={13} /> Resolve</button>
          <button onClick={() => setMsgModal({ open: true, name: selectedItem.name, phone: selectedItem.contact, type: "SMS" })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-info/10 text-info text-xs font-sans font-medium hover:bg-info/20"><Phone size={13} /> Send SMS</button>
          <button onClick={() => setMsgModal({ open: true, name: selectedItem.name, phone: selectedItem.contact, type: "WhatsApp" })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-success/10 text-success text-xs font-sans font-medium hover:bg-success/20"><MessageSquare size={13} /> WhatsApp</button>
        </div>

        
        {confirmAction && (
          <div className="fixed inset-0 bg-foreground/30 flex items-center justify-center z-50" onClick={() => setConfirmAction(null)}>
            <div className="bg-card rounded-lg shadow-lg border border-border p-6 w-96 animate-fade-in" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-3"><AlertTriangle size={16} className="text-warning" /><h3 className="font-serif font-semibold text-foreground">Confirm Action</h3></div>
              <p className="text-sm font-sans text-muted-foreground mb-4">Are you sure you want to <strong>{confirmAction.action}</strong> this item for <strong>{confirmAction.item.name}</strong>?</p>
              <div className="flex gap-2">
                <button onClick={() => updateStatus(confirmAction.item.id, confirmAction.status)}
                  className="flex-1 px-3 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium">Yes, Confirm</button>
                <button onClick={() => setConfirmAction(null)}
                  className="flex-1 px-3 py-2 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <MessageModal isOpen={msgModal.open} onClose={() => setMsgModal({ ...msgModal, open: false })}
          patientName={msgModal.name} patientPhone={msgModal.phone} type={msgModal.type} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Unified Inbox">
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <input type="text" placeholder="Search by name..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-4 pr-4 py-2 rounded-lg bg-section-bg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={16} className="text-muted-foreground" />
            {["all", "booking", "feedback", "international", "contact", "request", "document"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-sans font-medium capitalize transition-colors
                  ${filter === f ? "bg-burgundy text-primary-foreground" : "bg-section-bg text-muted-foreground hover:bg-border"}`}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={() => exportToExcel(filtered.map(i => ({ Name: i.name, Type: i.type, Contact: i.contact, Date: i.date, Status: i.status, Priority: i.priority })), "inbox-export")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-success/10 text-success text-xs font-sans font-medium hover:bg-success/20 transition-colors">
            <Download size={13} /> Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-section-bg">
                {["Name", "Type", "Contact", "Date", "Status", "Priority", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-b border-border hover:bg-section-bg/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-sans font-medium text-foreground cursor-pointer hover:text-burgundy"
                    onClick={() => setSelectedItem(item)}>{item.name}</td>
                  <td className="px-4 py-3 text-sm font-sans text-muted-foreground">{item.type}</td>
                  <td className="px-4 py-3 text-sm font-sans text-muted-foreground">{item.contact}</td>
                  <td className="px-4 py-3 text-sm font-sans text-muted-foreground">{item.date}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${statusColors[item.status]}`}>{item.status.replace("_", " ")}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${priorityColors[item.priority]}`}>{item.priority}</span></td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button onClick={() => setMenuOpen(menuOpen === item.id ? null : item.id)}
                        className="p-1.5 rounded hover:bg-section-bg text-muted-foreground hover:text-foreground">
                        <MoreVertical size={14} />
                      </button>
                      {menuOpen === item.id && (
                        <div className="absolute right-0 top-full mt-1 bg-card rounded-lg shadow-lg border border-border z-50 py-1 w-40 animate-fade-in">
                          <button onClick={() => { setSelectedItem(item); setMenuOpen(null); }} className="w-full text-left px-3 py-2 text-xs font-sans hover:bg-section-bg flex items-center gap-2"><Eye size={12} /> View Details</button>
                          <button onClick={() => { setConfirmAction({ item, action: "Mark In Progress", status: "in_progress" }); setMenuOpen(null); }} className="w-full text-left px-3 py-2 text-xs font-sans hover:bg-section-bg flex items-center gap-2"><Clock size={12} /> In Progress</button>
                          <button onClick={() => { setConfirmAction({ item, action: "Resolve", status: "resolved" }); setMenuOpen(null); }} className="w-full text-left px-3 py-2 text-xs font-sans hover:bg-section-bg flex items-center gap-2"><CheckCircle size={12} /> Resolve</button>
                          <button onClick={() => { setMsgModal({ open: true, name: item.name, phone: item.contact, type: "SMS" }); setMenuOpen(null); }} className="w-full text-left px-3 py-2 text-xs font-sans hover:bg-section-bg flex items-center gap-2"><Phone size={12} /> SMS</button>
                          <button onClick={() => { setMsgModal({ open: true, name: item.name, phone: item.contact, type: "WhatsApp" }); setMenuOpen(null); }} className="w-full text-left px-3 py-2 text-xs font-sans hover:bg-section-bg flex items-center gap-2"><MessageSquare size={12} /> WhatsApp</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      
      {confirmAction && (
        <div className="fixed inset-0 bg-foreground/30 flex items-center justify-center z-50" onClick={() => setConfirmAction(null)}>
          <div className="bg-card rounded-lg shadow-lg border border-border p-6 w-96 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3"><AlertTriangle size={16} className="text-warning" /><h3 className="font-serif font-semibold text-foreground">Confirm Action</h3></div>
            <p className="text-sm font-sans text-muted-foreground mb-4">Are you sure you want to <strong>{confirmAction.action}</strong> for <strong>{confirmAction.item.name}</strong>?</p>
            <div className="flex gap-2">
              <button onClick={() => updateStatus(confirmAction.item.id, confirmAction.status)}
                className="flex-1 px-3 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium">Yes, Confirm</button>
              <button onClick={() => setConfirmAction(null)}
                className="flex-1 px-3 py-2 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <MessageModal isOpen={msgModal.open} onClose={() => setMsgModal({ ...msgModal, open: false })}
        patientName={msgModal.name} patientPhone={msgModal.phone} type={msgModal.type} />
    </AdminLayout>
  );
};

export default UnifiedInbox;
