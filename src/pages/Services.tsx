import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { exportToExcel } from "@/data/mockDatabase";
import { ToggleLeft, ToggleRight, Edit, Save, Download, Search, ChevronLeft } from "lucide-react";

type HospService = {
  id: number; name: string; nameAr: string; category: string; description: string; descriptionAr: string;
  status: "Active" | "Inactive"; operationalNotes: string; relatedArea: string; usage: string;
  contactPerson: string; availability: string; lastUpdated: string;
  features: string[];
};

const initialServices: HospService[] = [
  { id: 1, name: "VIP Luxury Suites", nameAr: "أجنحة فاخرة", category: "Accommodation", description: "Private luxury suites with 24/7 concierge, premium amenities, and personalized care plans. Each suite is connected to Operating Theatres, ICU, and Neonatal Department for immediate specialized care.", descriptionAr: "أجنحة فاخرة خاصة مع خدمة الكونسيرج على مدار الساعة ووسائل الراحة المتميزة.", status: "Active", operationalNotes: "Full occupancy weekends. Extra staff required.", relatedArea: "Patient Floors", usage: "High", contactPerson: "Ali Al-Sabah", availability: "24/7", lastUpdated: "2026-04-01", features: ["24/7 Concierge", "Premium Amenities", "Smart TV with Streaming", "Private Dining Option", "Connected to OR & ICU"] },
  { id: 2, name: "Executive Suites", nameAr: "أجنحة تنفيذية", category: "Accommodation", description: "Spacious private rooms with dedicated nursing, entertainment systems, and calming ambiance for recovery.", descriptionAr: "غرف خاصة واسعة مع تمريض مخصص وأنظمة ترفيه.", status: "Active", operationalNotes: "Popular with international patients.", relatedArea: "Patient Floors", usage: "High", contactPerson: "Ali Al-Sabah", availability: "24/7", lastUpdated: "2026-04-01", features: ["Dedicated Nursing", "Entertainment System", "Room Service", "Family Area"] },
  { id: 3, name: "Airport Pickup & Transfer", nameAr: "خدمة النقل من المطار", category: "Transport", description: "Private luxury car service from Kuwait International Airport for international patients. VIP lounge access can be arranged.", descriptionAr: "خدمة سيارة فاخرة خاصة من مطار الكويت الدولي.", status: "Active", operationalNotes: "24-hour notice required. Coordinate with International Dept.", relatedArea: "Logistics", usage: "Medium", contactPerson: "Fahad Al-Rashid", availability: "24/7", lastUpdated: "2026-03-28", features: ["Luxury Vehicle", "Airport VIP Lounge", "Multilingual Driver", "Meet & Greet"] },
  { id: 4, name: "Valet Parking", nameAr: "خدمة صف السيارات", category: "Transport", description: "Complimentary valet parking for all patients and visitors at the main entrance.", descriptionAr: "خدمة صف السيارات المجانية لجميع المرضى والزوار.", status: "Active", operationalNotes: "Available at main entrance.", relatedArea: "Parking", usage: "High", contactPerson: "Security", availability: "24/7", lastUpdated: "2026-03-15", features: ["Complimentary", "Main Entrance", "Secure Parking"] },
  { id: 5, name: "Private Dining", nameAr: "تناول الطعام الخاص", category: "Food & Beverage", description: "Gourmet meals prepared by our executive chef with customizable menus. Halal certified. All dietary restrictions accommodated.", descriptionAr: "وجبات ذواقة يعدها الشيف التنفيذي مع قوائم قابلة للتخصيص.", status: "Active", operationalNotes: "Halal certified. Dietary restrictions accommodated.", relatedArea: "Kitchen & Dining", usage: "High", contactPerson: "Chef Hassan", availability: "7AM-10PM", lastUpdated: "2026-04-05", features: ["Customizable Menu", "Halal Certified", "Room Service", "Special Diets"] },
  { id: 6, name: "Café & Lounge", nameAr: "مقهى وصالة", category: "Food & Beverage", description: "Premium café with specialty coffee, fresh juices, and light meals for visitors and patients.", descriptionAr: "مقهى متميز مع قهوة مميزة وعصائر طازجة ووجبات خفيفة.", status: "Active", operationalNotes: "Open 7AM-10PM daily.", relatedArea: "Ground Floor", usage: "High", contactPerson: "Manager", availability: "7AM-10PM", lastUpdated: "2026-04-05", features: ["Specialty Coffee", "Fresh Juices", "Light Meals", "Wi-Fi"] },
  { id: 7, name: "Spa & Sauna", nameAr: "سبا وساونا", category: "Wellness", description: "Relaxation spa with sauna, steam room, and therapeutic treatments. Separate male/female facilities.", descriptionAr: "سبا للاسترخاء مع ساونا وغرفة بخار وعلاجات.", status: "Active", operationalNotes: "Appointment required. Separate male/female facilities.", relatedArea: "Wellness Center", usage: "Medium", contactPerson: "Wellness Coord.", availability: "9AM-8PM", lastUpdated: "2026-03-15", features: ["Sauna", "Steam Room", "Massage", "Separate Facilities"] },
  { id: 8, name: "Concierge Service", nameAr: "خدمة الكونسيرج", category: "Guest Services", description: "24/7 personal concierge for patient and family needs including shopping, entertainment, and special requests. Multilingual staff.", descriptionAr: "كونسيرج شخصي على مدار الساعة لاحتياجات المريض والأسرة.", status: "Active", operationalNotes: "Multilingual staff available.", relatedArea: "Reception", usage: "High", contactPerson: "Concierge Desk", availability: "24/7", lastUpdated: "2026-04-01", features: ["24/7 Available", "Multilingual", "Shopping Assistance", "Entertainment"] },
  { id: 9, name: "Translation & Interpreter", nameAr: "خدمات الترجمة", category: "Guest Services", description: "Professional medical translation services in 10+ languages including Arabic, English, Hindi, Urdu, French, Spanish, and Mandarin.", descriptionAr: "خدمات ترجمة طبية احترافية بأكثر من 10 لغات.", status: "Active", operationalNotes: "Arabic, English, Hindi, Urdu, French, Spanish, Mandarin available.", relatedArea: "International Dept", usage: "High", contactPerson: "Intl. Dept", availability: "8AM-8PM", lastUpdated: "2026-04-01", features: ["10+ Languages", "Medical Terminology", "On-demand", "Certified Translators"] },
  { id: 10, name: "Infant & Mother Support", nameAr: "دعم الأم والطفل", category: "Patient Care", description: "Specialized support services for new mothers including lactation consulting, nursery, and postnatal care programs.", descriptionAr: "خدمات دعم متخصصة للأمهات الجدد.", status: "Active", operationalNotes: "Available in maternity wing only.", relatedArea: "Maternity", usage: "Medium", contactPerson: "Maternity Lead", availability: "24/7", lastUpdated: "2026-03-25", features: ["Lactation Consulting", "Nursery", "Postnatal Care", "Parent Education"] },
  { id: 11, name: "Prayer Room & Spiritual Care", nameAr: "غرفة الصلاة والرعاية الروحية", category: "Guest Services", description: "Dedicated prayer rooms and spiritual support for patients of all faiths. Available on every floor.", descriptionAr: "غرف صلاة مخصصة ودعم روحي للمرضى من جميع الأديان.", status: "Active", operationalNotes: "Available on every floor.", relatedArea: "Multi-floor", usage: "Medium", contactPerson: "Administration", availability: "24/7", lastUpdated: "2026-03-01", features: ["Every Floor", "All Faiths", "Quiet Environment"] },
  { id: 12, name: "Financial & Billing Assistance", nameAr: "المساعدة المالية والفواتير", category: "Administration", description: "Dedicated billing support for insurance claims, payment plans, and financial counseling. All major insurance providers accepted.", descriptionAr: "دعم فوترة مخصص لمطالبات التأمين وخطط الدفع.", status: "Active", operationalNotes: "All major insurance providers accepted.", relatedArea: "Finance", usage: "High", contactPerson: "Finance Dept", availability: "Sun-Thu 8AM-4PM", lastUpdated: "2026-04-01", features: ["Insurance Claims", "Payment Plans", "13 Insurance Providers", "Financial Counseling"] },
  { id: 13, name: "Visitor Accommodation Booking", nameAr: "حجز إقامة الزوار", category: "Accommodation", description: "Partner hotel reservations for patient companions and family members at discounted rates.", descriptionAr: "حجوزات فندقية شريكة لمرافقي المرضى وأفراد العائلة.", status: "Active", operationalNotes: "Discounted rates at partner hotels.", relatedArea: "Concierge", usage: "Medium", contactPerson: "Concierge Desk", availability: "24/7", lastUpdated: "2026-03-20", features: ["Partner Hotels", "Discounted Rates", "Family Rooms", "Shuttle Service"] },
  { id: 14, name: "Patient Entertainment", nameAr: "ترفيه المريض", category: "Patient Care", description: "In-room entertainment systems including smart TVs with streaming services, library access, and recreational activities.", descriptionAr: "أنظمة ترفيه داخل الغرفة.", status: "Active", operationalNotes: "Smart TVs with streaming services in all rooms.", relatedArea: "Patient Floors", usage: "High", contactPerson: "IT Dept", availability: "24/7", lastUpdated: "2026-04-01", features: ["Smart TV", "Streaming", "Library", "Wi-Fi"] },
];

