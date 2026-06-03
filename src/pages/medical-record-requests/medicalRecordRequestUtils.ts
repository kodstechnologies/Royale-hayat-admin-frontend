export type MedicalRecordRequestListItem = {
  id: string;
  mrrId: string;
  patientName: string;
  patientFileNo: string;
  dateOfBirth: string;
  identificationLabel: string;
  authorizationLabel: string;
  servicePeriod: string;
  recipientName: string;
  recipientEmail: string;
  purposeLabel: string;
  requestedBy: string;
  requestDate: string;
  status: "pending" | "received";
  isViewed: boolean;
};

export type MedicalRecordRequestDetail = {
  id: string;
  mongoId: string;
  mrrId: string;
  status: "pending" | "received";
  isViewed: boolean;
  requestedDate: string;
  updatedAt?: string;
  patientFullName: string;
  patientFileNo: string;
  dateOfBirth: string;
  validIdentification: string;
  identificationLabel: string;
  civilIdNumber?: string;
  civilIdAttachment?: string;
  passportOrGovernmentIdAttachment?: string;
  specificAuthorization: string;
  authorizationLabel: string;
  specificFromDate: string;
  specificToDate: string;
  servicePeriod: string;
  specialRequest?: string;
  specificDocumentTypes: string[];
  specificDocumentsOther?: string;
  documentTypesLabel: string;
  recipientName: string;
  recipientEmailAddress: string;
  recipientContactNumber: string;
  purposeOfDisclosure: string;
  purposeLabel: string;
  otherPurpose?: string;
  requestedBy: string;
  patientNameConfirmation?: string;
  legalRepresentativeFullName?: string;
  relationshipWithPatient?: string;
  validProof?: string;
};

const formatDateValue = (
  value: unknown,
  options: Intl.DateTimeFormatOptions,
) => {
  if (!value) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", options);
};

export const formatDateOnly = (value?: string) =>
  formatDateValue(value, { year: "numeric", month: "long", day: "numeric" });

export const formatDateShort = (value?: string) =>
  formatDateValue(value, { month: "short", day: "numeric", year: "numeric" });

export const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatIdentification = (value?: string) => {
  if (value === "passportORGovtId") return "Passport / Valid Government ID";
  if (value === "civilId") return "Civil ID";
  return value?.trim() || "—";
};

export const formatAuthorization = (value?: string) => {
  if (value === "Discharge Summary") return "Discharge Summary";
  if (value === "specific documents") return "Specific Documents";
  return value?.trim() || "—";
};

export const formatPurpose = (purpose?: string, otherPurpose?: string) => {
  if (!purpose?.trim()) return "—";
  if (purpose === "Others" && otherPurpose?.trim()) {
    return `Others — ${otherPurpose.trim()}`;
  }
  return purpose;
};

export const formatServicePeriod = (from?: string, to?: string) => {
  const fromLabel = formatDateShort(from);
  const toLabel = formatDateShort(to);
  if (fromLabel === "—" && toLabel === "—") return "—";
  if (fromLabel !== "—" && fromLabel === toLabel) return fromLabel;
  return `${fromLabel} → ${toLabel}`;
};

const normalizeDocumentTypes = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    const raw = value.trim();
    if (raw.startsWith("[")) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
        return [raw];
      }
    }
    return [raw];
  }
  return [];
};

export const formatDocumentTypes = (
  authorization?: string,
  types: string[] = [],
  other?: string,
) => {
  if (authorization !== "specific documents") return "—";
  if (types.length === 0) return "—";
  const base = types.join(", ");
  if (types.includes("Others") && other?.trim()) {
    return `${base} (${other.trim()})`;
  }
  return base;
};

export const mapListItem = (row: Record<string, unknown>): MedicalRecordRequestListItem => {
  const mongoId = String(row._id ?? row.id ?? "");
  const mrrId = row.mrrId ? String(row.mrrId) : "—";
  const purpose = String(row.purposeOfDisclosure ?? "");

  return {
    id: mongoId,
    mrrId,
    patientName: String(row.patientFullName ?? "—"),
    patientFileNo: String(row.patientFileNo ?? "—"),
    dateOfBirth: formatDateShort(row.dateOfBirth as string | undefined),
    identificationLabel: formatIdentification(String(row.validIdentification ?? "")),
    authorizationLabel: formatAuthorization(String(row.specificAuthorization ?? "")),
    servicePeriod: formatServicePeriod(
      row.specificFromDate as string | undefined,
      row.specificToDate as string | undefined,
    ),
    recipientName: String(row.recipientName ?? "—"),
    recipientEmail: String(row.recipientEmailAddress ?? "—"),
    purposeLabel: formatPurpose(purpose, String(row.otherPurpose ?? "")),
    requestedBy: String(row.requestedBy ?? "—"),
    requestDate: row.createdAt
      ? String(row.createdAt).split("T")[0]
      : new Date().toISOString().split("T")[0],
    status: row.isViewed === true ? "received" : "pending",
    isViewed: row.isViewed === true,
  };
};

