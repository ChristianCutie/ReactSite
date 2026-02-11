import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AppRoutes from "./routes/AppRoutes";
import { useState, useEffect } from "react";
import axios from "axios";

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

  return (
    <>
      <AppRoutes isAuth={isAuth} setIsAuth={setIsAuth} />
    </>
  );
};

export default App;