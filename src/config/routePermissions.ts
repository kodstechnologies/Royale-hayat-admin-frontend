import { matchPath } from "react-router-dom";
import { PERMISSIONS } from "@/constants/permissions";
import {
  getStoredAdminUser,
  hasAnyPermission,
} from "@/utils/PermissionGate";
import {
  isCallCenterAllowedPath,
  isCallCenterRole,
  normalizeUserRole,
} from "@/lib/userRole";

const isCallCenterUser = (): boolean => {
  const user = getStoredAdminUser();
  return isCallCenterRole(String(user?.role || ""));
};

export type RoutePermissionRule = {
  /** React Router path pattern (supports :params) */
  pattern: string;
  /** User needs at least one of these permissions. Empty = any authenticated user. */
  permissions?: string[];
  excludeRoles?: string[];
};

/**
 * Most specific patterns first so dynamic segments do not swallow nested routes.
 */
export const ROUTE_PERMISSION_RULES: RoutePermissionRule[] = [
  // Appointments
  {
    pattern: "/appointment/view/:id",
    permissions: [PERMISSIONS.APPOINTMENT_REQUEST_VIEW],
  },
  {
    pattern: "/appointment/bookings/view/:id",
    permissions: [PERMISSIONS.APPOINTMENT_BOOKING_VIEW],
  },
  {
    pattern: "/appointment/bookings",
    permissions: [PERMISSIONS.APPOINTMENT_BOOKING_VIEW],
  },
  {
    pattern: "/appointment",
    permissions: [PERMISSIONS.APPOINTMENT_REQUEST_VIEW],
  },

  // Medical record requests
  {
    pattern: "/medical-record/view/:id",
    permissions: [PERMISSIONS.MRR_VIEW],
  },
  {
    pattern: "/medical-records-requests",
    permissions: [PERMISSIONS.MRR_VIEW],
  },

  // Enquiries
  {
    pattern: "/enquiries/view/:id",
    permissions: [PERMISSIONS.ENQUIRY_VIEW],
  },
  { pattern: "/enquiries", permissions: [PERMISSIONS.ENQUIRY_VIEW] },
  { pattern: "/al-safwa-enrollments", permissions: [PERMISSIONS.AL_SAFWA_VIEW] },

  // Jobs
  {
    pattern: "/jobs/view-applications/:id",
    permissions: [
      PERMISSIONS.JOB_APPLICATION_VIEW,
      PERMISSIONS.JOB_VIEW,
    ],
  },
  { pattern: "/jobs/apply/:id", permissions: [PERMISSIONS.JOB_VIEW] },
  { pattern: "/jobs/create", permissions: [PERMISSIONS.JOB_CREATE] },
  { pattern: "/jobs/edit/:id", permissions: [PERMISSIONS.JOB_UPDATE] },
  { pattern: "/jobs/view/:id", permissions: [PERMISSIONS.JOB_VIEW] },
  { pattern: "/job-posts", permissions: [PERMISSIONS.JOB_VIEW] },

  // Feedback
  {
    pattern: "/add-feedback",
    permissions: [PERMISSIONS.FEEDBACK_ADD, PERMISSIONS.FEEDBACK_VIEW],
  },
  { pattern: "/feedback", permissions: [PERMISSIONS.FEEDBACK_VIEW] },

  // Doctors
  { pattern: "/doctors/create", permissions: [PERMISSIONS.DOCTOR_CREATE] },
  { pattern: "/doctors/edit/:id", permissions: [PERMISSIONS.DOCTOR_UPDATE] },
  { pattern: "/doctors/view/:id", permissions: [PERMISSIONS.DOCTOR_VIEW] },
  { pattern: "/featured-doctors", permissions: [PERMISSIONS.DOCTOR_VIEW] },
  { pattern: "/doctors/:id", permissions: [PERMISSIONS.DOCTOR_VIEW] },
  { pattern: "/doctors", permissions: [PERMISSIONS.DOCTOR_VIEW] },

  // Categories
  { pattern: "/categories", permissions: [PERMISSIONS.CATAGORY_VIEW] },

  // Subspecialities
  {
    pattern: "/subspecialities/create",
    permissions: [PERMISSIONS.SUBSPECIALITY],
  },
  {
    pattern: "/subspecialities/edit/:id",
    permissions: [PERMISSIONS.SUBSPECIALITY_UPDATE],
  },
  {
    pattern: "/subspecialities/view/:id",
    permissions: [PERMISSIONS.SUBSPECIALITY_VIEW],
  },
  {
    pattern: "/subspecialities",
    permissions: [PERMISSIONS.SUBSPECIALITY_VIEW],
  },

  // Departments
  {
    pattern: "/departments/create",
    permissions: [PERMISSIONS.DEPARTMENT],
  },
  {
    pattern: "/departments/edit/:id",
    permissions: [PERMISSIONS.DEPARTMENT_UPDATE],
  },
  {
    pattern: "/departments/view/:id",
    permissions: [PERMISSIONS.DEPARTMENT_VIEW],
  },
  { pattern: "/departments", permissions: [PERMISSIONS.DEPARTMENT_VIEW] },

  // Achievements
  {
    pattern: "/achievements/create",
    permissions: [PERMISSIONS.ACHIEVEMENT_CREATE],
  },
  {
    pattern: "/achievements/edit/:id",
    permissions: [PERMISSIONS.ACHIEVEMENT_UPDATE],
  },
  {
    pattern: "/achievements/view/:id",
    permissions: [PERMISSIONS.ACHIEVEMENT_VIEW],
  },
  { pattern: "/achievements", permissions: [PERMISSIONS.ACHIEVEMENT_VIEW] },

  // Leadership
  {
    pattern: "/leadership/create",
    permissions: [PERMISSIONS.LEADERSHIP_CREATE],
  },
  {
    pattern: "/leadership/edit/:id",
    permissions: [PERMISSIONS.LEADERSHIP_UPDATE],
  },
  {
    pattern: "/leadership/view/:id",
    permissions: [PERMISSIONS.LEADERSHIP_VIEW],
  },
  { pattern: "/leadership", permissions: [PERMISSIONS.LEADERSHIP_VIEW] },

  // Work culture
  {
    pattern: "/work-culture/create",
    permissions: [PERMISSIONS.WORK_CULTURE_CREATE],
  },
  {
    pattern: "/work-culture/edit/:id",
    permissions: [PERMISSIONS.WORK_CULTURE_UPDATE],
  },
  {
    pattern: "/work-culture/view/:id",
    permissions: [PERMISSIONS.WORK_CULTURE_VIEW],
  },
  { pattern: "/life-at-rhh", permissions: [PERMISSIONS.WORK_CULTURE_VIEW] },
  { pattern: "/work-culture", permissions: [PERMISSIONS.WORK_CULTURE_VIEW] },

  // CSR
  { pattern: "/csr/create", permissions: [PERMISSIONS.CSR_CREATE] },
  { pattern: "/csr/edit/:id", permissions: [PERMISSIONS.CSR_UPDATE] },
  { pattern: "/csr/view/:id", permissions: [PERMISSIONS.CSR_VIEW] },
  { pattern: "/csr", permissions: [PERMISSIONS.CSR_VIEW] },

  // Documents & user management
  { pattern: "/documents", permissions: [PERMISSIONS.DOCUMENT_VIEW] },
  {
    pattern: "/user-management/create",
    permissions: [PERMISSIONS.USER_CREATE],
  },
  {
    pattern: "/user-management/edit/:id",
    permissions: [PERMISSIONS.USER_UPDATE],
  },
  {
    pattern: "/user-management",
    permissions: [PERMISSIONS.USER_VIEW],
  },

  // Authenticated-only (no module permission required)
  { pattern: "/settings", permissions: [] },
  { pattern: "/international-patients", permissions: [] },
  { pattern: "/al-safwa-enrollments", permissions: [PERMISSIONS.AL_SAFWA_VIEW] },
  { pattern: "/services", permissions: [] },
  { pattern: "/reports", permissions: [] },
  {
    pattern: "/",
    permissions: [],
    excludeRoles: ["call_center"],
  },
];

