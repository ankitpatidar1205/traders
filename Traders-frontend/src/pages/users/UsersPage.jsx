import React, { useState, useEffect } from 'react';
import { UserPlus, RotateCcw, Trash2 } from 'lucide-react';
import { useAuth, ROLES } from '../../context/AuthContext';
import DataTable from '../../components/common/DataTable';
import ConfirmModal from '../../components/modals/ConfirmModal';
import Toast from '../../components/common/Toast';
import * as api from '../../services/api';

const UsersPage = ({ onNavigate }) => {
    const { user, isSuperAdmin, isAdmin, isBroker } = useAuth();
    const [filters, setFilters] = useState({ username: '', status: '' });
    const [resetModal, setResetModal] = useState({ open: false, user: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
    const [toast, setToast] = useState({ message: '', type: 'success' });

    const [usersData, setUsersData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await api.getClients();
            setUsersData(data || []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSearch = () => {
        // Search is handled by filtering the usersData in the render or refetching
        // For now, let's keep it simple as the user requested "search bhi chalna chahiye"
        fetchUsers(); 
    };

    const handleReset = () => {
        setFilters({ username: '', status: '' });
        fetchUsers();
    };

    const toggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        try {
            await api.updateUserStatus(userId, newStatus);
            setToast({ message: `Status updated to ${newStatus}`, type: 'success' });
            fetchUsers();
        } catch (err) {
            console.error('Failed to update status:', err);
            setToast({ message: 'Failed to update status', type: 'error' });
        }
    };

    const handleResetPassword = async () => {
        setToast({ message: `Password reset for ${resetModal.user?.username}`, type: 'success' });
        setResetModal({ open: false, user: null });
    };

    const handleDeleteUser = async () => {
        try {
            await api.deleteUser(deleteModal.user?.id);
            setToast({ message: `User ${deleteModal.user?.username} deleted successfully`, type: 'success' });
            fetchUsers();
        } catch (err) {
            console.error('Failed to delete user:', err);
            setToast({ message: 'Failed to delete user: ' + err.message, type: 'error' });
        } finally {
            setDeleteModal({ open: false, user: null });
        }
    };

    const columns = [
        { key: 'id', label: 'ID', width: '80px' },
        { key: 'username', label: 'Username', className: 'text-[#00BCD4] font-medium' },
        { key: 'full_name', label: 'Full Name' },
        {
            key: 'role', label: 'Role', render: (val) => (
                <span className={`badge ${val === 'BROKER' || val === 'ADMIN' ? 'badge-active' : 'badge-pending'}`}>{val}</span>
            )
        },
        {
            key: 'status', label: 'Status', render: (val, row) => (
                <button 
                    onClick={() => toggleStatus(row.id, val)}
                    title={`Click to change to ${val === 'Active' ? 'Inactive' : 'Active'}`}
                    className={`badge ${val === 'Active' ? 'badge-active' : 'badge-inactive'} badge-interactive flex items-center gap-1.5`}
                >
                    <RotateCcw className="w-3 h-3 opacity-70" />
                    {val || 'Inactive'}
                </button>
            )
        },
        { 
            key: 'created_at', label: 'Created At', render: (val) => val ? new Date(val).toLocaleString() : '-' 
        },
    ];

    const actions = {
        onView: (row) => onNavigate('client-details'),
        onEdit: (row) => onNavigate('edit'),
        onDelete: (row) => setDeleteModal({ open: true, user: row }),
    };

    const filteredUsers = usersData.filter(u => {
        const matchUser = filters.username ? u.username.toLowerCase().includes(filters.username.toLowerCase()) : true;
        const matchStatus = filters.status ? u.status === filters.status : true;
        return matchUser && matchStatus;
    });

    return (
        <div className="flex flex-col h-full bg-[#1a2035] space-y-6 overflow-y-auto">
            <div className="bg-[#1f283e] p-10 rounded shadow-2xl border border-white/5 mx-6">
                <div className="flex flex-col md:flex-row gap-10 md:gap-24 mb-6">
                    <div className="flex-1 max-w-sm">
                        <label className="block text-sm text-slate-300 mb-2">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={filters.username}
                            onChange={handleFilterChange}
                            placeholder="Search username..."
                            className="bg-transparent w-full text-white text-sm py-2 outline-none border-b border-white/20 focus:border-[#5cb85c] transition-colors"
                        />
                        <div className="flex gap-2 mt-8">
                            <button
                                onClick={handleSearch}
                                className="text-white px-8 py-2.5 rounded text-sm font-bold uppercase tracking-wider transition-all shadow-[0_4px_10px_rgba(76,175,80,0.3)] hover:shadow-[0_4px_20px_rgba(76,175,80,0.5)] active:scale-95"
                                style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                            >
                                SEARCH
                            </button>
                            <button
                                onClick={handleReset}
                                className="bg-[#808080] hover:bg-[#707070] text-white px-8 py-2.5 rounded text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
                            >
                                <RotateCcw className="w-4 h-4" /> RESET
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 max-w-sm">
                        <label className="block text-sm text-slate-300 mb-2">Account Status</label>
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="bg-white text-slate-900 w-full px-4 py-2 rounded border border-slate-300 text-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#5cb85c]/50"
                        >
                            <option value="">All</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Active">Active</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="px-6 flex flex-wrap gap-4">
                {isSuperAdmin() && (
                    <button
                        onClick={() => onNavigate('create-admin')}
                        className="text-white px-6 py-2.5 rounded font-bold text-xs uppercase tracking-widest transition-all shadow-[0_4px_10px_rgba(76,175,80,0.3)] hover:shadow-[0_4px_20px_rgba(76,175,80,0.5)] active:scale-95"
                        style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                    >
                        ADD ADMIN
                    </button>
                )}
                {user?.role === ROLES.ADMIN && (
                    <button
                        onClick={() => onNavigate('create-broker')}
                        className="text-white px-6 py-2.5 rounded font-bold text-xs uppercase tracking-widest transition-all shadow-[0_4px_10px_rgba(76,175,80,0.3)] hover:shadow-[0_4_20px_rgba(76,175,80,0.5)] active:scale-95"
                        style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                    >
                        ADD BROKER
                    </button>
                )}
                {(user?.role === ROLES.ADMIN || isBroker()) && (
                    <button
                        onClick={() => onNavigate('create-client')}
                        className="text-white px-6 py-2.5 rounded font-bold text-xs uppercase tracking-widest transition-all shadow-[0_4px_10px_rgba(76,175,80,0.3)] hover:shadow-[0_4_20px_rgba(76,175,80,0.5)] active:scale-95"
                        style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                    >
                        ADD TRADER
                    </button>
                )}
            </div>

            <div className="mx-6 bg-[#1f283e] rounded border border-white/5 p-8 text-slate-400 text-sm">
                {loading ? (
                    <div className="text-left font-medium">Loading Users...</div>
                ) : filteredUsers.length > 0 ? (
                    <DataTable columns={columns} data={filteredUsers} actions={actions} searchable={false} emptyMessage="No Users Found" />
                ) : (
                    <div className="text-left font-medium">No Users Found</div>
                )}
            </div>

            <ConfirmModal
                isOpen={resetModal.open}
                onClose={() => setResetModal({ open: false, user: null })}
                onConfirm={handleResetPassword}
                title="Reset Password"
                message={`Are you sure you want to reset the password for "${resetModal.user?.username}"?`}
                confirmText="Reset Password"
                type="warning"
            />

            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, user: null })}
                onConfirm={handleDeleteUser}
                title="Delete User"
                message={`Are you sure you want to delete user "${deleteModal.user?.username}"? This action cannot be undone.`}
                confirmText="Delete User"
                type="danger"
            />

            <Toast 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ message: '', type: 'success' })} 
            />
        </div>
    );
};

export default UsersPage;
