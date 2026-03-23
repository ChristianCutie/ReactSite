import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import "@/assets/style/global.css";

// Lazy load all route components
const Login = lazy(() => import("@/pages/auth/Login.jsx"));
const Dashboard = lazy(() => import("@/pages/dashboard/dashboard.jsx"));
const Leave = lazy(() => import("@/pages/leave/Leave.jsx"));
const Attendance = lazy(() => import("@/pages/attendance/Attendance.jsx"));
const Loan = lazy(() => import("@/pages/loan/Loan.jsx"));
const Payslip = lazy(() => import("@/pages/payslip/Payslip.jsx"));
const Profile = lazy(() => import("@/pages/profile/Profile.jsx"));
const Lesson = lazy(() => import("@/pages/lessons/Lesson.jsx"));
const Modules = lazy(() => import("@/pages/lessons/components/Modules.jsx"));

// Loading component
const LoadingScreen = () => (
  <div className="loadingScreen">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const AppRoutes = ({ isAuth, setIsAuth }) => {
  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuth");
    if (storedAuth === "true") {
      setIsAuth(true);
    }
  }, [setIsAuth]);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Login */}
        <Route
          path="/"
          element={
            isAuth ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login setIsAuth={setIsAuth} />
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            isAuth ? (
              <Dashboard setIsAuth={setIsAuth} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/attendance"
          element={
            isAuth ? (
              <Attendance setIsAuth={setIsAuth} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/leave"
          element={
            isAuth ? <Leave setIsAuth={setIsAuth} /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/loan"
          element={
            isAuth ? <Loan setIsAuth={setIsAuth} /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/payslip"
          element={
            isAuth ? (
              <Payslip setIsAuth={setIsAuth} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/profile"
          element={
            isAuth ? (
              <Profile isAuth={isAuth} setIsAuth={setIsAuth} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/lessons"
          element={
            isAuth ? (
              <Lesson setIsAuth={setIsAuth} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/lessons/module"
          element={
            isAuth ? (
              <Modules setIsAuth={setIsAuth} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
