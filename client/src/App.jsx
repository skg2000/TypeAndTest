import React, { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return <AppRoutes theme={theme} toggleTheme={toggleTheme} />;
}

export default App;