import React, { useState, useEffect } from 'react';
import { RotateCcw, SquarePen, ArrowUp, ArrowDown, Eye, Copy, Trash2, Settings, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/api';
import ClientDetailPage from './ClientDetailPage';
import UpdateClientPage from './UpdateClientPage';
import CreateClientPage from './CreateClientPage';
import ResetAccountPage from './ResetAccountPage';
import RecalculateBrokeragePage from './RecalculateBrokeragePage';
import ChangePasswordPage from './ChangePasswordPage';
import DeleteClientPage from './DeleteClientPage';
import CopyTradingClientForm from './CopyTradingClientForm';
import Toast from '../../components/common/Toast';

import GlobalSettingsPage from '../settings/GlobalSettingsPage';

const TradingClientsPage = ({ onDepositClick, onWithdrawClick, onLogout, onNavigate }) => {
    const { isSuperAdmin, isAdmin } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [showDetailPage, setShowDetailPage] = useState(false);
    const [showUpdatePage, setShowUpdatePage] = useState(false);
    const [showCreatePage, setShowCreatePage] = useState(false);
    const [createFromDetail, setCreateFromDetail] = useState(false);
    const [showResetPage, setShowResetPage] = useState(false);
    const [showRecalculatePage, setShowRecalculatePage] = useState(false);
    const [showChangePasswordPage, setShowChangePasswordPage] = useState(false);
    const [showDeletePage, setShowDeletePage] = useState(false);
    const [showCopyPage, setShowCopyPage] = useState(false);
    const [showClientSettings, setShowClientSettings] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'success' });
    const [deleteConfirm, setDeleteConfirm] = useState(null); // holds client to be deleted

    const fetchClients = async () => {
        setLoading(true);
        try {
            const data = await api.getClients({ role: 'TRADER' });
            setClients(data || []);
        } catch (err) {
            console.error('Failed to fetch clients:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const filteredClients = clients.filter(client => {
        const username = client.username || '';
        const fullName = client.full_name || '';
        const matchesSearch = username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fullName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' ||
            (statusFilter === '1' && client.status === 'Active') ||
            (statusFilter === '0' && client.status === 'Inactive');

        const clientDate = new Date(client.created_at);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;
        
        // Ensure to Date includes the end of the day
        if (from) from.setHours(0, 0, 0, 0);
        if (to) to.setHours(23, 59, 59, 999);

        const matchesDate = (!from || clientDate >= from) && (!to || clientDate <= to);

        return matchesSearch && matchesStatus && matchesDate;
    });

    const toggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        try {
            await api.updateUserStatus(userId, newStatus);
            setToast({ message: `Status updated to ${newStatus}`, type: 'success' });
            if (fetchClients) fetchClients();
        } catch (err) {
            console.error('Failed to update status:', err);
            setToast({ message: 'Failed to update status', type: 'error' });
        }
    };

    const handleView = (client) => {
        setSelectedClient(client);
        setShowDetailPage(true);
    };

    const handleEdit = (client) => {
        setSelectedClient(client);
        setCreateFromDetail(false);
        setShowUpdatePage(true);
    };

    const handleCopy = (client) => {
        setSelectedClient(client);
        setCreateFromDetail(false);
        setShowCopyPage(true);
    };

    const handleDeposit = (client) => {
        if (onDepositClick) onDepositClick(client);
    };

    const handleWithdraw = (client) => {
        if (onWithdrawClick) onWithdrawClick(client);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;
        try {
            await api.deleteUser(deleteConfirm.id);
            setToast({ message: `Client "${deleteConfirm.username}" deleted successfully`, type: 'success' });
            fetchClients();
        } catch (err) {
            setToast({ message: 'Failed to delete client: ' + err.message, type: 'error' });
        } finally {
            setDeleteConfirm(null);
        }
    };

    return (
        <div className="relative flex flex-col h-full bg-[#1a2035] shadow-inner space-y-4 md:space-y-8 overflow-y-auto custom-scrollbar">

            <div className="px-3 sm:px-4 md:px-6 space-y-4 md:space-y-8 pb-6 md:pb-10">
                {/* Search Section */}
                <div className="bg-[#1f283e] p-4 sm:p-6 md:p-8 rounded shadow-2xl border border-white/5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-8">
                        <div className="group">
                            <label className="block text-sm text-slate-400 mb-2 font-medium">Username</label>
                            <input
                                type="text"
                                className="w-full bg-transparent border-b border-white/10 py-2 text-white focus:outline-none focus:border-[#5cb85c] transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search username..."
                            />
                        </div>
                        <div className="group">
                            <label className="block text-sm text-slate-400 mb-2 font-medium">Account Status</label>
                            <select
                                className="w-full bg-[#1f283e] border-b border-white/10 text-white py-2 focus:outline-none focus:border-[#5cb85c] appearance-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                        </div>
                        <div className="group">
                            <label className="block text-[10px] text-slate-500 mb-2 font-black uppercase tracking-widest">From Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className="w-full bg-[#151c2c] border border-white/10 rounded-md py-2.5 px-3 text-white focus:outline-none focus:border-[#4CAF50] transition-all [color-scheme:dark] text-xs font-bold"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label className="block text-[10px] text-slate-500 mb-2 font-black uppercase tracking-widest">To Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className="w-full bg-[#151c2c] border border-white/10 rounded-md py-2.5 px-3 text-white focus:outline-none focus:border-[#4CAF50] transition-all [color-scheme:dark] text-xs font-bold"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => fetchClients && fetchClients()}
                            className="text-white px-6 py-2.5 rounded font-bold text-xs tracking-widest transition-all shadow-[0_4px_10px_rgba(76,175,80,0.3)] hover:shadow-[0_4px_20px_rgba(76,175,80,0.5)] active:scale-95 uppercase flex-1 sm:flex-none"
                            style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}>SEARCH</button>
                        <button onClick={() => { setSearchTerm(''); setStatusFilter(''); setFromDate(''); setToDate(''); fetchClients && fetchClients(); }} className="bg-[#808080] hover:bg-[#707070] text-white px-6 py-2.5 rounded font-bold text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all uppercase flex-1 sm:flex-none"><RotateCcw className="w-4 h-4" /> RESET</button>
                    </div>
                </div>

                {/* Create Button */}
                {isAdmin() && (
                    <div className="flex justify-start">
                        <button
                            onClick={() => {
                                setSelectedClient(null);
                                setCreateFromDetail(false);
                                setShowCreatePage(true);
                            }}
                            className="w-full sm:w-auto text-white py-3 px-6 sm:px-8 rounded-md font-bold text-[11px] uppercase tracking-widest transition-all shadow-[0_4px_10px_rgba(76,175,80,0.3)] hover:shadow-[0_4px_20px_rgba(76,175,80,0.5)] active:scale-95 text-center"
                            style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                        >
                            + CREATE TRADING CLIENT
                        </button>
                    </div>
                )}

                {/* Table Container */}
                <div className="bg-[#1f283e] overflow-hidden rounded-lg border border-white/5 shadow-2xl">
                    <div className="px-3 sm:px-6 py-3 sm:py-4 bg-[#1a2035] border-b border-white/5 flex items-center justify-between flex-wrap gap-2">
                        <span className="text-slate-400 text-xs sm:text-sm font-medium">Showing <b className="text-white">{filteredClients.length}</b> of <b className="text-white">{clients.length}</b> items.</span>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar -webkit-overflow-scrolling-touch">
                        <table className="w-full text-left border-collapse" style={{ minWidth: '1600px' }}>
                            <thead className="bg-[#1a2035]/50">
                                <tr className="text-white/90 text-[13px] uppercase tracking-wider">
                                    <th className="px-4 py-5 font-bold w-16">#</th>
                                    <th className="px-4 py-5 font-bold text-center w-40">ACTIONS</th>
                                    <th className="px-4 py-5 font-bold">ID ↑</th>
                                    <th className="px-4 py-5 font-bold">Full Name ↑</th>
                                    <th className="px-4 py-5 font-bold">Username</th>
                                    <th className="px-4 py-5 font-bold">Ledger Balance ↑</th>
                                    {isAdmin() && (
                                        <>
                                            <th className="px-4 py-5 font-bold">Gross P/L ↑</th>
                                            <th className="px-4 py-5 font-bold">Brokerage ↑</th>
                                            <th className="px-4 py-5 font-bold">Swap Charges ↑</th>
                                            <th className="px-4 py-5 font-bold">Net P/L</th>
                                        </>
                                    )}
                                    <th className="px-4 py-5 font-bold">Admin</th>
                                    <th className="px-4 py-5 font-bold">Demo Account?</th>
                                    <th className="px-4 py-5 font-bold">Account Status</th>
                                    {isAdmin() && (
                                        <>
                                            <th className="px-4 py-5 font-bold">Active Trades</th>
                                            <th className="px-4 py-5 font-bold">Backup</th>
                                        </>
                                    )}
                                    <th className="px-4 py-5 font-bold">KYC Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-[13px] text-slate-300">
                                {loading ? (
                                    <tr>
                                        <td colSpan="14" className="px-4 py-12 text-center text-slate-500 font-medium italic">Loading clients...</td>
                                    </tr>
                                ) : filteredClients.length > 0 ? filteredClients.map((client, index) => (
                                    <tr key={client.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-6">{index + 1}</td>
                                        <td className="px-4 py-6">
                                            <div className="grid grid-cols-4 gap-x-1.5 gap-y-1.5 w-max mx-auto items-center justify-items-center">
                                                <button className="text-white hover:text-blue-400 transition-colors flex justify-center items-center" onClick={() => handleView(client)} title="View">
                                                    <i className="fa-solid fa-eye text-[15px]"></i>
                                                </button>
                                                <button className="text-white hover:text-blue-400 transition-colors flex justify-center items-center" onClick={() => handleEdit(client)} title="Edit">
                                                    <i className="fa-solid fa-pencil text-[15px]"></i>
                                                </button>
                                                {isAdmin() && (
                                                    <>
                                                        <button className="text-white hover:text-blue-400 transition-colors flex justify-center items-center" onClick={() => handleCopy(client)} title="Copy">
                                                            <i className="fa-solid fa-copy text-[15px]"></i>
                                                        </button>
                                                        <button
                                                            className="text-white hover:text-red-400 transition-colors flex justify-center items-center"
                                                            onClick={() => setDeleteConfirm(client)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-[15px] h-[15px]" />
                                                        </button>
                                                    </>
                                                )}

                                                <div onClick={() => handleDeposit(client)} className="w-[18px] h-[18px] bg-[#5cb85c] hover:bg-[#4caf50] rounded-full flex items-center justify-center cursor-pointer transition-all shadow-sm">
                                                    <i className="fa-solid fa-arrow-down text-white text-[11px] font-black"></i>
                                                </div>
                                                <div onClick={() => handleWithdraw(client)} className="w-[18px] h-[18px] bg-[#f44336] hover:bg-[#d32f2f] rounded-full flex items-center justify-center cursor-pointer transition-all shadow-sm">
                                                    <i className="fa-solid fa-arrow-up text-white text-[11px] font-black"></i>
                                                </div>
                                                <div className="col-span-2"></div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6">{client.id}</td>
                                        <td className="px-4 py-6 font-medium text-white">{client.full_name}</td>
                                        <td className="px-4 py-6 font-mono">{client.username}</td>
                                        <td className="px-4 py-6 font-mono text-white/80">{client.ledger_balance}</td>
                                        {isAdmin() && (
                                            <>
                                                <td className="px-4 py-6">{client.gross_pl || '0.00'}</td>
                                                <td className="px-4 py-6">{client.brokerage || '0.00'}</td>
                                                <td className="px-4 py-6">{client.swap_charges || '0.00'}</td>
                                                <td className="px-4 py-6 font-bold text-white">{client.net_pl || '0.00'}</td>
                                            </>
                                        )}
                                        <td className="px-4 py-6">{client.parent_username || 'SUPERADMIN'}</td>
                                        <td className="px-4 py-6">{client.is_demo ? 'Yes' : 'No'}</td>
                                        <td className="px-4 py-6">
                                            <button 
                                                onClick={() => toggleStatus(client.id, client.status)}
                                                title={`Click to change to ${client.status === 'Active' ? 'Inactive' : 'Active'}`}
                                                className={`badge ${client.status === 'Active' ? 'badge-active' : 'badge-inactive'} badge-interactive flex items-center gap-1.5`}
                                            >
                                                <RotateCcw className="w-3 h-3 opacity-70" />
                                                {client.status || 'Inactive'}
                                            </button>
                                        </td>
                                        {isAdmin() && (
                                            <>
                                                <td className="px-4 py-6 font-bold text-blue-400">{client.active_trades_count || 0}</td>
                                                <td className="px-4 py-6">
                                                    <button className="text-white hover:text-green-400 p-1.5 rounded bg-white/5 transition-all" title="Export Backup (PDF)">
                                                        <FileText className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                        <td className="px-4 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                                (client.kycStatus || '').toUpperCase() === 'VERIFIED' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                                (client.kycStatus || '').toUpperCase() === 'REJECTED' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                    'bg-orange-500/10 border-orange-500/20 text-orange-400'
                                                }`}>
                                                {(client.kycStatus || '').toUpperCase() === 'VERIFIED' ? 'VERIFIED' :
                                                 (client.kycStatus || '').toUpperCase() === 'REJECTED' ? 'REJECTED' : 'PENDING'}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="14" className="px-4 py-12 text-center text-slate-500 font-medium italic">No trading clients found matching your search.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-5 py-6 border-t border-white/5 flex items-center justify-between bg-[#1a2035]">
                        <div className="w-8 h-8 flex items-center justify-center bg-[#5cb85c] text-white text-sm font-bold rounded shadow-lg">1</div>
                    </div>
                </div>
            </div>

            {/* Client Detail Modal */}
            {showDetailPage && selectedClient && (
                <ClientDetailPage
                    client={selectedClient}
                    onLogout={onLogout}
                    onNavigate={onNavigate}
                    onClose={() => {
                        setShowDetailPage(false);
                        setSelectedClient(null);
                    }}
                    onUpdate={(client) => {
                        setShowDetailPage(false);
                        setSelectedClient(client);
                        setCreateFromDetail(true);
                        setShowUpdatePage(true);
                    }}
                    onReset={(client) => {
                        setShowDetailPage(false);
                        setSelectedClient(client);
                        setCreateFromDetail(true);
                        setShowResetPage(true);
                    }}
                    onRecalculate={(client) => {
                        setShowDetailPage(false);
                        setSelectedClient(client);
                        setCreateFromDetail(true);
                        setShowRecalculatePage(true);
                    }}
                    onDuplicate={(client) => {
                        setShowDetailPage(false);
                        setSelectedClient(client);
                        setCreateFromDetail(true);
                        setShowCopyPage(true);
                    }}
                    onChangePassword={(client) => {
                        setShowDetailPage(false);
                        setSelectedClient(client);
                        setCreateFromDetail(true);
                        setShowChangePasswordPage(true);
                    }}
                    onDelete={(client) => {
                        setShowDetailPage(false);
                        setSelectedClient(client);
                        setCreateFromDetail(true);
                        setShowDeletePage(true);
                    }}
                />
            )}

            {/* Reset Account Modal */}
            {showResetPage && selectedClient && (
                <ResetAccountPage
                    client={selectedClient}
                    onClose={() => {
                        setShowResetPage(false);
                        if (createFromDetail) setShowDetailPage(true);
                    }}
                    onResetConfirm={(password) => {
                        setToast({ message: 'Account reset successful', type: 'success' });
                        setShowResetPage(false);
                        if (createFromDetail) setShowDetailPage(true);
                    }}
                />
            )}

            {/* Recalculate Brokerage Modal */}
            {showRecalculatePage && selectedClient && (
                <RecalculateBrokeragePage
                    client={selectedClient}
                    onClose={() => {
                        setShowRecalculatePage(false);
                        if (createFromDetail) setShowDetailPage(true);
                    }}
                    onRecalculate={(client, password) => {
                        setToast({ message: 'Brokerage recalculated successfully', type: 'success' });
                        setShowRecalculatePage(false);
                        if (createFromDetail) setShowDetailPage(true);
                    }}
                />
            )}

            {/* Update Client Modal */}
            {showUpdatePage && selectedClient && (
                <UpdateClientPage
                    client={selectedClient}
                    onLogout={onLogout}
                    onNavigate={onNavigate}
                    onClose={() => {
                        setShowUpdatePage(false);
                        if (createFromDetail) setShowDetailPage(true);
                    }}
                    onSave={(updatedData) => {
                        setToast({ message: 'Client updated successfully!', type: 'success' });
                        setShowUpdatePage(false);
                        if (createFromDetail) setShowDetailPage(true);
                    }}
                />
            )}

            {/* Create Client Modal (Remains Unchanged) */}
            {showCreatePage && (
                <CreateClientPage
                    client={selectedClient}
                    onLogout={onLogout}
                    onNavigate={onNavigate}
                    onClose={() => {
                        setShowCreatePage(false);
                        if (createFromDetail) {
                            setShowDetailPage(true);
                        } else {
                            setSelectedClient(null);
                        }
                    }}
                    onSave={(data) => {
                        setToast({ message: 'Client created successfully!', type: 'success' });
                        setShowCreatePage(false);
                        if (createFromDetail) {
                            setShowDetailPage(true);
                        } else {
                            setSelectedClient(null);
                        }
                        fetchClients();
                    }}
                />
            )}

            {/* NEW Copy Client Modal (Isolated) */}
            {showCopyPage && (
                <CopyTradingClientForm
                    client={selectedClient}
                    onLogout={onLogout}
                    onClose={() => {
                        setShowCopyPage(false);
                        if (createFromDetail) {
                            setShowDetailPage(true);
                        } else {
                            setSelectedClient(null);
                        }
                    }}
                    onSave={(data) => {
                        setToast({ message: 'Client copied successfully!', type: 'success' });
                        setShowCopyPage(false);
                        if (createFromDetail) {
                            setShowDetailPage(true);
                        } else {
                            setSelectedClient(null);
                        }
                        fetchClients();
                    }}
                />
            )}

            {/* Change Password Modal */}
            {showChangePasswordPage && selectedClient && (
                <ChangePasswordPage
                    client={selectedClient}
                    onClose={() => {
                        setShowChangePasswordPage(false);
                        if (createFromDetail) setShowDetailPage(true);
                    }}
                    onChangePasswordConfirm={(newPass, transPass) => {
                        setToast({ message: 'Password updated successfully!', type: 'success' });
                        setShowChangePasswordPage(false);
                        if (createFromDetail) setShowDetailPage(true);
                    }}
                />
            )}

            {/* Client Global Settings View */}
            {showClientSettings && selectedClient && (
                <div className="absolute inset-0 z-[50] overflow-y-auto bg-[#1a2035] -m-6 p-6">
                    <GlobalSettingsPage 
                        clientId={selectedClient.id} 
                        clientName={selectedClient.username}
                        onBack={() => {
                            setShowClientSettings(false);
                            setSelectedClient(null);
                        }} 
                    />
                </div>
            )}

            {/* Delete Client Modal - Kept for reference or if still needed elsewhere, but hidden from main table now */}
            {showDeletePage && selectedClient && (
                <DeleteClientPage
                    client={selectedClient}
                    onClose={() => {
                        setShowDeletePage(false);
                        if (createFromDetail) setShowDetailPage(true);
                    }}
                    onDeleteConfirm={async (password) => {
                        try {
                            await api.deleteUser(selectedClient.id);
                            setToast({ message: `Client ${selectedClient.username} deleted successfully`, type: 'success' });
                            if (fetchClients) fetchClients();
                            setShowDeletePage(false);
                            setSelectedClient(null);
                        } catch (err) {
                            setToast({ message: 'Failed to delete client: ' + err.message, type: 'error' });
                        }
                    }}
                />
            )}

            {/* ===== INLINE DELETE CONFIRMATION MODAL ===== */}
            {deleteConfirm && (
                <div
                    className="fixed inset-0 z-[999] flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setDeleteConfirm(null)}
                >
                    <div
                        className="bg-[#1f283e] border border-red-500/20 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                <Trash2 className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Delete Trading Client</h3>
                                <p className="text-slate-400 text-sm mt-0.5">This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-slate-300 mb-2">
                            Are you sure you want to delete this record?
                        </p>
                        <p className="text-slate-500 text-sm mb-8">
                            Client: <span className="text-white font-bold">{deleteConfirm.username}</span> ({deleteConfirm.full_name})
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-3 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 font-bold text-sm transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="flex-1 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-lg shadow-red-500/20"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Toast 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ message: '', type: 'success' })} 
            />
        </div>
    );
};

export default TradingClientsPage;
