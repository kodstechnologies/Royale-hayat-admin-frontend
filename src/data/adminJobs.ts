// adminJobs.ts

export type AdminJob = {
  id: string;
  jobId: string;
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  arabicTitle: string;
  arabicDescription: string;
  arabicResponsibilities: string[];
  arabicRequirements: string[];
  category: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract";
  closingDate: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};

// Helper function to generate closing date (one year from today)
const getClosingDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0];
};

// Helper function to generate job ID
const generateJobId = (index: number) => {
  return `JA-${String(index + 1).padStart(3, '0')}`;
};

// Helper function to generate Arabic text (simplified translation)
const getArabicTitle = (title: string): string => {
  const titleMap: Record<string, string> = {
    "Registrar – Plastic Surgeon": "أخصائي - جراح تجميل",
    "Floor Coordinator only Female, Bilingual (Arabic & English)": "منسقة الطوابق - نسائية، ثنائية اللغة",
    "Birth Registration Assistant (Bilingual – Arabic & English, only local candidate)": "مساعد تسجيل المواليد",
    "Registered Nurse for Home Care Dept": "ممرضة مسجلة - قسم الرعاية المنزلية",
    "Registered Nurse for Labor and Delivery Department – Local (Female with MOH Licence)": "ممرضة مسجلة - قسم الولادة والتوليد",
    "Anesthesia – Specialist": "أخصائي تخدير",
    "Registrar – Internal Medicine": "أخصائي - طب باطني",
    "Registrar – Obstetrician and Gynecologist": "أخصائي - نساء وتوليد",
    "Consultant Pediatrician": "استشاري طب أطفال",
    "Registered Nurse for Cosmetic Center – Local (Female with MOH License & Laser Exp)": "ممرضة مسجلة - مركز التجميل",
    "Consultant Neonatologist": "استشاري حديثي الولادة",
    "Brand Manager": "مدير العلامة التجارية",
    "Anesthesia Technician – Local (Female with MOH)": "فني تخدير",
    "Guest Relations Officer": "مسؤول علاقات الضيوف",
    "Marketing Specialist – Digital & Social Media": "أخصائي تسويق - رقمي ووسائل التواصل",
    "Content Writer – Arabic & English": "كاتب محتوى - عربي وإنجليزي",
    "Registered Nurse – ICU": "ممرضة مسجلة - العناية المركزة",
    "Nurse Manager – Surgical Ward": "مديرة تمريض - الجناح الجراحي",
    "Quality Improvement Coordinator": "منسق تحسين الجودة",
    "Patient Safety Officer": "مسؤول سلامة المرضى",
    "Home Health Nurse": "ممرضة رعاية منزلية",
    "Consultant Cardiologist": "استشاري أمراض قلبية",
    "Specialist – Obstetrics & Gynecology": "أخصائي - نساء وتوليد",
    "Pediatrician": "طبيب أطفال",
    "Human Resources Coordinator": "منسق موارد بشرية",
    "Medical Records Specialist": "أخصائي سجلات طبية",
  };
  return titleMap[title] || title;
};

const getArabicDescription = (description: string): string => {
  // Simplified Arabic translations
  const arabicPrefix = "وصف الوظيفة: ";
  return arabicPrefix + description;
};

