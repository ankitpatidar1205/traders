import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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
      setUsers(data);
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
        <div className="relative z-20 -mb-8 ml-4 flex flex-col items-start">
          <div
            className="px-6 py-4 rounded-md shadow-xl relative z-10"
            style={{ background: 'linear-gradient(60deg, rgb(40, 140, 108), rgb(78, 167, 82))' }}
          >
            <h4 className="text-white text-base font-normal leading-none tracking-tight uppercase tracking-wider">
              {isWithdraw ? 'Withdraw Funds' : 'Add Funds'}
            </h4>
          </div>
          {/* The 3D fold decorator */}
          <div className="w-4 h-4 bg-[#2e7d32] -mt-2 ml-2 rounded-sm rotate-45 relative z-0 shadow-lg"></div>
        </div>

        {/* Card Container */}
        <div className="bg-[#202940] rounded shadow-2xl relative border border-white/5 pt-16 pb-8 px-8">
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* Row 1: User ID and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {/* User ID */}
              <div>
                <label className="block text-[#adb5bd] text-xs uppercase tracking-wider mb-3 font-medium">
                  User ID {loading && <Loader2 className="inline w-3 h-3 animate-spin ml-2" />}
                </label>
                <div className="relative">
                  <select
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    className="w-full bg-white text-slate-900 px-4 py-2.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] appearance-none cursor-pointer disabled:opacity-50"
                    disabled={loading || submitting}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Select User</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.username} : {u.full_name} ({u.role})
                        {u.balance !== undefined ? ` - Bal: $${u.balance}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[#adb5bd] text-xs uppercase tracking-wider mb-3 font-medium">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="1"
                  disabled={submitting}
                  className="w-full bg-transparent text-white text-sm py-2 px-0 border-0 border-b border-[#4a5568] focus:outline-none focus:border-[#4CAF50] transition-colors resize-none disabled:opacity-50"
                  style={{ lineHeight: '1.5' }}
                ></textarea>
              </div>
            </div>

            {/* Row 2: Funds and Transaction Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {/* Funds */}
              <div>
                <label className="block text-[#adb5bd] text-xs uppercase tracking-wider mb-3 font-medium">
                  Funds (Amount)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="0.00"
                  className="w-full bg-transparent text-white text-sm py-2 px-0 border-0 border-b border-[#4a5568] focus:outline-none focus:border-[#4CAF50] transition-colors disabled:opacity-50"
                />
              </div>

              {/* Transaction Password */}
              <div>
                <label className="block text-[#adb5bd] text-xs uppercase tracking-wider mb-3 font-medium">
                  Transaction Password
                </label>
                <input
                  type="password"
                  name="transactionPassword"
                  value={formData.transactionPassword}
                  onChange={handleChange}
                  disabled={submitting}
                  autoComplete="new-password"
                  placeholder="******"
                  className="w-full bg-transparent text-white text-sm py-2 px-0 border-0 border-b border-[#4a5568] focus:outline-none focus:border-[#4CAF50] transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#4CAF50] hover:bg-[#43A047] text-white font-bold py-2.5 px-10 rounded shadow-lg uppercase tracking-wider text-[11px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SAVE'}
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
