// Update src/App.tsx to include AIChat
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import AdminInvite from "./pages/AdminInvite";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import MyLearning from "./pages/MyLearning";
import CourseLearning from "./pages/CourseLearning";
import Quiz from "./pages/Quiz";
import Profile from "./pages/Profile";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import ProtectedRoute from "./components/ProtectedRoute";

import {
  ProtectedAdminRoute,
  SuperAdminRoute,
} from "@/components/admin/ProtectedAdminRoute";

import { DashboardLayout } from "@/components/layout/DashboardLayout";

import NotFound from "./pages/NotFound";
import AccessibilityWidget from "./components/AccessibilityWidget";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import GetStarted from "./pages/GetStarted";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { AIChat } from "./components/AIChat";
import { AuthProvider } from "@/contexts/AuthContext";


// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import AdminCourses from "./pages/admin/Courses";
import CourseNew from "./pages/admin/CourseNew";
import AdminCourseDetail from "./pages/admin/CourseDetail";
import CourseBuilder from "./pages/admin/CourseBuilder";
import CourseEnrollments from "./pages/admin/CourseEnrollments";
import Users from "./pages/admin/Users";
import Analytics from "./pages/admin/Analytics";
import Instructors from "./pages/admin/Instructors";
import InstructorDetail from "./pages/admin/InstructorDetail";
import AdminProfile from "./pages/admin/AdminProfile";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/admin-invite" element={<AdminInvite />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/services" element={<Services />} />
            <Route path="/get" element={<GetStarted />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route
              path="/payment/success"
              element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/failed"
              element={
                <ProtectedRoute>
                  <PaymentFailed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-learning"
              element={
                <ProtectedRoute>
                  <MyLearning />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learn/:courseId"
              element={
                <ProtectedRoute>
                  <CourseLearning />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learn/:courseId/quiz/:quizId"
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />


            {/* Admin routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedAdminRoute>
                  <DashboardLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="courses/new" element={<CourseNew />} />
              <Route path="courses/:id" element={<AdminCourseDetail />} />
              <Route path="courses/:id/builder" element={<CourseBuilder />} />
              <Route
                path="courses/:id/enrollments"
                element={<CourseEnrollments />}
              />
              <Route path="users" element={<Users />} />
              <Route path="analytics" element={<Analytics />} />
              <Route
                path="instructors"
                element={
                  <SuperAdminRoute>
                    <Instructors />
                  </SuperAdminRoute>
                }
              />
              <Route
                path="instructors/:id"
                element={
                  <SuperAdminRoute>
                    <InstructorDetail />
                  </SuperAdminRoute>
                }
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* <AIChat /> */}
        </BrowserRouter>
        <AccessibilityWidget />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
