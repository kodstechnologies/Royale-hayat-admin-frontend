import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Login from "./pages/login/Login";
import Dashboard from "./pages/Dashboard";
import AppointmentRequests from "./pages/appointment/AppointmentRequests";
import Bookings from "./pages/appointment/Bookings";
import ViewAppointmentRequest from "./pages/appointment/ViewAppointmentRequest";
import ViewBookings from "./pages/appointment/ViewBookings";
import MedicalRecordsRequests from "./pages/medical-record-requests/MedicalRecordsRequests";
import InternationalPatients from "./pages/InternationalPatients";
import AlSafwaEnrollments from "./pages/AlSafwaEnrollments";
import Enquiries from "./pages/Enquiries";

import JobApplications from "./pages/job/JobPosts";
import CreateJobPage from "./pages/job/createJob";
import EditJobPage from "./pages/job/EditJob";
import FeedbackReviews from "./pages/feedbacks/FeedbackReviews";
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
import Settings from "./pages/settings/ChangePassword";
import NotFound from "./pages/NotFound";
import OtpScreen from "./pages/login/otpScreen";
import ViewEnquiry from "./pages/enquiries/viewEnquiry";
import JobPosts from "./pages/job/JobPosts";
import ViewJobApplications from "./pages/job/ViewJobApplications";
import ViewJobPost from "./pages/job/ViewJobPosts";
import ApplyForJob from "./pages/job/ApplyForJob";
import ViewRequest from "./pages/medical-record-requests/ViewRequest";
import AllAchievements from "./pages/achievements/AllAchievements";
import AddAchievement from "./pages/achievements/AddAchievement";
import EditAchievements from "./pages/achievements/EditAchievements";
import ViewAchievement from "./pages/achievements/ViewAchievement";
import ViewSubspeciality from "./pages/subspeciality/ViewSubspeciality";
import ProtectedLayout from "./components/layout/ProtectedLayout";
import PermissionProtectedRoute from "./components/routing/PermissionProtectedRoute";
import AddFeedback from "./pages/feedbacks/AddFeedback";
import AllLeadership from "./pages/leadership/AllLeadership";
import ViewLeadership from "./pages/leadership/ViewLeadership";
import EditLeadership from "./pages/leadership/EditLeadership";
import AddLeadership from "./pages/leadership/AddLeaderShip";
import AllCSR from "./pages/csr/AllCSR";
import CreateCSR from "./pages/csr/CreateCSR";
import ViewCSR from "./pages/csr/ViewCsr";
import EditCSR from "./pages/csr/EditCSR";
import AllWorkCulture from "./pages/workCulture/AllWorkCulture";
import ViewWorkCulture from "./pages/workCulture/ViewWorkCulture";
import EditWorkCulture from "./pages/workCulture/EditWorkCulture";
import AddWorkCulture from "./pages/workCulture/AddWorkCulture";
import FeaturedDoctors from "./pages/doctor/FeaturedDoctors";
import LifeAtRHH from "./pages/workCulture/LifeAtRHH";
import ViewAllUsers from "./pages/user-management/ViewAllUsers";
import CreateUser from "./pages/user-management/CreateUser";
import EditUser from "./pages/user-management/EditUser";
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

            <Route element={<ProtectedLayout />}>
              <Route element={<PermissionProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/appointment" element={<AppointmentRequests />} />
              <Route path="/appointment/view/:id" element={<ViewAppointmentRequest />} />
              <Route path="/appointment/bookings" element={<Bookings />} />
              <Route path="/appointment/bookings/view/:id" element={<ViewBookings />} />
              <Route path="/medical-records-requests" element={<MedicalRecordsRequests />} />
              <Route path="/medical-record/view/:id" element={<ViewRequest />} />

              <Route path="/international-patients" element={<InternationalPatients />} />
              <Route path="/al-safwa-enrollments" element={<AlSafwaEnrollments />} />
              <Route path="/enquiries" element={<Enquiries />} />
              <Route path="/enquiries/view/:id" element={<ViewEnquiry />} />
              <Route path="/job-posts" element={<JobPosts />} />
              <Route path="/jobs/create" element={<CreateJobPage />} />
              <Route path="/jobs/edit/:id" element={<EditJobPage />} />
              <Route path="/jobs/view/:id" element={<ViewJobPost />} />

              <Route path="/jobs/view-applications/:id" element={<ViewJobApplications />} />
              <Route path="/jobs/apply/:id" element={<ApplyForJob />} />

              <Route path="/feedback" element={<FeedbackReviews />} />
              <Route path="/add-feedback" element={<AddFeedback />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/doctors/create" element={<CreateDoctorPage />} />
              <Route path="/doctors/edit/:id" element={<EditDoctorPage />} />
              <Route path="/doctors/view/:id" element={<ViewDoctor />} />
              <Route path="/doctors/:id" element={<DoctorProfile />} />
              <Route path="/featured-doctors" element={<FeaturedDoctors />} />


              <Route path="/categories" element={<Categories />} />

              <Route path="/subspecialities" element={<Subspecialities />} />
              <Route path="/subspecialities/create" element={<CreateSubspecialityPage />} />
              <Route path="/subspecialities/edit/:id" element={<EditSubspecialityPage />} />
              <Route path="/subspecialities/view/:id" element={<ViewSubspeciality />} />
              <Route path="/departments" element={<Departments />} />

              <Route path="/achievements" element={<AllAchievements />} />
              <Route path="/achievements/create" element={<AddAchievement />} />
              <Route path="/achievements/edit/:id" element={<EditAchievements />} />
              <Route path="/achievements/view/:id" element={<ViewAchievement />} />

              <Route path="/leadership" element={<AllLeadership />} />
              <Route path="/leadership/view/:id" element={<ViewLeadership />} />
              <Route path="/leadership/edit/:id" element={<EditLeadership />} />
              <Route path="/leadership/create" element={<AddLeadership />} />


              <Route path="/work-culture" element={<AllWorkCulture />} />
              <Route path="/work-culture/view/:id" element={<ViewWorkCulture />} />
              <Route path="/work-culture/edit/:id" element={<EditWorkCulture />} />
              <Route path="/work-culture/create" element={<AddWorkCulture />} />
              <Route path="/life-at-rhh" element={<LifeAtRHH />} />



              <Route path="/csr" element={<AllCSR />} />
              <Route path="/csr/create" element={<CreateCSR />} />
              <Route path="/csr/view/:id" element={<ViewCSR />} />
              <Route path="/csr/edit/:id" element={<EditCSR />} />




              <Route path="/departments/create" element={<CreateDepartmentPage />} />
              <Route path="/departments/edit/:id" element={<EditDepartmentPage />} />
              <Route path="/departments/view/:id" element={<ViewDepartment />} />
              <Route path="/services" element={<Services />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/user-management" element={<ViewAllUsers />} />
              <Route path="/user-management/create" element={<CreateUser />} />
              <Route path="/user-management/edit/:id" element={<EditUser />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
