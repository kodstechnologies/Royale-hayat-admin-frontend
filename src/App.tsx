import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AppointmentRequests from "./pages/AppointmentRequests";
import MedicalRecordsRequests from "./pages/MedicalRecordsRequests";
import InternationalPatients from "./pages/InternationalPatients";
import AlSafwaEnrollments from "./pages/AlSafwaEnrollments";
import ContactMessages from "./pages/ContactMessages";
import JobApplications from "./pages/job/JobApplications";
import FeedbackReviews from "./pages/FeedbackReviews";
import Doctors from "./pages/Doctors";
import DoctorProfile from "./pages/DoctorProfile";
import Departments from "./pages/Departments";
import Services from "./pages/Services";
import Documents from "./pages/Documents";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/appointment-requests" element={<AppointmentRequests />} />
            <Route path="/medical-records-requests" element={<MedicalRecordsRequests />} />
            <Route path="/international-patients" element={<InternationalPatients />} />
            <Route path="/al-safwa-enrollments" element={<AlSafwaEnrollments />} />
            <Route path="/contact-messages" element={<ContactMessages />} />
            <Route path="/job-applications" element={<JobApplications />} />
            <Route path="/feedback" element={<FeedbackReviews />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:id" element={<DoctorProfile />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/services" element={<Services />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