export const adminJobs: AdminJob[] = [
  {
    id: "1",
    jobId: "JA-001",
    title: "Registrar – Plastic Surgeon",
    description: "Candidates applying should have minimum Two years of experience as Plastic Surgery Registrar.",
    responsibilities: [
      "Assist in plastic and reconstructive surgeries",
      "Conduct pre-operative and post-operative patient assessments",
      "Participate in outpatient clinics",
      "Maintain accurate patient records",
      "Collaborate with senior consultants on complex cases"
    ],
    requirements: [
      "MBBS degree with specialization in Plastic Surgery",
      "Minimum 2 years of experience as Plastic Surgery Registrar",
      "Valid MOH license",
      "Strong surgical skills",
      "Excellent communication skills"
    ],
    arabicTitle: getArabicTitle("Registrar – Plastic Surgeon"),
    arabicDescription: getArabicDescription("Candidates applying should have minimum Two years of experience as Plastic Surgery Registrar."),
    arabicResponsibilities: [
      "المساعدة في العمليات الجراحية التجميلية والترميمية",
      "إجراء تقييمات المرضى قبل وبعد الجراحة",
      "المشاركة في العيادات الخارجية",
      "الحفاظ على سجلات دقيقة للمرضى"
    ],
    arabicRequirements: [
      "بكالوريوس طب وجراحة مع تخصص في جراحة التجميل",
      "خبرة سنتين كأخصائي جراحة تجميل",
      "رخصة وزارة الصحة سارية المفعول"
    ],
    category: "Specialist Doctors",
    location: "On-Site",
    type: "Full-time",
    closingDate: getClosingDate(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "2",
    jobId: "JA-002",
    title: "Floor Coordinator only Female, Bilingual (Arabic & English)",
    description: "Royale Hayat Hospital have devoted considerable effort to applying established strategies for quality improvement thus they created a position of Floor coordinator.",
    responsibilities: [
      "To ensure a differences and service recovery every day with every patient throughout his or her hospitalization",
      "Positive outcomes of stay",
      "Improved quality outcomes, and patient satisfaction which may help transform the acute care delivery model",
      "Coordinate floor operations and ensure smooth patient flow",
      "Liaise between departments to resolve patient concerns"
    ],
    requirements: [
      "Bilingual proficiency in Arabic and English (mandatory)",
      "Female candidates only",
      "Minimum 2 years of experience in hospitality or healthcare coordination",
      "Excellent communication and organizational skills"
    ],
    arabicTitle: getArabicTitle("Floor Coordinator only Female, Bilingual (Arabic & English)"),
    arabicDescription: getArabicDescription("Royale Hayat Hospital have devoted considerable effort to applying established strategies for quality improvement."),
    arabicResponsibilities: [
      "تنسيق عمليات الطوابق وضمان تدفق المرضى بسلاسة",
      "التنسيق بين الأقسام لحل مخاوف المرضى",
      "ضمان نتائج إيجابية للإقامة",
      "تحسين نتائج الجودة ورضا المرضى"
    ],
    arabicRequirements: [
      "إجادة اللغتين العربية والإنجليزية (إلزامي)",
      "مرشحات نسائية فقط",
      "خبرة سنتين في التنسيق في الضيافة أو الرعاية الصحية"
    ],
    category: "Hospitality / Guest Services",
    location: "On-Site",
    type: "Full-time",
    closingDate: getClosingDate(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "3",
    jobId: "JA-003",
    title: "Birth Registration Assistant (Bilingual – Arabic & English, only local candidate)",
    description: "Birth Registration Clerk shall ensure complete documentation of Birth, Death, Sick Leave, Maternity Leave and other patient related records as per MOH guidelines and protocols.",
    responsibilities: [
      "Process birth registrations accurately",
      "Maintain complete documentation of births, deaths, and leaves",
      "Ensure compliance with MOH guidelines",
      "Coordinate with medical records department",
      "Provide bilingual support to patients"
    ],
    requirements: [
      "Bilingual proficiency in Arabic and English",
      "Local candidate only",
      "Knowledge of MOH guidelines and protocols",
      "Attention to detail",
      "Experience in medical records preferred"
    ],
    arabicTitle: getArabicTitle("Birth Registration Assistant"),
    arabicDescription: getArabicDescription("Birth Registration Clerk shall ensure complete documentation of Birth, Death, Sick Leave, Maternity Leave records."),
    arabicResponsibilities: [
      "معالجة تسجيلات المواليد بدقة",
      "الحفاظ على التوثيق الكامل للمواليد والوفيات والإجازات",
      "ضمان الامتثال لإرشادات وزارة الصحة",
      "التنسيق مع قسم السجلات الطبية"
    ],
    arabicRequirements: [
      "إجادة اللغتين العربية والإنجليزية",
      "مرشح محلي فقط",
      "معرفة بإرشادات وزارة الصحة",
      "الاهتمام بالتفاصيل"
    ],
    category: "Quality & Patient Safety",
    location: "On-Site",
    type: "Full-time",
    closingDate: getClosingDate(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "4",
    jobId: "JA-004",
    title: "Registered Nurse for Home Care Dept",
    description: "To ensure the safe provision of nursing services in collaboration with the patient/family and the multidisciplinary health care team.",
    responsibilities: [
      "Provide nursing care to patients in their homes",
      "Collaborate with patient families and healthcare team",
      "Monitor patient health status and report changes",
      "Administer medications as prescribed",
      "Educate patients and families on care plans"
    ],
    requirements: [
      "Valid nursing license",
      "Minimum 2 years of nursing experience",
      "Home care experience preferred",
      "Valid driver's license",
      "Strong communication skills"
    ],
    arabicTitle: getArabicTitle("Registered Nurse for Home Care Dept"),
    arabicDescription: getArabicDescription("To ensure the safe provision of nursing services in collaboration with the patient/family."),
    arabicResponsibilities: [
      "تقديم الرعاية التمريضية للمرضى في منازلهم",
      "التعاون مع عائلات المرضى والفريق الصحي",
      "مراقبة الحالة الصحية للمرضى",
      "إعطاء الأدوية حسب الوصفة الطبية"
    ],
    arabicRequirements: [
      "رخصة تمريض سارية المفعول",
      "خبرة تمريض سنتين",
      "رخصة قيادة سارية"
    ],
    category: "Royale Home Health",
    location: "Field",
    type: "Full-time",
    closingDate: getClosingDate(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "5",
    jobId: "JA-005",
    title: "Registered Nurse for Labor and Delivery Department – Local (Female with MOH Licence)",
    description: "Registered Nurse for Labor and Delivery Department - Local (Female with MOH Licence).",
    responsibilities: [
      "Monitor maternal and fetal well-being during labor",
      "Assist with deliveries and cesarean sections",
      "Provide postpartum care and education",
      "Support breastfeeding initiation",
      "Maintain accurate delivery records"
    ],
    requirements: [
      "Valid MOH license",
      "Female candidates only",
      "Local candidate",
      "Labor and delivery experience preferred",
      "Neonatal resuscitation certification"
    ],
    arabicTitle: getArabicTitle("Registered Nurse for Labor and Delivery Department"),
    arabicDescription: getArabicDescription("Registered Nurse for Labor and Delivery Department - Local (Female with MOH Licence)."),
    arabicResponsibilities: [
      "مراقبة صحة الأم والجنين أثناء المخاض",
      "المساعدة في الولادات الطبيعية والقيصرية",
      "تقديم رعاية ما بعد الولادة والتثقيف الصحي",
      "دعم بدء الرضاعة الطبيعية"
    ],
    arabicRequirements: [
      "رخصة وزارة الصحة سارية",
      "مرشحات نسائية فقط",
      "مرشح محلي"
    ],
    category: "Nursing Support",
    location: "On-Site",
    type: "Full-time",
    closingDate: getClosingDate(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "6",
    jobId: "JA-006",
    title: "Anesthesia – Specialist",
    description: "Assesses and prepare patients for Anesthesia.",
    responsibilities: [
      "Assess patients prior to anesthesia",
      "Prepare anesthesia equipment and medications",
      "Monitor patients during procedures",
      "Manage post-anesthesia recovery",
      "Collaborate with surgical team"
    ],
    requirements: [
      "MBBS with specialization in Anesthesia",
      "Valid MOH license",
      "Minimum 3 years of experience",
      "ACLS and BLS certification"
    ],
    arabicTitle: getArabicTitle("Anesthesia – Specialist"),
    arabicDescription: getArabicDescription("Assesses and prepare patients for Anesthesia."),
    arabicResponsibilities: [
      "تقييم المرضى قبل التخدير",
      "تحضير معدات وأدوية التخدير",
      "مراقبة المرضى أثناء الإجراءات",
      "إدارة التعافي بعد التخدير"
    ],
    arabicRequirements: [
      "بكالوريوس طب مع تخصص في التخدير",
      "رخصة وزارة الصحة سارية",
      "خبرة 3 سنوات"
    ],
    category: "Specialist Doctors",
    location: "On-Site",
    type: "Full-time",
    closingDate: getClosingDate(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "7",
    jobId: "JA-007",
    title: "Registrar – Internal Medicine",
    description: "Active Listening, Critical Thinking, Active Learning, Monitoring, and Quality control Analysis.",
    responsibilities: [
      "Provide comprehensive internal medicine care",
      "Conduct patient assessments and diagnoses",
      "Develop treatment plans",
      "Monitor patient progress",
      "Participate in quality improvement initiatives"
    ],
    requirements: [
      "MBBS with specialization in Internal Medicine",
      "Valid MOH license",
      "Minimum 2 years of registrar experience",
      "Strong clinical skills"
    ],
    arabicTitle: getArabicTitle("Registrar – Internal Medicine"),
    arabicDescription: getArabicDescription("Active Listening, Critical Thinking, Active Learning, Monitoring, and Quality control Analysis."),
    arabicResponsibilities: [
      "تقديم رعاية شاملة في الطب الباطني",
      "إجراء تقييمات المرضى وتشخيصهم",
      "تطوير خطط العلاج",
      "مراقبة تقدم المرضى"
    ],
    arabicRequirements: [
      "بكالوريوس طب مع تخصص في الطب الباطني",
      "رخصة وزارة الصحة سارية",
      "خبرة سنتين"
    ],
    category: "Specialist Doctors",
    location: "On-Site",
    type: "Full-time",
    closingDate: getClosingDate(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "8",
    jobId: "JA-008",
    title: "Registrar – Obstetrician and Gynecologist",
    description: "To attend casualty cases and give emergency treatment, do the necessary admission procedures.",
    responsibilities: [
      "Handle emergency obstetric cases",
      "Perform necessary admission procedures",
      "Assist in deliveries and surgeries",
      "Provide antenatal and postnatal care",
      "Maintain patient records"
    ],
    requirements: [
      "MBBS with specialization in OB/GYN",
      "Valid MOH license",
      "Minimum 2 years of registrar experience",
      "Emergency management skills"
    ],
    arabicTitle: getArabicTitle("Registrar – Obstetrician and Gynecologist"),
    arabicDescription: getArabicDescription("To attend casualty cases and give emergency treatment, do the necessary admission procedures."),
    arabicResponsibilities: [
      "التعامل مع حالات الطوارئ التوليدية",
      "إجراء إجراءات القبول اللازمة",
      "المساعدة في الولادات والعمليات الجراحية",
      "تقديم رعاية ما قبل وما بعد الولادة"
    ],
    arabicRequirements: [
      "بكالوريوس طب مع تخصص في نساء وتوليد",
      "رخصة وزارة الصحة سارية",
      "خبرة سنتين"
    ],
    category: "Specialist Doctors",
    location: "On-Site",
    type: "Full-time",
    closingDate: getClosingDate(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "9",
    jobId: "JA-009",
    title: "Consultant Pediatrician",
    description: "Contribution to the daytime weekly attending rota and covering clinic. Clinic will be both by appointment and emergency walk-ins.",
    responsibilities: [
      "Provide expert pediatric care",
      "Attend weekly rota and cover clinic",
      "Handle both appointment and emergency cases",
      "Supervise junior medical staff",
      "Participate in clinical teaching"
    ],
    requirements: [
      "MBBS with specialization in Pediatrics",
      "Board certification",
      "Minimum 5 years of consultant experience",
      "Valid MOH license",
      "PALS certification"
    ],
    arabicTitle: getArabicTitle("Consultant Pediatrician"),
    arabicDescription: getArabicDescription("Contribution to the daytime weekly attending rota and covering clinic."),
    arabicResponsibilities: [
      "تقديم رعاية أطفال متخصصة",
      "المشاركة في الجدول الأسبوعي وتغطية العيادة",
      "التعامل مع حالات المواعيد والطوارئ",
      "الإشراف على الكوادر الطبية المبتدئة"
    ],
    arabicRequirements: [
      "بكالوريوس طب مع تخصص في طب الأطفال",
      "شهادة البورد",
      "خبرة 5 سنوات كاستشاري",
      "رخصة وزارة الصحة سارية"
    ],
    category: "Specialist Doctors",
    location: "On-Site",
    type: "Full-time",
    closingDate: getClosingDate(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "10",
    jobId: "JA-010",
    title: "Registered Nurse for Cosmetic Center – Local (Female with MOH License & Laser Exp)",
    description: "Responsible for the nursing care of patients according to their scope of practice in liaison with Medical Staff and Allied Health Professionals.",
    responsibilities: [
      "Provide nursing care for cosmetic procedures",
      "Assist with laser treatments",
      "Prepare patients for cosmetic procedures",
      "Provide post-procedure care and education",
      "Maintain equipment and supplies"
    ],
    requirements: [
      "Valid MOH license",
      "Female candidates only",
      "Laser experience required",
      "Local candidate",
      "Cosmetic nursing experience preferred"
    ],
    arabicTitle: getArabicTitle("Registered Nurse for Cosmetic Center"),
    arabicDescription: getArabicDescription("Responsible for the nursing care of patients according to their scope of practice."),
    arabicResponsibilities: [
      "تقديم الرعاية التمريضية للإجراءات التجميلية",
      "المساعدة في علاجات الليزر",
      "تحضير المرضى للإجراءات التجميلية",
      "تقديم الرعاية والتثقيف بعد الإجراء"
    ],
    arabicRequirements: [
      "رخصة وزارة الصحة سارية",
      "مرشحات نسائية فقط",
      "خبرة في الليزر مطلوبة",
      "مرشح محلي"
    ],
    category: "Nursing Support",
    location: "On-Site",
    type: "Full-time",
    closingDate: getClosingDate(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "11",
    jobId: "JA-011",
    title: "Consultant Neonatologist",
    description: "Candidates applying should have minimum Five years of experience in SCBU/NICU.",
    responsibilities: [
      "Provide expert neonatal care in NICU/SCBU",
      "Manage premature and critically ill newborns",
      "Lead neonatal resuscitation teams",
      "Supervise junior medical staff",
      "Participate in parent counseling"
    ],
    requirements: [
      "MBBS with specialization in Neonatology",
      "Board certification",
      "Minimum 5 years of NICU/SCBU experience",
      "Valid MOH license",
      "NRP certification"
    ],
    arabicTitle: getArabicTitle("Consultant Neonatologist"),
    arabicDescription: getArabicDescription("Candidates applying should have minimum Five years of experience in SCBU/NICU."),
    arabicResponsibilities: [
      "تقديم رعاية لحديثي الولادة في وحدة العناية المركزة",
      "إدارة الأطفال الخدج والمرضى حرجًا",
      "قيادة فرق إنعاش حديثي الولادة",
      "الإشراف على الكوادر الطبية المبتدئة"
    ],
    arabicRequirements: [
      "بكالوريوس طب مع تخصص في حديثي الولادة",
      "شهادة البورد",
      "خبرة 5 سنوات في وحدة العناية المركزة لحديثي الولادة",
      "رخصة وزارة الصحة سارية"
    ],
    category: "Specialist Doctors",
    location: "On-Site",
    type: "Full-time",
    closingDate: getClosingDate(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "12",
    jobId: "JA-012",
    title: "Brand Manager",
    description: "The Brand Manager develops and executes strategies to enhance RHH's brand image. Responsibilities include managing social media campaigns, supervising team members, coordinating publicity for doctors.",
    responsibilities: [
      "Develop and execute brand strategies",
      "Manage social media campaigns",
      "Supervise marketing team members",
      "Coordinate doctor publicity efforts",
      "Monitor brand performance metrics"
    ],
    requirements: [
      "Bachelor's degree in Marketing or related field",
      "Minimum 5 years of brand management experience",
      "Healthcare industry experience preferred",
      "Strong leadership and communication skills",
      "Portfolio of successful brand campaigns"
    ],
    arabicTitle: getArabicTitle("Brand Manager"),
    arabicDescription: getArabicDescription("The Brand Manager develops and executes strategies to enhance RHH's brand image."),
    arabicResponsibilities: [
      "تطوير وتنفيذ استراتيجيات العلامة التجارية",
      "إدارة حملات وسائل التواصل الاجتماعي",
      "الإشراف على أعضاء فريق التسويق",
      "تنسيق جهود الدعاية للأطباء"
    ],
    arabicRequirements: [
      "بكالوريوس في التسويق أو مجال ذي صلة",
      "خبرة 5 سنوات في إدارة العلامات التجارية",
      "خبرة في قطاع الرعاية الصحية"
    ],
    category: "Marketing & Communications",
    location: "On-Site",
    type: "Full-time",
    closingDate: getClosingDate(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "13",
    jobId: "JA-013",
    title: "Anesthesia Technician – Local (Female with MOH)",
    description: "Responsible for providing care to patients undergoing anesthesia in liaison with Medical Staff and Allied Health Professionals.",
    responsibilities: [
      "Prepare and maintain anesthesia equipment",
      "Assist anesthesiologists during procedures",
      "Monitor anesthesia supplies inventory",
      "Ensure equipment sterilization",
      "Document anesthesia procedures"
    ],
    requirements: [
      "Valid MOH license",
      "Female candidates only",
      "Local candidate",
      "Anesthesia technician certification",
      "Minimum 2 years of experience"
    ],
    arabicTitle: getArabicTitle("Anesthesia Technician"),
    arabicDescription: getArabicDescription("Responsible for providing care to patients undergoing anesthesia."),
    arabicResponsibilities: [
      "تحضير وصيانة معدات التخدير",
      "مساعدة أطباء التخدير أثناء الإجراءات",
      "مراقبة مخزون مستلزمات التخدير",
      "ضمان تعقيم المعدات"
    ],
    arabicRequirements: [
      "رخصة وزارة الصحة سارية",
      "مرشحات نسائية فقط",
      "مرشح محلي",
      "شهادة فني تخدير"
    ],
    category: "Surgical Services",
    location: "On-Site",
    type: "Full-time",
    closingDate: getClosingDate(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "14",
    jobId: "JA-014",
    title: "Guest Relations Officer",
    description: "Provide outstanding hospitality and patient experience throughout the hospital premises.",
    responsibilities: [
      "Welcome and assist patients and visitors",
      "Handle complaints and feedback professionally",
      "Coordinate with departments for patient needs",
      "Maintain guest satisfaction records"
    ],
    requirements: [
      "Experience in hospitality or guest relations",
      "Excellent interpersonal skills",
      "Bilingual preferred",
      "Professional appearance and demeanor"
    ],
    arabicTitle: getArabicTitle("Guest Relations Officer"),
    arabicDescription: getArabicDescription("Provide outstanding hospitality and patient experience throughout the hospital premises."),
    arabicResponsibilities: [
      "الترحيب بالمرضى والزوار ومساعدتهم",
      "التعامل مع الشكاوى والملاحظات بشكل احترافي",
      "التنسيق مع الأقسام لتلبية احتياجات المرضى",
      "الحفاظ على سجلات رضا الضيوف"
    ],
    arabicRequirements: [
      "خبرة في الضيافة أو علاقات الضيوف",
      "مهارات تواصل ممتازة",
      "إجادة اللغتين مفضلة"
    ],
    category: "Hospitality / Guest Services",
    location: "On-Site",
    type: "Full-time",
    closingDate: getClosingDate(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "15",
    jobId: "JA-015",
    title: "Marketing Specialist – Digital & Social Media",
    description: "Drive digital marketing campaigns, manage social media channels, and enhance brand visibility for the hospital.",
    responsibilities: [
      "Plan and execute digital marketing campaigns",
      "Manage hospital social media accounts",
      "Analyze campaign performance metrics",
      "Create engaging content for various platforms"
    ],
    requirements: [
      "Bachelor's degree in Marketing or related field",
      "3+ years of digital marketing experience",
      "Proficiency in social media management tools",
      "Strong analytical and creative skills"
    ],
    arabicTitle: getArabicTitle("Marketing Specialist – Digital & Social Media"),
    arabicDescription: getArabicDescription("Drive digital marketing campaigns, manage social media channels, and enhance brand visibility."),
    arabicResponsibilities: [
      "تخطيط وتنفيذ حملات التسويق الرقمي",
      "إدارة حسابات وسائل التواصل الاجتماعي للمستشفى",
      "تحليل مقاييس أداء الحملات",
      "إنشاء محتوى جذاب لمنصات مختلفة"
    ],
    arabicRequirements: [
      "بكالوريوس في التسويق أو مجال ذي صلة",
      "3+ سنوات خبرة في التسويق الرقمي",
      "إتقان أدوات إدارة وسائل التواصل الاجتماعي"
    ],
    category: "Marketing & Communications",
    location: "On-Site",
    type: "Full-time",
    closingDate: getClosingDate(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
];

// Helper functions
export const getJobsByCategory = (category: string): AdminJob[] => {
  return adminJobs.filter(job => job.category === category);
};

export const getJobById = (id: string): AdminJob | undefined => {
  return adminJobs.find(job => job.id === id);
};

export const getActiveJobs = (): AdminJob[] => {
  return adminJobs.filter(job => job.isActive === true);
};

export const getJobsByType = (type: "Full-time" | "Part-time" | "Contract"): AdminJob[] => {
  return adminJobs.filter(job => job.type === type);
};

export const getCategories = (): string[] => {
  return [...new Set(adminJobs.map(job => job.category))];
};