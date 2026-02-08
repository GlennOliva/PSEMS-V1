import React, { useState, useEffect, useMemo } from 'react';
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

// ✅ localStorage key for system notice (survives reload)
const BARN_NOTICE_KEY = 'barn_occupancy_notice';

type BarnAvailabilityResponse = {
  barn_id: number;
  barn_name: string;
  available: boolean;
};

type HarvestLimitResponse = {
  batch_id: number;
  batch_name: string;
  barn_id: number;
  baseChickens: number;
  mortalityTotal: number;
  harvestedTotal: number;
  available: number;
  startDate: string;
  endDate: string;
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

  const [batches, setBatches] = useState<{ id: number; batch_name: string }[]>([]);
  const [limit, setLimit] = useState<HarvestLimitResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = localStorage.getItem('user_id');

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const maxAllowed = useMemo(() => {
    // if no batch selected, 0; if limit not loaded yet, 0
    return Math.max(0, Number(limit?.available ?? 0));
  }, [limit]);

  // ✅ Fetch batches on open
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/batch`);
        if (!res.ok) throw new Error('Failed to fetch batches');
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Invalid batch response');
        setBatches(
          data.map((b: any) => ({
            id: Number(b.id),
            batch_name: String(b.batch_name ?? ''),
          }))
        );
      } catch (err) {
        console.error(err);
        setError('Could not load batch list');
      }
    };

    if (isOpen) fetchBatches();
  }, [isOpen]);

  // ✅ Populate form when editing / reset when adding
  useEffect(() => {
    if (!isOpen) return;

    if (harvest && mode === 'edit') {
      setFormData({
        batch_id: String(harvest.batch_id),
        date: today, // disabled anyway
        harvest: String(harvest.harvest ?? ''),
        number_of_boxes: String(harvest.number_of_boxes ?? ''),
      });
    } else {
      setFormData({
        batch_id: '',
        date: today,
        harvest: '',
        number_of_boxes: '',
      });
    }

    setLimit(null);
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

    const res = await fetch(`${apiUrl}/api/barn/availability/by-batch/${batchId}`);
    if (!res.ok) return;

    const data = (await res.json()) as BarnAvailabilityResponse;

    if (data?.available) {
      const message = ` ${data.barn_name} is now available for occupancy.`;

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

  // ✅ Fetch dynamic harvest limit when batch changes
  useEffect(() => {
    if (!isOpen) return;
    if (!formData.batch_id) {
      setLimit(null);
      return;
    }

    const fetchLimit = async () => {
      try {
        // If edit mode, exclude current harvest record so maxAllowed is correct
        const exclude = harvest?.id ? `&excludeHarvestId=${harvest.id}` : '';
        const res = await fetch(
          `${apiUrl}/api/batch/${formData.batch_id}/harvest-limit?date=${today}${exclude}`
        );

        if (!res.ok) {
          // fallback: no limit
          setLimit(null);
          return;
        }

        const data = (await res.json()) as HarvestLimitResponse;
        setLimit(data);

        // If user already typed something higher than max, clamp it
        const typed = Number(formData.harvest || 0);
        if (typed > Number(data.available || 0)) {
          setFormData((prev) => ({ ...prev, harvest: String(data.available ?? 0) }));
        }
      } catch (e) {
        console.error(e);
        setLimit(null);
      }
    };

    fetchLimit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, formData.batch_id, today]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // ✅ if user changes batch, reset harvest fields
    if (name === 'batch_id') {
      setFormData((prev) => ({
        ...prev,
        batch_id: value,
        harvest: '',
        number_of_boxes: prev.number_of_boxes,
      }));
      setError(null);
      return;
    }

    // ✅ guard: prevent setting a past date even if user types it
    if (name === 'date' && value < today) {
      setError('Date cannot be in the past.');
      return;
    }

    // ✅ guard: harvest cannot exceed dynamic maxAllowed
    if (name === 'harvest') {
      const n = Number(value);

      if (value !== '' && (!Number.isFinite(n) || n < 0)) {
        setError('Harvest must be a valid number (0 or higher).');
        return;
      }

      if (value !== '' && n > maxAllowed) {
        const msg = `Harvest cannot exceed ${maxAllowed}.`;
        setError(msg);
        showSnackbar(msg, 'error');
        return;
      }
    }

    setError(null);
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.batch_id) {
      setError('Please select a batch.');
      showSnackbar('Please select a batch.', 'error');
      return;
    }

    const harvestNum = parseInt(formData.harvest, 10);
    if (!Number.isFinite(harvestNum) || harvestNum < 0) {
      setError('Harvest must be a valid number (0 or higher).');
      showSnackbar('Harvest must be a valid number (0 or higher).', 'error');
      return;
    }

    // ✅ enforce dynamic max at submit too
    if (harvestNum > maxAllowed) {
      const msg = `Harvest cannot exceed ${maxAllowed}.`;
      setError(msg);
      showSnackbar(msg, 'error');
      return;
    }

    const boxesNum = parseInt(formData.number_of_boxes, 10);
    if (!Number.isFinite(boxesNum) || boxesNum < 0) {
      setError('Number of boxes must be 0 or higher.');
      showSnackbar('Number of boxes must be 0 or higher.', 'error');
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
        no_boxes: boxesNum,
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

      if (!res || !res.ok) {
        const errData = res ? await res.json().catch(() => ({})) : {};
        const msg =
          errData?.error ||
          errData?.message ||
          'Failed to save harvest. Please try again.';
        setError(msg);
        showSnackbar(msg, 'error');
        return;
      }

      onSave?.({
        ...formData,
        harvest: harvestNum,
        number_of_boxes: boxesNum,
      });

      showSnackbar(
        mode === 'add'
          ? 'Harvest record added successfully!'
          : 'Harvest record updated successfully!',
        'success'
      );

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
                <option key={b.id} value={String(b.id)}>
                  {b.batch_name}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Breakdown box */}
          {formData.batch_id && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
              {limit ? (
                <>
                  <div className="font-medium text-gray-800">
                    Max harvest allowed: <span className="font-bold">{limit.available}</span>
                  </div>
                  <div className="text-gray-600 mt-1">
                    {limit.baseChickens} (Batch) − {limit.mortalityTotal} (Mortality) − {limit.harvestedTotal} (Already Harvested)
                    = <span className="font-semibold">{limit.available}</span>
                  </div>
                </>
              ) : (
                <div className="text-gray-600">
                  Loading harvest limit… (If this stays, add the backend endpoint
                  <code className="ml-1">/api/batch/:id/harvest-limit</code>)
                </div>
              )}
            </div>
          )}

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
              max={maxAllowed}
              disabled={!formData.batch_id || !limit} // disable until limit is ready
            />
            <p className="text-xs text-gray-500 mt-1">
              Max allowed: {formData.batch_id ? maxAllowed : 0}
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
              disabled={loading || (!limit && !!formData.batch_id)}
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
