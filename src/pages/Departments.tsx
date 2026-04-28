import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { doctors as mockDoctors, exportToExcel } from "@/data/mockDatabase";
import { Edit, ToggleLeft, ToggleRight, Save, Download, Search, ChevronLeft, Stethoscope, Users, MapPin, Eye, X, Plus, Trash2 } from "lucide-react";

type DeptState = {
  id: number; name: string; nameAr: string; description: string; descriptionAr: string;
  doctors: string[]; active: boolean; headOfDept: string; totalPatients: number; location: string;
  specialties: string[]; services: string[]; notes: string; operatingHours: string; bedCount: number; equipment: string[];
};

const websiteDepts: DeptState[] = [
  { id: 1, name: "Obstetrics & Gynecology", nameAr: "أمراض النساء والتوليد", description: "At Royale Hayat Hospital, we know that pregnancy and childbirth are life-changing experiences. Our expert team is here to guide you, offering compassionate care tailored to your needs, ensuring safety and comfort for you and your baby.", descriptionAr: "في مستشفى رويال حياة، نعلم أن الحمل والولادة تجارب تغير حياتك. فريقنا من الخبراء هنا لإرشادك.", doctors: ["Dr. Abubakr Elmardi", "Dr. Layla Ahmed", "Dr. Sara Nasser"], active: true, headOfDept: "Dr. Abubakr Elmardi", totalPatients: 1240, location: "5th Floor", specialties: ["Women's Health", "Urogynecology", "Cosmetic Gynecology", "Gynecologic Oncology", "Physiotherapy", "Parent & Childbirth Education"], services: ["Preconception Planning", "Prenatal Care", "24/7 Consultant Availability", "Maternal-Fetal Medicine", "Obstetric Ultrasound", "Labor Pain Management", "Care for Multiples", "Vaginal and Cesarean Deliveries", "Genetic Counseling"], notes: "9 private birthing suites, 6 Mimosa Suites for low-risk births, 2 High Dependency Units, 1 isolation room.", operatingHours: "24/7", bedCount: 18, equipment: ["4D Ultrasound", "Fetal Monitor", "HDU Equipment", "Operating Theatre"] },
  { id: 2, name: "Reproductive Medicine & IVF", nameAr: "الطب التناسلي وأطفال الأنابيب", description: "We blend expertise with cutting-edge technology to offer the most advanced infertility treatments.", descriptionAr: "نمزج الخبرة مع التكنولوجيا المتطورة لتقديم أحدث علاجات العقم.", doctors: ["Dr. Layla Ahmed"], active: true, headOfDept: "Dr. Layla Ahmed", totalPatients: 380, location: "Building A, Floor 3", specialties: ["IVF", "ICSI", "IUI", "Frozen Embryo Transfer", "PGD"], services: ["Clomid Cycles", "Male Factor Infertility", "Artificial Insemination (IUI)", "IVF and FET", "ICSI", "Pre-implantation Genetic Diagnosis", "Endometriosis & PCOS Treatment"], notes: "Specialized counseling and emotional support services available.", operatingHours: "Sun-Thu 8AM-4PM", bedCount: 6, equipment: ["Embryo Incubator", "Microscopy", "Cryopreservation"] },
  { id: 3, name: "Pediatrics", nameAr: "طب الأطفال", description: "World-class pediatric care with warmth and a child-centered approach.", descriptionAr: "رعاية أطفال عالمية المستوى مع الدفء ونهج يركز على الطفل.", doctors: ["Dr. Hassan Bakr", "Dr. Mona Rashed", "Dr. Aisha Zayed"], active: true, headOfDept: "Dr. Hassan Bakr", totalPatients: 1580, location: "Building A, Floor 4", specialties: ["General Pediatrics", "PICU", "Neonatology", "Pediatric Cardiology", "Pediatric Dentistry", "Endocrinology", "Immunology & Allergy"], services: ["General Infant Check-ups", "Growth & Development Monitoring", "High-Risk Infant Follow-Up", "PICU", "Hearing Screening", "Emergency & Observation", "Vaccinations", "Pediatric Surgery", "Newborn Screening"], notes: "Level III Neonatal Unit - highest in Kuwait's private sector.", operatingHours: "24/7", bedCount: 35, equipment: ["Ventilators", "Incubators", "Patient Monitors", "Phototherapy"] },
  { id: 4, name: "Internal Medicine", nameAr: "الطب الباطني", description: "Your trusted partner for health management.", descriptionAr: "شريكك الموثوق لإدارة الصحة.", doctors: ["Dr. Fatima Al-Sabah", "Dr. Nasser Al-Dosari"], active: true, headOfDept: "Dr. Fatima Al-Sabah", totalPatients: 1890, location: "Building A, Floor 2", specialties: ["Cardiology", "Nephrology", "Gastroenterology", "Endocrinology & Metabolism", "Rheumatology", "Clinical Nutrition & Dietetics"], services: ["Health Check Program", "Chronic Disease Management", "Cardiovascular Testing", "ECG", "Radiology Studies", "Exercise Treadmill Test"], notes: "Kuwait's only endoscopic ultrasound system available.", operatingHours: "Sun-Thu 8AM-8PM", bedCount: 30, equipment: ["ECG", "Echocardiography", "Endoscopy Suite", "Ultrasound"] },
  { id: 5, name: "Cardiology", nameAr: "أمراض القلب", description: "We prioritize preventive cardiac care to promote long-term heart health.", descriptionAr: "نعطي الأولوية لرعاية القلب الوقائية.", doctors: ["Dr. Omar Khalil", "Dr. Faisal Al-Tamimi"], active: true, headOfDept: "Dr. Omar Khalil", totalPatients: 890, location: "Building A, Floor 2", specialties: ["Interventional Cardiology", "Electrophysiology", "Preventive Cardiology"], services: ["Heart Health Check-up", "Preventive Cardiac Screening", "Hypertension Monitoring", "Echocardiography", "Stress Testing", "Arrhythmia Detection"], notes: "Personalized training, monitoring, and education programs.", operatingHours: "Sun-Thu 8AM-6PM", bedCount: 12, equipment: ["Echo Machine", "Stress Test System", "Holter Monitor", "Cardiac Catheterization Lab"] },
  { id: 6, name: "General & Laparoscopic Surgery", nameAr: "الجراحة العامة والمنظار", description: "Exceptional care blending expert skills with advanced technology.", descriptionAr: "رعاية استثنائية تمزج المهارات الخبيرة مع التكنولوجيا المتقدمة.", doctors: ["Dr. Khalid Al-Mutairi", "Dr. Ahmad Bashar"], active: true, headOfDept: "Dr. Khalid Al-Mutairi", totalPatients: 730, location: "Building A, Floor 1", specialties: ["Obesity Bariatric Surgery", "Breast Surgical Oncology", "Abdominal Wall Reconstruction", "Laparoscopic Surgery"], services: ["Breast Surgery", "Liver & Gallbladder Surgery", "Upper GI Surgeries", "Endocrine Surgeries", "Laparoscopic Surgery", "Hernia Surgery", "Pediatric Surgery"], notes: "First in Middle East & Africa recognized as International Center of Excellence for bariatric surgery.", operatingHours: "Sun-Thu 7AM-4PM", bedCount: 20, equipment: ["Laparoscopic Tower", "Surgical Robots", "Monitoring Systems"] },
  { id: 7, name: "Dermatology", nameAr: "الأمراض الجلدية", description: "Highly qualified dermatologists provide expert care for all dermatological needs.", descriptionAr: "أطباء جلدية مؤهلون تأهيلاً عالياً.", doctors: ["Dr. Nadia Farouk", "Dr. Huda Al-Salem"], active: true, headOfDept: "Dr. Nadia Farouk", totalPatients: 670, location: "Building B, Floor 1", specialties: ["Medical Dermatology", "Cosmetic Dermatology", "Laser Treatments", "Skin Cancer"], services: ["Botox & Fillers", "Chemical Peels", "PRP Therapy", "Laser Hair Removal", "Skin Cancer Screening", "Dermoscopy & Biopsies"], notes: "Luxurious dermatological care with precision and compassion.", operatingHours: "Sun-Thu 8AM-6PM", bedCount: 4, equipment: ["Laser Systems", "Dermoscope", "Cryotherapy Unit"] },
  { id: 8, name: "ENT (Ear, Nose & Throat)", nameAr: "الأنف والأذن والحنجرة", description: "Expert care for conditions affecting the ear, nose, throat, head, and neck.", descriptionAr: "رعاية متخصصة لحالات الأذن والأنف والحنجرة.", doctors: ["Dr. Sami Haddad"], active: true, headOfDept: "Dr. Sami Haddad", totalPatients: 420, location: "Building B, Floor 2", specialties: ["Pediatric Otolaryngology", "Otology/Neurotology", "Head & Neck Surgery", "Rhinology", "Sleep Disorders"], services: ["Tonsillectomy & Adenoidectomy", "FESS", "Nasal Endoscopy", "Vertigo Management", "Sleep Apnea Treatment", "Coblation Surgery"], notes: "Advanced endoscopic procedures available.", operatingHours: "Sun-Thu 9AM-5PM", bedCount: 8, equipment: ["Endoscope", "Audiometer", "Tympanometer"] },
  { id: 9, name: "Plastic Surgery", nameAr: "جراحة التجميل", description: "Internationally certified physicians offering advanced surgical and non-surgical solutions.", descriptionAr: "أطباء معتمدون دولياً يقدمون حلولاً جراحية وغير جراحية متقدمة.", doctors: [], active: true, headOfDept: "Consultant Surgeon", totalPatients: 310, location: "Building B, Floor 1", specialties: ["Body Contouring", "Breast Surgery", "Facial Surgery", "Non-Surgical Treatments"], services: ["Thermage 5th Gen", "Fraxel Dual", "Laser Hair Removal", "Botox & Fillers", "Tummy Tuck", "Breast Augmentation", "Face Lifts"], notes: "All-female medical team available.", operatingHours: "Sun-Thu 9AM-5PM", bedCount: 6, equipment: ["Thermage System", "Fraxel Laser", "Surgical Theatre"] },
  { id: 10, name: "Dental Clinic", nameAr: "عيادة الأسنان", description: "Exceptional dental care in a luxurious setting.", descriptionAr: "رعاية أسنان استثنائية في بيئة فاخرة.", doctors: ["Dr. Lina Barakat", "Dr. Saeed Al-Hajri"], active: true, headOfDept: "Dr. Lina Barakat", totalPatients: 920, location: "Building C, Floor 1", specialties: ["Cosmetic Dentistry", "Orthodontics", "Implantology", "Endodontics", "Periodontology"], services: ["Pediatric Dentistry", "Lumineers & Veneers", "Crowns & Bridges", "Teeth Whitening", "Dental Implants", "Braces & Aligners", "Root Canal"], notes: "Pain-free experience with latest dental technology.", operatingHours: "Sun-Thu 9AM-9PM, Sat 10AM-4PM", bedCount: 0, equipment: ["Digital X-Ray", "3D Scanner", "Laser Equipment"] },
  { id: 11, name: "Pain Management", nameAr: "إدارة الألم", description: "Enhancing quality of life for those with acute or chronic pain.", descriptionAr: "تعزيز جودة الحياة لمن يعانون من ألم حاد أو مزمن.", doctors: ["Dr. Hamid Ghaderi"], active: true, headOfDept: "Dr. Hamid Ghaderi", totalPatients: 280, location: "Building A, Floor 2", specialties: ["Chronic Pain", "Spine Pain", "CT-Guided Injections"], services: ["Epidural Anesthesia", "Chronic Pain Management", "Headache & Facial Pain", "Neck & Back Pain", "Neuropathic Pain", "Post-operative Pain", "Sports Injury Pain"], notes: "First CT-guided spine therapeutic injection center in Kuwait.", operatingHours: "Sun-Thu 8AM-4PM", bedCount: 4, equipment: ["CT Scanner", "Fluoroscopy", "Nerve Block Equipment"] },
  { id: 12, name: "Center for Diagnostic Imaging", nameAr: "مركز التصوير التشخيصي", description: "Advanced diagnostic and image-guided therapeutic services.", descriptionAr: "خدمات تشخيصية متقدمة وعلاجية موجهة بالصور.", doctors: [], active: true, headOfDept: "Chief Radiologist", totalPatients: 2100, location: "Building A, Ground Floor", specialties: ["Abdominal & Women's Imaging", "Breast Imaging", "Cardiovascular Imaging", "Musculoskeletal Imaging", "Neuroradiology", "Pediatric Imaging", "Interventional Radiology"], services: ["MRI", "CT Scan", "Fluoroscopy", "4D Ultrasound", "Bone Densitometry", "Digital Mammography", "Image-Guided Biopsies", "Virtual Colonoscopy"], notes: "AI-driven CAD software for enhanced detection.", operatingHours: "24/7", bedCount: 0, equipment: ["MRI Machine", "128-slice CT Scanner", "Digital Mammography", "4D Ultrasound"] },
  { id: 13, name: "Family Medicine", nameAr: "طب الأسرة", description: "Continuous, personalized care for individuals and families of all ages.", descriptionAr: "رعاية مستمرة وشخصية للأفراد والعائلات من جميع الأعمار.", doctors: [], active: true, headOfDept: "Family Medicine Lead", totalPatients: 1500, location: "Building A, Ground Floor", specialties: ["Preventive Care", "Chronic Disease Management", "Pediatric & Geriatric Care"], services: ["Preventive Care & Screenings", "Chronic Condition Management", "Acute Illness Treatment", "Immunizations", "Women's & Men's Health", "Lifestyle Counseling", "Mental Health Support"], notes: "One point of contact for whole-family coordinated care.", operatingHours: "Sun-Thu 8AM-8PM, Sat 9AM-2PM", bedCount: 0, equipment: ["General Diagnostics"] },
  { id: 14, name: "Anesthesia & ICU", nameAr: "التخدير والعناية المركزة", description: "Ensuring patient safety and comfort for all surgical and childbirth procedures.", descriptionAr: "ضمان سلامة المريض وراحته لجميع الإجراءات الجراحية والولادة.", doctors: ["Dr. Hamid Ghaderi"], active: true, headOfDept: "Prof. Dr. Omar El Khateeb", totalPatients: 950, location: "Building A, Floor 5", specialties: ["General Anesthesia", "Regional Anesthesia", "ICU", "Pediatric Anesthesia"], services: ["General Anesthesia", "Local & Regional Anesthesia", "Conscious Sedation", "Advanced Brainwave Monitoring", "High-Risk Patient Anesthesia", "Labor Pain Relief", "ICU Monitoring"], notes: "Round-the-clock monitoring for severe, life-threatening conditions.", operatingHours: "24/7", bedCount: 12, equipment: ["Ventilators", "Monitoring Systems", "Bronchoscopy", "Anesthesia Machines"] },
  { id: 15, name: "Laboratory Services", nameAr: "خدمات المختبر", description: "Comprehensive laboratory and diagnostic testing services.", descriptionAr: "خدمات مختبرية وتشخيصية شاملة.", doctors: [], active: true, headOfDept: "Lab Director", totalPatients: 3200, location: "Building A, Ground Floor", specialties: ["Clinical Chemistry", "Hematology", "Microbiology", "Pathology"], services: ["Blood Tests", "Urinalysis", "Culture & Sensitivity", "Histopathology", "Tumor Markers", "Hormone Assays"], notes: "CAP accredited 8 times in a row.", operatingHours: "24/7", bedCount: 0, equipment: ["Automated Analyzers", "Flow Cytometer"] },
  { id: 16, name: "Pharmacy", nameAr: "الصيدلية", description: "Royale Hayat Pharmacy and Clinical Pharmacy services.", descriptionAr: "صيدلية رويال حياة وخدمات الصيدلة السريرية.", doctors: [], active: true, headOfDept: "Chief Pharmacist", totalPatients: 0, location: "Building A, Ground Floor", specialties: ["Clinical Pharmacy", "Medication Counseling"], services: ["Prescription Dispensing", "Medication Counseling", "Drug Interaction Checks", "Compounding"], notes: "Full pharmacy services available.", operatingHours: "24/7", bedCount: 0, equipment: [] },
];

