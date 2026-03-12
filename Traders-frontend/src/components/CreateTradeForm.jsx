import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Check, ArrowLeft, Settings, User, Lock, Key } from 'lucide-react';

const InputField = ({ label, type = "text", placeholder, name, value, onChange }) => (
  <div className="flex flex-col gap-1 w-full group">
    <label className="text-[13px] uppercase tracking-tight mb-1" style={{ color: '#bcc0cf' }}>{label}</label>
    <div className="border-b border-white/10 group-focus-within:border-[#4caf50] transition-colors pb-1">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent text-white py-1 outline-none text-[15px] placeholder:text-slate-600 font-normal"
      />
    </div>
  </div>
);

const WhiteSelectField = ({ label, name, options, value, onChange, placeholder }) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-[13px] uppercase tracking-tight mb-2" style={{ color: '#bcc0cf' }}>{label}</label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-white text-slate-800 py-2.5 px-3 pr-10 outline-none text-sm rounded shadow-sm appearance-none font-bold"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  </div>
);

const CreateTradeForm = ({ onSave, onBack, onLogout, onNavigate }) => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [formData, setFormData] = useState({
    scrip: '',
    category: 'Mega',
    userId: '',
    lots: '',
    buyRate: '',
    sellRate: '',
    transactionPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1a2035] z-50 flex flex-col overflow-hidden text-slate-300">
      {/* Top Bar - Green as per screenshot */}
      <div className="bg-[#4caf50] h-14 flex items-center justify-between px-4 shadow-md shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:bg-black/10 px-3 py-1.5 rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[14px] font-bold uppercase tracking-tight">Back</span>
          </button>
        </div>
        <div className="flex items-center gap-4 text-white">
          <button className="hover:bg-black/10 p-1 rounded-full transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* Profile Dropdown Container */}
          <div className="relative" ref={profileRef}>
            <div
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 font-bold uppercase text-[12px] cursor-pointer hover:bg-black/10 px-3 py-1.5 rounded transition-colors tracking-tight select-none"
            >
              <User className="w-4 h-4 text-white/80" />
              DEMO PANNEL
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded shadow-2xl overflow-hidden z-50 border border-gray-100 animate-in fade-in zoom-in duration-200 origin-top-right">
                {/* Ledger Balance Section */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-[#333] text-[14px] font-medium">
                    Ledger-Balance: <span className="font-bold">0</span>
                  </p>
                </div>

                {/* Action Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate('change-password');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-[#333] hover:bg-gray-50 transition-colors text-[13px] font-medium text-left"
                  >
                    <Lock className="w-4 h-4 text-gray-400" />
                    Change Login Password
                  </button>
                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate('change-transaction-password');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-[#333] hover:bg-gray-50 transition-colors text-[13px] font-medium text-left"
                  >
                    <Key className="w-4 h-4 text-gray-400" />
                    Change Transaction Password
                  </button>
                </div>

                {/* Logout Button */}
                <div className="p-3">
                  <button
                    onClick={() => {
                      if (onLogout) onLogout();
                      setShowProfileDropdown(false);
                    }}
                    className="w-full bg-[#f44336] hover:bg-[#d32f2f] text-white py-2.5 rounded text-[13px] font-bold uppercase transition-all shadow-md"
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Placeholder */}
        <div className="w-64 bg-[#1a2035] border-r border-white/5 hidden lg:flex flex-col p-4 space-y-1.5 shrink-0 overflow-y-auto custom-scrollbar">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-widest pb-4 mb-2 border-b border-white/5 px-2">Dashboard</div>
          {[
            { icon: 'fa-table-columns', label: 'DashBoard' },
            { icon: 'fa-chart-line', label: 'Market Watch' },
            { icon: 'fa-bell', label: 'Notifications' },
            { icon: 'fa-list-ul', label: 'Action Ledger' },
            { icon: 'fa-briefcase', label: 'Active Positions' },
            { icon: 'fa-box-archive', label: 'Closed Positions' },
            { icon: 'fa-user-tie', label: 'Trading Clients' },
            { icon: 'fa-arrow-right-arrow-left', label: 'Trades', active: true },
            { icon: 'fa-users-rectangle', label: 'Group Trades' },
            { icon: 'fa-clock-rotate-left', label: 'Closed Trades' },
            { icon: 'fa-trash-can', label: 'Deleted Trades' },
            { icon: 'fa-hourglass-half', label: 'Pending Orders' },
            { icon: 'fa-wallet', label: 'Trader Funds' },
            { icon: 'fa-users', label: 'Users' },
            { icon: 'fa-arrow-up-right-dots', label: 'Tickers' },
            { icon: 'fa-ban', label: 'Banned Limit Orders' },
            { icon: 'fa-building-columns', label: 'Bank Details' },
            { icon: 'fa-address-card', label: 'Accounts' },
            { icon: 'fa-network-wired', label: 'Broker Accounts' },
            { icon: 'fa-key', label: 'Change Login Password' },
            { icon: 'fa-shield-halved', label: 'Change Transaction Password' },
            { icon: 'fa-money-bill-transfer', label: 'Withdrawal Requests' },
            { icon: 'fa-file-invoice-dollar', label: 'Deposit Requests' },
            { icon: 'fa-right-from-bracket', label: 'Log Out' }
          ].map((item) => (
            <div
              key={item.label}
              onClick={onBack}
              className={`text-slate-400 text-[13px] flex items-center justify-between py-2.5 px-3 rounded hover:bg-white/5 cursor-pointer transition-colors ${item.active ? 'bg-[#4caf50] text-white shadow-lg' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className={`fa-solid ${item.icon} text-xs`}></span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.label === 'Market Watch' && <span className="text-[10px] opacity-60" style={{ color: '#bcc0cf' }}>{currentTime}</span>}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8 bg-[#1a2035]">
          <div className="max-w-6xl mx-auto mt-4 mb-6">
            {/* Card Container */}
            <div className="bg-[#202940] rounded shadow-2xl relative border border-white/5 mt-6">
              {/* Floating Header Ribbon */}
              <div
                className="absolute -top-6 left-5 px-6 py-4 rounded shadow-xl z-10"
                style={{ background: 'linear-gradient(60deg, rgb(40, 140, 108), rgb(78, 167, 82))' }}
              >
                <h4 className="text-white text-[16px] font-normal leading-none tracking-tight">Create Trades</h4>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-12 pt-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 px-2 lg:px-4">

                  {/* Left Column */}
                  <div className="space-y-10">
                    <div>
                      <WhiteSelectField
                        label="Scrip"
                        name="scrip"
                        placeholder="Select Scrip"
                        value={formData.scrip}
                        onChange={handleChange}
                        options={[
                          "360ONE FUTURE", "AARTIIND FUTURE", "ABBOTINDIA FUTURE", "ABCAPITAL FUTURE", "ADANIENT FUTURE", "GOLD26APRFUT", "CRUDEOIL20MARFUT"
                        ]}
                      />
                      <div className="mt-4">
                        <WhiteSelectField
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          options={["Mega", "Mini", "Lot"]}
                        />
                      </div>
                    </div>

                    <InputField
                      label="Lots / Units"
                      name="lots"
                      value={formData.lots}
                      onChange={handleChange}
                      placeholder=""
                    />

                    <InputField
                      label="Sell Rate"
                      name="sellRate"
                      value={formData.sellRate}
                      onChange={handleChange}
                      placeholder=""
                    />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-10">
                    <WhiteSelectField
                      label="User ID"
                      name="userId"
                      placeholder="Select User"
                      value={formData.userId}
                      onChange={handleChange}
                      options={[
                        "3761 : demo001", "3705 : demo0174", "4424 : SHRE043"
                      ]}
                    />

                    <InputField
                      label="Buy Rate"
                      name="buyRate"
                      value={formData.buyRate}
                      onChange={handleChange}
                      placeholder=""
                    />

                    <InputField
                      label="Transaction Password"
                      name="transactionPassword"
                      type="password"
                      value={formData.transactionPassword}
                      onChange={handleChange}
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="px-4 mt-12 pb-6">
                  <button
                    type="submit"
                    className="text-white px-10 py-2.5 rounded shadow-lg font-bold text-[13px] uppercase tracking-wider transition-all active:scale-95"
                    style={{ background: 'linear-gradient(60deg, rgb(40, 140, 108), rgb(78, 167, 82))' }}
                  >
                    SAVE
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTradeForm;
