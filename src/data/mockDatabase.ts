
export type Patient = {
  id: string;
  name: string;
  nameAr: string;
  patientId: string;
  phone: string;
  email: string;
  nationality: string;
  gender: "Male" | "Female";
  dob: string;
  bloodType: string;
  insurance: string;
  insuranceId: string;
  emergencyContact: string;
  emergencyPhone: string;
  registeredDate: string;
  lastVisit: string;
  totalVisits: number;
  departments: string[];
  doctors: string[];
  status: "Active" | "Discharged" | "Scheduled";
  isInternational: boolean;
  language: string;
  notes: string;
  documents: PatientDocument[];
  appointments: PatientAppointment[];
  communications: Communication[];
  financials: PatientFinancials;
  services: string[];
  checkIn?: string;
  checkOut?: string;
  roomNumber?: string;
  utilitiesUsed: string[];
};

export type PatientDocument = {
  id: string;
  name: string;
  type: "Medical Report" | "Prescription" | "Scan" | "Lab Result" | "Insurance" | "ID" | "Other";
  uploadDate: string;
  size: string;
  uploadedBy: string;
};

export type PatientAppointment = {
  id: string;
  date: string;
  department: string;
  doctor: string;
  type: "Visit" | "Follow-up" | "Consultation" | "Surgery";
  status: "Completed" | "Scheduled" | "Cancelled" | "No-show";
  notes: string;
};

export type Communication = {
  id: string;
  type: "SMS" | "WhatsApp" | "Email" | "Call";
  date: string;
  message: string;
  direction: "Outgoing" | "Incoming";
  status: "Sent" | "Delivered" | "Read" | "Failed";
};

export type PatientFinancials = {
  totalBilled: number;
  totalPaid: number;
  outstanding: number;
  insuranceCovered: number;
  currency: string;
  invoices: { id: string; date: string; amount: number; status: "Paid" | "Pending" | "Overdue" }[];
};

export type Doctor = {
  id: number;
  name: string;
  nameAr: string;
  specialty: string;
  department: string;
  availability: string;
  bookingOpen: boolean;
  visible: boolean;
  onlineAppointments: number;
  totalPatients: number;
  rating: number;
  nextAvailable: string;
  languages: string[];
  qualifications: string;
  experience: number;
  phone: string;
  email: string;
};

export type Department = {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  doctors: string[];
  active: boolean;
  headOfDept: string;
  totalPatients: number;
  location: string;
};

export type Appointment = {
  id: number;
  patientId: string;
  patient: string;
  department: string;
  doctor: string;
  date: string;
  time: string;
  type: "Visit" | "Follow-up" | "Consultation" | "Surgery";
  status: "confirmed" | "pending" | "cancelled" | "rescheduled" | "completed";
  source: "Online" | "Walk-in" | "Phone" | "International";
  notes: string;
};

export type FeedbackEntry = {
  id: number;
  patient: string;
  patientId: string;
  rating: number;
  comment: string;
  doctor: string;
  department: string;
  date: string;
  status: "new" | "replied" | "flagged" | "resolved";
  reply?: string;
};

export type InboxItem = {
  id: number;
  name: string;
  type: string;
  contact: string;
  date: string;
  status: "new" | "in_progress" | "resolved";
  priority: "high" | "medium" | "low";
  message: string;
};

export type Notification = {
  id: number;
  title: string;
  message: string;
  type: "appointment" | "request" | "international" | "document" | "feedback" | "system";
  time: string;
  read: boolean;
  link: string;
};

export type ServiceItem = {
  id: number;
  name: string;
  nameAr: string;
  category: "Medical" | "Hospitality" | "Wellness" | "Diagnostic" | "Surgical";
  description: string;
  active: boolean;
  price?: string;
  duration?: string;
};

export type HospitalDocument = {
  id: string;
  title: string;
  category: "Policy" | "Protocol" | "Guide" | "Form" | "Certificate" | "Brochure" | "Report";
  department: string;
  uploadDate: string;
  fileSize: string;
  uploadedBy: string;
  tags: string[];
  description: string;
};

