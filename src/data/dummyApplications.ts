
export type JobApplication = {
  _id: string;
  applicationId: string;
  fullName: string;
  email: string;
  phone: string;
  cvUrl: string;
  coverLetter: string;
  jobTitle: string;
  jobId: string;
  appliedDate: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected";
  isViewed?: boolean;
  experience?: number;
  currentCompany?: string;
  noticePeriod?: string;
};

export const dummyApplications: JobApplication[] = [
  {
    _id: "app-1",
    applicationId: "APP-001",
    fullName: "John Smith",
    email: "john.smith@example.com",
    phone: "+971 50 123 4567",
    cvUrl: "/uploads/cv/john_smith_cv.pdf",
    coverLetter:
      "Dear Hiring Manager,\n\nI am writing to express my strong interest in the Registrar – Plastic Surgeon position at Royale Hayat Hospital. With over 3 years of experience in plastic and reconstructive surgery, I am confident in my ability to contribute to your esteemed institution.\n\nSincerely,\nJohn Smith",
    jobTitle: "Registrar – Plastic Surgeon",
    jobId: "JA-001",
    appliedDate: "2024-03-10T09:00:00Z",
    status: "pending",
    experience: 3,
    currentCompany: "City General Hospital",
    noticePeriod: "30 days",
  },
  {
    _id: "app-2",
    applicationId: "APP-002",
    fullName: "Sara Al-Mansouri",
    email: "sara.mansouri@example.com",
    phone: "+971 55 987 6543",
    cvUrl: "/uploads/cv/sara_mansouri_cv.pdf",
    coverLetter:
      "Dear Hiring Manager,\n\nI am a board-certified plastic surgeon with 4 years of registrar experience. I am eager to join Royale Hayat Hospital and contribute to its surgical excellence.\n\nBest regards,\nSara Al-Mansouri",
    jobTitle: "Registrar – Plastic Surgeon",
    jobId: "JA-001",
    appliedDate: "2024-03-12T11:30:00Z",
    status: "reviewed",
    experience: 4,
    currentCompany: "Al Noor Hospital",
    noticePeriod: "60 days",
  },

  {
    _id: "app-3",
    applicationId: "APP-003",
    fullName: "Fatima Al-Rashidi",
    email: "fatima.rashidi@example.com",
    phone: "+965 99 112 2334",
    cvUrl: "/uploads/cv/fatima_rashidi_cv.pdf",
    coverLetter:
      "Dear Hiring Manager,\n\nI am a bilingual (Arabic & English) hospitality professional with 3 years of floor coordination experience in a private hospital. I am excited to apply for this role.\n\nWarm regards,\nFatima Al-Rashidi",
    jobTitle: "Floor Coordinator only Female, Bilingual (Arabic & English)",
    jobId: "JA-002",
    appliedDate: "2024-03-08T08:45:00Z",
    status: "shortlisted",
    experience: 3,
    currentCompany: "Kuwait Medical Center",
    noticePeriod: "15 days",
  },

  {
    _id: "app-4",
    applicationId: "APP-004",
    fullName: "Nour Hassan",
    email: "nour.hassan@example.com",
    phone: "+965 66 543 2100",
    cvUrl: "/uploads/cv/nour_hassan_cv.pdf",
    coverLetter:
      "Dear Hiring Manager,\n\nI am a registered nurse with 5 years of labor and delivery experience and a valid MOH license. I am passionate about maternal care and would love to join your team.\n\nSincerely,\nNour Hassan",
    jobTitle: "Registered Nurse for Labor and Delivery Department",
    jobId: "JA-005",
    appliedDate: "2024-03-14T10:00:00Z",
    status: "pending",
    experience: 5,
    currentCompany: "Royale Women's Clinic",
    noticePeriod: "30 days",
  },
  {
    _id: "app-5",
    applicationId: "APP-005",
    fullName: "Aisha Al-Otaibi",
    email: "aisha.otaibi@example.com",
    phone: "+965 55 321 9876",
    cvUrl: "/uploads/cv/aisha_otaibi_cv.pdf",
    coverLetter:
      "Dear Hiring Manager,\n\nWith 6 years of L&D nursing experience and NRP certification, I am well-prepared to contribute to your department.\n\nBest,\nAisha Al-Otaibi",
    jobTitle: "Registered Nurse for Labor and Delivery Department",
    jobId: "JA-005",
    appliedDate: "2024-03-15T14:20:00Z",
    status: "reviewed",
    experience: 6,
    currentCompany: "Maternity Care Hospital",
    noticePeriod: "45 days",
  },

  {
    _id: "app-6",
    applicationId: "APP-006",
    fullName: "Dr. Khalid Al-Farsi",
    email: "khalid.farsi@example.com",
    phone: "+965 77 654 3210",
    cvUrl: "/uploads/cv/khalid_farsi_cv.pdf",
    coverLetter:
      "Dear Hiring Manager,\n\nI am a board-certified pediatrician with 7 years of consultant experience. I am drawn to Royale Hayat Hospital's reputation for pediatric excellence.\n\nRegards,\nDr. Khalid Al-Farsi",
    jobTitle: "Consultant Pediatrician",
    jobId: "JA-009",
    appliedDate: "2024-03-05T09:15:00Z",
    status: "shortlisted",
    experience: 7,
    currentCompany: "Children's Specialty Hospital",
    noticePeriod: "90 days",
  },
  {
    _id: "app-7",
    applicationId: "APP-007",
    fullName: "Dr. Mona Al-Zaabi",
    email: "mona.zaabi@example.com",
    phone: "+965 88 765 4321",
    cvUrl: "/uploads/cv/mona_zaabi_cv.pdf",
    coverLetter:
      "Dear Hiring Manager,\n\nWith 5 years as a consultant pediatrician and PALS certification, I am confident I can deliver exceptional care to your young patients.\n\nSincerely,\nDr. Mona Al-Zaabi",
    jobTitle: "Consultant Pediatrician",
    jobId: "JA-009",
    appliedDate: "2024-03-07T13:00:00Z",
    status: "rejected",
    experience: 5,
    currentCompany: "Gulf Pediatric Center",
    noticePeriod: "60 days",
  },
  {
    _id: "app-8",
    applicationId: "APP-008",
    fullName: "Dr. Yusuf Al-Balushi",
    email: "yusuf.balushi@example.com",
    phone: "+965 99 876 5432",
    cvUrl: "/uploads/cv/yusuf_balushi_cv.pdf",
    coverLetter:
      "Dear Hiring Manager,\n\nI bring 8 years of pediatric consultant experience across two GCC countries. I am excited about this opportunity.\n\nBest regards,\nDr. Yusuf Al-Balushi",
    jobTitle: "Consultant Pediatrician",
    jobId: "JA-009",
    appliedDate: "2024-03-09T16:45:00Z",
    status: "pending",
    experience: 8,
    currentCompany: "National Children's Hospital",
    noticePeriod: "30 days",
  },

  {
    _id: "app-9",
    applicationId: "APP-009",
    fullName: "Layla Al-Hamdan",
    email: "layla.hamdan@example.com",
    phone: "+965 55 234 5678",
    cvUrl: "/uploads/cv/layla_hamdan_cv.pdf",
    coverLetter:
      "Dear Hiring Manager,\n\nI am a marketing professional with 6 years of brand management experience in the healthcare sector. I am excited to bring my expertise to Royale Hayat Hospital.\n\nSincerely,\nLayla Al-Hamdan",
    jobTitle: "Brand Manager",
    jobId: "JA-012",
    appliedDate: "2024-03-11T10:30:00Z",
    status: "reviewed",
    experience: 6,
    currentCompany: "HealthBrand Agency",
    noticePeriod: "30 days",
  },
];

export const getApplicationsByJobId = (jobId: string): JobApplication[] =>
  dummyApplications.filter(a => a.jobId === jobId);

export const getApplicationById = (id: string): JobApplication | undefined =>
  dummyApplications.find(a => a._id === id);