/** First path to try after login or when access is denied (sidebar order). */
export const NAV_LANDING_ROUTES: RoutePermissionRule[] = [
  { pattern: "/appointment", permissions: [PERMISSIONS.APPOINTMENT_REQUEST_VIEW] },
  {
    pattern: "/medical-records-requests",
    permissions: [PERMISSIONS.MRR_VIEW],
  },
  { pattern: "/job-posts", permissions: [PERMISSIONS.JOB_VIEW] },
  { pattern: "/enquiries", permissions: [PERMISSIONS.ENQUIRY_VIEW] },
  { pattern: "/al-safwa-enrollments", permissions: [PERMISSIONS.AL_SAFWA_VIEW] },
  { pattern: "/feedback", permissions: [PERMISSIONS.FEEDBACK_VIEW] },
  { pattern: "/achievements", permissions: [PERMISSIONS.ACHIEVEMENT_VIEW] },
  { pattern: "/doctors", permissions: [PERMISSIONS.DOCTOR_VIEW] },
  { pattern: "/leadership", permissions: [PERMISSIONS.LEADERSHIP_VIEW] },
  { pattern: "/csr", permissions: [PERMISSIONS.CSR_VIEW] },
  { pattern: "/work-culture", permissions: [PERMISSIONS.WORK_CULTURE_VIEW] },
  { pattern: "/documents", permissions: [PERMISSIONS.DOCUMENT_VIEW] },
  { pattern: "/user-management", permissions: [PERMISSIONS.USER_VIEW] },
  { pattern: "/categories", permissions: [PERMISSIONS.CATAGORY_VIEW] },
  { pattern: "/departments", permissions: [PERMISSIONS.DEPARTMENT_VIEW] },
  {
    pattern: "/subspecialities",
    permissions: [PERMISSIONS.SUBSPECIALITY_VIEW],
  },
];

