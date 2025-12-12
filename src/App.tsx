import React, { useState, useEffect } from "react";
import HomeWindow from "./renderer/windows/home/HomeWindow";
import StickyNoteWindow from "./renderer/windows/sticky-note/StickyNoteWindow";

import "./App.css";

/**
 * App Router Component
 * 
 * This component handles routing between different window types in the Electron app.
 * Each window type (Home, StickyNote) loads independently with hash-based routing.
 * 
 * Routes:
 * - #/home (or empty) -> HomeWindow (group management)
 * - #/sticky/:groupId -> StickyNoteWindow (individual sticky note)
 */
function App() {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Route to appropriate window component
  if (route.startsWith("#/sticky/")) {
    return <StickyNoteWindow />;
  }

  // Default to home window
  return <HomeWindow />;
}

export default App;
