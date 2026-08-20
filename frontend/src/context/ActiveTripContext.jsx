import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";

const ActiveTripContext = createContext();

export function ActiveTripProvider({ children }) {
  const [activeTripId, setActiveTripId] = useState(() => localStorage.getItem("activeTripId"));
  const [activeTrip, setActiveTrip] = useState(null);

  useEffect(() => {
    if (!activeTripId) {
      setActiveTrip(null);
      return;
    }
    let interval;
    async function poll() {
      try {
        const { data } = await api.get(`/trips/${activeTripId}`);
        if (data.status === "completed" || data.status === "cancelled") {
          clearActiveTrip();
        } else {
          setActiveTrip(data);
        }
      } catch (err) {
        clearActiveTrip();
      }
    }
    poll();
    interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [activeTripId]);

  function startActiveTrip(tripId) {
    localStorage.setItem("activeTripId", tripId);
    setActiveTripId(tripId);
  }

  function clearActiveTrip() {
    localStorage.removeItem("activeTripId");
    setActiveTripId(null);
    setActiveTrip(null);
  }

  return (
    <ActiveTripContext.Provider value={{ activeTrip, startActiveTrip, clearActiveTrip }}>
      {children}
    </ActiveTripContext.Provider>
  );
}

export function useActiveTrip() {
  return useContext(ActiveTripContext);
}