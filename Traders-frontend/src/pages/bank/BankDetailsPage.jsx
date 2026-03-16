import React, { useState, useEffect } from 'react';
import { Plus, Search, X, SquarePen, Trash2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import * as api from '../../services/api';

const BankDetailsPage = () => {
  const [bankData, setBankData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', text: '' });

  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newBank, setNewBank] = useState({
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    ifsc: '',
    branch: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const showToast = (text, type = 'success') => {
    setToast({ show: true, type, text });
    setTimeout(() => setToast({ show: false, type: '', text: '' }), 3000);
  };

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const data = await api.getBanks();
      setBankData(data);
    } catch (err) {
      showToast(err.message || 'Failed to load bank details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBank(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (bank) => {
    setNewBank({
      bankName: bank.bank_name,
      accountHolder: bank.account_holder,
      accountNumber: bank.account_number,
      ifsc: bank.ifsc,
      branch: bank.branch
    });
    setEditingId(bank.id);
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) return;
    try {
      await api.deleteBank(id);
      showToast('Bank deleted successfully', 'success');
      fetchBanks();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.toggleBankStatus(id);
      showToast(`Status changed to ${res.status}`, 'success');
      fetchBanks();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await api.updateBank(editingId, { ...newBank, status: bankData.find(b => b.id === editingId)?.status || 'Active' });
        showToast('Bank account updated successfully!', 'success');
      } else {
        await api.createBank(newBank);
        showToast('Bank account added successfully!', 'success');
      }
      handleCloseModal();
      fetchBanks();
    } catch (err) {
      showToast(err.message || 'Failed to save bank', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setIsEditing(false);
    setEditingId(null);
    setNewBank({ bankName: '', accountHolder: '', accountNumber: '', ifsc: '', branch: '' });
  };

  const filteredBankData = bankData.filter(bank => {
    const matchesSearch = bank.bank_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.account_number?.includes(searchTerm);
    const matchesStatus = statusFilter === 'All Status' || bank.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full bg-[#1a2035] p-4 space-y-8 overflow-y-auto relative">

      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded shadow-2xl text-white text-[14px] font-medium ${toast.type === 'success' ? 'bg-[#16a34a]' : 'bg-[#dc2626]'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white tracking-tight italic">Bank Details Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#4CAF50] hover:bg-green-600 text-white font-bold py-2 px-6 rounded transition-all uppercase tracking-wider text-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Bank
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#202940] rounded border border-[#2d3748] mb-6 flex items-center gap-4 p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by bank or account number..."
            className="w-full bg-[#1c2638] border border-[#2d3748] text-white pl-10 pr-4 py-2 rounded text-sm focus:outline-none focus:border-[#01B4EA] transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#1c2638] border border-[#2d3748] text-white px-4 py-2 rounded text-sm focus:outline-none focus:border-[#01B4EA]"
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 bg-[#202940] rounded-lg border border-[#2d3748] overflow-hidden flex flex-col shadow-xl">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#4CAF50]" />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#1c2638] z-10">
                <tr className="text-slate-100 text-[11px] font-semibold border-b border-[#2d3748] uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4 font-bold">Bank Name</th>
                  <th className="px-6 py-4">Account Holder</th>
                  <th className="px-6 py-4">Account Number</th>
                  <th className="px-6 py-4">IFSC Code</th>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[12px] text-slate-300">
                {filteredBankData.length > 0 ? (
                  filteredBankData.map((bank) => (
                    <tr key={bank.id} className="border-b border-[#2d3748] hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4 text-slate-500">#{bank.id}</td>
                      <td className="px-6 py-4 font-semibold text-white">{bank.bank_name}</td>
                      <td className="px-6 py-4">{bank.account_holder}</td>
                      <td className="px-6 py-4 text-[#01B4EA] font-mono">{bank.account_number}</td>
                      <td className="px-6 py-4 font-mono">{bank.ifsc}</td>
                      <td className="px-6 py-4">{bank.branch}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(bank.id)}
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all ${bank.status === 'Active'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                            }`}
                        >
                          {bank.status}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(bank)}
                            className="action-icon action-icon-edit"
                            title="Edit"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(bank.id)}
                            className="action-icon action-icon-delete"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-10 text-center text-slate-500 font-medium italic">
                      No bank records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4 border-t border-[#2d3748] bg-[#1c2638]/30 flex justify-between items-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Showing {filteredBankData.length} records</p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#202940] w-full max-w-md rounded-lg border border-[#2d3748] shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-[#2d3748]">
              <h3 className="text-white font-bold text-lg">{isEditing ? 'Edit Bank Account' : 'Add New Bank Account'}</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
              {[
                { label: 'Bank Name', name: 'bankName', placeholder: 'e.g. HDFC Bank' },
                { label: 'Account Holder Name', name: 'accountHolder', placeholder: 'e.g. SHRISHREENATHJI TRADERS' },
                { label: 'Account Number', name: 'accountNumber', placeholder: 'Enter Account Number' },
                { label: 'IFSC Code', name: 'ifsc', placeholder: 'Enter IFSC Code' },
                { label: 'Branch Name', name: 'branch', placeholder: 'Enter Branch Name' },
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-slate-400 text-xs uppercase font-bold mb-1">{field.label}</label>
                  <input
                    name={field.name}
                    value={newBank[field.name]}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#1c2638] border border-[#2d3748] rounded px-3 py-2 text-white focus:outline-none focus:border-[#4CAF50]"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#4CAF50] hover:bg-green-600 text-white font-bold py-2 rounded transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditing ? 'UPDATE BANK' : 'SAVE BANK')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankDetailsPage;