const Departments = () => {
  const [departments, setDepartments] = useState(websiteDepts);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<DeptState | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<DeptState>>({});
  const [editDoctors, setEditDoctors] = useState<string[]>([]);
  const [editSpecialties, setEditSpecialties] = useState<string[]>([]);
  const [editServices, setEditServices] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const { t, lang } = useLanguage();

  const toggleActive = (id: number) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d));
    if (selectedDept?.id === id) setSelectedDept(prev => prev ? { ...prev, active: !prev.active } : null);
  };

  const startEdit = () => {
    if (!selectedDept) return;
    setEditing(true);
    setEditData({
      name: selectedDept.name, nameAr: selectedDept.nameAr, description: selectedDept.description, descriptionAr: selectedDept.descriptionAr,
      location: selectedDept.location, headOfDept: selectedDept.headOfDept, notes: selectedDept.notes, operatingHours: selectedDept.operatingHours,
    });
    setEditDoctors([...selectedDept.doctors]);
    setEditSpecialties([...selectedDept.specialties]);
    setEditServices([...selectedDept.services]);
  };

  const saveEdit = () => {
    if (!selectedDept) return;
    const updated = { ...selectedDept, ...editData, doctors: editDoctors, specialties: editSpecialties, services: editServices } as DeptState;
    setDepartments(prev => prev.map(d => d.id === selectedDept.id ? updated : d));
    setSelectedDept(updated);
    setEditing(false);
  };

  const addItem = (list: string[], setList: (v: string[]) => void) => {
    if (newItem.trim()) { setList([...list, newItem.trim()]); setNewItem(""); }
  };

  const removeItem = (list: string[], setList: (v: string[]) => void, idx: number) => {
    setList(list.filter((_, i) => i !== idx));
  };

  const filtered = departments.filter(d => {
    const name = lang === "ar" ? d.nameAr : d.name;
    return name.toLowerCase().includes(search.toLowerCase()) || d.name.toLowerCase().includes(search.toLowerCase());
  });

  if (selectedDept) {
    const deptDoctors = mockDoctors.filter(doc => doc.department === selectedDept.name || selectedDept.doctors.includes(doc.name));
    const displayName = lang === "ar" ? selectedDept.nameAr : selectedDept.name;
    const displayDesc = lang === "ar" ? selectedDept.descriptionAr : selectedDept.description;

    const EditableList = ({ title, items, setItems }: { title: string; items: string[]; setItems: (v: string[]) => void }) => (
      <div className="mb-3">
        <label className="text-xs font-sans text-muted-foreground font-semibold">{title}</label>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-1 px-2 py-1 rounded bg-section-bg text-xs font-sans text-foreground border border-border">
              {item}
              <button onClick={() => removeItem(items, setItems, i)} className="text-error hover:text-error/80"><Trash2 size={10} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} placeholder={`${t("Add")} ${title.toLowerCase()}...`}
            className="flex-1 px-3 py-1.5 rounded-lg border border-border text-xs font-sans focus:outline-none focus:ring-1 focus:ring-gold"
            onKeyDown={e => e.key === "Enter" && addItem(items, setItems)} />
          <button onClick={() => addItem(items, setItems)} className="px-2 py-1.5 rounded-md bg-burgundy/10 text-burgundy text-xs font-sans"><Plus size={12} /></button>
        </div>
      </div>
    );

    return (
      <AdminLayout title="Departments">
        <button onClick={() => { setSelectedDept(null); setEditing(false); }}
          className="flex items-center gap-1 text-sm font-sans text-burgundy hover:text-burgundy-deep mb-4">
          <ChevronLeft size={14} /> {t("Back")}
        </button>

        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            {editing ? (
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-sans text-muted-foreground">{t("Name")} (EN)</label>
                    <input type="text" value={editData.name || ""} onChange={e => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" /></div>
                  <div><label className="text-xs font-sans text-muted-foreground">{t("Name")} (AR)</label>
                    <input type="text" value={editData.nameAr || ""} onChange={e => setEditData({ ...editData, nameAr: e.target.value })} dir="rtl"
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" /></div>
                </div>
                <div><label className="text-xs font-sans text-muted-foreground">{t("Description")} (EN)</label>
                  <textarea value={editData.description || ""} onChange={e => setEditData({ ...editData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold resize-none" rows={3} /></div>
                <div><label className="text-xs font-sans text-muted-foreground">{t("Description")} (AR)</label>
                  <textarea value={editData.descriptionAr || ""} onChange={e => setEditData({ ...editData, descriptionAr: e.target.value })} dir="rtl"
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold resize-none" rows={3} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-sans text-muted-foreground">{t("Head of Dept")}</label>
                    <input type="text" value={editData.headOfDept || ""} onChange={e => setEditData({ ...editData, headOfDept: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" /></div>
                  <div><label className="text-xs font-sans text-muted-foreground">{t("Location")}</label>
                    <input type="text" value={editData.location || ""} onChange={e => setEditData({ ...editData, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" /></div>
                  <div className="col-span-2"><label className="text-xs font-sans text-muted-foreground">{t("Operating Hours")}</label>
                    <input type="text" value={editData.operatingHours || ""} onChange={e => setEditData({ ...editData, operatingHours: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" /></div>
                </div>

                <EditableList title={t("Doctors")} items={editDoctors} setItems={setEditDoctors} />
                <EditableList title={t("Specialties")} items={editSpecialties} setItems={setEditSpecialties} />
                <EditableList title={t("Services")} items={editServices} setItems={setEditServices} />

                <div><label className="text-xs font-sans text-muted-foreground">{t("Notes")}</label>
                  <textarea value={editData.notes || ""} onChange={e => setEditData({ ...editData, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold resize-none" rows={2} /></div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex items-center gap-1 px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium"><Save size={12} /> {t("Save")}</button>
                  <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium">{t("Cancel")}</button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-xl font-serif font-semibold text-foreground">{displayName}</h2>
                  <p className="text-sm font-sans text-muted-foreground mt-2">{displayDesc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={startEdit} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium hover:bg-border"><Edit size={12} /> {t("Edit")}</button>
                  <div className="relative group">
                    <button onClick={() => toggleActive(selectedDept.id)}>
                      {selectedDept.active ? <ToggleRight size={24} className="text-success" /> : <ToggleLeft size={24} className="text-muted-foreground" />}
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-primary-foreground text-[10px] font-sans rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {selectedDept.active ? t("Click to hide department") : t("Click to show department")}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {!editing && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {[
                [t("Head of Dept"), selectedDept.headOfDept, Stethoscope],
                [t("Location"), selectedDept.location, MapPin],
                [t("Total Patients"), String(selectedDept.totalPatients), Users],
                [t("Beds"), String(selectedDept.bedCount), Eye],
              ].map(([label, val, Icon]: any) => (
                <div key={label} className="bg-section-bg rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1"><Icon size={12} className="text-muted-foreground" /><span className="text-xs font-sans text-muted-foreground">{label}</span></div>
                  <p className="text-sm font-sans font-medium text-foreground">{val}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {!editing && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-card rounded-lg shadow-sm border border-border p-5">
                <h3 className="text-sm font-serif font-semibold text-foreground mb-3">{t("Operating Hours")}</h3>
                <p className="text-sm font-sans text-muted-foreground">{selectedDept.operatingHours}</p>
              </div>
              <div className="bg-card rounded-lg shadow-sm border border-border p-5">
                <h3 className="text-sm font-serif font-semibold text-foreground mb-3">{t("Equipment")}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDept.equipment.map(eq => (<span key={eq} className="px-2 py-1 rounded bg-section-bg text-xs font-sans text-foreground">{eq}</span>))}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-sm border border-border p-5 mb-4">
              <h3 className="text-sm font-serif font-semibold text-foreground mb-2">{t("Specialties")}</h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedDept.specialties.map(s => (<span key={s} className="px-2 py-1 rounded bg-burgundy/10 text-burgundy text-xs font-sans font-medium">{s}</span>))}
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-sm border border-border p-5 mb-4">
              <h3 className="text-sm font-serif font-semibold text-foreground mb-2">{t("Services")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {selectedDept.services.map(s => (
                  <div key={s} className="flex items-center gap-2 py-1"><div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" /><span className="text-sm font-sans text-foreground">{s}</span></div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-sm border border-border p-5 mb-4">
              <h3 className="text-sm font-serif font-semibold text-foreground mb-2">{t("Notes")}</h3>
              <p className="text-sm font-sans text-muted-foreground">{selectedDept.notes}</p>
            </div>

            <div className="bg-card rounded-lg shadow-sm border border-border p-5">
              <h3 className="text-sm font-serif font-semibold text-foreground mb-3">{t("Assigned Doctors")} ({deptDoctors.length})</h3>
              <div className="space-y-2">
                {deptDoctors.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div><p className="text-sm font-sans font-medium text-foreground">{doc.name}</p><p className="text-xs font-sans text-muted-foreground">{doc.specialty} · {doc.availability}</p></div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium ${doc.bookingOpen ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>{doc.bookingOpen ? t("Available") : t("Unavailable")}</span>
                  </div>
                ))}
                {deptDoctors.length === 0 && <p className="text-xs font-sans text-muted-foreground">{t("No data available")}</p>}
              </div>
            </div>
          </>
        )}
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Departments">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder={t("Search...")} value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-card border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
        </div>
        <button onClick={() => exportToExcel(departments.map(d => ({ Name: d.name, Head: d.headOfDept, Patients: d.totalPatients, Specialties: d.specialties.length, Active: d.active })), "departments")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-success/10 text-success text-xs font-sans font-medium hover:bg-success/20 transition-colors">
          <Download size={13} /> {t("Export")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(dept => {
          const displayName = lang === "ar" ? dept.nameAr : dept.name;
          const displayDesc = lang === "ar" ? dept.descriptionAr : dept.description;
          return (
            <div key={dept.id} className={`bg-card rounded-lg shadow-sm border border-border p-5 transition-opacity cursor-pointer hover:shadow-md ${!dept.active ? "opacity-60" : ""}`}
              onClick={() => setSelectedDept(dept)}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-serif font-semibold text-foreground text-base">{displayName}</h3>
                <div className="flex items-center gap-1 relative group" onClick={e => e.stopPropagation()}>
                  <button onClick={() => toggleActive(dept.id)}>
                    {dept.active ? <ToggleRight size={20} className="text-success" /> : <ToggleLeft size={20} />}
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-primary-foreground text-[10px] font-sans rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {dept.active ? t("Click to hide department") : t("Click to show department")}
                  </div>
                </div>
              </div>
              <p className="text-sm font-sans text-muted-foreground mb-3 line-clamp-2">{displayDesc}</p>
              <div className="space-y-1.5 text-xs font-sans mb-3">
                <div className="flex justify-between"><span className="text-muted-foreground">{t("Head of Dept")}</span><span className="text-foreground">{dept.headOfDept}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("Total Patients")}</span><span className="text-foreground">{dept.totalPatients}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("Specialties")}</span><span className="text-foreground">{dept.specialties.length}</span></div>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {dept.specialties.slice(0, 3).map(s => (<span key={s} className="px-2 py-0.5 rounded bg-burgundy/10 text-burgundy text-[10px] font-sans font-medium">{s}</span>))}
                {dept.specialties.length > 3 && <span className="text-[10px] font-sans text-muted-foreground">+{dept.specialties.length - 3} more</span>}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs font-sans font-medium ${dept.active ? "text-success" : "text-error"}`}>{dept.active ? t("Active") : t("Inactive")}</span>
                <span className="text-xs font-sans text-burgundy font-medium">{t("View All")} →</span>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
};

export default Departments;
