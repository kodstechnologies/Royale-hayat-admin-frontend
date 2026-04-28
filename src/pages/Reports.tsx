import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { appointments, feedbackEntries, patients, exportToExcel } from "@/data/mockDatabase";

const reportCategories = [
  { id: "feedback", label: "Feedback & Reviews" },
  { id: "appointment-requests", label: "Appointment Requests" },
  { id: "international", label: "International Patients" },
];

const chartColor = "hsl(342,40%,55%)";
const chartColorLight = "hsl(342,40%,75%)";
const chartColorLighter = "hsl(342,40%,85%)";

const Reports = () => {
  const [activeReport, setActiveReport] = useState("feedback");
  const [dateRange, setDateRange] = useState("6months");
  const { t } = useLanguage();

  const feedbackByRating = [
    { rating: "5★", count: feedbackEntries.filter(f => f.rating === 5).length },
    { rating: "4★", count: feedbackEntries.filter(f => f.rating === 4).length },
    { rating: "3★", count: feedbackEntries.filter(f => f.rating === 3).length },
    { rating: "2★", count: feedbackEntries.filter(f => f.rating === 2).length },
    { rating: "1★", count: feedbackEntries.filter(f => f.rating === 1).length },
  ];

  const feedbackByStatus = [
    { name: t("New"), value: feedbackEntries.filter(f => f.status === "new").length, color: chartColor },
    { name: t("Replied"), value: feedbackEntries.filter(f => f.status === "replied").length, color: chartColorLight },
    { name: t("Flagged"), value: feedbackEntries.filter(f => f.status === "flagged").length, color: chartColorLighter },
    { name: t("Resolved"), value: feedbackEntries.filter(f => f.status === "resolved").length, color: "hsl(342,20%,80%)" },
  ];

  const feedbackTrends = [
    { month: "Oct", reviews: 28, avgRating: 4.2 },
    { month: "Nov", reviews: 35, avgRating: 4.4 },
    { month: "Dec", reviews: 22, avgRating: 4.1 },
    { month: "Jan", reviews: 40, avgRating: 4.5 },
    { month: "Feb", reviews: 45, avgRating: 4.6 },
    { month: "Mar", reviews: 52, avgRating: 4.7 },
    { month: "Apr", reviews: 38, avgRating: 4.5 },
  ];

  const appointmentsByStatus = [
    { status: t("Confirmed"), count: appointments.filter(a => a.status === "confirmed").length },
    { status: t("Pending"), count: appointments.filter(a => a.status === "pending").length },
    { status: t("Completed"), count: appointments.filter(a => a.status === "completed").length },
    { status: t("Cancelled"), count: appointments.filter(a => a.status === "cancelled").length },
    { status: t("Rescheduled"), count: appointments.filter(a => a.status === "rescheduled").length },
  ];

  const monthlyRequests = [
    { month: "Oct", requests: 45, converted: 32 },
    { month: "Nov", requests: 52, converted: 38 },
    { month: "Dec", requests: 38, converted: 25 },
    { month: "Jan", requests: 61, converted: 48 },
    { month: "Feb", requests: 68, converted: 52 },
    { month: "Mar", requests: 75, converted: 60 },
    { month: "Apr", requests: 58, converted: 44 },
  ];

  const intlByCountry = [
    { country: "UK", patients: 8 }, { country: "Germany", patients: 5 },
    { country: "India", patients: 7 }, { country: "China", patients: 3 },
    { country: "Spain", patients: 4 }, { country: "USA", patients: 6 },
    { country: "Oman", patients: 4 }, { country: "Iraq", patients: 3 },
    { country: "Saudi", patients: 5 }, { country: "France", patients: 2 },
  ];

  const intlTrends = [
    { month: "Oct", enquiries: 12 }, { month: "Nov", enquiries: 15 },
    { month: "Dec", enquiries: 10 }, { month: "Jan", enquiries: 18 },
    { month: "Feb", enquiries: 22 }, { month: "Mar", enquiries: 25 },
    { month: "Apr", enquiries: 20 },
  ];

  const handleExport = () => {
    const exportMap: Record<string, () => void> = {
      feedback: () => exportToExcel(feedbackEntries.map(f => ({ Patient: f.patient, Rating: f.rating, Comment: f.comment, Doctor: f.doctor, Status: f.status, Date: f.date })), "feedback-report"),
      "appointment-requests": () => exportToExcel(appointments.map(a => ({ Patient: a.patient, Department: a.department, Doctor: a.doctor, Date: a.date, Status: a.status, Source: a.source })), "appointment-requests-report"),
      international: () => exportToExcel(intlByCountry, "international-report"),
    };
    (exportMap[activeReport] || (() => {}))();
  };

  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-card rounded-lg shadow-sm border border-border p-5">
      <h3 className="font-serif font-semibold text-foreground mb-3 text-sm">{title}</h3>
      {children}
    </div>
  );

  return (
    <AdminLayout title="Reports">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex gap-1 flex-wrap">
          {reportCategories.map(cat => (
            <button key={cat.id} onClick={() => setActiveReport(cat.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-colors
                ${activeReport === cat.id ? "bg-burgundy text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-section-bg"}`}>
              {t(cat.label)}
            </button>
          ))}
        </div>
        <select value={dateRange} onChange={e => setDateRange(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-border text-sm font-sans bg-card focus:outline-none focus:ring-1 focus:ring-gold">
          <option value="1month">{t("Last 1 Month")}</option><option value="3months">{t("Last 3 Months")}</option>
          <option value="6months">{t("Last 6 Months")}</option><option value="1year">{t("Last 1 Year")}</option>
        </select>
        {["CSV", "Excel", "PDF"].map(fmt => (
          <button key={fmt} onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-card border border-border text-xs font-sans font-medium text-foreground hover:bg-section-bg transition-colors">
            <Download size={13} /> {fmt}
          </button>
        ))}
      </div>

      {activeReport === "feedback" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title={t("Feedback Trends")}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={feedbackTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,92%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: "Inter" }} /><YAxis tick={{ fontSize: 10, fontFamily: "Inter" }} />
                <Tooltip /><Line type="monotone" dataKey="reviews" stroke={chartColor} strokeWidth={2} dot={{ fill: chartColor }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title={t("By Rating")}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={feedbackByRating}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,92%)" />
                <XAxis dataKey="rating" tick={{ fontSize: 10, fontFamily: "Inter" }} /><YAxis tick={{ fontSize: 10, fontFamily: "Inter" }} />
                <Tooltip /><Bar dataKey="count" fill={chartColorLight} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title={t("By Status")}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={feedbackByStatus} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {feedbackByStatus.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie><Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title={t("Average Rating Trend")}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={feedbackTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,92%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: "Inter" }} /><YAxis domain={[3, 5]} tick={{ fontSize: 10, fontFamily: "Inter" }} />
                <Tooltip /><Line type="monotone" dataKey="avgRating" stroke={chartColor} strokeWidth={2} dot={{ fill: chartColor }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {activeReport === "appointment-requests" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title={t("Request Volume & Conversions")}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyRequests}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,92%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: "Inter" }} /><YAxis tick={{ fontSize: 10, fontFamily: "Inter" }} />
                <Tooltip />
                <Bar dataKey="requests" fill={chartColor} radius={[3, 3, 0, 0]} name={t("Requests")} />
                <Bar dataKey="converted" fill={chartColorLight} radius={[3, 3, 0, 0]} name={t("Converted")} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title={t("Request Status")}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={appointmentsByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,92%)" />
                <XAxis dataKey="status" tick={{ fontSize: 10, fontFamily: "Inter" }} /><YAxis tick={{ fontSize: 10, fontFamily: "Inter" }} />
                <Tooltip /><Bar dataKey="count" fill={chartColorLight} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title={t("Conversion Rate")}>
            <div className="space-y-4 pt-4">
              {[{ label: t("Converted"), pct: 65, color: `bg-[hsl(342,40%,55%)]` }, { label: t("Pending"), pct: 20, color: `bg-[hsl(342,40%,75%)]` }, { label: t("Rejected"), pct: 15, color: `bg-[hsl(342,40%,85%)]` }].map(r => (
                <div key={r.label}>
                  <div className="flex justify-between text-xs font-sans mb-1"><span>{r.label}</span><span>{r.pct}%</span></div>
                  <div className="w-full h-2 bg-section-bg rounded-full"><div className={`h-2 rounded-full ${r.color}`} style={{ width: `${r.pct}%` }} /></div>
                </div>
              ))}
            </div>
          </ChartCard>
          <ChartCard title={t("By Source")}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[
                { source: t("Online"), count: appointments.filter(a => a.source === "Online").length },
                { source: t("Walk-in"), count: appointments.filter(a => a.source === "Walk-in").length },
                { source: t("Phone"), count: appointments.filter(a => a.source === "Phone").length },
                { source: t("International"), count: appointments.filter(a => a.source === "International").length },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,92%)" />
                <XAxis dataKey="source" tick={{ fontSize: 10, fontFamily: "Inter" }} /><YAxis tick={{ fontSize: 10, fontFamily: "Inter" }} />
                <Tooltip /><Bar dataKey="count" fill={chartColor} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {activeReport === "international" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title={t("Enquiries by Country")}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={intlByCountry}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,92%)" />
                <XAxis dataKey="country" tick={{ fontSize: 10, fontFamily: "Inter" }} /><YAxis tick={{ fontSize: 10, fontFamily: "Inter" }} />
                <Tooltip /><Bar dataKey="patients" fill={chartColorLight} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title={t("Monthly Enquiry Trends")}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={intlTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,92%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: "Inter" }} /><YAxis tick={{ fontSize: 10, fontFamily: "Inter" }} />
                <Tooltip /><Area type="monotone" dataKey="enquiries" stroke={chartColor} fill={chartColor} fillOpacity={0.08} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </AdminLayout>
  );
};

export default Reports;
