import React, { useState } from "react";
import "./index.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/login";
import Dashboard from "./pages/admin/Dashboard";

const App = () => {
  const [isAuth, setIsAuth] = useState(false);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={isAuth ? <Navigate to="/admin/dashboard" /> : <Login setIsAuth={setIsAuth} />}
        />
        <Route
          path="/admin/dashboard"
          element={isAuth ? <Dashboard /> : <Navigate to="/" />}
        />
      </Routes>
    </>
  );
};

export default App;
