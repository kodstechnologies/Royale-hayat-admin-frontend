import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Login from "./pages/login/Login";
import Dashboard from "./pages/Dashboard";
import AppointmentRequests from "./pages/AppointmentRequests";
import MedicalRecordsRequests from "./pages/MedicalRecordsRequests";
import InternationalPatients from "./pages/InternationalPatients";
import AlSafwaEnrollments from "./pages/AlSafwaEnrollments";
import ContactMessages from "./pages/ContactMessages";
import JobApplications from "./pages/job/JobApplications";
import CreateJobPage from "./pages/job/createJob";
import EditJobPage from "./pages/job/EditJob";
import FeedbackReviews from "./pages/FeedbackReviews";
import Doctors from "./pages/Doctors";
import CreateDoctorPage from "./pages/doctor/CreateDoctorPage";
import EditDoctorPage from "./pages/doctor/EditDoctorPage";
import ViewDoctor from "./pages/doctor/ViewDoctor";
import DoctorProfile from "./pages/DoctorProfile";
import Departments from "./pages/Departments";
import CreateDepartmentPage from "./pages/department/createDepartment";
import EditDepartmentPage from "./pages/department/editDepartment";
import ViewDepartment from "./pages/department/ViewDepartment";
import Categories from "./pages/Categories";
import Subspecialities from "./pages/Subspecialities";
import CreateSubspecialityPage from "./pages/subspeciality/CreateSubspeciality";
import EditSubspecialityPage from "./pages/subspeciality/EditSubspeciality";
import Services from "./pages/Services";
import Documents from "./pages/Documents";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import OtpScreen from "./pages/login/otpScreen";

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
            <Route path="/otp" element={<OtpScreen />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/appointment-requests" element={<AppointmentRequests />} />
            <Route path="/medical-records-requests" element={<MedicalRecordsRequests />} />
            <Route path="/international-patients" element={<InternationalPatients />} />
            <Route path="/al-safwa-enrollments" element={<AlSafwaEnrollments />} />
            <Route path="/enquiries" element={<ContactMessages />} />
            <Route path="/job-applications" element={<JobApplications />} />
            <Route path="/jobs/create" element={<CreateJobPage />} />
            <Route path="/jobs/edit/:id" element={<EditJobPage />} />
            <Route path="/feedback" element={<FeedbackReviews />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/create" element={<CreateDoctorPage />} />
            <Route path="/doctors/edit/:id" element={<EditDoctorPage />} />
            <Route path="/doctors/view/:id" element={<ViewDoctor />} />
            <Route path="/doctors/:id" element={<DoctorProfile />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/subspecialities" element={<Subspecialities />} />
            <Route path="/subspecialities/create" element={<CreateSubspecialityPage />} />
            <Route path="/subspecialities/edit/:id" element={<EditSubspecialityPage />} />
            <Route path="/departments" element={<Departments />} />

            {/* <Route path="/departments/create" element={<CreateDepartmentPage />} />
            <Route path="/departments/edit/:id" element={<EditDepartmentPage />} /> */}
            <Route path="/departments/view/:id" element={<ViewDepartment />} />
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
