import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

interface Staff {
  id?: number;
  full_name: string;
  email: string;
  address: string;
  password: string;
  role: string;
}

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (staff: Partial<Staff>) => void;
  staff?: Staff | null;
  mode: "add" | "edit";
}

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8081";

const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  staff,
  mode,
}) => {
const [formData, setFormData] = useState({
  full_name: "",
  email: "",
  address: "",
  password: "",
  role: "staff" as "staff" | "admin", // always staff
});


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Prefill form when editing
useEffect(() => {
  if (staff && mode === "edit") {
    setFormData({
      full_name: staff.full_name,
      email: staff.email,
      address: staff.address,
      password: staff.password || "",
      role: "staff", // always staff
    });
  } else {
    setFormData({
      full_name: "",
      email: "",
      address: "",
      password: "",
      role: "staff", // always staff
    });
  }
}, [staff, mode, isOpen]);





  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSnackbarClose = () => {
    setSnackbar((s) => ({ ...s, open: false }));
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  if (!formData.full_name || !formData.email || !formData.password || !formData.address) {
    const msg = "Please fill all required fields.";
    setError(msg);
    showSnackbar(msg, "error"); // show snackbar for validation
    setLoading(false);
    return;
  }

  try {
    const url = mode === "add"
      ? `${apiUrl}/api/user/register`
      : `${apiUrl}/api/user/${staff?.id}`;
    const method = mode === "add" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to save staff");
    }

    const savedStaff = await res.json();

    onSave?.({
      ...formData,
      id: savedStaff.id ?? staff?.id,
    });

    showSnackbar(
      mode === "add"
        ? "Staff added successfully!"
        : "Staff updated successfully!",
      "success"
    );

    setTimeout(() => window.location.reload(), 1000);
    onClose();
  } catch (err: any) {
    console.error("Submit error:", err);
    setError(err.message);
    showSnackbar(err.message || "Something went wrong", "error");
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={mode === "add" ? "Add New Staff" : "Edit Staff"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm font-medium">{error}</div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required={mode === "add"} // only required when adding
            />
          </div>

          

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200"
              disabled={loading}
            >
              {mode === "add" ? "Add Staff" : "Update Staff"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default StaffModal;
