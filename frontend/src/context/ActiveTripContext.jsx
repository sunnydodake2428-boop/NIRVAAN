import { createContext, useContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import api from "../api/client";

const ActiveTripContext = createContext();

export function ActiveTripProvider({ children }) {
  const [activeTripId, setActiveTripId] = useState(() => localStorage.getItem("activeTripId"));
  const [activeTrip, setActiveTrip] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const socketRef = useRef(null);

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

  useEffect(() => {
    if (!activeTripId) return;
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
    socketRef.current.emit("join-trip", activeTripId);
    socketRef.current.on("location-update", (loc) => setDriverLocation(loc));
    return () => socketRef.current?.disconnect();
  }, [activeTripId]);

  function startActiveTrip(tripId) {
    localStorage.setItem("activeTripId", tripId);
    setActiveTripId(tripId);
  }

  function clearActiveTrip() {
    localStorage.removeItem("activeTripId");
    setActiveTripId(null);
    setActiveTrip(null);
    setDriverLocation(null);
  }

  return (
    <ActiveTripContext.Provider value={{ activeTrip, driverLocation, startActiveTrip, clearActiveTrip }}>
      {children}
    </ActiveTripContext.Provider>
  );
}

export function useActiveTrip() {
  return useContext(ActiveTripContext);
}