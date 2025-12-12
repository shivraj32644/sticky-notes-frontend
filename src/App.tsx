import React, { useState, useEffect } from "react";
import StickyNote from "./modules/home/components/StickyNote";

import "./App.css";
import HomePageTemplate from "./modules/home/template/home.template";

function App() {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Simple manual routing for now
  // Routes:
  // #/home (or empty) -> Home
  // #/sticky/:id -> StickyNote

  let Component = HomePageTemplate;
  if (route.startsWith("#/sticky/")) {
    Component = StickyNote;
  }

  return <Component />;
}

export default App;
