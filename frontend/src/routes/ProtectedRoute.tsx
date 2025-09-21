import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // Example: check for token in localStorage
  const isAuthenticated = !!localStorage.getItem("token");

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
