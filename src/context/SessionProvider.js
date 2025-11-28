import { createContext, useContext, useEffect, useState } from "react";
import {
    loadSessionsFromStorage,
    saveSessionsToStorage,
} from "../storage/sessionStorage";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    (async () => {
      const stored = await loadSessionsFromStorage();
      if (stored) setSessions(stored);
    })();
  }, []);

  useEffect(() => {
    saveSessionsToStorage(sessions);
  }, [sessions]);

  const addSession = (session) => {
    setSessions((prev) => [session, ...prev]);
  };

  const value = {
    sessions,
    addSession,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSessions() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSessions must be used within SessionProvider");
  return ctx;
}
