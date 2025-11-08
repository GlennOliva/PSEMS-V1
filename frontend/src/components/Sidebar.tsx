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
import logo from '../images/image-removebg-preview.png'



const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;
      const [userProfile, setUserProfile] = useState<{   email: string;  role: "admin" | "staff";} | null>(null);
 
      const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/temperature", label: "Temperature", icon: Thermometer },
    { to: "/humidity", label: "Humidity", icon: Droplets },
    { to: "/ammonia", label: "Ammonia", icon: Wind },
    { to: "/co2", label: "CO₂", icon: Activity },
    { to: "/barn-records", label: "Barn Records", icon: Database },
    { to: "/reports", label: "Reports", icon: FileText }, // Only for admin
     { to: "/manage_staff", label: "Staff", icon: User2 }, // Only for admin
  ];

  // ✅ Filter items based on role
  const filteredNavItems = navItems.filter(item => {
    if (item.label === "Reports" && userProfile?.role !== "admin") {
      return false; // hide Reports if not admin
    }
    else if (item.label === "Staff" && userProfile?.role !== "admin") {
      return false; // hide Staff if not admin
    }
    return true;
  });


  useEffect(() => {
    const userId = localStorage.getItem('user_id'); // Retrieve the admin ID from local storage

    if (userId) {
      fetch(`${apiUrl}/api/user/${userId}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text(); // This might be HTML
          throw new Error(`Error ${res.status}: ${text}`);
        }
        return res.json();
      })
      .then(data => {
        setUserProfile(data || null);
      })
      .catch(err => {
        console.error("Failed to fetch user profile:", err.message);
      });
    } else {
        console.log("User ID not found in local storage");
    }
  }, [apiUrl]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/"); // Redirect to login page
  };


  return (
 <div className="bg-white shadow-lg h-screen w-64 fixed left-0 top-0 z-30 border-r border-gray-200">
{/* Logo and Title */}
<div className="text-center mb-8">
  <div className="flex items-center justify-center mb-4">
    <img
      src={logo}      // or an imported variable (see below)
      alt="PSEMS Logo"
      className="h-40 w-40 object-contain"
    />
  </div>



      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <div className="space-y-1">
      {filteredNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'} // so only exact "/" matches
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

      

    {/* Bottom section: user info + logout */}
<div className="absolute bottom-0 left-0 w-full border-t border-white-200 bg-white-50">
  <div className="px-4 py-4 flex flex-col items-center">
    {/* 👤 User name */}
    <p className="text-sm font-medium text-gray-800">
          Hi, {userProfile?.email}
    </p>
    <p className="text-xs text-gray-500">{userProfile?.role}</p> {/* optional role/label */}

    {/* Logout Button */}
    <button
      onClick={handleLogout}
      className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg
                 px-4 py-2 text-sm font-medium text-red-600
                 hover:text-white hover:bg-red-500
                 transition-colors duration-200"
    >
      <LogOut className="h-5 w-5" />
      Logout
    </button>
  </div>
      </div>
    </div>
  );
};

export default Sidebar;


