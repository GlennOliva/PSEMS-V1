import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Mortality } from '../types';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface MortalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mortality: Mortality) => void;
  mortality?: Mortality | null;
  mode: 'add' | 'edit';
}

const MortalityModal: React.FC<MortalityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mortality,
  mode,
}) => {
  const [formData, setFormData] = useState({
    barn_id: '',
    cause: '',
    notes: '',
    date: '',
    quantity: '',
  });

  const [barns, setBarns] = useState<{ id: number; barn_name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  const apiUrl = import.meta.env.VITE_API_URL;
  const currentUserId = localStorage.getItem('user_id');

  // ✅ Close Snackbar handler
  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Prefill form on edit
  useEffect(() => {
    if (mortality && mode === 'edit') {
      setFormData({
        barn_id: mortality.barn_id.toString(),
        cause: mortality.cause,
        notes: mortality.notes,
        date: mortality.date,
        quantity: mortality.quantity.toString(),
      });
    } else {
      setFormData({
        barn_id: '',
        cause: '',
        notes: '',
        date: '',
        quantity: '',
      });
    }
  }, [mortality, mode, isOpen]);

  // Fetch barns when modal opens
  useEffect(() => {
    const fetchBarns = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/barn`);
        const data = await res.json();

        if (!Array.isArray(data)) throw new Error('Invalid barn data');
        setBarns(data);
      } catch (err: any) {
        console.error(err);
        setError('Could not load barn list');
        setSnackbar({ open: true, message: 'Could not load barn list', severity: 'error' });
      }
    };
    if (isOpen) fetchBarns();
  }, [isOpen, apiUrl]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!currentUserId) {
    setSnackbar({ open: true, message: 'User not logged in', severity: 'error' });
    return;
  }

  const quantityNum = Number(formData.quantity);
  if (!formData.quantity || isNaN(quantityNum)) {
    setSnackbar({ open: true, message: 'Quantity is required', severity: 'error' });
    return;
  }

  const body = {
    user_id: mode === 'add'
      ? Number(currentUserId)
      : mortality?.user_id ?? Number(currentUserId),
    barn_id: Number(formData.barn_id),
    cause: formData.cause,
    quantity: quantityNum,
    notes: formData.notes,
    date: formData.date,
  };

  try {
    const url =
      mode === 'add'
        ? `${apiUrl}/api/mortality/add_mortality`
        : `${apiUrl}/api/mortality/${mortality?.id}`;
    const method = mode === 'add' ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Something went wrong');
    }

    const saved = await res.json();

    onSave({
      id: saved.id || mortality?.id!,
      user_id: mortality?.user_id || Number(currentUserId),
      barn_id: body.barn_id,
      cause: body.cause,
      notes: body.notes,
      date: body.date,
      quantity: body.quantity,
    });

    // ✅ Show success snackbar
    setSnackbar({
      open: true,
      message:
        mode === 'add'
          ? 'Mortality record added successfully!'
          : 'Mortality record updated successfully!',
      severity: 'success',
    });

    onClose();

    // ✅ Reload after 1.5 seconds so alert is visible
    setTimeout(() => {
      window.location.reload();
    }, 1500);

  } catch (err: any) {
    console.error(err);

    // ✅ Show error snackbar
    setSnackbar({
      open: true,
      message: err.message || 'Something went wrong',
      severity: 'error',
    });

    // ✅ Reload after 1.5 seconds
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }
};


  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={mode === 'add' ? 'Add Mortality Record' : 'Edit Mortality Record'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-600">{error}</div>}

          {/* Barn */}
          <div>
            <label className="block text-sm font-medium mb-2">Barn</label>
            <select
              name="barn_id"
              value={formData.barn_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Select Barn</option>
              {barns.map((barn) => (
                <option key={barn.id} value={barn.id}>
                  {barn.barn_name}
                </option>
              ))}
            </select>
          </div>

          {/* Cause */}
          <div>
            <label className="block text-sm font-medium mb-2">Cause</label>
            <select
              name="cause"
              value={formData.cause}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Select Cause</option>
              {[
                'Disease',
                'Heat Stress',
                'Cold Stress',
                'Injury',
                'Predator Attack',
                'Equipment Malfunction',
                'Feed Issues',
                'Water Issues',
                'Unknown',
                'Other',
              ].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min={0}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border rounded resize-none"
              placeholder="Enter detailed notes..."
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {mode === 'add' ? 'Add Record' : 'Update Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ✅ Material-UI Snackbar, top-right */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MortalityModal;
