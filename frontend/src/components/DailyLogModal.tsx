import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { DailyLog } from '../types';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface DailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: DailyLog) => void;
  log?: DailyLog | null;
  mode: 'add' | 'edit';
}

interface Batch {
  id: string;
  batch_name: string;
}

interface Mortality {
  id: number;
  cause: string;
  date: string;
}

const DailyLogModal: React.FC<DailyLogModalProps> = ({ isOpen, onClose, onSave, log, mode }) => {
  const [formData, setFormData] = useState({
    batch_id: '',
    date: '',
    mortality_id: '',
    feed: ''
  });

  const [batches, setBatches] = useState<Batch[]>([]);
  const [mortalities, setMortalities] = useState<Mortality[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const apiUrl = import.meta.env.VITE_API_URL;
  const currentUserId = localStorage.getItem('user_id');

  useEffect(() => {
    if (isOpen) {
      // Fetch batches
      fetch(`${apiUrl}/api/batch`)
        .then(res => res.json())
        .then(data => setBatches(data))
        .catch(err => console.error('Failed to fetch batches:', err));

      // Fetch mortalities
      fetch(`${apiUrl}/api/mortality/user_mortality/${currentUserId}`)
        .then(res => res.json())
        .then(data => setMortalities(data))
        .catch(err => console.error('Failed to fetch mortalities:', err));
    }
  }, [isOpen, apiUrl, currentUserId]);

  useEffect(() => {
    if (log && mode === 'edit') {
      setFormData({
        batch_id: log.batch_id,
        date: log.date,
        mortality_id: log.mortality_id.toString(),
        feed: log.feed.toString()
      });
    } else {
      setFormData({ batch_id: '', date: '', mortality_id: '', feed: '' });
    }
  }, [log, mode, isOpen]);

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      setSnackbar({ open: true, message: 'User not logged in', severity: 'error' });
      return;
    }

    const body = {
      user_id: Number(currentUserId),
      batch_id: formData.batch_id,
      mortality_id: Number(formData.mortality_id),
      feed: parseFloat(formData.feed),
      date: formData.date
    };

    try {
      const url =
        mode === 'add'
          ? `${apiUrl}/api/daily_logs/add_daily`
          : `${apiUrl}/api/daily_logs/${log?.id}`;
      const method = mode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Something went wrong');
      }

      const saved = await res.json();
      onSave({
        id: saved.id || log?.id!,
        user_id: body.user_id,
        batch_id: body.batch_id,
        mortality_id: body.mortality_id,
        feed: body.feed,
        date: body.date
      });

      setSnackbar({
        open: true,
        message: mode === 'add' ? 'Daily log added successfully!' : 'Daily log updated successfully!',
        severity: 'success'
      });

      setTimeout(() => window.location.reload(), 1000);
      onClose();
    } catch (err: any) {
      console.error(err);
      setSnackbar({ open: true, message: err.message || 'Something went wrong', severity: 'error' });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={mode === 'add' ? 'Add Daily Log' : 'Edit Daily Log'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Batch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
            <select
              name="batch_id"
              value={formData.batch_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Batch</option>
              {batches.map(batch => (
                <option key={batch.id} value={batch.id}>
                  {batch.batch_name}
                </option>
              ))}
            </select>
          </div>

          {/* Mortality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mortality</label>
            <select
              name="mortality_id"
              value={formData.mortality_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Mortality</option>
              {mortalities.map(m => (
                <option key={m.id} value={m.id}>
                  {` ${m.cause}`}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Feed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Feed</label>
            <input
              type="number"
              name="feed"
              value={formData.feed}
              onChange={handleChange}
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              min="0"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200">
              {mode === 'add' ? 'Add Log' : 'Update Log'}
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
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DailyLogModal;
