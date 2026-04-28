import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, TrendingDown, Calendar, Globe, Clock, Stethoscope, Activity, MessageSquare, Star, ClipboardList, Shield, Mail, UserCheck } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { appointments, doctors, departments, feedbackEntries, patients } from "@/data/mockDatabase";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const pendingAppointments = appointments.filter(a => a.status === "pending").length;
  const internationalPatients = patients.filter(p => p.isInternational).length;
  const availableDoctors = doctors.filter(d => d.bookingOpen).length;
  const avgRating = (feedbackEntries.reduce((s, f) => s + f.rating, 0) / feedbackEntries.length).toFixed(1);

  const statsCards = [
    { title: t("Appointment Requests"), value: String(pendingAppointments + 23), change: "+5", up: true, icon: Calendar, link: "/appointment-requests", color: "bg-burgundy/10 text-burgundy" },
    { title: t("Medical Records Requests"), value: "8", change: "+3", up: true, icon: ClipboardList, link: "/medical-records-requests", color: "bg-info/10 text-info" },
    { title: t("International Enquiries"), value: String(internationalPatients), change: "+12%", up: true, icon: Globe, link: "/international-patients", color: "bg-info/10 text-info" },
    { title: t("Al Safwa Enrollments"), value: "6", change: "+2", up: true, icon: Shield, link: "/al-safwa-enrollments", color: "bg-gold/10 text-gold" },
    { title: t("Contact Messages"), value: "8", change: "+4", up: true, icon: Mail, link: "/contact-messages", color: "bg-burgundy/10 text-burgundy" },
    { title: t("Job Applications"), value: "8", change: "+3", up: true, icon: UserCheck, link: "/job-applications", color: "bg-success/10 text-success" },
    { title: t("Feedback & Reviews"), value: String(feedbackEntries.length), change: "+8", up: true, icon: MessageSquare, link: "/feedback", color: "bg-warning/10 text-warning" },
    { title: t("Avg Rating"), value: avgRating, change: "+0.2", up: true, icon: Star, link: "/feedback", color: "bg-gold/10 text-gold" },
  ];

  const weeklyData = [
    { day: t("Sun"), requests: 12, converted: 8 },
    { day: t("Mon"), requests: 18, converted: 14 },
    { day: t("Tue"), requests: 15, converted: 11 },
    { day: t("Wed"), requests: 22, converted: 17 },
    { day: t("Thu"), requests: 19, converted: 15 },
    { day: t("Fri"), requests: 6, converted: 4 },
    { day: t("Sat"), requests: 4, converted: 3 },
  ];

  const monthlyTrends = [
    { month: "Oct", requests: 65, intl: 12, feedback: 28 },
    { month: "Nov", requests: 72, intl: 15, feedback: 35 },
    { month: "Dec", requests: 58, intl: 10, feedback: 22 },
    { month: "Jan", requests: 85, intl: 18, feedback: 40 },
    { month: "Feb", requests: 92, intl: 22, feedback: 45 },
    { month: "Mar", requests: 98, intl: 25, feedback: 52 },
    { month: "Apr", requests: 78, intl: 20, feedback: 38 },
  ];

  const feedbackByRating = [
    { rating: "5★", count: feedbackEntries.filter(f => f.rating === 5).length },
    { rating: "4★", count: feedbackEntries.filter(f => f.rating === 4).length },
    { rating: "3★", count: feedbackEntries.filter(f => f.rating === 3).length },
    { rating: "2★", count: feedbackEntries.filter(f => f.rating === 2).length },
    { rating: "1★", count: feedbackEntries.filter(f => f.rating === 1).length },
  ];

  const departmentLoad = [
    { dept: "OB/GYN", patients: 1240 }, { dept: "Pediatrics", patients: 1580 },
    { dept: "Internal Med", patients: 1890 }, { dept: "Cardiology", patients: 890 },
    { dept: "Surgery", patients: 730 }, { dept: "Dermatology", patients: 670 },
  ];

  const sourceDistribution = [
    { name: t("Online"), value: 45, color: "hsl(213,60%,70%)" },
    { name: t("Phone"), value: 25, color: "hsl(39,44%,70%)" },
    { name: t("Walk-in"), value: 18, color: "hsl(125,40%,65%)" },
    { name: t("International"), value: 12, color: "hsl(342,40%,70%)" },
  ];

  const chartColor = "hsl(342,40%,55%)";

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statsCards.map((card) => (
          <div key={card.title} onClick={() => navigate(card.link)}
            className="bg-card rounded-lg p-3.5 shadow-sm border border-border animate-fade-in cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon size={15} />
              </div>
              <span className={`text-[10px] font-sans font-medium flex items-center gap-0.5 ${card.up ? "text-success" : "text-error"}`}>
                {card.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {card.change}
              </span>
            </div>
            <p className="text-xl font-serif font-bold text-foreground">{card.value}</p>
            <p className="text-[10px] font-sans text-muted-foreground mt-0.5 truncate">{card.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
          <h3 className="font-serif font-semibold text-foreground mb-3 text-sm">{t("Weekly Requests & Conversions")}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,92%)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: "Inter" }} />
              <YAxis tick={{ fontSize: 10, fontFamily: "Inter" }} />
              <Tooltip />
              <Bar dataKey="requests" fill={chartColor} radius={[3, 3, 0, 0]} name={t("Requests")} />
              <Bar dataKey="converted" fill="hsl(342,40%,75%)" radius={[3, 3, 0, 0]} name={t("Converted")} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
          <h3 className="font-serif font-semibold text-foreground mb-3 text-sm">{t("Monthly Trends")}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,92%)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: "Inter" }} />
              <YAxis tick={{ fontSize: 10, fontFamily: "Inter" }} />
              <Tooltip />
              <Area type="monotone" dataKey="requests" stroke={chartColor} fill={chartColor} fillOpacity={0.06} strokeWidth={1.5} name={t("Requests")} />
              <Area type="monotone" dataKey="intl" stroke="hsl(342,40%,75%)" fill="hsl(342,40%,75%)" fillOpacity={0.06} strokeWidth={1.5} name={t("International")} />
              <Area type="monotone" dataKey="feedback" stroke="hsl(342,40%,85%)" fill="hsl(342,40%,85%)" fillOpacity={0.06} strokeWidth={1.5} name={t("Feedback")} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
          <h3 className="font-serif font-semibold text-foreground mb-3 text-sm">{t("Request Sources")}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={sourceDistribution} cx="50%" cy="50%" outerRadius={65} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {sourceDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
          <h3 className="font-serif font-semibold text-foreground mb-3 text-sm">{t("Feedback by Rating")}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={feedbackByRating} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,92%)" />
              <XAxis type="number" tick={{ fontSize: 10, fontFamily: "Inter" }} />
              <YAxis type="category" dataKey="rating" tick={{ fontSize: 10, fontFamily: "Inter" }} width={30} />
              <Tooltip />
              <Bar dataKey="count" fill={chartColor} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
          <h3 className="font-serif font-semibold text-foreground mb-3 text-sm">{t("Department Patient Load")}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={departmentLoad} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,92%)" />
              <XAxis type="number" tick={{ fontSize: 10, fontFamily: "Inter" }} />
              <YAxis type="category" dataKey="dept" tick={{ fontSize: 9, fontFamily: "Inter" }} width={70} />
              <Tooltip />
              <Bar dataKey="patients" fill="hsl(342,40%,75%)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
