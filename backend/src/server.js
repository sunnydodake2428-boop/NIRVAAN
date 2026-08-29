require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const ratingRoutes = require("./routes/ratingRoutes");

const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const driverRoutes = require("./routes/driverRoutes");
const contactRoutes = require("./routes/contactRoutes");
const registerTrackingSocket = require("./sockets/trackingSocket");

const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim());


const app = express();
app.use(cors({ origin: allowedOrigins }));
app.options("*", cors({ origin: allowedOrigins }));
app.use(express.json());
app.use("/api/ratings", ratingRoutes);
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/contacts", contactRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigins },
});
registerTrackingSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Nirvaan backend running on port ${PORT}`));