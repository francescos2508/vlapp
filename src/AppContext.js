import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [activeApp, setActiveApp] = useState(null);

  return (
    <AppContext.Provider value={{ user, setUser, activeApp, setActiveApp }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}