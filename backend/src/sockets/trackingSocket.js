// Handles real-time ambulance location broadcasting.
// Driver emits their location -> server relays it to the caller watching that trip.

function registerTrackingSocket(io) {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Caller joins a room specific to their trip to receive updates
    socket.on("join-trip", (tripId) => {
      socket.join(`trip-${tripId}`);
    });

    // Driver sends live location updates for an active trip
    socket.on("driver-location-update", ({ tripId, lat, lng }) => {
      io.to(`trip-${tripId}`).emit("location-update", { lat, lng, timestamp: Date.now() });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

module.exports = registerTrackingSocket;