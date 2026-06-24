import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "@/hooks/useScrollToTop";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Login from "./pages/login/Login";
import OtpScreen from "./pages/login/otpScreen";
import NotFound from "./pages/NotFound";
import ProtectedLayout from "./components/layout/ProtectedLayout";
import PermissionProtectedRoute from "./components/routing/PermissionProtectedRoute";
import { Loader2 } from "lucide-react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const AppointmentRequests = lazy(() => import("./pages/appointment/AppointmentRequests"));
const Bookings = lazy(() => import("./pages/appointment/Bookings"));
const ViewAppointmentRequest = lazy(() => import("./pages/appointment/ViewAppointmentRequest"));
const ViewBookings = lazy(() => import("./pages/appointment/ViewBookings"));
const MedicalRecordsRequests = lazy(
  () => import("./pages/medical-record-requests/MedicalRecordsRequests"),
);
const InternationalPatients = lazy(() => import("./pages/InternationalPatients"));
const AlSafwaEnrollments = lazy(() => import("./pages/AlSafwaEnrollments"));
const EventBookings = lazy(() => import("./pages/event-bookings/EventBookings"));
const ViewEventBooking = lazy(() => import("./pages/event-bookings/ViewEventBooking"));
const Enquiries = lazy(() => import("./pages/Enquiries"));
const UserChats = lazy(() => import("./pages/UserChats"));
const ViewUserChat = lazy(() => import("./pages/user-chats/ViewUserChat"));
const CreateJobPage = lazy(() => import("./pages/job/createJob"));
const EditJobPage = lazy(() => import("./pages/job/EditJob"));
const FeedbackReviews = lazy(() => import("./pages/feedbacks/FeedbackReviews"));
const Doctors = lazy(() => import("./pages/Doctors"));
const CreateDoctorPage = lazy(() => import("./pages/doctor/CreateDoctorPage"));
const EditDoctorPage = lazy(() => import("./pages/doctor/EditDoctorPage"));
const ViewDoctor = lazy(() => import("./pages/doctor/ViewDoctor"));
const DoctorProfile = lazy(() => import("./pages/DoctorProfile"));
const Departments = lazy(() => import("./pages/Departments"));
const CreateDepartmentPage = lazy(() => import("./pages/department/createDepartment"));
const EditDepartmentPage = lazy(() => import("./pages/department/editDepartment"));
const ViewDepartment = lazy(() => import("./pages/department/ViewDepartment"));
const Categories = lazy(() => import("./pages/Categories"));
const Subspecialities = lazy(() => import("./pages/Subspecialities"));
const CreateSubspecialityPage = lazy(() => import("./pages/subspeciality/CreateSubspeciality"));
const EditSubspecialityPage = lazy(() => import("./pages/subspeciality/EditSubspeciality"));
const Services = lazy(() => import("./pages/Services"));
const Documents = lazy(() => import("./pages/Documents"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/settings/ChangePassword"));
const ViewEnquiry = lazy(() => import("./pages/enquiries/viewEnquiry"));
const JobPosts = lazy(() => import("./pages/job/JobPosts"));
const ViewJobApplications = lazy(() => import("./pages/job/ViewJobApplications"));
const ViewJobPost = lazy(() => import("./pages/job/ViewJobPosts"));
const ApplyForJob = lazy(() => import("./pages/job/ApplyForJob"));
const ViewRequest = lazy(() => import("./pages/medical-record-requests/ViewRequest"));
const AllAchievements = lazy(() => import("./pages/achievements/AllAchievements"));
const AddAchievement = lazy(() => import("./pages/achievements/AddAchievement"));
const EditAchievements = lazy(() => import("./pages/achievements/EditAchievements"));
const ViewAchievement = lazy(() => import("./pages/achievements/ViewAchievement"));
const ViewSubspeciality = lazy(() => import("./pages/subspeciality/ViewSubspeciality"));
const AddFeedback = lazy(() => import("./pages/feedbacks/AddFeedback"));
const AllLeadership = lazy(() => import("./pages/leadership/AllLeadership"));
const ViewLeadership = lazy(() => import("./pages/leadership/ViewLeadership"));
const EditLeadership = lazy(() => import("./pages/leadership/EditLeadership"));
const AddLeadership = lazy(() => import("./pages/leadership/AddLeaderShip"));
const AllCSR = lazy(() => import("./pages/csr/AllCSR"));
const CreateCSR = lazy(() => import("./pages/csr/CreateCSR"));
const ViewCSR = lazy(() => import("./pages/csr/ViewCsr"));
const EditCSR = lazy(() => import("./pages/csr/EditCSR"));
const AllWorkCulture = lazy(() => import("./pages/workCulture/AllWorkCulture"));
const ViewWorkCulture = lazy(() => import("./pages/workCulture/ViewWorkCulture"));
const EditWorkCulture = lazy(() => import("./pages/workCulture/EditWorkCulture"));
const AddWorkCulture = lazy(() => import("./pages/workCulture/AddWorkCulture"));
const FeaturedDoctors = lazy(() => import("./pages/doctor/FeaturedDoctors"));
const LifeAtRHH = lazy(() => import("./pages/workCulture/LifeAtRHH"));
const ViewAllUsers = lazy(() => import("./pages/user-management/ViewAllUsers"));
const CreateUser = lazy(() => import("./pages/user-management/CreateUser"));
const EditUser = lazy(() => import("./pages/user-management/EditUser"));
const FileManager = lazy(() => import("./pages/file-manager/FileManager"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
    <Loader2 className="h-8 w-8 animate-spin text-burgundy" aria-hidden />
    <span className="sr-only">Loading page...</span>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
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
                  <Route path="/event-bookings" element={<EventBookings />} />
                  <Route path="/event-bookings/view/:id" element={<ViewEventBooking />} />
                  <Route path="/enquiries" element={<Enquiries />} />
                  <Route path="/enquiries/view/:id" element={<ViewEnquiry />} />
                  <Route path="/user-chats" element={<UserChats />} />
                  <Route path="/user-chats/view/:id" element={<ViewUserChat />} />
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
                  <Route path="/file-manager" element={<FileManager />} />
                  <Route path="/user-management" element={<ViewAllUsers />} />
                  <Route path="/user-management/create" element={<CreateUser />} />
                  <Route path="/user-management/edit/:id" element={<EditUser />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
