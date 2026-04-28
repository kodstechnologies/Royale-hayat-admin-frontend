import { useState } from "react";
import { X, Send, MessageSquare, Phone } from "lucide-react";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientPhone: string;
  type: "SMS" | "WhatsApp";
}

const MessageModal = ({ isOpen, onClose, patientName, patientPhone, type }: MessageModalProps) => {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    if (message.trim()) {
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setMessage("");
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-foreground/30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-lg border border-border p-6 w-96 animate-fade-in" onClick={e => e.stopPropagation()}>
        {sent ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
              <Send size={20} className="text-success" />
            </div>
            <p className="text-sm font-sans font-semibold text-foreground">Message Sent Successfully!</p>
            <p className="text-xs font-sans text-muted-foreground mt-1">
              {type} sent to {patientName}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-semibold text-foreground flex items-center gap-2">
                {type === "WhatsApp" ? <MessageSquare size={16} className="text-success" /> : <Phone size={16} className="text-info" />}
                Send {type}
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-sans text-muted-foreground">To</label>
                <p className="text-sm font-sans font-medium text-foreground">{patientName}</p>
                <p className="text-xs font-sans text-muted-foreground">{patientPhone}</p>
              </div>
              <div>
                <label className="text-xs font-sans text-muted-foreground">Message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full mt-1 p-3 rounded-lg border border-border text-sm font-sans bg-section-bg focus:outline-none focus:ring-1 focus:ring-gold resize-none"
                  rows={4} />
              </div>
              <div className="text-xs font-sans text-muted-foreground">
                Quick templates:
                <div className="flex flex-wrap gap-1 mt-1">
                  {["Appointment reminder", "Documents needed", "Results ready", "Follow-up scheduled"].map(t => (
                    <button key={t} onClick={() => setMessage(t + " - Royale Hayat Hospital")}
                      className="px-2 py-1 rounded bg-section-bg border border-border text-xs hover:bg-muted transition-colors">{t}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSend}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-sm font-sans font-medium hover:bg-burgundy-deep transition-colors">
                <Send size={14} /> Send {type}
              </button>
              <button onClick={onClose}
                className="px-4 py-2 rounded-md bg-section-bg text-muted-foreground text-sm font-sans font-medium hover:bg-border transition-colors">
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageModal;
