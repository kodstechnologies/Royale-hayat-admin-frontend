import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Save, Globe, Bell, Shield, Clock, Mail, MessageSquare, Download, Users, BarChart3 } from "lucide-react";

const Settings = () => {
  const [settings, setSettings] = useState({
    hospitalName: "Royale Hayat Hospital",
    email: "info@royalehayat.com",
    phone: "+965 2536 0555",
    address: "Al Rai, Kuwait City, Kuwait",
    website: "https://www.royalehayat.com",
    timezone: "Asia/Kuwait",
    language: "English",
    dateFormat: "DD/MM/YYYY",
    currency: "KWD",
    bookingEnabled: true,
    intlPatientsEnabled: true,
    notificationsEnabled: true,
    smsNotifications: true,
    emailReminders: true,
    whatsappEnabled: true,
    pushNotifications: false,
    appointmentAlerts: true,
    feedbackAlerts: true,
    documentAlerts: true,
    systemAlerts: true,
    autoAssignDoctor: false,
    requireInsurance: true,
    maintenanceMode: false,
    twoFactorAuth: true,
    sessionTimeout: "30",
    maxLoginAttempts: "5",
    passwordExpiry: "90",
    ipWhitelist: "",
    smtpHost: "smtp.royalehayat.com",
    smtpPort: "587",
    senderEmail: "noreply@royalehayat.com",
    smsProvider: "Twilio",
    smsApiKey: "••••••••",
    whatsappApiKey: "••••••••",
    appointmentBuffer: "15",
    maxAdvanceBooking: "30",
    cancelPolicy: "24",
    workingHoursStart: "08:00",
    workingHoursEnd: "22:00",
    defaultExportFormat: "CSV",
    includePatientId: true,
    autoBackup: true,
    backupFrequency: "Daily",
    defaultRole: "Staff",
    requireApproval: true,
    auditLogging: true,
    dashboardRefresh: "5",
    defaultDashboardView: "Overview",
  });

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`w-10 h-6 rounded-full transition-colors ${checked ? "bg-success" : "bg-border"}`}>
      <div className={`w-4 h-4 rounded-full bg-card shadow-sm transition-transform mx-1 ${checked ? "translate-x-4" : ""}`} />
    </button>
  );

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "communication", label: "Communication", icon: MessageSquare },
    { id: "security", label: "Security", icon: Shield },
    { id: "scheduling", label: "Scheduling", icon: Clock },
    { id: "email", label: "Email / SMTP", icon: Mail },
    { id: "export", label: "Data Export", icon: Download },
    { id: "roles", label: "Roles & Access", icon: Users },
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  ];

  const InputField = ({ label, keyName, type = "text" }: { label: string; keyName: string; type?: string }) => (
    <div>
      <label className="text-xs font-sans text-muted-foreground">{label}</label>
      <input type={type} value={settings[keyName as keyof typeof settings] as string}
        onChange={e => setSettings({ ...settings, [keyName]: e.target.value })}
        className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
    </div>
  );

  const ToggleField = ({ label, desc, keyName }: { label: string; desc: string; keyName: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div><span className="text-sm font-sans font-medium text-foreground">{label}</span><p className="text-xs font-sans text-muted-foreground mt-0.5">{desc}</p></div>
      <Toggle checked={settings[keyName as keyof typeof settings] as boolean} onChange={() => setSettings({ ...settings, [keyName]: !settings[keyName as keyof typeof settings] })} />
    </div>
  );

  return (
    <AdminLayout title="Settings">
      {/* Horizontal Tabs */}
      <div className="flex gap-1 flex-wrap mb-5 border-b border-border pb-3">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-sans font-medium transition-colors
              ${activeTab === tab.id ? "bg-burgundy text-primary-foreground" : "text-muted-foreground hover:bg-section-bg"}`}>
            <tab.icon size={13} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-3xl space-y-5">
        {activeTab === "general" && (
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h3 className="font-serif font-semibold text-foreground mb-4">General Settings</h3>
            <div className="space-y-4">
              {[["Hospital Name", "hospitalName"], ["Email", "email"], ["Phone", "phone"], ["Address", "address"], ["Website", "website"]].map(([l, k]) => (
                <InputField key={k} label={l} keyName={k} />
              ))}
              <div className="grid grid-cols-2 gap-4">
                {[["Timezone", "timezone"], ["Language", "language"], ["Date Format", "dateFormat"], ["Currency", "currency"]].map(([l, k]) => (
                  <InputField key={k} label={l} keyName={k} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h3 className="font-serif font-semibold text-foreground mb-4">Notification Settings</h3>
            <div className="space-y-1">
              <ToggleField label="Email Notifications" desc="Receive email alerts for new enquiries and bookings" keyName="notificationsEnabled" />
              <ToggleField label="SMS Notifications" desc="Send SMS to patients for appointment reminders" keyName="smsNotifications" />
              <ToggleField label="Email Reminders" desc="Auto-send appointment reminders 24h before" keyName="emailReminders" />
              <ToggleField label="Push Notifications" desc="Browser push notifications for urgent alerts" keyName="pushNotifications" />
              <ToggleField label="Appointment Alerts" desc="Notify on new appointments and changes" keyName="appointmentAlerts" />
              <ToggleField label="Feedback Alerts" desc="Notify on new feedback and reviews" keyName="feedbackAlerts" />
              <ToggleField label="Document Upload Alerts" desc="Notify when patients upload documents" keyName="documentAlerts" />
              <ToggleField label="System Alerts" desc="Notify on system events and maintenance" keyName="systemAlerts" />
            </div>
          </div>
        )}

        {activeTab === "communication" && (
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h3 className="font-serif font-semibold text-foreground mb-4">Communication Settings</h3>
            <div className="space-y-4">
              <ToggleField label="WhatsApp Messaging" desc="Enable WhatsApp communication with patients" keyName="whatsappEnabled" />
              <InputField label="SMS Provider" keyName="smsProvider" />
              <InputField label="SMS API Key" keyName="smsApiKey" />
              <InputField label="WhatsApp API Key" keyName="whatsappApiKey" />
              <button className="px-4 py-2 rounded-md bg-section-bg border border-border text-sm font-sans font-medium text-foreground hover:bg-muted transition-colors">Send Test SMS</button>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h3 className="font-serif font-semibold text-foreground mb-4">Security Settings</h3>
            <div className="space-y-4">
              <ToggleField label="Two-Factor Authentication" desc="Require 2FA for all admin users" keyName="twoFactorAuth" />
              <ToggleField label="Maintenance Mode" desc="Disable public access to the website" keyName="maintenanceMode" />
              <ToggleField label="Audit Logging" desc="Log all admin actions for compliance" keyName="auditLogging" />
              <div className="grid grid-cols-3 gap-4">
                <InputField label="Session Timeout (min)" keyName="sessionTimeout" type="number" />
                <InputField label="Max Login Attempts" keyName="maxLoginAttempts" type="number" />
                <InputField label="Password Expiry (days)" keyName="passwordExpiry" type="number" />
              </div>
              <InputField label="IP Whitelist (comma-separated)" keyName="ipWhitelist" />
            </div>
          </div>
        )}

        {activeTab === "scheduling" && (
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h3 className="font-serif font-semibold text-foreground mb-4">Scheduling & Booking</h3>
            <div className="space-y-4">
              <ToggleField label="Online Booking" desc="Allow patients to book appointments online" keyName="bookingEnabled" />
              <ToggleField label="International Patients Portal" desc="Enable intake forms for international patients" keyName="intlPatientsEnabled" />
              <ToggleField label="Auto-Assign Doctor" desc="Automatically assign available doctor to new bookings" keyName="autoAssignDoctor" />
              <ToggleField label="Require Insurance Info" desc="Mandate insurance details during booking" keyName="requireInsurance" />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Buffer Between Appointments (min)" keyName="appointmentBuffer" type="number" />
                <InputField label="Max Advance Booking (days)" keyName="maxAdvanceBooking" type="number" />
                <InputField label="Cancellation Policy (hours)" keyName="cancelPolicy" type="number" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Working Hours Start" keyName="workingHoursStart" type="time" />
                <InputField label="Working Hours End" keyName="workingHoursEnd" type="time" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "email" && (
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h3 className="font-serif font-semibold text-foreground mb-4">Email / SMTP</h3>
            <div className="space-y-4">
              {[["SMTP Host", "smtpHost"], ["SMTP Port", "smtpPort"], ["Sender Email", "senderEmail"]].map(([l, k]) => (
                <InputField key={k} label={l} keyName={k} />
              ))}
              <button className="px-4 py-2 rounded-md bg-section-bg border border-border text-sm font-sans font-medium text-foreground hover:bg-muted transition-colors">Send Test Email</button>
            </div>
          </div>
        )}

        {activeTab === "export" && (
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h3 className="font-serif font-semibold text-foreground mb-4">Data Export Settings</h3>
            <div className="space-y-4">
              <InputField label="Default Export Format" keyName="defaultExportFormat" />
              <ToggleField label="Include Patient ID" desc="Include patient IDs in exported files" keyName="includePatientId" />
              <ToggleField label="Auto Backup" desc="Automatically backup data on schedule" keyName="autoBackup" />
              <InputField label="Backup Frequency" keyName="backupFrequency" />
            </div>
          </div>
        )}

        {activeTab === "roles" && (
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h3 className="font-serif font-semibold text-foreground mb-4">Roles & Access</h3>
            <div className="space-y-4">
              <InputField label="Default New User Role" keyName="defaultRole" />
              <ToggleField label="Require Admin Approval" desc="New user registrations require admin approval" keyName="requireApproval" />
              <div className="bg-section-bg rounded-lg p-4">
                <p className="text-xs font-sans font-semibold text-foreground mb-2">Role Permissions Overview</p>
                <div className="space-y-2 text-xs font-sans">
                  {[
                    { role: "Admin", perms: "Full access to all modules" },
                    { role: "Staff", perms: "View patients, appointments. Limited editing." },
                    { role: "Coordinator", perms: "Manage appointments, international patients, inbox" },
                    { role: "Content Manager", perms: "Edit website content, manage services" },
                  ].map(r => (
                    <div key={r.role} className="flex justify-between items-center py-1 border-b border-border last:border-0">
                      <span className="font-medium text-foreground">{r.role}</span>
                      <span className="text-muted-foreground">{r.perms}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h3 className="font-serif font-semibold text-foreground mb-4">Dashboard Preferences</h3>
            <div className="space-y-4">
              <InputField label="Auto-refresh Interval (minutes)" keyName="dashboardRefresh" type="number" />
              <InputField label="Default View" keyName="defaultDashboardView" />
            </div>
          </div>
        )}

        <button onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-burgundy text-primary-foreground text-sm font-sans font-medium hover:bg-burgundy-deep transition-colors">
          <Save size={16} /> {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </AdminLayout>
  );
};

export default Settings;
