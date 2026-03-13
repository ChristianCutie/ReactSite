import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login.jsx";
import Dashboard from "../pages/dashboard/dashboard.jsx";
import Leave from "../pages/leave/Leave.jsx";
import Attendance from "../pages/attendance/Attendance.jsx";
import Loan from "../pages/loan/Loan.jsx";
import Payslip from "../pages/payslip/Payslip.jsx";
import Profile from "../pages/profile/Profile.jsx";
import Lesson from "../pages/lessons/Lesson.jsx";
import Modules from "../pages/lessons/components/Modules.jsx";
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
        )

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
