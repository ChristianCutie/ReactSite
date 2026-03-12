import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("isAuth");
    if (auth === "true") {
      setIsAuth(true);
    } else {
      setIsAuth(false);
    }
  }, []);

  // Listen for storage changes (when logout happens)
  useEffect(() => {
    const handleStorageChange = () => {
      const auth = localStorage.getItem("isAuth");
      setIsAuth(auth === "true");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <>
      <AppRoutes isAuth={isAuth} setIsAuth={setIsAuth} />
    </>
  );
};

export default App;
