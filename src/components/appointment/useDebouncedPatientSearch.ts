import { useEffect, useState } from "react";

export function useDebouncedPatientSearch(patientName: string, delayMs = 300) {
  const [debouncedPatientName, setDebouncedPatientName] = useState(patientName);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedPatientName(patientName.trim()),
      delayMs,
    );
    return () => window.clearTimeout(timer);
  }, [patientName, delayMs]);

  return debouncedPatientName;
}
