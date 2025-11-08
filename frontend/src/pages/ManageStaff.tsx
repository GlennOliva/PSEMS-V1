import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import { Staff } from '../types';
import StaffModal from '../components/StaffModal';
import DeleteModal from '../components/DeleteModal';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const ManageStaff: React.FC = () => {
  const [modalState, setModalState] = useState({
    staff: { isOpen: false, mode: 'add' as 'add' | 'edit', data: null as Staff | null },
    delete: {
      isOpen: false,
      data: null as Staff | null,
      title: '',
      message: '',
      itemName: '',
    },
  });

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const apiUrl = import.meta.env.VITE_API_URL;

  // ✅ Table columns
  const staffColumns = [
    { key: 'display_id', label: 'ID', sortable: false },
    { key: 'full_name', label: 'Full Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
  ];

  // ✅ Fetch staff data
  useEffect(() => {
    let isMounted = true;
    const loadStaff = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/user/staff`, { headers: { 'Cache-Control': 'no-cache' } });
        if (!res.ok) throw new Error('Failed to fetch staff');
        const data: Staff[] = await res.json();

        const formatted = data.map((staff, index) => ({
          ...staff,
          display_id: index + 1,
        }));

        if (isMounted) setStaffList(formatted);
      } catch (err: any) {
        console.error('Fetch error (staff):', err);
        showSnackbar(err.message || 'Failed to fetch staff', 'error');
      }
    };

    loadStaff();
    return () => {
      isMounted = false;
    };
  }, [apiUrl]);

  // ✅ Handlers
  const handleAdd = () => {
    setModalState(prev => ({
      ...prev,
      staff: { isOpen: true, mode: 'add', data: null },
    }));
  };

  const handleEdit = (item: Staff) => {
    setModalState(prev => ({
      ...prev,
      staff: { isOpen: true, mode: 'edit', data: item },
    }));
  };

  const handleDelete = (item: Staff) => {
    setModalState(prev => ({
      ...prev,
      delete: {
        isOpen: true,
        data: item,
        title: 'Delete Staff',
        message: `Are you sure you want to delete ${item.full_name}? This action cannot be undone.`,
        itemName: item.full_name,
      },
    }));
  };

  const closeModal = (modalType: string) => {
    setModalState(prev => ({
      ...prev,
      [modalType]: { ...prev[modalType as keyof typeof prev], isOpen: false, data: null },
    }));
  };

  const handleSaveStaff = (staffData: Partial<Staff>) => {
    if (modalState.staff.mode === 'add') {
      const newStaff: Staff = {
        id: Date.now(),
        full_name: staffData.full_name!,
        email: staffData.email!,
        address: staffData.address!,
        password: staffData.password!,
        role: staffData.role!,
      };
      setStaffList(prev => [...prev, newStaff]);
      showSnackbar('Staff added successfully!', 'success');
    } else {
      setStaffList(prev =>
        prev.map(staff =>
          staff.id === modalState.staff.data?.id ? { ...staff, ...staffData } : staff
        )
      );
      showSnackbar('Staff updated successfully!', 'success');
    }
    closeModal('staff');
  };

  const handleConfirmDelete = async () => {
    const data = modalState.delete.data;
    if (!data?.id) {
      console.error('No staff ID to delete');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/user/${data.id}`, { method: 'DELETE' });
      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result.error || result.message || 'Failed to delete staff');
      }

      setStaffList(prev => prev.filter(staff => staff.id !== data.id));
      showSnackbar(result.message || 'Staff deleted successfully!', 'success');
    } catch (err: any) {
      console.error('Delete error:', err);
      showSnackbar(err.message || 'Failed to delete staff', 'error');
    } finally {
      closeModal('delete');
    }
  };

  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Manage Staff</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <Table
              columns={staffColumns}
              data={staffList}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              title="Staff"
            />
          </div>
        </div>
      </div>

      {/* ✅ Modals */}
      <StaffModal
        isOpen={modalState.staff.isOpen}
        onClose={() => closeModal('staff')}
        onSave={handleSaveStaff}
        staff={modalState.staff.data}
        mode={modalState.staff.mode}
      />

      <DeleteModal
        isOpen={modalState.delete.isOpen}
        onClose={() => closeModal('delete')}
        onConfirm={handleConfirmDelete}
        title={modalState.delete.title}
        message={modalState.delete.message}
        itemName={modalState.delete.itemName}
      />

      {/* ✅ Snackbar */}
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

export default ManageStaff;