export const departments: Department[] = [
  { id: 1, name: "Obstetrics & Gynecology", nameAr: "أمراض النساء والتوليد", description: "Comprehensive women's health services from prenatal care to gynecological treatments.", doctors: ["Dr. Layla Ahmed", "Dr. Sara Nasser", "Dr. Maryam Al-Harbi"], active: true, headOfDept: "Dr. Layla Ahmed", totalPatients: 1240, location: "Building A, Floor 3" },
  { id: 2, name: "Cardiology", nameAr: "أمراض القلب", description: "Advanced cardiovascular diagnostics and interventional procedures.", doctors: ["Dr. Omar Khalil", "Dr. Faisal Al-Tamimi"], active: true, headOfDept: "Dr. Omar Khalil", totalPatients: 890, location: "Building A, Floor 2" },
  { id: 3, name: "Dermatology", nameAr: "الأمراض الجلدية", description: "Medical and cosmetic dermatology with state-of-the-art laser treatments.", doctors: ["Dr. Nadia Farouk", "Dr. Huda Al-Salem"], active: true, headOfDept: "Dr. Nadia Farouk", totalPatients: 670, location: "Building B, Floor 1" },
  { id: 4, name: "Pediatrics", nameAr: "طب الأطفال", description: "Specialized care for infants, children, and adolescents.", doctors: ["Dr. Hassan Bakr", "Dr. Mona Rashed", "Dr. Aisha Zayed"], active: true, headOfDept: "Dr. Hassan Bakr", totalPatients: 1580, location: "Building A, Floor 4" },
  { id: 5, name: "ENT", nameAr: "الأنف والأذن والحنجرة", description: "Ear, nose, and throat surgical and medical services.", doctors: ["Dr. Sami Haddad"], active: true, headOfDept: "Dr. Sami Haddad", totalPatients: 420, location: "Building B, Floor 2" },
  { id: 6, name: "Orthopedics", nameAr: "جراحة العظام", description: "Joint replacement, sports medicine, and spinal surgery.", doctors: ["Dr. Reem Al-Fahad", "Dr. Tariq Mansour"], active: true, headOfDept: "Dr. Reem Al-Fahad", totalPatients: 560, location: "Building A, Floor 1" },
  { id: 7, name: "Internal Medicine", nameAr: "الطب الباطني", description: "Comprehensive internal medicine and chronic disease management.", doctors: ["Dr. Fatima Al-Sabah", "Dr. Nasser Al-Dosari"], active: true, headOfDept: "Dr. Fatima Al-Sabah", totalPatients: 1890, location: "Building A, Floor 2" },
  { id: 8, name: "Neurology", nameAr: "طب الأعصاب", description: "Diagnosis and treatment of nervous system disorders.", doctors: ["Dr. Youssef Mansour"], active: true, headOfDept: "Dr. Youssef Mansour", totalPatients: 340, location: "Building B, Floor 3" },
  { id: 9, name: "Ophthalmology", nameAr: "طب العيون", description: "Complete eye care from routine exams to advanced surgical procedures.", doctors: ["Dr. Amira Kassem", "Dr. Salim Al-Qattan"], active: true, headOfDept: "Dr. Amira Kassem", totalPatients: 510, location: "Building B, Floor 1" },
  { id: 10, name: "General Surgery", nameAr: "الجراحة العامة", description: "Minimally invasive and conventional surgical procedures.", doctors: ["Dr. Khalid Al-Mutairi", "Dr. Ahmad Bashar"], active: true, headOfDept: "Dr. Khalid Al-Mutairi", totalPatients: 730, location: "Building A, Floor 1" },
  { id: 11, name: "Dental", nameAr: "طب الأسنان", description: "Comprehensive dental care including cosmetic and restorative dentistry.", doctors: ["Dr. Lina Barakat", "Dr. Saeed Al-Hajri"], active: true, headOfDept: "Dr. Lina Barakat", totalPatients: 920, location: "Building C, Floor 1" },
  { id: 12, name: "Urology", nameAr: "المسالك البولية", description: "Diagnosis and treatment of urinary tract and male reproductive disorders.", doctors: ["Dr. Waleed Shams"], active: true, headOfDept: "Dr. Waleed Shams", totalPatients: 290, location: "Building B, Floor 2" },
];

