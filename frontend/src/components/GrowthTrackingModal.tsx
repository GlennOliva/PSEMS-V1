import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import Modal from './Modal';
import { GrowthTracking } from '../types';

interface Batch {
  id: string;
  batch_name: string;
}

interface GrowthTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (growth: Partial<GrowthTracking>) => void;
  growth?: GrowthTracking | null;
  mode: 'add' | 'edit';
}



const GrowthTrackingModal: React.FC<GrowthTrackingModalProps> = ({ isOpen, onClose, onSave, growth, mode }) => {
  const [formData, setFormData] = useState({
    batch_id: '',
    date: '',
    age: '',
    total_weight: '',
    no_chickens: '',
    average_weight_kg: ''
  });

  const handleSnackbarClose = (
  _event?: React.SyntheticEvent | Event,
  reason?: string
) => {
  if (reason === 'clickaway') return;
  setSnackbar(prev => ({ ...prev, open: false }));
};


  const [batches, setBatches] = useState<Batch[]>([]);
    const apiUrl = import.meta.env.VITE_API_URL;

      const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });



  // Fetch batch list from API
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/batch`);
        if (!res.ok) throw new Error('Failed to fetch batches');
        const data: Batch[] = await res.json();
        setBatches(data);
      } catch (error) {
        console.error('Error fetching batches:', error);
      }
    };
    fetchBatches();
  }, []);

  // Populate form data when editing
  useEffect(() => {
    if (growth && mode === 'edit') {
      setFormData({
        batch_id: growth.batch_id,
        date: growth.date,
        age: growth.age.toString(),
        total_weight: growth.total_weight.toString(),
        no_chickens: growth.no_chickens.toString(),
        average_weight_kg: growth.average_weight_kg.toString()
      });
    } else {
      setFormData({
        batch_id: '',
        date: '',
        age: '',
        total_weight: '',
        no_chickens: '',
        average_weight_kg: ''
      });
    }

    
  }, [growth, mode, isOpen]);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setFormData(prev => {
    const newData = { ...prev, [name]: value };

    // Auto-calculate average weight
    if (name === 'total_weight' || name === 'no_chickens') {
      const totalWeight = parseFloat(name === 'total_weight' ? value : newData.total_weight);
      const numChickens = parseInt(name === 'no_chickens' ? value : newData.no_chickens);

      if (totalWeight && numChickens && numChickens > 0) {
        newData.average_weight_kg = (totalWeight / numChickens).toFixed(2);
      } else {
        newData.average_weight_kg = '';
      }
    }

    return newData;
  });
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const currentUserId = localStorage.getItem('user_id');
  if (!currentUserId) {
    setSnackbar({ open: true, message: 'User not logged in', severity: 'error' });
    return;
  }

  const payload = {
    user_id: currentUserId,
    batch_id: formData.batch_id,
    date: formData.date,
    age: formData.age ? parseInt(formData.age) : 0,
    total_weight: formData.total_weight ? parseFloat(formData.total_weight) : 0,
    no_chicken: formData.no_chickens ? parseInt(formData.no_chickens) : 0,
    average_weight: formData.average_weight_kg ? parseFloat(formData.average_weight_kg) : 0
  };

  try {
    const url =
      mode === 'add'
        ? `${apiUrl}/api/growth_tracking/add_growth`
        : `${apiUrl}/api/growth_tracking/${growth!.id}`;

    const method = mode === 'add' ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      setSnackbar({
        open: true,
        message: data.error || 'Failed to save growth record',
        severity: 'error'
      });

      // Reload after 3 seconds on error
      setTimeout(() => window.location.reload(), 3000);
      return;
    }

    // Show success Snackbar
    setSnackbar({
      open: true,
      message: mode === 'add' ? 'Growth Tracking added successfully!' : 'Growth Tracking updated successfully!',
      severity: 'success'
    });

    // Delay modal close and page reload to let Snackbar show
    setTimeout(() => {
      onSave(payload);
      onClose();
      window.location.reload(); // reload after 0.5s delay
    }, 500);

  } catch (err: any) {
    console.error(err);
    setSnackbar({
      open: true,
      message: err.message || 'Something went wrong',
      severity: 'error'
    });

    // Reload after 3 seconds on exception
    setTimeout(() => window.location.reload(), 3000);
  }
};




  return (

    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Add Growth Tracking' : 'Edit Growth Tracking'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Age, total_weight, no_of_chickens, average_weight fields same as before */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age (days)</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Weight (kg)</label>
          <input
            type="number"
            name="total_weight"
            value={formData.total_weight}
            onChange={handleChange}
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Chickens</label>
          <input
            type="number"
            name="no_chickens"
            value={formData.no_chickens}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Average Weight (kg)</label>
          <input
            type="number"
            name="average_weight_kg"
            value={formData.average_weight_kg}
            onChange={handleChange}
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            required
            min="0"
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">
            Automatically calculated from total weight ÷ number of chickens
          </p>
        </div>

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
            {mode === 'add' ? 'Add Record' : 'Update Record'}
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

export default GrowthTrackingModal;
