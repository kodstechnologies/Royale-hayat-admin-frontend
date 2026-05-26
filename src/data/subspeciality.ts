// adminSubspeciality.ts

export type AdminSubspeciality = {
  id: string;
  departmentId: string;
  departmentName: string;
  name: string;
  nameAr: string;
  createdAt: string;
  updatedAt: string;
};

export const adminSubspecialities: AdminSubspeciality[] = [
  // Obstetrics & Gynecology (Department ID: 1)
  {
    id: "1",
    departmentId: "1",
    departmentName: "Obstetrics & Gynecology",
    name: "Women's Health",
    nameAr: "صحة المرأة",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    departmentId: "1",
    departmentName: "Obstetrics & Gynecology",
    name: "Urogynecology",
    nameAr: "أمراض المسالك البولية النسائية",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "3",
    departmentId: "1",
    departmentName: "Obstetrics & Gynecology",
    name: "Cosmetic Gynecology",
    nameAr: "أمراض النساء التجميلية",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "4",
    departmentId: "1",
    departmentName: "Obstetrics & Gynecology",
    name: "Gynecologic Oncology",
    nameAr: "أورام النساء",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "5",
    departmentId: "1",
    departmentName: "Obstetrics & Gynecology",
    name: "Physiotherapy",
    nameAr: "العلاج الطبيعي",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "6",
    departmentId: "1",
    departmentName: "Obstetrics & Gynecology",
    name: "Parent and Childbirth Education",
    nameAr: "تثقيف الوالدين والولادة",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },

  // General & Laparoscopic Surgery (Department ID: 6)
  {
    id: "7",
    departmentId: "6",
    departmentName: "General & Laparoscopic Surgery",
    name: "Obesity Bariatric Surgery",
    nameAr: "جراحة السمنة",
    createdAt: "2024-01-18T13:30:00Z",
    updatedAt: "2024-01-18T13:30:00Z",
  },
  {
    id: "8",
    departmentId: "6",
    departmentName: "General & Laparoscopic Surgery",
    name: "Breast Surgical Oncology",
    nameAr: "أورام الثدي الجراحية",
    createdAt: "2024-01-18T13:30:00Z",
    updatedAt: "2024-01-18T13:30:00Z",
  },
  {
    id: "9",
    departmentId: "6",
    departmentName: "General & Laparoscopic Surgery",
    name: "Abdominal Wall Reconstruction",
    nameAr: "إعادة بناء جدار البطن",
    createdAt: "2024-01-18T13:30:00Z",
    updatedAt: "2024-01-18T13:30:00Z",
  },
  {
    id: "10",
    departmentId: "6",
    departmentName: "General & Laparoscopic Surgery",
    name: "Clinical Nutrition & Dietetics",
    nameAr: "التغذية السريرية",
    createdAt: "2024-01-18T13:30:00Z",
    updatedAt: "2024-01-18T13:30:00Z",
  },

  // Internal Medicine (Department ID: 5)
  {
    id: "11",
    departmentId: "5",
    departmentName: "Internal Medicine",
    name: "Cardiology",
    nameAr: "أمراض القلب",
    createdAt: "2024-01-20T15:30:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
  },
  {
    id: "12",
    departmentId: "5",
    departmentName: "Internal Medicine",
    name: "Nephrology",
    nameAr: "أمراض الكلى",
    createdAt: "2024-01-20T15:30:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
  },
  {
    id: "13",
    departmentId: "5",
    departmentName: "Internal Medicine",
    name: "Gastroenterology",
    nameAr: "أمراض الجهاز الهضمي",
    createdAt: "2024-01-20T15:30:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
  },
  {
    id: "14",
    departmentId: "5",
    departmentName: "Internal Medicine",
    name: "Endocrinology & Metabolism",
    nameAr: "الغدد الصماء والتمثيل الغذائي",
    createdAt: "2024-01-20T15:30:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
  },
  {
    id: "15",
    departmentId: "5",
    departmentName: "Internal Medicine",
    name: "Rheumatology",
    nameAr: "أمراض الروماتيزم",
    createdAt: "2024-01-20T15:30:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
  },
  {
    id: "16",
    departmentId: "5",
    departmentName: "Internal Medicine",
    name: "Clinical Nutrition & Dietetics",
    nameAr: "التغذية السريرية",
    createdAt: "2024-01-20T15:30:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
  },
];

// Helper function to get subspecialities by department ID
export const getSubspecialitiesByDepartmentId = (departmentId: string): AdminSubspeciality[] => {
  return adminSubspecialities.filter(sub => sub.departmentId === departmentId);
};

// Helper function to get subspecialities by department name
export const getSubspecialitiesByDepartmentName = (departmentName: string): AdminSubspeciality[] => {
  return adminSubspecialities.filter(sub => sub.departmentName === departmentName);
};