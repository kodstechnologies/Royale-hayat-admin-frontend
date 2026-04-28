import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { CalendarPlus, Eye, EyeOff, Users, Clock, Search } from "lucide-react";
import { doctors as allDoctors } from "@/data/mockDatabase";

const Doctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState(allDoctors.map(d => ({ ...d })));
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");

  const toggleBooking = (id: number) => {
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, bookingOpen: !d.bookingOpen } : d));
  };

  const toggleVisibility = (id: number) => {
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, visible: !d.visible } : d));
  };

  const departments = ["All", ...Array.from(new Set(allDoctors.map(d => d.department)))];

  const filtered = doctors.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === "All" || d.department === filterDept;
    return matchSearch && matchDept;
  });

  const totalOnline = doctors.reduce((s, d) => s + d.onlineAppointments, 0);
  const totalVisible = doctors.filter(d => d.visible).length;

  return (
    <AdminLayout title="Doctors">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Doctors", value: doctors.length, icon: Users },
          { label: "Visible on Website", value: totalVisible, icon: Eye },
          { label: "Online Appointments", value: totalOnline, icon: CalendarPlus },
          { label: "Booking Open", value: doctors.filter(d => d.bookingOpen).length, icon: Clock },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-lg shadow-sm border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-burgundy/10 flex items-center justify-center">
              <stat.icon size={18} className="text-burgundy" />
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-foreground">{stat.value}</p>
              <p className="text-xs font-sans text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search doctors..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-card border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
          className="px-3 py-2 rounded-lg bg-card border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold">
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(doctor => (
          <div key={doctor.id} className="bg-card rounded-lg shadow-sm border border-border p-5 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/doctors/${doctor.id}`)}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center">
                  <span className="text-burgundy font-serif font-bold text-lg">{doctor.name.split(" ").pop()?.[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-sans font-semibold text-foreground">{doctor.name}</p>
                  <p className="text-xs font-sans text-muted-foreground">{doctor.specialty}</p>
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); toggleVisibility(doctor.id); }}
                className={`p-1.5 rounded-md transition-colors ${doctor.visible ? "text-success hover:bg-success/10" : "text-muted-foreground hover:bg-muted"}`}
                title={doctor.visible ? "Visible" : "Hidden"}>
                {doctor.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>

            <div className="space-y-2 mb-4 text-xs font-sans">
              <div className="flex justify-between"><span className="text-muted-foreground">Department</span><span className="text-foreground">{doctor.department}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Availability</span><span className="text-foreground">{doctor.availability}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Online Appts</span><span className="text-foreground font-medium">{doctor.onlineAppointments}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Rating</span><span className="text-gold font-medium">★ {doctor.rating}</span></div>
            </div>

            <div className="flex items-center justify-between" onClick={e => e.stopPropagation()}>
              <span className={`px-2.5 py-1 rounded-full text-xs font-sans font-medium ${doctor.bookingOpen ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                {doctor.bookingOpen ? "Booking Open" : "Booking Closed"}
              </span>
              <button onClick={() => toggleBooking(doctor.id)}
                className="text-xs font-sans text-burgundy hover:text-burgundy-deep font-medium">
                {doctor.bookingOpen ? "Close" : "Open"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Doctors;
