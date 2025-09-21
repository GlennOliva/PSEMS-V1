import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Harvest } from '../types';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface HarvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (harvest: Partial<Harvest>) => void;
  harvest?: Harvest | null;
  mode: 'add' | 'edit';
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';

const HarvestModal: React.FC<HarvestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  harvest,
  mode,
}) => {
  const [formData, setFormData] = useState({
    batch_id: '',
    date: '',
    harvest: '',
    number_of_boxes: '',
  });

  const [batches, setBatches] = useState<
    { id: number; batch_id: string; batch_name: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = localStorage.getItem('user_id');

  // ✅ Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // --- Fetch batches when modal opens
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/batch`);
        if (!res.ok) throw new Error('Failed to fetch batches');
        const data = await res.json();
        setBatches(data);
      } catch (err) {
        console.error(err);
        setError('Could not load batch list');
      }
    };
    if (isOpen) fetchBatches();
  }, [isOpen]);

  // --- Populate form when editing
  useEffect(() => {
    if (harvest && mode === 'edit') {
setFormData({
  batch_id: harvest.batch_id,
  date: harvest.date,
  harvest: harvest.harvest.toString(),
  number_of_boxes: harvest.number_of_boxes.toString(),
});
    } else {
      setFormData({
        batch_id: '',
        date: '',
        harvest: '',
        number_of_boxes: '',
      });
    }
    setError(null);
  }, [harvest, mode, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return; // don't close on clickaway
    setSnackbar((s) => ({ ...s, open: false }));
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const body = {
      user_id: userId,
      batch_id: formData.batch_id,
      date: formData.date,
      no_harvest: parseInt(formData.harvest, 10),
      no_boxes: parseInt(formData.number_of_boxes, 10),
    };

    if (mode === 'add') {
      await fetch(`${apiUrl}/api/harvest/add_harvest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else if (harvest) {
      await fetch(`${apiUrl}/api/harvest/${harvest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    onSave?.({
      ...formData,
      harvest: parseInt(formData.harvest, 10),
      number_of_boxes: parseInt(formData.number_of_boxes, 10),
    });

    showSnackbar(
      mode === 'add'
        ? 'Harvest record added successfully!'
        : 'Harvest record updated successfully!',
      'success'
    );
    onClose();
  } catch (err: any) {
    console.error(err);
    setError(err.message || 'Something went wrong');
    showSnackbar(err.message || 'Something went wrong', 'error');
  } finally {
    setLoading(false);
    // ✅ Reload after 3 seconds so user can see Snackbar
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }
};

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={mode === 'add' ? 'Add Harvest Record' : 'Edit Harvest Record'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm font-medium">{error}</div>
          )}

          {/* Dynamic Batch List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch
            </label>
            <select
              name="batch_id"
              value={formData.batch_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batch_name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Harvest number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harvest (Number of Chickens)
            </label>
            <input
              type="number"
              name="harvest"
              value={formData.harvest}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              min="0"
            />
          </div>

          {/* Boxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Boxes
            </label>
            <input
              type="number"
              name="number_of_boxes"
              value={formData.number_of_boxes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              min="0"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg
                         transition-colors duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg
                         transition-colors duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading
                ? 'Saving...'
                : mode === 'add'
                ? 'Add Harvest'
                : 'Update Harvest'}
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

export default HarvestModal;
