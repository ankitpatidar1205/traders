import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, X, User, Mail, Lock, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/common/DataTable';
import ConfirmModal from '../../components/modals/ConfirmModal';
import Toast from '../../components/common/Toast';
import * as api from '../../services/api';

const UsersPage = ({ onNavigate, roleFilter }) => {
    const navigate = useNavigate();
    const { isSuperAdmin, isAdmin } = useAuth();
    const [filters, setFilters] = useState({ username: '', status: '' });
    const [resetModal, setResetModal] = useState({ open: false, user: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
    const [toast, setToast] = useState({ message: '', type: 'success' });
    const [usersData, setUsersData] = useState([]);
    const [loading, setLoading] = useState(false);

    // View modal
    const [viewModal, setViewModal] = useState({ open: false, user: null });

    // Edit modal
    const [editModal, setEditModal] = useState({ open: false, user: null });
    const [editForm, setEditForm] = useState({ full_name: '', email: '', mobile: '', password: '' });
    const [editLoading, setEditLoading] = useState(false);

    const roleLabel = roleFilter === 'ADMIN' ? 'Admin' : 'Broker';

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await api.getClients({ role: roleFilter });
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

    const toggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        try {
            await api.updateUserStatus(userId, newStatus);
            setToast({ message: `Status updated to ${newStatus}`, type: 'success' });
            fetchUsers();
        } catch (err) {
            setToast({ message: 'Failed to update status', type: 'error' });
        }
    };

    const openEditModal = (row) => {
        setEditForm({
            full_name: row.full_name || '',
            email: row.email || '',
            mobile: row.mobile || '',
            password: '',
        });
        setEditModal({ open: true, user: row });
    };

    const handleEditSave = async () => {
        setEditLoading(true);
        try {
            const payload = { full_name: editForm.full_name, email: editForm.email, mobile: editForm.mobile };
            if (editForm.password) payload.password = editForm.password;
            await api.updateUser(editModal.user.id, payload);
            setToast({ message: `${roleLabel} updated successfully`, type: 'success' });
            setEditModal({ open: false, user: null });
            fetchUsers();
        } catch (err) {
            setToast({ message: 'Failed to update: ' + err.message, type: 'error' });
        } finally {
            setEditLoading(false);
        }
    };

    const handleResetPassword = async () => {
        try {
            await api.resetPassword(resetModal.user?.id);
            setToast({ message: `Password reset for ${resetModal.user?.username}`, type: 'success' });
        } catch (err) {
            setToast({ message: 'Failed to reset password: ' + err.message, type: 'error' });
        } finally {
            setResetModal({ open: false, user: null });
        }
    };

    const handleDeleteUser = async () => {
        try {
            await api.deleteUser(deleteModal.user?.id);
            setToast({ message: `${roleLabel} ${deleteModal.user?.username} deleted successfully`, type: 'success' });
            fetchUsers();
        } catch (err) {
            setToast({ message: 'Failed to delete: ' + err.message, type: 'error' });
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
        { key: 'created_at', label: 'Created At', render: (val) => val ? new Date(val).toLocaleString() : '-' },
    ];

    const actions = {
        onView: (row) => {
            if (roleFilter === 'BROKER') {
                navigate(`/brokers/view/${row.id}`);
            } else {
                setViewModal({ open: true, user: row });
            }
        },
        onEdit: (row) => {
            if (roleFilter === 'BROKER') {
                navigate(`/brokers/edit/${row.id}`);
            } else if (roleFilter === 'ADMIN') {
                navigate(`/admins/edit/${row.id}`);
            } else {
                openEditModal(row);
            }
        },
        onDelete: (row) => setDeleteModal({ open: true, user: row }),
    };

    const filteredUsers = usersData.filter(u => {
        const matchUser = filters.username ? u.username.toLowerCase().includes(filters.username.toLowerCase()) : true;
        const matchStatus = filters.status ? u.status === filters.status : true;
        const matchRole = roleFilter ? u.role === roleFilter : true;
        return matchUser && matchStatus && matchRole;
    });

    return (
        <div className="flex flex-col h-full bg-[#1a2035] space-y-4 md:space-y-6 overflow-y-auto">
            {/* Filters */}
            <div className="bg-[#1f283e] p-4 sm:p-6 md:p-10 rounded shadow-2xl border border-white/5 mx-3 sm:mx-4 md:mx-6">
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 md:gap-24 mb-4 md:mb-6">
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
                                onClick={fetchUsers}
                                className="text-white px-8 py-2.5 rounded text-sm font-bold uppercase tracking-wider transition-all shadow-[0_4px_10px_rgba(76,175,80,0.3)] hover:shadow-[0_4px_20px_rgba(76,175,80,0.5)] active:scale-95"
                                style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                            >
                                SEARCH
                            </button>
                            <button
                                onClick={() => { setFilters({ username: '', status: '' }); fetchUsers(); }}
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
                            className="bg-white text-slate-900 w-full px-4 py-2 rounded border border-slate-300 text-sm outline-none cursor-pointer"
                        >
                            <option value="">All</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Active">Active</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Add buttons */}
            <div className="px-3 sm:px-4 md:px-6 flex flex-wrap gap-3 md:gap-4">
                {roleFilter === 'ADMIN' && isSuperAdmin() && (
                    <button
                        onClick={() => onNavigate('admins/create')}
                        className="text-white px-6 py-2.5 rounded font-bold text-xs uppercase tracking-widest transition-all shadow-[0_4px_10px_rgba(76,175,80,0.3)] hover:shadow-[0_4px_20px_rgba(76,175,80,0.5)] active:scale-95"
                        style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                    >
                        ADD ADMIN
                    </button>
                )}
                {roleFilter === 'BROKER' && isAdmin() && (
                    <button
                        onClick={() => onNavigate('brokers/create')}
                        className="text-white px-6 py-2.5 rounded font-bold text-xs uppercase tracking-widest transition-all shadow-[0_4px_10px_rgba(76,175,80,0.3)] hover:shadow-[0_4px_20_px_rgba(76,175,80,0.5)] active:scale-95"
                        style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                    >
                        ADD BROKER
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="mx-3 sm:mx-4 md:mx-6 bg-[#1f283e] rounded border border-white/5 p-3 sm:p-5 md:p-8 text-slate-400 text-sm">
                {loading ? (
                    <div className="text-left font-medium">Loading {roleLabel}s...</div>
                ) : filteredUsers.length > 0 ? (
                    <DataTable columns={columns} data={filteredUsers} actions={actions} searchable={false} emptyMessage={`${roleLabel}s Not Found`} />
                ) : (
                    <div className="text-left font-medium">{roleLabel}s Not Found</div>
                )}
            </div>

            {/* ── VIEW MODAL ── */}
            {viewModal.open && viewModal.user && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1f283e] rounded-xl border border-white/10 shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10" style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)', borderRadius: '12px 12px 0 0' }}>
                            <h2 className="text-white text-lg font-bold uppercase tracking-wider">{roleLabel} Details</h2>
                            <button onClick={() => setViewModal({ open: false, user: null })} className="text-white hover:bg-black/20 p-1 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {[
                                { label: 'ID', value: viewModal.user.id },
                                { label: 'Username', value: viewModal.user.username },
                                { label: 'Full Name', value: viewModal.user.full_name || '—' },
                                { label: 'Email', value: viewModal.user.email || '—' },
                                { label: 'Mobile', value: viewModal.user.mobile || '—' },
                                { label: 'Role', value: viewModal.user.role },
                                { label: 'Status', value: viewModal.user.status || '—' },
                                { label: 'Created At', value: viewModal.user.created_at ? new Date(viewModal.user.created_at).toLocaleString() : '—' },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</span>
                                    <span className="text-white text-sm font-bold">{value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 pb-6">
                            <button
                                onClick={() => setViewModal({ open: false, user: null })}
                                className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 rounded font-bold text-sm uppercase tracking-wider transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── EDIT MODAL ── */}
            {editModal.open && editModal.user && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1f283e] rounded-xl border border-white/10 shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10" style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)', borderRadius: '12px 12px 0 0' }}>
                            <h2 className="text-white text-lg font-bold uppercase tracking-wider">Edit {roleLabel}: {editModal.user.username}</h2>
                            <button onClick={() => setEditModal({ open: false, user: null })} className="text-white hover:bg-black/20 p-1 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5" autoComplete="off">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={editForm.full_name}
                                            onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
                                            className="w-full bg-white border border-slate-200 rounded px-10 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#4caf50] text-sm"
                                            placeholder="Full name"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                                            className="w-full bg-white border border-slate-200 rounded px-10 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#4caf50] text-sm"
                                            placeholder="Email"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Mobile Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            value={editForm.mobile}
                                            onChange={e => setEditForm(p => ({ ...p, mobile: e.target.value }))}
                                            className="w-full bg-white border border-slate-200 rounded px-10 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#4caf50] text-sm"
                                            placeholder="10-digit mobile"
                                            maxLength={10}
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">New Password <span className="normal-case text-slate-500">(optional)</span></label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="password"
                                            value={editForm.password}
                                            onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))}
                                            className="w-full bg-white border border-slate-200 rounded px-10 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#4caf50] text-sm"
                                            placeholder="Leave blank to keep current"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={handleEditSave}
                                disabled={editLoading}
                                className="flex-1 text-white py-3 rounded font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-60 active:scale-[0.98]"
                                style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                            >
                                {editLoading ? 'SAVING...' : `UPDATE ${roleLabel.toUpperCase()}`}
                            </button>
                            <button
                                onClick={() => setEditModal({ open: false, user: null })}
                                className="px-6 bg-white/10 hover:bg-white/20 text-white py-3 rounded font-bold text-sm uppercase tracking-wider transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                title={`Delete ${roleLabel}`}
                message={`Are you sure you want to delete ${roleLabel.toLowerCase()} "${deleteModal.user?.username}"? This action cannot be undone.`}
                confirmText={`Delete ${roleLabel}`}
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
