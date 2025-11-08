import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";

import SensorPage from "../pages/SensorPage";
import BarnRecords from "../pages/BarnRecords";
import Reports from "../pages/Reports";
import Dashboard from "../pages/Dashboard";
import Sidebar from "../components/Sidebar";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "./ProtectedRoute";
import ManageStaff from "../pages/ManageStaff";

// Layout wrapper
const MainLayout = () => (
  <div className="min-h-screen bg-gray-50 flex">
    <Sidebar />

    <main className="flex-1 ml-64 p-8">
      <Outlet /> {/* <-- This is where child routes render */}
    </main>
  </div>
);

const AppRoutes = () => (
  <Router>
    <Routes>
      {/* Auth routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes with layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/temperature"
            element={
              <SensorPage title="Temperature" unit="°C" sensorType="temperature" />
            }
          />
          <Route
            path="/humidity"
            element={<SensorPage title="Humidity" unit="%" sensorType="humidity" />}
          />
          <Route
            path="/ammonia"
            element={<SensorPage title="Ammonia" unit="ppm" sensorType="ammonia" />}
          />
          <Route
            path="/co2"
            element={
              <SensorPage title="Carbon Dioxide" unit="ppm" sensorType="co2" />
            }
          />
          <Route path="/barn-records" element={<BarnRecords />} />
          <Route path="/reports" element={<Reports />} />
             <Route path="/manage_staff" element={<ManageStaff />} />
        </Route>
      </Route>
    </Routes>
  </Router>
);

export default AppRoutes;
