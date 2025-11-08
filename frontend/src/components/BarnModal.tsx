import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Barn } from '../types';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface BarnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (barn: Partial<Barn>) => void;
  barn?: Barn | null;
  mode: 'add' | 'edit';
}

const BarnModal: React.FC<BarnModalProps> = ({
  isOpen,
  onClose,
  onSave,
  barn,
  mode,
}) => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const [formData, setFormData] = useState({
    barn_id: '',
    barn_name: '',
    description: '',
    date: '',
  });

  useEffect(() => {
    if (barn && mode === 'edit') {
      setFormData({
        barn_id: barn.id,
        barn_name: barn.barn_name,
        description: barn.description,
        date: barn.date,
      });
    } else {
      setFormData({
        barn_id: '',
        barn_name: '',
        description: '',
        date: '',
      });
    }
  }, [barn, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentUserId = localStorage.getItem('user_id');
    if (!currentUserId) {
      setSnackbar({
        open: true,
        message: 'User not logged in',
        severity: 'error',
      });
      setTimeout(() => window.location.reload(), 1500);
      return;
    }

    const payload = {
      user_id: currentUserId,
      barn_name: formData.barn_name,
      description: formData.description,
      date: formData.date,
    };

    try {
      let res: Response;

      if (mode === 'add') {
     
        res = await fetch(`${apiUrl}/api/barn/add_barn`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
      
        res = await fetch(`${apiUrl}/api/barn/${formData.barn_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error(`${mode === 'add' ? 'Add' : 'Update'} failed`);

      setSnackbar({
        open: true,
        message: mode === 'add' ? 'Barn added successfully!' : 'Barn updated successfully!',
        severity: 'success',
      });

      setTimeout(() => window.location.reload(), 1500);
      onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: `Error ${mode === 'add' ? 'adding' : 'updating'} barn`,
        severity: 'error',
      });
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={mode === 'add' ? 'Add Barn' : 'Edit Barn'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Barn Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Barn Name
            </label>
            <input
              type="text"
              name="barn_name"
              value={formData.barn_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Barn Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Barn Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe the barn..."
              required
            />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200"
            >
              {mode === 'add' ? 'Add Barn' : 'Update Barn'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ✅ Snackbar Component */}
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

export default BarnModal;
