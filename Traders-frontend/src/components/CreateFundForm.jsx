import React, { useState } from 'react';

const CreateFundForm = ({ onSave, onBack, mode = 'deposit', initialUser }) => {
  const isWithdraw = mode === 'withdraw';

  const [formData, setFormData] = useState({
    userId: initialUser?.id || '',
    notes: '',
    amount: '',
    transactionPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, mode });
  };

  return (
    <div className="min-h-screen bg-[#1a2035]  font-sans">
      <div className="max-w-6xl mx-auto">

        {/* Floating Card Header (3D Ribbon Style) */}
        <div className="relative z-20 -mb-8 ml-4 flex flex-col items-start">
          <div
            className="px-6 py-4 rounded-md shadow-xl relative z-10"
            style={{ background: 'linear-gradient(60deg, rgb(40, 140, 108), rgb(78, 167, 82))' }}
          >
            <h4 className="text-white text-base font-normal leading-none tracking-tight uppercase tracking-wider">
              Add/Withdraw Funds
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
                  User ID
                </label>
                <div className="relative">
                  <select
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    className="w-full bg-white text-slate-900 px-4 py-2.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Select User</option>
                    <option value="3705377">3705377 : Demo0174 (Demo ji)</option>
                    <option value="5643097">5643097 : New User</option>
                    <option value="SHRE001">SHRE001 : User One</option>
                    <option value="SHRE002">SHRE002 : User Two</option>
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
                  className="w-full bg-transparent text-white text-sm py-2 px-0 border-0 border-b border-[#4a5568] focus:outline-none focus:border-[#4CAF50] transition-colors resize-none"
                  style={{ lineHeight: '1.5' }}
                ></textarea>
              </div>
            </div>

            {/* Row 2: Funds and Transaction Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {/* Funds */}
              <div>
                <label className="block text-[#adb5bd] text-xs uppercase tracking-wider mb-3 font-medium">
                  Funds
                </label>
                <input
                  type="text"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full bg-transparent text-white text-sm py-2 px-0 border-0 border-b border-[#4a5568] focus:outline-none focus:border-[#4CAF50] transition-colors"
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
                  autoComplete="new-password"
                  className="w-full bg-transparent text-white text-sm py-2 px-0 border-0 border-b border-[#4a5568] focus:outline-none focus:border-[#4CAF50] transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 flex justify-start items-center">
              <button
                type="submit"
                className="bg-[#4CAF50] hover:bg-[#43A047] text-white font-bold py-2.5 px-8 rounded shadow-lg uppercase tracking-wider text-[11px] transition-all"
              >
                SAVE
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFundForm;
