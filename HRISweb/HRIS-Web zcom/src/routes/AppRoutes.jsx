import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login.jsx";
import Dashboard from "../pages/dashboard/dashboard.jsx";
import Leave from "../pages/leave/Leave.jsx";
import Attendance from "../pages/attendance/Attendance.jsx";
import Loan from "../pages/loan/Loan.jsx";
import Payslip from "../pages/payslip/Payslip.jsx";
import Profile from "../pages/profile/Profile.jsx";
import { useEffect } from "react";

const AppRoutes = ({ isAuth, setIsAuth }) => {
  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuth");
    if (storedAuth === "true") {
      setIsAuth(true);
    }
  }, [setIsAuth]);

  return (
    <Routes>
      {/* Login */}
      <Route
        path="/snl-hr-app"
        element={
          isAuth ? (
            <Navigate to="/snl-hr-app/dashboard" replace />
          ) : (
            <Login setIsAuth={setIsAuth} />
          )
        }
      />

      {/* Protected routes */}
      <Route
        path="/snl-hr-app/dashboard"
        element={
          isAuth ? (
            <Dashboard setIsAuth={setIsAuth} />
          ) : (
            <Navigate to="/snl-hr-app" replace />
          )
        }
      />

      <Route
        path="/snl-hr-app/attendance"
        element={
          isAuth ? (
            <Attendance setIsAuth={setIsAuth} />
          ) : (
            <Navigate to="/snl-hr-app" replace />
          )
        }
      />

      <Route
        path="/snl-hr-app/leave"
        element={
          isAuth ? <Leave setIsAuth={setIsAuth} /> : <Navigate to="/snl-hr-app" replace />
        }
      />

      <Route
        path="/snl-hr-app/loan"
        element={
          isAuth ? <Loan setIsAuth={setIsAuth} /> : <Navigate to="/snl-hr-app" replace />
        }
      />
      <Route
        path="/snl-hr-app/payslip"
        element={
          isAuth ? (
            <Payslip setIsAuth={setIsAuth} />
          ) : (
            <Navigate to="/snl-hr-app" replace />
          )
        }
      />

      <Route
        path="/snl-hr-app/profile"
        element={
          isAuth ? (
            <Profile isAuth={isAuth} setIsAuth={setIsAuth} />
          ) : (
            <Navigate to="/snl-hr-app" replace />
          )
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/snl-hr-app" replace />} />
    </Routes>
  );
};

export default AppRoutes;
