import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { Batch } from "../types";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (batch: Partial<Batch>) => void;
  batch?: Batch | null;
  mode: "add" | "edit";
}

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8081";

const BatchModal: React.FC<BatchModalProps> = ({
  isOpen,
  onClose,
  onSave,
  batch,
  mode,
}) => {
  const [formData, setFormData] = useState({
    id: "",
    barn_id: "",
    batch_name: "",
    breed: "",
    no_chicken: "",
    date_started: "",
    date_completed: "",
    status: "",
  });

  const [barns, setBarns] = useState<{ id: number; barn_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch barns when modal opens
  useEffect(() => {
    const fetchBarns = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/barn`);
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Invalid barn data", data);
          throw new Error("Invalid barn data format");
        }

        setBarns(data);
      } catch (err) {
        console.error("Failed to fetch barns:", err);
        setError("Could not load barn list");
      }
    };
    if (isOpen) fetchBarns();
  }, [isOpen]);

useEffect(() => {
  if (batch && mode === "edit") {
    setFormData({
      id: batch.id.toString(),
      barn_id: batch.barn_id.toString(),
      batch_name: batch.batch_name,
      breed: batch.breed,
      no_chicken: batch.no_chicken?.toString() ?? "",
      date_started: batch.date_started,
      date_completed: batch.date_completed || "",
      status: batch.date_completed ? "Completed" : "Active", // auto-set based on date_completed
    });
  } else {
    setFormData({
      id: "",
      barn_id: "",
      batch_name: "",
      breed: "",
      no_chicken: "",
      date_started: "",
      date_completed: "",
      status: "Active", // default for new batch
    });
  }
}, [batch, mode, isOpen]);






const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  setFormData((prev) => {
    let updated = { ...prev, [name]: value };

    // ✅ Auto-status logic: Active if no date_completed, Completed if date_completed is set
    if (name === "date_completed") {
      updated.status = value ? "Completed" : "Active";
    }

    return updated;
  });
};







  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setSnackbar((s) => ({ ...s, open: false }));
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  const currentUserId = localStorage.getItem("user_id");
  if (!currentUserId) {
    setError("User not logged in");
    setLoading(false);
    return;
  }

  const noChickens = Number(formData.no_chicken);
  const barnIdNum = Number(formData.barn_id);
  const idNum = formData.id ? Number(formData.id) : undefined;

  if (
    !barnIdNum ||
    !formData.batch_name ||
    !formData.breed ||
    !formData.date_started ||
    !formData.status ||
    isNaN(noChickens) ||
    noChickens <= 0
  ) {
    setError("Please fill all required fields with valid values");
    setLoading(false);
    return;
  }

  // ✅ force everything into primitives
  const body = {
    user_id: String(currentUserId),
    id: idNum,
    barn_id: barnIdNum,
    batch_name: String(formData.batch_name),
    breed: String(formData.breed),
    no_chicken: noChickens,
    date_started: String(formData.date_started),
    date_completed: formData.date_completed
      ? String(formData.date_completed)
      : null,
    status: String(formData.status),
  };

  try {
    const url =
      mode === "add"
        ? `${apiUrl}/api/batch/add`
        : `${apiUrl}/api/batch/${idNum}`;
    const method = mode === "add" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), // ✅ now safe
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Something went wrong");
    }

    // ✅ server response should be plain JSON now
    const savedBatch = await res.json();

    onSave?.({
      id: savedBatch.id ?? idNum,
      barn_id: barnIdNum,
      batch_name: formData.batch_name,
      breed: formData.breed,
      no_chicken: noChickens,
      date_started: formData.date_started,
      date_completed: formData.date_completed || undefined,
      status: formData.status,
    });

    showSnackbar(
      mode === "add"
        ? "Batch added successfully!"
        : "Batch updated successfully!",
      "success"
    );

    // 🔄 Refresh after success
    setTimeout(() => window.location.reload(), 1000);

    onClose();
  } catch (err: any) {
    console.error("Submit error:", err);
    setError(err.message || "Something went wrong");
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
        title={mode === "add" ? "Add New Batch" : "Edit Batch"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm font-medium">{error}</div>
          )}

          {/* Barn Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Barn
            </label>
            <select
              name="barn_id"
              value={formData.barn_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Barn</option>
              {barns.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.barn_name}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch Name
            </label>
            <input
              type="text"
              name="batch_name"
              value={formData.batch_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
                disabled={formData.status === "Completed"} // disable if completed
            />
          </div>

          {/* Breed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Breed
            </label>
            <select
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Breed</option>
              <option value="Broiler">Broiler</option>
              <option value="Layer">Layer</option>
              <option value="Free Range">Free Range</option>
            </select>
          </div>

          {/* Number of Chickens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Chickens
            </label>
            <input
              type="number"
              name="no_chicken"
              value={formData.no_chicken}
              onChange={handleChange}
              min={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
                disabled={formData.status === "Completed"} // disable if completed
            />
          </div>

          {/* Dates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Started
            </label>
            <input
  type="date"
  name="date_started"
  value={formData.date_started}
  onChange={handleChange}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  max={new Date().toISOString().split("T")[0]} // today as max
  required

/>

          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Completed (Optional)
            </label>
            <input
              type="date"
              name="date_completed"
              value={formData.date_completed}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

           />
          </div>

          {/* Status
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
          <select
  name="status"
  value={formData.status}
  onChange={handleChange}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  required

>
  <option value="" disabled>
    Select Status
  </option>
  <option value="Active">Active</option>
  <option value="Completed">Completed</option>
  <option value="Terminated">Terminated</option>
</select>


          </div> */}

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
              {mode === "add" ? "Add Batch" : "Update Batch"}
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

export default BatchModal;
