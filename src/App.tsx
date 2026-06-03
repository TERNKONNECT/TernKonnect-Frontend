// Update src/App.tsx to include AIChat
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import MyLearning from "./pages/MyLearning";
import CourseLearning from "./pages/CourseLearning";
import Quiz from "./pages/Quiz";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import AccessibilityWidget from "./components/AccessibilityWidget";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import GetStarted from "./pages/GetStarted";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { AIChat } from "./components/AIChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/get" element={<GetStarted />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* <AIChat /> */}
      </BrowserRouter>
      <AccessibilityWidget />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
