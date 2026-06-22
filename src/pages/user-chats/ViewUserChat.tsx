import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Bot,
  Calendar,
  Globe,
  Hash,
  MessageSquare,
  Sparkles,
  User,
} from "lucide-react";
import { getChatLogById, type ChatLogRecord } from "@/api/chatLog";

const formatDate = (value?: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ViewUserChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState<ChatLogRecord | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLog = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await getChatLogById(id);
        setLog({ ...response.data, isViewed: true });
        setError("");
        window.dispatchEvent(new Event("userChatsUpdated"));
      } catch (err: unknown) {
        setLog(null);
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr?.response?.data?.message || "Failed to load chat log");
      } finally {
        setLoading(false);
      }
    };

    void fetchLog();
  }, [id]);

  const sourceLabel =
    log?.source === "whatsapp" || log?.source === "guided_topic"
      ? "WhatsApp handoff"
      : "—";

  return (
    <AdminLayout title="View User Chat">
      <div className="space-y-6">
        <BreadCrumb />

        <Button
          variant="ghost"
          onClick={() => navigate("/user-chats")}
          className="text-slate-600 hover:text-burgundy -mt-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to User Chats
        </Button>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading chat...
          </div>
        ) : error || !log ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
            {error || "Chat log not found"}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl border-2 border-burgundy/30 bg-white shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <Hash className="h-5 w-5 text-burgundy mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Reference</p>
                    <p className="font-mono font-semibold text-burgundy">
                      {log.referenceId || "—"}
                    </p>
                  </div>
                </div>
             
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Language</p>
                    <p className="font-medium text-slate-800 uppercase">{log.lang}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Date</p>
                    <p className="font-medium text-slate-800">{formatDate(log.createdAt)}</p>
                  </div>
                </div>
                {log.topicId && (
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">Topic</p>
                      <p className="font-medium text-slate-800">{log.topicId}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Status</p>
                    <p className="font-medium text-slate-800">
                      {log.isViewed === true ? "Viewed" : "New"}
                    </p>
                  </div>
                </div>
              
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Conversation</h3>
              <div className="space-y-3">
                {(log.messages?.length ? log.messages : []).map((message, index) => (
                  <div
                    key={index}
                    className={`rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                      message.role === "user"
                        ? "bg-burgundy/5 border border-burgundy/10 ml-8"
                        : "bg-slate-50 border border-slate-200 mr-8"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                      {message.role === "user" ? "User" : "Assistant"}
                    </p>
                    {message.content}
                  </div>
                ))}
              </div>

              {log.assistantReply &&
                !log.messages?.some(
                  (m) => m.role === "assistant" && m.content === log.assistantReply,
                ) && (
                  <div className="rounded-xl px-4 py-3 text-sm whitespace-pre-wrap bg-slate-50 border border-slate-200 mr-8">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                      Assistant reply
                    </p>
                    {log.assistantReply}
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ViewUserChat;