export const doctors: Doctor[] = [
  { id: 1, name: "Dr. Layla Ahmed", nameAr: "د. ليلى أحمد", specialty: "Obstetrics & Gynecology", department: "Obstetrics & Gynecology", availability: "Sun-Thu 9AM-3PM", bookingOpen: true, visible: true, onlineAppointments: 47, totalPatients: 312, rating: 4.9, nextAvailable: "Apr 10, 2026", languages: ["Arabic", "English"], qualifications: "MD, FRCOG", experience: 18, phone: "+965 5501 0001", email: "l.ahmed@royalehayat.com" },
  { id: 2, name: "Dr. Omar Khalil", nameAr: "د. عمر خليل", specialty: "Interventional Cardiology", department: "Cardiology", availability: "Sun-Wed 10AM-4PM", bookingOpen: true, visible: true, onlineAppointments: 63, totalPatients: 489, rating: 4.8, nextAvailable: "Apr 10, 2026", languages: ["Arabic", "English", "French"], qualifications: "MD, FACC", experience: 22, phone: "+965 5501 0002", email: "o.khalil@royalehayat.com" },
  { id: 3, name: "Dr. Nadia Farouk", nameAr: "د. نادية فاروق", specialty: "Cosmetic Dermatology", department: "Dermatology", availability: "Mon-Thu 8AM-2PM", bookingOpen: false, visible: true, onlineAppointments: 28, totalPatients: 215, rating: 4.7, nextAvailable: "Apr 14, 2026", languages: ["Arabic", "English"], qualifications: "MD, Board Certified", experience: 12, phone: "+965 5501 0003", email: "n.farouk@royalehayat.com" },
  { id: 4, name: "Dr. Hassan Bakr", nameAr: "د. حسن بكر", specialty: "Pediatric Medicine", department: "Pediatrics", availability: "Sun-Thu 9AM-5PM", bookingOpen: true, visible: true, onlineAppointments: 85, totalPatients: 621, rating: 4.9, nextAvailable: "Apr 9, 2026", languages: ["Arabic", "English"], qualifications: "MD, DCH", experience: 20, phone: "+965 5501 0004", email: "h.bakr@royalehayat.com" },
  { id: 5, name: "Dr. Sami Haddad", nameAr: "د. سامي حداد", specialty: "ENT Surgery", department: "ENT", availability: "Sun-Tue 10AM-3PM", bookingOpen: false, visible: false, onlineAppointments: 12, totalPatients: 178, rating: 4.5, nextAvailable: "Apr 15, 2026", languages: ["Arabic"], qualifications: "MD, FRCS", experience: 15, phone: "+965 5501 0005", email: "s.haddad@royalehayat.com" },
  { id: 6, name: "Dr. Reem Al-Fahad", nameAr: "د. ريم الفهد", specialty: "Orthopedic Surgery", department: "Orthopedics", availability: "Sun-Thu 8AM-4PM", bookingOpen: true, visible: true, onlineAppointments: 54, totalPatients: 402, rating: 4.8, nextAvailable: "Apr 11, 2026", languages: ["Arabic", "English"], qualifications: "MD, MS Ortho", experience: 16, phone: "+965 5501 0006", email: "r.alfahad@royalehayat.com" },
  { id: 7, name: "Dr. Fatima Al-Sabah", nameAr: "د. فاطمة الصباح", specialty: "Internal Medicine", department: "Internal Medicine", availability: "Sun-Thu 8AM-3PM", bookingOpen: true, visible: true, onlineAppointments: 91, totalPatients: 734, rating: 4.9, nextAvailable: "Apr 9, 2026", languages: ["Arabic", "English", "Hindi"], qualifications: "MD, MRCP", experience: 25, phone: "+965 5501 0007", email: "f.alsabah@royalehayat.com" },
  { id: 8, name: "Dr. Youssef Mansour", nameAr: "د. يوسف منصور", specialty: "Neurology", department: "Neurology", availability: "Mon-Wed 9AM-4PM", bookingOpen: true, visible: true, onlineAppointments: 38, totalPatients: 267, rating: 4.7, nextAvailable: "Apr 12, 2026", languages: ["Arabic", "English"], qualifications: "MD, PhD Neuroscience", experience: 19, phone: "+965 5501 0008", email: "y.mansour@royalehayat.com" },
  { id: 9, name: "Dr. Amira Kassem", nameAr: "د. أميرة قاسم", specialty: "Ophthalmology", department: "Ophthalmology", availability: "Sun-Thu 10AM-5PM", bookingOpen: false, visible: true, onlineAppointments: 22, totalPatients: 198, rating: 4.6, nextAvailable: "Apr 16, 2026", languages: ["Arabic", "English", "French"], qualifications: "MD, FRCOphth", experience: 14, phone: "+965 5501 0009", email: "a.kassem@royalehayat.com" },
  { id: 10, name: "Dr. Khalid Al-Mutairi", nameAr: "د. خالد المطيري", specialty: "General Surgery", department: "General Surgery", availability: "Sun-Wed 7AM-2PM", bookingOpen: true, visible: true, onlineAppointments: 71, totalPatients: 553, rating: 4.8, nextAvailable: "Apr 10, 2026", languages: ["Arabic", "English"], qualifications: "MD, FRCS", experience: 21, phone: "+965 5501 0010", email: "k.almutairi@royalehayat.com" },
  { id: 11, name: "Dr. Sara Nasser", nameAr: "د. سارة ناصر", specialty: "Maternal-Fetal Medicine", department: "Obstetrics & Gynecology", availability: "Sun-Thu 8AM-2PM", bookingOpen: true, visible: true, onlineAppointments: 35, totalPatients: 245, rating: 4.8, nextAvailable: "Apr 11, 2026", languages: ["Arabic", "English"], qualifications: "MD, Fellowship MFM", experience: 13, phone: "+965 5501 0011", email: "s.nasser@royalehayat.com" },
  { id: 12, name: "Dr. Faisal Al-Tamimi", nameAr: "د. فيصل التميمي", specialty: "Electrophysiology", department: "Cardiology", availability: "Sun-Wed 9AM-3PM", bookingOpen: true, visible: true, onlineAppointments: 29, totalPatients: 187, rating: 4.7, nextAvailable: "Apr 12, 2026", languages: ["Arabic", "English"], qualifications: "MD, FACC, FHRS", experience: 17, phone: "+965 5501 0012", email: "f.altamimi@royalehayat.com" },
  { id: 13, name: "Dr. Mona Rashed", nameAr: "د. منى راشد", specialty: "Pediatric Pulmonology", department: "Pediatrics", availability: "Mon-Thu 9AM-4PM", bookingOpen: true, visible: true, onlineAppointments: 42, totalPatients: 310, rating: 4.8, nextAvailable: "Apr 10, 2026", languages: ["Arabic", "English"], qualifications: "MD, Fellowship", experience: 11, phone: "+965 5501 0013", email: "m.rashed@royalehayat.com" },
  { id: 14, name: "Dr. Huda Al-Salem", nameAr: "د. هدى السالم", specialty: "Clinical Dermatology", department: "Dermatology", availability: "Sun-Wed 8AM-3PM", bookingOpen: true, visible: true, onlineAppointments: 33, totalPatients: 224, rating: 4.6, nextAvailable: "Apr 11, 2026", languages: ["Arabic", "English", "Urdu"], qualifications: "MD, DDS", experience: 9, phone: "+965 5501 0014", email: "h.alsalem@royalehayat.com" },
  { id: 15, name: "Dr. Lina Barakat", nameAr: "د. لينا بركات", specialty: "Cosmetic Dentistry", department: "Dental", availability: "Sun-Thu 9AM-5PM", bookingOpen: true, visible: true, onlineAppointments: 56, totalPatients: 445, rating: 4.9, nextAvailable: "Apr 9, 2026", languages: ["Arabic", "English"], qualifications: "BDS, MDS", experience: 14, phone: "+965 5501 0015", email: "l.barakat@royalehayat.com" },
  { id: 16, name: "Dr. Waleed Shams", nameAr: "د. وليد شمس", specialty: "Urology", department: "Urology", availability: "Sun-Wed 8AM-3PM", bookingOpen: true, visible: true, onlineAppointments: 19, totalPatients: 156, rating: 4.7, nextAvailable: "Apr 13, 2026", languages: ["Arabic", "English"], qualifications: "MD, FRCS Urology", experience: 18, phone: "+965 5501 0016", email: "w.shams@royalehayat.com" },
  { id: 17, name: "Dr. Aisha Zayed", nameAr: "د. عائشة زايد", specialty: "Neonatology", department: "Pediatrics", availability: "Sun-Thu 7AM-3PM", bookingOpen: true, visible: true, onlineAppointments: 44, totalPatients: 367, rating: 4.9, nextAvailable: "Apr 9, 2026", languages: ["Arabic", "English"], qualifications: "MD, Fellowship Neonatology", experience: 16, phone: "+965 5501 0017", email: "a.zayed@royalehayat.com" },
  { id: 18, name: "Dr. Nasser Al-Dosari", nameAr: "د. ناصر الدوسري", specialty: "Gastroenterology", department: "Internal Medicine", availability: "Sun-Wed 9AM-4PM", bookingOpen: true, visible: true, onlineAppointments: 37, totalPatients: 298, rating: 4.7, nextAvailable: "Apr 11, 2026", languages: ["Arabic", "English"], qualifications: "MD, FRCP", experience: 20, phone: "+965 5501 0018", email: "n.aldosari@royalehayat.com" },
  { id: 19, name: "Dr. Tariq Mansour", nameAr: "د. طارق منصور", specialty: "Sports Medicine", department: "Orthopedics", availability: "Mon-Thu 8AM-3PM", bookingOpen: true, visible: true, onlineAppointments: 25, totalPatients: 189, rating: 4.6, nextAvailable: "Apr 12, 2026", languages: ["Arabic", "English"], qualifications: "MD, FFSEM", experience: 10, phone: "+965 5501 0019", email: "t.mansour@royalehayat.com" },
  { id: 20, name: "Dr. Ahmad Bashar", nameAr: "د. أحمد بشار", specialty: "Laparoscopic Surgery", department: "General Surgery", availability: "Sun-Thu 7AM-2PM", bookingOpen: true, visible: true, onlineAppointments: 48, totalPatients: 412, rating: 4.8, nextAvailable: "Apr 10, 2026", languages: ["Arabic", "English", "Turkish"], qualifications: "MD, FACS", experience: 23, phone: "+965 5501 0020", email: "a.bashar@royalehayat.com" },
];

