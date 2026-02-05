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

// ✅ Max harvest rule: must be BELOW 500
const MAX_HARVEST = 499;

// ✅ localStorage key for system notice (survives reload)
const BARN_NOTICE_KEY = 'barn_occupancy_notice';

type BarnAvailabilityResponse = {
  barn_id: number;
  barn_name: string;
  available: boolean;
};

const HarvestModal: React.FC<HarvestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  harvest,
  mode,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    batch_id: '',
    date: today,
    harvest: '',
    number_of_boxes: '',
  });

  const [batches, setBatches] = useState<
    { id: number; batch_id: string; batch_name: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = localStorage.getItem('user_id');

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

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

  useEffect(() => {
    if (harvest && mode === 'edit') {
      setFormData({
        batch_id: harvest.batch_id,
        date: today,
        harvest: harvest.harvest.toString(),
        number_of_boxes: harvest.number_of_boxes.toString(),
      });
    } else {
      setFormData({
        batch_id: '',
        date: today,
        harvest: '',
        number_of_boxes: '',
      });
    }
    setError(null);
  }, [harvest, mode, isOpen, today]);

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return;
    setSnackbar((s) => ({ ...s, open: false }));
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // ✅ Call backend: “is barn now available (all batches harvested)?”
  const checkBarnAvailabilityAndNotify = async (batchId: string) => {
    if (!batchId) return;

    // You will implement this endpoint in backend:
    // GET /api/barn/availability/by-batch/:batchId
    const res = await fetch(`${apiUrl}/api/barn/availability/by-batch/${batchId}`);
    if (!res.ok) return; // don’t block save if this fails

    const data = (await res.json()) as BarnAvailabilityResponse;

    if (data?.available) {
      const message = ` ${data.barn_name} is now available for occupancy.`;

      // Save to localStorage so it still shows after your window.location.reload()
      localStorage.setItem(
        BARN_NOTICE_KEY,
        JSON.stringify({
          message,
          barn_id: data.barn_id,
          barn_name: data.barn_name,
          available: true,
          at: new Date().toISOString(),
        })
      );

      // Also dispatch an event (updates immediately if no reload yet)
      window.dispatchEvent(
        new CustomEvent('barn-availability', {
          detail: {
            message,
            ...data,
            at: new Date().toISOString(),
          },
        })
      );

      showSnackbar(message, 'success');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // ✅ guard: prevent setting a past date even if user types it
    if (name === 'date' && value < today) {
      setError('Date cannot be in the past.');
      return;
    }

    // ✅ guard: harvest must be BELOW 500
    if (name === 'harvest') {
      const n = Number(value);
      if (value !== '' && (!Number.isFinite(n) || n < 0)) {
        setError('Harvest must be a valid number (0 or higher).');
        return;
      }
      if (value !== '' && n >= 500) {
        setError('Harvest must be below 500.');
        showSnackbar('Harvest must be below 500.', 'error');
        return;
      }
    }

    setError(null);
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.date < today) {
      setError('Date cannot be in the past.');
      showSnackbar('Date cannot be in the past.', 'error');
      return;
    }

    const harvestNum = parseInt(formData.harvest, 10);
    if (!Number.isFinite(harvestNum) || harvestNum < 0) {
      setError('Harvest must be a valid number (0 or higher).');
      showSnackbar('Harvest must be a valid number (0 or higher).', 'error');
      return;
    }
    if (harvestNum >= 500) {
      setError('Harvest must be below 500.');
      showSnackbar('Harvest must be below 500.', 'error');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const body = {
        user_id: userId,
        batch_id: formData.batch_id,
        date: formData.date,
        no_harvest: harvestNum,
        no_boxes: parseInt(formData.number_of_boxes, 10),
      };

      let res: Response | null = null;

      if (mode === 'add') {
        res = await fetch(`${apiUrl}/api/harvest/add_harvest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else if (harvest) {
        res = await fetch(`${apiUrl}/api/harvest/${harvest.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      // ✅ IMPORTANT: check API response, don’t assume success
      if (!res || !res.ok) {
        const msg = 'Failed to save harvest. Please try again.';
        setError(msg);
        showSnackbar(msg, 'error');
        return;
      }

      onSave?.({
        ...formData,
        harvest: harvestNum,
        number_of_boxes: parseInt(formData.number_of_boxes, 10),
      });

      showSnackbar(
        mode === 'add'
          ? 'Harvest record added successfully!'
          : 'Harvest record updated successfully!',
        'success'
      );

      // ✅ NEW: check barn availability after successful save
      await checkBarnAvailabilityAndNotify(formData.batch_id);

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
      showSnackbar(err.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={today}
              min={today}
              max={today}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent opacity-70"
              required
            />
          </div>

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
              max={MAX_HARVEST}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be below 500 (max {MAX_HARVEST}).
            </p>
          </div>

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
              {loading ? 'Saving...' : mode === 'add' ? 'Add Harvest' : 'Update Harvest'}
            </button>
          </div>
        </form>
      </Modal>

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
