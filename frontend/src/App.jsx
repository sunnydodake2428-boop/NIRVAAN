import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import { ActiveTripProvider } from "./context/ActiveTripContext";
import ActiveTripBar from "./components/ActiveTripBar";

// Patient
import EmergencyContacts from "./pages/patient/EmergencyContacts";
import PatientHome from "./pages/patient/PatientHome";
import LiveTracking from "./pages/patient/LiveTracking";
import TripFeedback from "./pages/patient/TripFeedback";
import HospitalFinder from "./pages/patient/HospitalFinder";
import TripHistory from "./pages/patient/TripHistory";
import PatientProfile from "./pages/patient/Profile";
import AIAssistant from "./pages/patient/AIAssistant";
import PatientSettings from "./pages/patient/Settings";
import EditProfile from "./pages/patient/EditProfile";
import PaymentHistory from "./pages/patient/PaymentHistory";

// Driver
import VehicleDetails from "./pages/driver/VehicleDetails";
import DriverHome from "./pages/driver/DriverHome";
import DriverTrip from "./pages/driver/DriverTrip";
import DriverHistory from "./pages/driver/DriverHistory";
import Earnings from "./pages/driver/Earnings";
import DriverProfile from "./pages/driver/Profile";
import DriverAI from "./pages/driver/DriverAI";
import DriverEditProfile from "./pages/driver/EditProfile";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import HospitalManagement from "./pages/admin/HospitalManagement";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <ActiveTripProvider>
        <ActiveTripBar />
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Patient routes */}
          <Route path="/patient" element={<ProtectedRoute allowedRole="caller"><PatientHome /></ProtectedRoute>} />
          <Route path="/patient/hospitals" element={<ProtectedRoute allowedRole="caller"><HospitalFinder /></ProtectedRoute>} />
          <Route path="/patient/history" element={<ProtectedRoute allowedRole="caller"><TripHistory /></ProtectedRoute>} />
          <Route path="/patient/profile" element={<ProtectedRoute allowedRole="caller"><PatientProfile /></ProtectedRoute>} />
          <Route path="/patient/trip/:tripId" element={<ProtectedRoute allowedRole="caller"><LiveTracking /></ProtectedRoute>} />
          <Route path="/patient/payments" element={<ProtectedRoute allowedRole="caller"><PaymentHistory /></ProtectedRoute>} />
          <Route path="/patient/settings" element={<ProtectedRoute allowedRole="caller"><PatientSettings /></ProtectedRoute>} />
          <Route path="/patient/emergency-contacts" element={<ProtectedRoute allowedRole="caller"><EmergencyContacts /></ProtectedRoute>} />
          <Route path="/patient/trip/:tripId/feedback" element={<ProtectedRoute allowedRole="caller"><TripFeedback /></ProtectedRoute>} />
          <Route path="/patient/ai" element={<ProtectedRoute allowedRole="caller"><AIAssistant /></ProtectedRoute>} />
          <Route path="/patient/edit-profile" element={<ProtectedRoute allowedRole="caller"><EditProfile /></ProtectedRoute>} />

          {/* Driver routes */}
          <Route path="/driver/vehicle" element={<ProtectedRoute allowedRole="driver"><VehicleDetails /></ProtectedRoute>} />
          <Route path="/driver/edit-profile" element={<ProtectedRoute allowedRole="driver"><DriverEditProfile /></ProtectedRoute>} />
          <Route path="/driver" element={<ProtectedRoute allowedRole="driver"><DriverHome /></ProtectedRoute>} />
          <Route path="/driver/trip/:tripId" element={<ProtectedRoute allowedRole="driver"><DriverTrip /></ProtectedRoute>} />
          <Route path="/driver/history" element={<ProtectedRoute allowedRole="driver"><DriverHistory /></ProtectedRoute>} />
          <Route path="/driver/earnings" element={<ProtectedRoute allowedRole="driver"><Earnings /></ProtectedRoute>} />
          <Route path="/driver/profile" element={<ProtectedRoute allowedRole="driver"><DriverProfile /></ProtectedRoute>} />
          <Route path="/driver/ai" element={<ProtectedRoute allowedRole="driver"><DriverAI /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/hospitals" element={<ProtectedRoute allowedRole="admin"><HospitalManagement /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </ActiveTripProvider>
    </BrowserRouter>
  );
}

export default App;