export const getMatchingRouteRule = (
  pathname: string,
): RoutePermissionRule | null => {
  for (const rule of ROUTE_PERMISSION_RULES) {
    if (matchPath({ path: rule.pattern, end: true }, pathname)) {
      return rule;
    }
  }
  return null;
};

const isRuleAllowedForCurrentUser = (rule: RoutePermissionRule): boolean => {
  const user = getStoredAdminUser();
  if (!user || user.isActive === false) return false;

  const role = normalizeUserRole(String(user.role || ""));

  if (normalizeUserRole("admin") === role) return true;

  if (
    rule.excludeRoles?.some(
      (excluded) => normalizeUserRole(excluded) === role,
    )
  ) {
    return false;
  }

  if (!rule.permissions?.length) return true;

  return hasAnyPermission(rule.permissions);
};

/** Whether the current user may open this pathname. */
export const isRouteAllowed = (pathname: string): boolean => {
  const user = getStoredAdminUser();
  if (!user || user.isActive === false) return false;

  if (normalizeUserRole(String(user.role || "")) === "admin") {
    return true;
  }

  if (isCallCenterUser() && !isCallCenterAllowedPath(pathname)) {
    return false;
  }

  const rule = getMatchingRouteRule(pathname);
  if (!rule) return true;

  return isRuleAllowedForCurrentUser(rule);
};

/**
 * Best redirect target after login or when a route is denied.
 * Skips `deniedPath` so we do not redirect to the same URL.
 */
export const getFirstAllowedRoutePath = (deniedPath?: string): string => {
  const user = getStoredAdminUser();
  const role = normalizeUserRole(String(user?.role || ""));

  if (role === "admin") return "/";

  if (isCallCenterUser()) {
    return "/appointment";
  }

  const candidates = [
    ...NAV_LANDING_ROUTES,
    { pattern: "/", permissions: [] as string[], excludeRoles: ["call_center"] },
    { pattern: "/settings", permissions: [] as string[] },
  ];

  for (const rule of candidates) {
    if (deniedPath && matchPath({ path: rule.pattern, end: true }, deniedPath)) {
      continue;
    }
    if (isRuleAllowedForCurrentUser(rule)) {
      return rule.pattern;
    }
  }

  return "/settings";
};
