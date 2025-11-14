import React, { useEffect, useState } from 'react';
import {
  Home,
  Thermometer,
  Droplets,
  Wind,
  Activity,
  FileText,
  Database,
  LogOut,
  User2,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../images/image-removebg-preview.png';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [userProfile, setUserProfile] = useState<{ email: string; role: 'admin' | 'staff' } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/temperature", label: "Temperature", icon: Thermometer },
    { to: "/humidity", label: "Humidity", icon: Droplets },
    { to: "/ammonia", label: "Ammonia", icon: Wind },
    { to: "/co2", label: "CO₂", icon: Activity },
    { to: "/barn-records", label: "Barn Records", icon: Database },
    { to: "/reports", label: "Reports", icon: FileText },
    { to: "/manage_staff", label: "Staff", icon: User2 },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (item.label === "Reports" && userProfile?.role !== "admin") return false;
    if (item.label === "Staff" && userProfile?.role !== "admin") return false;
    return true;
  });

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      fetch(`${apiUrl}/api/user/${userId}`)
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Error ${res.status}: ${text}`);
          }
          return res.json();
        })
        .then(data => setUserProfile(data || null))
        .catch(err => console.error("Failed to fetch user profile:", err.message));
    } else {
      console.log("User ID not found in local storage");
    }
  }, [apiUrl]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      {/* Hamburger button for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-100 hover:bg-gray-200"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg h-screen w-64 fixed top-0 left-0 border-r border-gray-200 z-50
        transform md:translate-x-0 transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="PSEMS Logo" className="h-40 w-40 object-contain" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {filteredNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="h-5 w-5 mr-3" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 w-full border-t border-gray-200 bg-white">
          <div className="px-4 py-4 flex flex-col items-center">
            <p className="text-sm font-medium text-gray-800">Hi, {userProfile?.email}</p>
            <p className="text-xs text-gray-500">{userProfile?.role}</p>

            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-500 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
