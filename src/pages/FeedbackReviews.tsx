import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Star, MessageSquare, Flag, CheckCircle, Reply } from "lucide-react";

type Feedback = {
  id: number; patient: string; rating: number; comment: string;
  doctor: string; department: string; date: string;
  status: "new" | "replied" | "flagged" | "resolved";
};

const feedbackData: Feedback[] = [
  { id: 1, patient: "Sarah Al-Mutairi", rating: 5, comment: "Exceptional care during my delivery. The staff was incredibly attentive and the facilities are world-class.", doctor: "Dr. Layla Ahmed", department: "Obstetrics", date: "2026-04-07", status: "new" },
  { id: 2, patient: "Ahmed Hassan", rating: 4, comment: "Very good service, slight wait time but the consultation was thorough.", doctor: "Dr. Omar Khalil", department: "Cardiology", date: "2026-04-06", status: "replied" },
  { id: 3, patient: "Noura Al-Rashidi", rating: 2, comment: "Room cleanliness could be improved. Staff was friendly however.", doctor: "Dr. Nadia Farouk", department: "Dermatology", date: "2026-04-05", status: "flagged" },
  { id: 4, patient: "Fatima Al-Sabah", rating: 5, comment: "Best hospital experience in Kuwait. True luxury healthcare.", doctor: "Dr. Hassan Bakr", department: "Pediatrics", date: "2026-04-04", status: "resolved" },
];

const statusStyles: Record<string, string> = {
  new: "bg-info/10 text-info", replied: "bg-success/10 text-success",
  flagged: "bg-error/10 text-error", resolved: "bg-muted text-muted-foreground",
};

const FeedbackReviews = () => {
  const [data, setData] = useState(feedbackData);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const updateStatus = (id: number, status: Feedback["status"]) => {
    setData((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
  };

  const handleReply = (id: number) => {
    if (replyText.trim()) {
      updateStatus(id, "replied");
      setReplyingTo(null);
      setReplyText("");
    }
  };

  return (
    <AdminLayout title="Feedback & Reviews">
      <div className="space-y-4">
        {data.map((fb) => (
          <div key={fb.id} className="bg-card rounded-lg shadow-sm border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-sans font-medium text-foreground">{fb.patient}</p>
                <p className="text-xs font-sans text-muted-foreground">{fb.department} · {fb.doctor} · {fb.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className={s <= fb.rating ? "text-gold fill-gold" : "text-border"} />
                  ))}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${statusStyles[fb.status]}`}>{fb.status}</span>
              </div>
            </div>
            <p className="text-sm font-sans text-foreground mb-4">{fb.comment}</p>

            {replyingTo === fb.id && (
              <div className="mb-3 animate-fade-in">
                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full p-3 rounded-lg border border-border text-sm font-sans bg-section-bg focus:outline-none focus:ring-1 focus:ring-gold resize-none"
                  rows={3} />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleReply(fb.id)}
                    className="px-3 py-1.5 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium hover:bg-burgundy-deep transition-colors">Send Reply</button>
                  <button onClick={() => setReplyingTo(null)}
                    className="px-3 py-1.5 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium hover:bg-border transition-colors">Cancel</button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setReplyingTo(fb.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium hover:bg-border transition-colors">
                <Reply size={13} /> Reply
              </button>
              <button onClick={() => updateStatus(fb.id, "flagged")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium hover:bg-border transition-colors">
                <Flag size={13} /> Flag
              </button>
              <button onClick={() => updateStatus(fb.id, "resolved")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium hover:bg-border transition-colors">
                <CheckCircle size={13} /> Resolve
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default FeedbackReviews;
