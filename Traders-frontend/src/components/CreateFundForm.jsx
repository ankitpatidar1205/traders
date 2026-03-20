import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import * as api from '../services/api';

const CreateFundForm = ({ onSave, onBack, mode = 'deposit', initialUser }) => {
  const isWithdraw = mode === 'withdraw';

  const [formData, setFormData] = useState({
    userId: initialUser?.id || '',
    notes: '',
    amount: '',
    transactionPassword: ''
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', text: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getClients();
      setUsers(Array.isArray(data) ? data.filter(u => u.role === 'TRADER') : []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text, type = 'success') => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast({ show: false, text: '', type: '' }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId) return showToast('Please select a user', 'error');
    if (!formData.amount) return showToast('Please enter an amount', 'error');

    setSubmitting(true);
    try {
      await api.createFund({
        ...formData,
        mode
      });
      showToast('Fund processed successfully!', 'success');
      setTimeout(() => onSave?.(formData), 1500);
    } catch (err) {
      showToast(err.message || 'Failed to process fund', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2035] font-sans relative">
      {/* Toast Notification */}
      {toast.show && (
          <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded shadow-2xl transition-all border ${
              toast.type === 'success' ? 'bg-[#1b2a21] border-green-500/30 text-green-400' : 'bg-[#2a1b1b] border-red-500/30 text-red-400'
          }`}>
              {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="text-[14px] font-medium tracking-wide">{toast.text}</p>
          </div>
      )}

      <div className="max-w-6xl mx-auto pt-10">

        {/* Floating Card Header (3D Ribbon Style) */}
        <div className="relative z-20 -mb-8 ml-4 flex flex-col items-start translate-y-2">
          <div
            className="px-8 py-4 rounded-md shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] relative z-10"
            style={{ background: 'linear-gradient(60deg, #66bb6a, #43a047)' }}
          >
            <h4 className="text-white text-[18px] font-bold m-0 tracking-wide">
              Add/Withdraw Funds
            </h4>
          </div>
          {/* The 3D fold decorator */}
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#2e7d32] -z-10 rounded-sm transform rotate-45"></div>
        </div>

        {/* Card Container */}
        <div className="bg-[#202940] rounded shadow-2xl relative border border-white/5 pt-16 pb-12 px-12">
          <form onSubmit={handleSubmit} className="space-y-12">

            {/* Row 1: User ID and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {/* User ID */}
              <div>
                <label className="block text-[#bcc0cf] text-[15px] font-normal mb-1">
                  User ID {loading && <Loader2 className="inline w-3 h-3 animate-spin ml-2" />}
                </label>
                <div className="relative pt-3">
                  <select
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    className="w-full bg-white text-black font-bold px-4 py-2 text-[15px] border border-gray-300 rounded-sm appearance-none cursor-pointer outline-none shadow-sm"
                    disabled={loading || submitting}
                  >
                    <option value="" className="font-bold">Select User</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id} className="text-black font-medium">
                        {u.username} : {u.full_name} ({u.role})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-[50%] -translate-y-[10%] pointer-events-none text-black">
                     <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[#bcc0cf] text-[15px] font-normal mb-1">
                  Notes
                </label>
                <div className="pt-3">
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full bg-transparent text-white text-[15px] py-1 border-0 border-b border-[#4f5361] focus:outline-none focus:border-white/40 transition-all opacity-90"
                    placeholder=""
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Funds and Transaction Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {/* Funds */}
              <div>
                <label className="block text-[#bcc0cf] text-[15px] font-normal mb-1">
                  Funds
                </label>
                <div className="pt-3">
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full bg-transparent text-white text-[15px] py-1 border-0 border-b border-[#4f5361] focus:outline-none focus:border-white/40 transition-all opacity-90"
                    placeholder=""
                  />
                </div>
              </div>

              {/* Transaction Password */}
              <div>
                <label className="block text-[#bcc0cf] text-[15px] font-normal mb-1">
                  Transaction Password
                </label>
                <div className="pt-3">
                  <input
                    type="password"
                    name="transactionPassword"
                    value={formData.transactionPassword}
                    onChange={handleChange}
                    disabled={submitting}
                    autoComplete="new-password"
                    className="w-full bg-transparent text-white text-[15px] py-1 border-0 border-b border-[#4f5361] focus:outline-none focus:border-white/40 transition-all opacity-90"
                    placeholder=""
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-8 flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#4caf50] hover:bg-[#43a047] text-white px-10 py-2.5 rounded shadow-[0_4px_10px_0_rgba(76,175,80,0.3)] font-bold text-[14px] uppercase transition-all disabled:opacity-60 active:scale-95"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SAVE'}
              </button>
              <button
                type="button"
                onClick={onBack}
                disabled={submitting}
                className="bg-[#607d8b] hover:bg-[#546e7a] text-white font-bold py-2.5 px-10 rounded shadow-lg uppercase tracking-wider text-[11px] transition-all disabled:opacity-50 active:scale-95"
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFundForm;