const generatePatientId = (i: number) => `RHH-${String(2024000 + i).padStart(7, "0")}`;

export const patients: Patient[] = Array.from({ length: 60 }, (_, i) => {
  const names = [
    "Sarah Al-Mutairi", "Ahmed Hassan", "Fatima Al-Sabah", "Mohammad Ali", "Noura Al-Rashidi",
    "Khalid Ibrahim", "Maryam Al-Enezi", "Abdullah Al-Fadhli", "Hessa Al-Kandari", "Omar Jamal",
    "Reem Al-Harbi", "Youssef Salem", "Dalal Al-Shammari", "Faisal Al-Dosari", "Latifa Al-Mutawa",
    "Hassan Mahmoud", "Zainab Al-Ajmi", "Saad Al-Rashid", "Noor Al-Hamad", "Tariq Jassem",
    "Asma Al-Sabah", "Bader Al-Azmi", "Ghada Al-Salem", "Jassem Al-Khamis", "Munira Al-Qattan",
    "Saleh Al-Hajri", "Hayat Al-Fahad", "Adel Al-Shaya", "Sawsan Al-Badr", "Mishal Al-Enezi",
    "Amina Hassan", "Waleed Al-Rashid", "Dana Al-Mutairi", "Fahad Al-Salem", "Shaikha Al-Sabah",
    "Rashid Al-Ajmi", "Mariam Al-Dosari", "Hamad Al-Kandari", "Lulwa Al-Shammari", "Nayef Al-Harbi",
    "Hanan Al-Rashidi", "Saud Al-Enezi", "Rania Al-Fadhli", "Khaled Al-Qattan", "Afrah Al-Mutawa",
    "Badr Al-Salem", "Fatma Al-Hajri", "Jasem Al-Azmi", "Maha Al-Fahad", "Talal Al-Khamis",
    "Lamees Al-Dosari", "Ahmad Al-Rashid", "Nouf Al-Sabah", "Yousef Al-Enezi", "Sara Al-Ajmi",
    "Hameed Al-Kandari", "Dalal Al-Mutairi", "Nasser Al-Salem", "Amal Al-Harbi", "Fares Al-Shammari",
  ];
  const namesAr = [
    "سارة المطيري", "أحمد حسن", "فاطمة الصباح", "محمد علي", "نورة الرشيدي",
    "خالد ابراهيم", "مريم العنزي", "عبدالله الفضلي", "حصة الكندري", "عمر جمال",
    "ريم الحربي", "يوسف سالم", "دلال الشمري", "فيصل الدوسري", "لطيفة المطوع",
    "حسن محمود", "زينب العجمي", "سعد الرشيد", "نور الحمد", "طارق جاسم",
    "أسماء الصباح", "بدر العازمي", "غادة السالم", "جاسم الخميس", "منيرة القطان",
    "صالح الهاجري", "حياة الفهد", "عادل الشايع", "سوسن البدر", "مشعل العنزي",
    "أمينة حسن", "وليد الرشيد", "دانة المطيري", "فهد السالم", "شيخة الصباح",
    "راشد العجمي", "مريم الدوسري", "حمد الكندري", "لولوة الشمري", "نايف الحربي",
    "حنان الرشيدي", "سعود العنزي", "رانيا الفضلي", "خالد القطان", "أفراح المطوع",
    "بدر السالم", "فاطمة الهاجري", "جاسم العازمي", "مها الفهد", "طلال الخميس",
    "لمياء الدوسري", "أحمد الرشيد", "نوف الصباح", "يوسف العنزي", "سارة العجمي",
    "حميد الكندري", "دلال المطيري", "ناصر السالم", "أمل الحربي", "فارس الشمري",
  ];
  const depts = departments.map(d => d.name);
  const docNames = doctors.map(d => d.name);
  const genders: ("Male" | "Female")[] = ["Male", "Female"];
  const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const insurances = ["Gulf Insurance", "Wataniya Insurance", "AXA GIG", "Al Ahlia Insurance", "Kuwait Insurance", "None", "Bupa International", "PICC Health", "Allianz"];
  const nationalities = ["Kuwaiti", "Kuwaiti", "Kuwaiti", "Saudi", "Egyptian", "Indian", "British", "German", "Spanish", "Chinese", "Pakistani", "Lebanese", "Jordanian", "Syrian", "American"];
  const languages = ["Arabic", "Arabic", "Arabic", "English", "English", "Arabic/English", "Hindi/English", "Spanish/English", "Mandarin", "German/English"];
  const statuses: ("Active" | "Discharged" | "Scheduled")[] = ["Active", "Discharged", "Scheduled"];

  const deptIdx = i % depts.length;
  const docIdx = i % docNames.length;
  const nationality = nationalities[i % nationalities.length];
  const isIntl = !["Kuwaiti", "Saudi", "Egyptian"].includes(nationality);

  return {
    id: `p-${i + 1}`,
    name: names[i],
    nameAr: namesAr[i],
    patientId: generatePatientId(i + 1),
    phone: `+965 ${5500 + i} ${1000 + (i * 7) % 9000}`,
    email: `${names[i].split(" ")[0].toLowerCase()}${i}@email.com`,
    nationality,
    gender: genders[i % 2],
    dob: `${1955 + (i * 3) % 50}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
    bloodType: bloodTypes[i % bloodTypes.length],
    insurance: insurances[i % insurances.length],
    insuranceId: `INS-${100000 + i * 37}`,
    emergencyContact: names[(i + 5) % names.length],
    emergencyPhone: `+965 ${5600 + i} ${2000 + (i * 11) % 9000}`,
    registeredDate: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
    lastVisit: `2026-${String(((i + 2) % 4) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
    totalVisits: 1 + (i * 3) % 20,
    departments: [depts[deptIdx], depts[(deptIdx + 3) % depts.length]],
    doctors: [docNames[docIdx]],
    status: statuses[i % 3],
    isInternational: isIntl,
    language: languages[i % languages.length],
    notes: i % 5 === 0 ? "VIP patient - requires priority attention" : "",
    documents: [
      { id: `doc-${i}-1`, name: "Medical Report.pdf", type: "Medical Report", uploadDate: "2026-03-15", size: "2.4 MB", uploadedBy: "System" },
      ...(i % 3 === 0 ? [{ id: `doc-${i}-2`, name: "Lab Results.pdf", type: "Lab Result" as const, uploadDate: "2026-03-20", size: "1.1 MB", uploadedBy: "Lab" }] : []),
      ...(i % 4 === 0 ? [{ id: `doc-${i}-3`, name: "Insurance Card.jpg", type: "Insurance" as const, uploadDate: "2026-01-10", size: "0.5 MB", uploadedBy: "Patient" }] : []),
    ],
    appointments: [
      { id: `apt-${i}-1`, date: "2026-04-10", department: depts[deptIdx], doctor: docNames[docIdx], type: "Visit", status: i % 4 === 0 ? "Scheduled" : "Completed", notes: "" },
      ...(i % 2 === 0 ? [{ id: `apt-${i}-2`, date: "2026-03-20", department: depts[deptIdx], doctor: docNames[docIdx], type: "Follow-up" as const, status: "Completed" as const, notes: "Regular follow-up" }] : []),
    ],
    communications: [
      { id: `comm-${i}-1`, type: "SMS" as const, date: "2026-04-08", message: "Your appointment is confirmed for April 10.", direction: "Outgoing", status: "Delivered" },
    ],
    financials: {
      totalBilled: 150 + (i * 47) % 5000,
      totalPaid: 100 + (i * 31) % 4000,
      outstanding: (i * 13) % 500,
      insuranceCovered: (i * 23) % 3000,
      currency: "KWD",
      invoices: [
        { id: `inv-${i}-1`, date: "2026-03-15", amount: 75 + (i * 17) % 500, status: i % 3 === 0 ? "Pending" : "Paid" },
      ],
    },
    services: [
      "Consultation", 
      ...(i % 3 === 0 ? ["Lab Tests"] : []),
      ...(i % 5 === 0 ? ["VIP Suite", "Private Dining"] : []),
    ],
    checkIn: i % 3 === 0 ? "2026-04-08 08:00" : undefined,
    checkOut: i % 6 === 0 ? "2026-04-09 14:00" : undefined,
    roomNumber: i % 3 === 0 ? `${100 + (i % 50)}` : undefined,
    utilitiesUsed: i % 3 === 0 ? ["WiFi", "TV", "Room Service"] : [],
  };
});

export const appointments: Appointment[] = Array.from({ length: 40 }, (_, i) => {
  const statuses: Appointment["status"][] = ["confirmed", "pending", "cancelled", "rescheduled", "completed"];
  const types: Appointment["type"][] = ["Visit", "Follow-up", "Consultation", "Surgery"];
  const sources: Appointment["source"][] = ["Online", "Walk-in", "Phone", "International"];
  const pt = patients[i % patients.length];
  const doc = doctors[i % doctors.length];
  return {
    id: i + 1,
    patientId: pt.patientId,
    patient: pt.name,
    department: doc.department,
    doctor: doc.name,
    date: `2026-04-${String(9 + (i % 20)).padStart(2, "0")}`,
    time: `${8 + (i % 10)}:${i % 2 === 0 ? "00" : "30"}`,
    type: types[i % types.length],
    status: statuses[i % statuses.length],
    source: sources[i % sources.length],
    notes: i % 5 === 0 ? "Patient requested specific time" : "",
  };
});

export const feedbackEntries: FeedbackEntry[] = Array.from({ length: 25 }, (_, i) => {
  const statuses: FeedbackEntry["status"][] = ["new", "replied", "flagged", "resolved"];
  const pt = patients[i % patients.length];
  const doc = doctors[i % doctors.length];
  const comments = [
    "Exceptional care during my visit. The staff was incredibly attentive.",
    "Very good service, slight wait time but the consultation was thorough.",
    "Room cleanliness could be improved. Staff was friendly however.",
    "Best hospital experience in Kuwait. True luxury healthcare.",
    "The doctor was very professional and explained everything clearly.",
    "Wait time was too long but treatment was excellent.",
    "Outstanding facilities and very caring nurses.",
    "Could improve the parking situation. Everything else was perfect.",
    "My child received excellent care. Thank you Dr. Bakr!",
    "The VIP suite was amazing. Felt like a hotel stay.",
  ];
  return {
    id: i + 1,
    patient: pt.name,
    patientId: pt.patientId,
    rating: 2 + (i * 7) % 4,
    comment: comments[i % comments.length],
    doctor: doc.name,
    department: doc.department,
    date: `2026-04-${String(1 + (i % 9)).padStart(2, "0")}`,
    status: statuses[i % statuses.length],
  };
});

export const inboxItems: InboxItem[] = Array.from({ length: 20 }, (_, i) => {
  const types = ["Booking", "International Enquiry", "Feedback", "Request Form", "Contact", "Document Upload"];
  const priorities: InboxItem["priority"][] = ["high", "medium", "low"];
  const statuses: InboxItem["status"][] = ["new", "in_progress", "resolved"];
  const pt = patients[i % patients.length];
  return {
    id: i + 1,
    name: pt.name,
    type: types[i % types.length],
    contact: pt.phone,
    date: `2026-04-${String(1 + (i % 9)).padStart(2, "0")}`,
    status: statuses[i % statuses.length],
    priority: priorities[i % priorities.length],
    message: `${types[i % types.length]} from ${pt.name} regarding ${doctors[i % doctors.length].department}`,
  };
});

export const notifications: Notification[] = [
  { id: 1, title: "New Appointment Request", message: "Sarah Al-Mutairi has requested an appointment with Dr. Layla Ahmed.", type: "appointment", time: "2 min ago", read: false, link: "/appointment-requests" },
  { id: 2, title: "Appointment Confirmed", message: "Ahmed Hassan's cardiology appointment has been confirmed for April 10.", type: "appointment", time: "5 min ago", read: false, link: "/appointments" },
  { id: 3, title: "International Enquiry", message: "James Wilson from UK submitted a cardiac surgery consultation request.", type: "international", time: "12 min ago", read: false, link: "/international-patients" },
  { id: 4, title: "Document Uploaded", message: "Fatima Al-Sabah uploaded medical reports for review.", type: "document", time: "20 min ago", read: false, link: "/patient-documents" },
  { id: 5, title: "New Feedback", message: "Mohammad Ali submitted a 5-star review for Pediatrics department.", type: "feedback", time: "30 min ago", read: false, link: "/feedback" },
  { id: 6, title: "Urgent Case Alert", message: "Emergency pediatric case requires immediate attention - Room 204.", type: "system", time: "45 min ago", read: false, link: "/appointments" },
  { id: 7, title: "Appointment Cancelled", message: "Noura Al-Rashidi cancelled her dermatology appointment.", type: "appointment", time: "1 hr ago", read: true, link: "/appointments" },
  { id: 8, title: "New Booking Request", message: "Khalid Ibrahim requested online booking for Orthopedics.", type: "request", time: "1.5 hrs ago", read: true, link: "/appointment-requests" },
  { id: 9, title: "System Maintenance", message: "Scheduled maintenance tonight from 2AM-4AM. Backup systems active.", type: "system", time: "2 hrs ago", read: true, link: "/settings" },
  { id: 10, title: "Patient Record Updated", message: "Lab results added for patient Maryam Al-Enezi.", type: "document", time: "3 hrs ago", read: true, link: "/patient-records" },
  { id: 11, title: "Feedback Alert", message: "Low rating (2 stars) received from Hessa Al-Kandari - requires review.", type: "feedback", time: "4 hrs ago", read: true, link: "/feedback" },
  { id: 12, title: "International Patient Arrival", message: "Chen Wei from China arriving tomorrow. Coordinator assigned.", type: "international", time: "5 hrs ago", read: true, link: "/international-patients" },
];

export const services: ServiceItem[] = [
  { id: 1, name: "Prenatal Care", nameAr: "رعاية ما قبل الولادة", category: "Medical", description: "Complete pregnancy care with regular monitoring and ultrasound services.", active: true, price: "50 KWD", duration: "45 min" },
  { id: 2, name: "Cardiac Screening", nameAr: "فحص القلب", category: "Medical", description: "Comprehensive heart health assessment and risk evaluation.", active: true, price: "120 KWD", duration: "60 min" },
  { id: 3, name: "Pediatric Check-up", nameAr: "فحص الأطفال", category: "Medical", description: "Routine health examination for children with developmental assessment.", active: true, price: "35 KWD", duration: "30 min" },
  { id: 4, name: "Dermatology Consultation", nameAr: "استشارة جلدية", category: "Medical", description: "Expert skin care consultation and treatment planning.", active: true, price: "45 KWD", duration: "30 min" },
  { id: 5, name: "Orthopedic Assessment", nameAr: "تقييم العظام", category: "Medical", description: "Joint and bone evaluation with imaging services.", active: true, price: "60 KWD", duration: "45 min" },
  { id: 6, name: "Neurology Consultation", nameAr: "استشارة الأعصاب", category: "Medical", description: "Comprehensive neurological examination and treatment.", active: true, price: "75 KWD", duration: "45 min" },
  { id: 7, name: "Eye Examination", nameAr: "فحص العيون", category: "Medical", description: "Complete eye health assessment and vision testing.", active: true, price: "40 KWD", duration: "30 min" },
  { id: 8, name: "Dental Care", nameAr: "رعاية الأسنان", category: "Medical", description: "Comprehensive dental care including cosmetic and restorative dentistry.", active: true, price: "30 KWD", duration: "45 min" },
  { id: 9, name: "Laparoscopic Surgery", nameAr: "جراحة المنظار", category: "Surgical", description: "Minimally invasive surgical procedures.", active: true, price: "Varies", duration: "Varies" },
  { id: 10, name: "C-Section Delivery", nameAr: "ولادة قيصرية", category: "Surgical", description: "Planned and emergency cesarean delivery.", active: true, price: "800 KWD", duration: "2-3 hrs" },
  { id: 11, name: "Joint Replacement", nameAr: "استبدال المفاصل", category: "Surgical", description: "Hip and knee replacement surgery.", active: true, price: "Varies", duration: "3-4 hrs" },
  { id: 12, name: "MRI Scan", nameAr: "تصوير بالرنين المغناطيسي", category: "Diagnostic", description: "High-resolution magnetic resonance imaging.", active: true, price: "150 KWD", duration: "45 min" },
  { id: 13, name: "CT Scan", nameAr: "الأشعة المقطعية", category: "Diagnostic", description: "Computed tomography for detailed body imaging.", active: true, price: "100 KWD", duration: "30 min" },
  { id: 14, name: "Blood Tests", nameAr: "تحاليل الدم", category: "Diagnostic", description: "Comprehensive blood work and analysis.", active: true, price: "25 KWD", duration: "15 min" },
  { id: 15, name: "Ultrasound", nameAr: "التصوير بالموجات فوق الصوتية", category: "Diagnostic", description: "Diagnostic ultrasound imaging.", active: true, price: "50 KWD", duration: "30 min" },
  { id: 16, name: "ECG / Echo", nameAr: "تخطيط القلب", category: "Diagnostic", description: "Electrocardiogram and echocardiography.", active: true, price: "60 KWD", duration: "30 min" },
  { id: 17, name: "VIP Suite", nameAr: "جناح كبار الشخصيات", category: "Hospitality", description: "Private luxury suites with 24/7 concierge and premium amenities.", active: true, price: "300 KWD/night", duration: "Per stay" },
  { id: 18, name: "Airport Transfer", nameAr: "خدمة النقل من المطار", category: "Hospitality", description: "Private car service for international patients.", active: true, price: "50 KWD", duration: "1 hr" },
  { id: 19, name: "Private Dining", nameAr: "تناول طعام خاص", category: "Hospitality", description: "Gourmet meals prepared by our executive chef.", active: true, price: "25 KWD/meal", duration: "Per meal" },
  { id: 20, name: "Concierge Service", nameAr: "خدمة الكونسيرج", category: "Hospitality", description: "24/7 personal concierge for patient and family needs.", active: true, price: "Included", duration: "24/7" },
  { id: 21, name: "Hotel Accommodation", nameAr: "إقامة فندقية", category: "Hospitality", description: "Partner hotel bookings for patient companions.", active: true, price: "80 KWD/night", duration: "Per stay" },
  { id: 22, name: "Translation Services", nameAr: "خدمات الترجمة", category: "Hospitality", description: "Professional medical translation in 10+ languages.", active: true, price: "30 KWD/hr", duration: "Per hour" },
  { id: 23, name: "Nutrition Consultation", nameAr: "استشارة تغذية", category: "Wellness", description: "Personalized dietary planning and nutrition counseling.", active: true, price: "35 KWD", duration: "45 min" },
  { id: 24, name: "Physiotherapy", nameAr: "العلاج الطبيعي", category: "Wellness", description: "Rehabilitation and physical therapy sessions.", active: true, price: "30 KWD", duration: "45 min" },
  { id: 25, name: "Laser Therapy", nameAr: "العلاج بالليزر", category: "Wellness", description: "Advanced laser treatments for cosmetic procedures.", active: false, price: "200 KWD", duration: "60 min" },
];

export const hospitalDocuments: HospitalDocument[] = [
  { id: "hdoc-1", title: "Patient Rights & Responsibilities", category: "Policy", department: "Administration", uploadDate: "2025-01-15", fileSize: "1.2 MB", uploadedBy: "Admin", tags: ["policy", "patient"], description: "Guidelines on patient rights and responsibilities at Royale Hayat Hospital." },
  { id: "hdoc-2", title: "Infection Control Protocol", category: "Protocol", department: "Quality Assurance", uploadDate: "2025-02-20", fileSize: "3.5 MB", uploadedBy: "QA Team", tags: ["protocol", "infection", "safety"], description: "Standard infection control procedures for all departments." },
  { id: "hdoc-3", title: "Insurance Claim Guide", category: "Guide", department: "Finance", uploadDate: "2025-03-10", fileSize: "0.8 MB", uploadedBy: "Finance", tags: ["insurance", "claims", "guide"], description: "Step-by-step guide for processing insurance claims." },
  { id: "hdoc-4", title: "Admission Form", category: "Form", department: "Reception", uploadDate: "2025-01-05", fileSize: "0.3 MB", uploadedBy: "Admin", tags: ["form", "admission"], description: "Standard patient admission form." },
  { id: "hdoc-5", title: "JCI Accreditation Certificate", category: "Certificate", department: "Administration", uploadDate: "2024-12-01", fileSize: "2.1 MB", uploadedBy: "CEO Office", tags: ["accreditation", "JCI"], description: "Joint Commission International accreditation certificate." },
  { id: "hdoc-6", title: "Hospital Services Brochure", category: "Brochure", department: "Marketing", uploadDate: "2025-06-15", fileSize: "5.4 MB", uploadedBy: "Marketing", tags: ["brochure", "services"], description: "Comprehensive brochure of all hospital services." },
  { id: "hdoc-7", title: "Emergency Protocol", category: "Protocol", department: "Emergency", uploadDate: "2025-04-20", fileSize: "2.8 MB", uploadedBy: "Emergency Dept", tags: ["emergency", "protocol"], description: "Emergency response and triage protocol." },
  { id: "hdoc-8", title: "Visitor Policy", category: "Policy", department: "Administration", uploadDate: "2025-05-10", fileSize: "0.5 MB", uploadedBy: "Admin", tags: ["visitor", "policy"], description: "Hospital visiting hours and visitor guidelines." },
  { id: "hdoc-9", title: "Discharge Summary Template", category: "Form", department: "Medical Records", uploadDate: "2025-03-25", fileSize: "0.4 MB", uploadedBy: "Medical Records", tags: ["discharge", "template"], description: "Standard discharge summary form for all departments." },
  { id: "hdoc-10", title: "Annual Quality Report 2025", category: "Report", department: "Quality Assurance", uploadDate: "2026-01-30", fileSize: "8.2 MB", uploadedBy: "QA Team", tags: ["quality", "annual", "report"], description: "Annual quality and patient safety report." },
  { id: "hdoc-11", title: "International Patient Guide", category: "Guide", department: "International Relations", uploadDate: "2025-07-01", fileSize: "3.1 MB", uploadedBy: "Intl. Dept", tags: ["international", "guide"], description: "Complete guide for international patients visiting the hospital." },
  { id: "hdoc-12", title: "Staff Training Manual", category: "Guide", department: "HR", uploadDate: "2025-08-15", fileSize: "6.7 MB", uploadedBy: "HR", tags: ["training", "staff"], description: "Comprehensive staff training and orientation manual." },
  { id: "hdoc-13", title: "Pharmacy Formulary", category: "Guide", department: "Pharmacy", uploadDate: "2025-09-01", fileSize: "4.3 MB", uploadedBy: "Pharmacy", tags: ["pharmacy", "formulary", "medication"], description: "Hospital drug formulary and prescribing guidelines." },
  { id: "hdoc-14", title: "Data Privacy Policy", category: "Policy", department: "IT", uploadDate: "2025-04-15", fileSize: "1.8 MB", uploadedBy: "IT Dept", tags: ["privacy", "data", "HIPAA"], description: "Data privacy and patient information protection policy." },
  { id: "hdoc-15", title: "Medical Equipment Inventory", category: "Report", department: "Biomedical", uploadDate: "2026-02-10", fileSize: "2.5 MB", uploadedBy: "Biomedical", tags: ["equipment", "inventory"], description: "Complete inventory of medical equipment across all departments." },
];

export const exportToExcel = (data: any[], filename: string) => {
  const headers = Object.keys(data[0] || {});
  const csvContent = [
    headers.join(","),
    ...data.map(row => headers.map(h => {
      const val = row[h];
      const str = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
      return `"${str.replace(/"/g, '""')}"`;
    }).join(","))
  ].join("\n");
  
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
