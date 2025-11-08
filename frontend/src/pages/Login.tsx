import React, { useState } from 'react';
import {  Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../images/image-removebg-preview.png'
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';



const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "warning" | "info",
  });
    const apiUrl = import.meta.env.VITE_API_URL;
  const [isLoading] = useState(false);
   const navigate = useNavigate();

const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!email || !password) {
    setSnackbar({ open: true, message: "Email and password are required.", severity: "error" });
    return;
  }

  try {
    const response = await axios.post(`${apiUrl}/api/user/login`, { email, password });

    if (response.status === 200) {
      const { user, token } = response.data;

      // ✅ Check if role is admin or staff
      if (user.role !== "admin" && user.role !== "staff") {
        setSnackbar({
          open: true,
          message: "You do not have permission to login.",
          severity: "error",
        });
        return; // stop login
      }

      console.log("Login Successful:", user);

      // ✅ Save token and user_id
      localStorage.setItem("token", token);
      localStorage.setItem("user_id", user.id);

      setSnackbar({ open: true, message: "Login Successful!", severity: "success" });

      setTimeout(() => navigate("/dashboard"), 1500);
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      setSnackbar({
        open: true,
        message: error.response.data?.message || "Login failed",
        severity: "error",
      });
    } else {
      setSnackbar({ open: true, message: "An unexpected error occurred.", severity: "error" });
    }
  }
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
  {/* Logo and Title */}
<div className="text-center mb-8">
  <div className="flex items-center justify-center mb-4">
    <img
      src={logo}      // or an imported variable (see below)
      alt="PSEMS Logo"
      className="h-40 w-40 object-contain"
    />
  </div>
  <p className="text-gray-600">Sign in to your account</p>
</div>


        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Register Link
        <div className="mt-6 text-center">
  <p className="text-gray-600">
    Don't have an account?{" "}
    <Link
      to="/register"
      className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
    >
      Sign up
    </Link>
  </p>
</div> */}
        </div>
      </div>


      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>


    </div>
  );
};

export default Login;