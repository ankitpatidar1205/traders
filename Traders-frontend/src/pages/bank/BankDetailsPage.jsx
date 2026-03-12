import React, { useState } from 'react';
import { Plus, Search, X, SquarePen, Trash2 } from 'lucide-react';

const BankDetailsPage = () => {
  const [bankData, setBankData] = useState([
    {
      id: 1,
      bankName: "HDFC Bank",
      accountHolder: "SHRISHREENATHJI TRADERS",
      accountNumber: "50200012345678",
      ifsc: "HDFC0001234",
      branch: "Mumbai Main Branch",
      status: "Active"
    },
    {
      id: 2,
      bankName: "ICICI Bank",
      accountHolder: "SHRISHREENATHJI TRADERS",
      accountNumber: "000405001234",
      ifsc: "ICIC0000004",
      branch: "Delhi Connaught Place",
      status: "Active"
    },
    {
      id: 3,
      bankName: "State Bank of India",
      accountHolder: "SHRISHREENATHJI TRADERS",
      accountNumber: "31234567890",
      ifsc: "SBIN0001234",
      branch: "Ahmedabad Corporate Branch",
      status: "Inactive"
    },
  ]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBank(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (bank) => {
    setNewBank({
      bankName: bank.bankName,
      accountHolder: bank.accountHolder,
      accountNumber: bank.accountNumber,
      ifsc: bank.ifsc,
      branch: bank.branch
    });
    setEditingId(bank.id);
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      setBankData(bankData.filter(bank => bank.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      setBankData(bankData.map(bank =>
        bank.id === editingId ? { ...bank, ...newBank } : bank
      ));
      alert('Bank Account Updated Successfully!');
    } else {
      const newEntry = {
        id: bankData.length > 0 ? Math.max(...bankData.map(b => b.id)) + 1 : 1,
        ...newBank,
        status: 'Active'
      };
      setBankData([...bankData, newEntry]);
      alert('New Bank Account Added Successfully!');
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setIsEditing(false);
    setEditingId(null);
    setNewBank({ bankName: '', accountHolder: '', accountNumber: '', ifsc: '', branch: '' });
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filteredBankData = bankData.filter(bank => {
    const matchesSearch = bank.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.accountNumber.includes(searchTerm);
    const matchesStatus = statusFilter === 'All Status' || bank.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full bg-[#1a2035] p-4 space-y-8 overflow-y-auto relative">
      {/* Header Actions */}
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

      {/* Table Section */}
      <div className="flex-1 bg-[#202940] rounded-lg border border-[#2d3748] overflow-hidden flex flex-col shadow-xl">
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
                    <td className="px-6 py-4 font-semibold text-white">{bank.bankName}</td>
                    <td className="px-6 py-4">{bank.accountHolder}</td>
                    <td className="px-6 py-4 text-[#01B4EA] font-mono">{bank.accountNumber}</td>
                    <td className="px-6 py-4 font-mono">{bank.ifsc}</td>
                    <td className="px-6 py-4">{bank.branch}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${bank.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        {bank.status}
                      </span>
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
                  <td colSpan="8" className="px-6 py-10 text-center text-slate-500 font-medium italic">No bank records found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[#2d3748] bg-[#1c2638]/30 flex justify-between items-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Showing {filteredBankData.length} records</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1c2638] text-white text-xs border border-[#2d3748]">1</button>
          </div>
        </div>
      </div>

      {/* Add Bank Modal */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#202940] w-full max-w-md rounded-lg border border-[#2d3748] shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-[#2d3748]">
              <h3 className="text-white font-bold text-lg">{isEditing ? 'Edit Bank Account' : 'Add New Bank Account'}</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-slate-400 text-xs uppercase font-bold mb-1">Bank Name</label>
                <input
                  name="bankName"
                  value={newBank.bankName}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#202940] border border-[#2d3748] rounded px-3 py-2 text-white focus:outline-none focus:border-[#01B4EA]"
                  placeholder="e.g. HDFC Bank"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs uppercase font-bold mb-1">Account Holder Name</label>
                <input
                  name="accountHolder"
                  value={newBank.accountHolder}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#202940] border border-[#2d3748] rounded px-3 py-2 text-white focus:outline-none focus:border-[#01B4EA]"
                  placeholder="e.g. SHRISHREENATHJI TRADERS"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs uppercase font-bold mb-1">Account Number</label>
                <input
                  name="accountNumber"
                  value={newBank.accountNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#202940] border border-[#2d3748] rounded px-3 py-2 text-white focus:outline-none focus:border-[#01B4EA]"
                  placeholder="Enter Account Number"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs uppercase font-bold mb-1">IFSC Code</label>
                <input
                  name="ifsc"
                  value={newBank.ifsc}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#202940] border border-[#2d3748] rounded px-3 py-2 text-white focus:outline-none focus:border-[#01B4EA]"
                  placeholder="Enter IFSC Code"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs uppercase font-bold mb-1">Branch Name</label>
                <input
                  name="branch"
                  value={newBank.branch}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#202940] border border-[#2d3748] rounded px-3 py-2 text-white focus:outline-none focus:border-[#01B4EA]"
                  placeholder="Enter Branch Name"
                />
              </div>

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
                  className="flex-1 bg-[#01B4EA] hover:bg-cyan-600 text-white font-bold py-2 rounded transition-colors shadow-lg"
                >
                  {isEditing ? 'UPDATE BANK' : 'SAVE BANK'}
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