export const mapDetail = (
  row: Record<string, unknown>,
  fallbackId: string,
): MedicalRecordRequestDetail => {
  const mongoId = String(row._id ?? row.id ?? fallbackId);
  const mrrId = row.mrrId ? String(row.mrrId) : "—";
  const purpose = String(row.purposeOfDisclosure ?? "");
  const authorization = String(row.specificAuthorization ?? "");
  const documentTypes = normalizeDocumentTypes(row.specificDocumentTypes);

  return {
    id: mrrId,
    mongoId,
    mrrId,
    status: row.isViewed === true ? "received" : "pending",
    isViewed: row.isViewed === true,
    requestedDate: String(row.createdAt ?? new Date().toISOString()),
    updatedAt: row.updatedAt ? String(row.updatedAt) : undefined,
    patientFullName: String(row.patientFullName ?? "—"),
    patientFileNo: String(row.patientFileNo ?? "—"),
    dateOfBirth: String(row.dateOfBirth ?? ""),
    validIdentification: String(row.validIdentification ?? ""),
    identificationLabel: formatIdentification(String(row.validIdentification ?? "")),
    civilIdNumber: row.civilIdNumber
      ? String(row.civilIdNumber)
      : row.civilId
        ? String(row.civilId)
        : undefined,
    civilIdAttachment: row.civilIdAttachment
      ? String(row.civilIdAttachment)
      : undefined,
    passportOrGovernmentIdAttachment: row.passportOrGovernmentIdAttachment
      ? String(row.passportOrGovernmentIdAttachment)
      : row.passportOrGovernmentId
        ? String(row.passportOrGovernmentId)
        : undefined,
    specificAuthorization: authorization || "—",
    authorizationLabel: formatAuthorization(authorization),
    specificFromDate: String(row.specificFromDate ?? ""),
    specificToDate: String(row.specificToDate ?? ""),
    servicePeriod: formatServicePeriod(
      row.specificFromDate as string | undefined,
      row.specificToDate as string | undefined,
    ),
    specialRequest: row.specialRequest ? String(row.specialRequest) : undefined,
    specificDocumentTypes: documentTypes,
    specificDocumentsOther: row.specificDocumentsOther
      ? String(row.specificDocumentsOther)
      : undefined,
    documentTypesLabel: formatDocumentTypes(
      authorization,
      documentTypes,
      row.specificDocumentsOther ? String(row.specificDocumentsOther) : undefined,
    ),
    recipientName: String(row.recipientName ?? "—"),
    recipientEmailAddress: String(row.recipientEmailAddress ?? "—"),
    recipientContactNumber: String(row.recipientContactNumber ?? "—"),
    purposeOfDisclosure: purpose || "—",
    purposeLabel: formatPurpose(purpose, String(row.otherPurpose ?? "")),
    otherPurpose: row.otherPurpose ? String(row.otherPurpose) : undefined,
    requestedBy: String(row.requestedBy ?? "—"),
    patientNameConfirmation: row.patientNameConfirmation
      ? String(row.patientNameConfirmation)
      : undefined,
    legalRepresentativeFullName: row.legalRepresentativeFullName
      ? String(row.legalRepresentativeFullName)
      : undefined,
    relationshipWithPatient: row.relationshipWithPatient
      ? String(row.relationshipWithPatient)
      : undefined,
    validProof: row.validProof ? String(row.validProof) : undefined,
  };
};

export const matchesSearch = (item: MedicalRecordRequestListItem, query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  return [
    item.mrrId,
    item.patientName,
    item.patientFileNo,
    item.recipientName,
    item.recipientEmail,
    item.identificationLabel,
    item.authorizationLabel,
    item.purposeLabel,
    item.requestedBy,
    item.servicePeriod,
  ].some((value) => value.toLowerCase().includes(q));
};
