/** Notify sidebar and appointment pages to refresh unviewed counts. */
export const notifyAppointmentsUpdated = () => {
  window.dispatchEvent(new Event("appointmentsUpdated"));
};
