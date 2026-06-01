import { PERMISSIONS } from "@/constants/permissions";

export type PermissionOption = {
  key: string;
  label: string;
};

export type PermissionGroup = {
  id: string;
  title: string;
  permissions: PermissionOption[];
};

/** Human-readable label from permission string e.g. `doctor.create` → `Doctor Create` */
export const formatPermissionLabel = (permissionKey: string): string =>
  permissionKey
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const toOption = (key: string): PermissionOption => ({
  key,
  label: formatPermissionLabel(key),
});

const PERMISSION_GROUP_DEFS: {
  id: string;
  title: string;
  permissionKeys: (keyof typeof PERMISSIONS)[];
}[] = [
  {
    id: "doctors",
    title: "Doctors",
    permissionKeys: [
      "DOCTOR_CREATE",
      "DOCTOR_UPDATE",
      "DOCTOR_DELETE",
      "DOCTOR_VIEW",
    
    ],
  },
  {
    id: "categories",
    title: "Categories",
    permissionKeys: [
      "CATAGORY_CREATE",
      "CATAGORY_UPDATE",
      "CATAGORY_DELETE",
      "CATAGORY_VIEW",
   
    ],
  },
  {
    id: "departments",
    title: "Departments",
    permissionKeys: [
      "DEPARTMENT",
      "DEPARTMENT_UPDATE",
      "DEPARTMENT_DELETE",
      "DEPARTMENT_VIEW",
  
    ],
  },
  {
    id: "subspecialities",
    title: "Subspecialities",
    permissionKeys: [
      "SUBSPECIALITY",
      "SUBSPECIALITY_UPDATE",
      "SUBSPECIALITY_DELETE",
      "SUBSPECIALITY_VIEW",
     
    ],
  },
  {
    id: "appointment-requests",
    title: "Appointment Requests",
    permissionKeys: [
      "APPOINTMENT_REQUEST_VIEW",
      "APPOINTMENT_REQUEST_ACCEPT",
      "APPOINTMENT_REQUEST_REJECT",
    ],
  },
  {
    id: "appointment-bookings",
    title: "Appointment Bookings",
    permissionKeys: [
      "APPOINTMENT_BOOKING_VIEW",
    ],
  },
  {
    id: "users",
    title: "User Management",
    permissionKeys: [
      "USER_CREATE",
      "USER_UPDATE",
      "USER_DELETE",
      "USER_VIEW",
    ],
  },
  {
    id: "enquiries",
    title: "Enquiries",
    permissionKeys: [
      "ENQUIRY_VIEW",
      "ENQUIRY_DELETE",
    ],
  },
  {
    id: "al-safwa",
    title: "Al Safwa Enrollments",
    permissionKeys: [
      "AL_SAFWA_VIEW",
      "AL_SAFWA_CREATE",
      "AL_SAFWA_UPDATE",
      "AL_SAFWA_DELETE",
    ],
  },
  {
    id: "jobs",
    title: "Jobs",
    permissionKeys: [
      "JOB_CREATE",
      "JOB_UPDATE",
      "JOB_DELETE",
      "JOB_VIEW",
    ],
  },
  {
    id: "job-applications",
    title: "Job Applications",
    permissionKeys: [
      "JOB_APPLICATION_VIEW",
      "JOB_APPLICATION_UPDATE",
      "JOB_APPLICATION_DELETE",
    ],
  },
  {
    id: "medical-records",
    title: "Medical Record Requests",
    permissionKeys: ["MRR_VIEW", "MRR_SHARE_VIA_EMAIL", "MRR_DELETE"],
  },
  {
    id: "feedback",
    title: "Feedback & Reviews",
    permissionKeys: ["FEEDBACK_VIEW", "FEEDBACK_ADD", "FEEDBACK_UPDATE", "FEEDBACK_DELETE"],
  },
  {
    id: "achievements",
    title: "Employee Recognition",
    permissionKeys: [
      "ACHIEVEMENT_VIEW",
      "ACHIEVEMENT_CREATE",
      "ACHIEVEMENT_UPDATE",
      "ACHIEVEMENT_DELETE",
    ],
  },
  {
    id: "csr",
    title: "CSR",
    permissionKeys: [
      "CSR_VIEW",
      "CSR_CREATE",
      "CSR_UPDATE",
      "CSR_DELETE",
    ],
  },
  {
    id: "leadership",
    title: "Leadership",
    permissionKeys: [
      "LEADERSHIP_VIEW",
      "LEADERSHIP_CREATE",
      "LEADERSHIP_UPDATE",
      "LEADERSHIP_DELETE",
    ],
  },
  {
    id: "work-culture",
    title: "Work Culture",
    permissionKeys: [
      "WORK_CULTURE_VIEW",
      "WORK_CULTURE_CREATE",
      "WORK_CULTURE_UPDATE",
      "WORK_CULTURE_DELETE",
    ],
  },
  {
    id: "documents",
    title: "Documents",
    permissionKeys: [
      "DOCUMENT_VIEW",
      "DOCUMENT_CREATE",
      "DOCUMENT_UPDATE",
      "DOCUMENT_DELETE",
    ],
  },
];

/** Permissions not shown in user-management create/edit pickers */
const UNASSIGNABLE_PERMISSION_KEYS = new Set<string>([
  PERMISSIONS.APPOINTMENT_REQUEST_CREATE,
  PERMISSIONS.ENQUIRY_UPDATE,
]);

export const filterAssignablePermissions = (permissions: string[]): string[] =>
  permissions.filter((key) => !UNASSIGNABLE_PERMISSION_KEYS.has(key));

/** All permissions from constants — flat list (excludes unassignable) */
export const getAllPermissionOptions = (): PermissionOption[] =>
  Object.values(PERMISSIONS)
    .filter((key) => !UNASSIGNABLE_PERMISSION_KEYS.has(key))
    .map((key) => toOption(key));

/** Permissions grouped by module for user-management UI */
export const getGroupedPermissionOptions = (): PermissionGroup[] => {
  const allKeys = new Set(Object.values(PERMISSIONS));
  const assigned = new Set<string>();

  const groups = PERMISSION_GROUP_DEFS.map((def) => {
    const permissions = def.permissionKeys
      .map((key) => PERMISSIONS[key])
      .filter((key) => key && allKeys.has(key))
      .map((key) => {
        assigned.add(key);
        return toOption(key);
      });

    return {
      id: def.id,
      title: def.title,
      permissions,
    };
  }).filter((group) => group.permissions.length > 0);

  const unassigned = getAllPermissionOptions().filter(
    (option) => !assigned.has(option.key),
  );

  if (unassigned.length > 0) {
    groups.push({
      id: "other",
      title: "Other",
      permissions: unassigned,
    });
  }

  return groups;
};