const Services = () => {
  const [services, setServices] = useState(initialServices);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [selectedService, setSelectedService] = useState<HospService | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<HospService>>({});
  const { t, lang } = useLanguage();

  const categories = ["All", ...Array.from(new Set(initialServices.map(s => s.category)))];

  const filtered = services.filter(s => {
    const matchCat = filterCat === "All" || s.category === filterCat;
    const name = lang === "ar" ? s.nameAr : s.name;
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleStatus = (id: number) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s));
    if (selectedService?.id === id) setSelectedService(prev => prev ? { ...prev, status: prev.status === "Active" ? "Inactive" : "Active" } : null);
  };

  const startEdit = () => { if (!selectedService) return; setEditing(true); setEditData({ ...selectedService }); };

  const saveEdit = () => {
    if (!selectedService) return;
    const updated = { ...selectedService, ...editData } as HospService;
    setServices(prev => prev.map(s => s.id === selectedService.id ? updated : s));
    setSelectedService(updated);
    setEditing(false);
  };

  if (selectedService) {
    const displayName = lang === "ar" ? selectedService.nameAr : selectedService.name;
    const displayDesc = lang === "ar" ? selectedService.descriptionAr : selectedService.description;

    return (
      <AdminLayout title="Hospitality Services">
        <button onClick={() => { setSelectedService(null); setEditing(false); }}
          className="flex items-center gap-1 text-sm font-sans text-burgundy hover:text-burgundy-deep mb-4">
          <ChevronLeft size={14} /> {t("Back")}
        </button>

        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-sans text-muted-foreground">{t("Name")} (EN)</label>
                  <input type="text" value={editData.name || ""} onChange={e => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" /></div>
                <div><label className="text-xs font-sans text-muted-foreground">{t("Name")} (AR)</label>
                  <input type="text" value={editData.nameAr || ""} onChange={e => setEditData({ ...editData, nameAr: e.target.value })} dir="rtl"
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-sans text-muted-foreground">{t("Category")}</label>
                  <input type="text" value={editData.category || ""} onChange={e => setEditData({ ...editData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" /></div>
                <div><label className="text-xs font-sans text-muted-foreground">{t("Contact Person")}</label>
                  <input type="text" value={editData.contactPerson || ""} onChange={e => setEditData({ ...editData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" /></div>
                <div><label className="text-xs font-sans text-muted-foreground">{t("Availability")}</label>
                  <input type="text" value={editData.availability || ""} onChange={e => setEditData({ ...editData, availability: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" /></div>
              </div>
              <div><label className="text-xs font-sans text-muted-foreground">{t("Description")} (EN)</label>
                <textarea value={editData.description || ""} onChange={e => setEditData({ ...editData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold resize-none" rows={3} /></div>
              <div><label className="text-xs font-sans text-muted-foreground">{t("Description")} (AR)</label>
                <textarea value={editData.descriptionAr || ""} onChange={e => setEditData({ ...editData, descriptionAr: e.target.value })} dir="rtl"
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold resize-none" rows={3} /></div>
              <div><label className="text-xs font-sans text-muted-foreground">{t("Operational Notes")}</label>
                <textarea value={editData.operationalNotes || ""} onChange={e => setEditData({ ...editData, operationalNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold resize-none" rows={2} /></div>
              <div className="flex gap-2">
                <button onClick={saveEdit} className="flex items-center gap-1 px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium"><Save size={12} /> {t("Save")}</button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium">{t("Cancel")}</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-serif font-semibold text-foreground">{displayName}</h2>
                  <span className="text-xs font-sans text-gold font-medium">{selectedService.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={startEdit} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium hover:bg-border"><Edit size={12} /> {t("Edit")}</button>
                  <button onClick={() => toggleStatus(selectedService.id)}>
                    {selectedService.status === "Active" ? <ToggleRight size={24} className="text-success" /> : <ToggleLeft size={24} className="text-muted-foreground" />}
                  </button>
                </div>
              </div>
              <p className="text-sm font-sans text-muted-foreground mb-4">{displayDesc}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {[
                  [t("Related Area"), selectedService.relatedArea],
                  [t("Usage"), selectedService.usage], [t("Contact Person"), selectedService.contactPerson],
                  [t("Availability"), selectedService.availability], [t("Last Updated"), selectedService.lastUpdated],
                ].map(([label, val]) => (
                  <div key={label} className="bg-section-bg rounded-lg p-3">
                    <p className="text-xs font-sans text-muted-foreground">{label}</p>
                    <p className="text-sm font-sans font-medium text-foreground">{val}</p>
                  </div>
                ))}
              </div>
              {selectedService.features.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-serif font-semibold text-foreground mb-2">{t("Features")}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedService.features.map(f => (<span key={f} className="px-2 py-1 rounded bg-burgundy/10 text-burgundy text-xs font-sans font-medium">{f}</span>))}
                  </div>
                </div>
              )}
              {selectedService.operationalNotes && (
                <div className="bg-section-bg rounded-lg p-4">
                  <p className="text-xs font-sans text-muted-foreground mb-1">{t("Operational Notes")}</p>
                  <p className="text-sm font-sans text-foreground">{selectedService.operationalNotes}</p>
                </div>
              )}
            </>
          )}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Hospitality Services">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder={t("Search...")} value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-card border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              className={`px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-colors
                ${filterCat === c ? "bg-burgundy text-primary-foreground" : "bg-card text-muted-foreground hover:bg-border border border-border"}`}>
              {c}
            </button>
          ))}
        </div>
        <button onClick={() => exportToExcel(filtered.map(s => ({ Name: s.name, Category: s.category, Status: s.status, Usage: s.usage })), "hospitality-services")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-success/10 text-success text-xs font-sans font-medium hover:bg-success/20 transition-colors">
          <Download size={13} /> {t("Export")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(service => {
          const displayName = lang === "ar" ? service.nameAr : service.name;
          const displayDesc = lang === "ar" ? service.descriptionAr : service.description;
          return (
            <div key={service.id} className={`bg-card rounded-lg shadow-sm border border-border p-5 cursor-pointer hover:shadow-md transition-shadow ${service.status === "Inactive" ? "opacity-60" : ""}`}
              onClick={() => setSelectedService(service)}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-serif font-semibold text-foreground text-base">{displayName}</h3>
                  <span className="text-xs font-sans text-gold font-medium">{service.category}</span>
                </div>
                <div onClick={e => e.stopPropagation()}>
                  <button onClick={() => toggleStatus(service.id)}>
                    {service.status === "Active" ? <ToggleRight size={20} className="text-success" /> : <ToggleLeft size={20} className="text-muted-foreground" />}
                  </button>
                </div>
              </div>
              <p className="text-sm font-sans text-muted-foreground mb-2 line-clamp-2">{displayDesc}</p>
              <div className="space-y-1 text-xs font-sans">
                <div className="flex justify-between"><span className="text-muted-foreground">{t("Availability")}</span><span className="text-foreground">{service.availability}</span></div>
              </div>
              <div className="mt-2 text-xs font-sans text-burgundy font-medium">{t("View All")} →</div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
};

export default Services;
