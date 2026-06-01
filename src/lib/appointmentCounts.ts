export const notifyAppointmentsUpdated = () => {
  window.dispatchEvent(new Event("appointmentsUpdated"));
};
