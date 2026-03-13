import React, { useState, useEffect } from 'react';
import { Trash2, ChevronUp, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import * as api from '../../services/api';

const BannedLimitOrdersPage = () => {
  const [view, setView] = useState('list');
  const [selectedItems, setSelectedItems] = useState([]);
  const [bannedItems, setBannedItems] = useState([]);
  const [scrips, setScrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, text: '', type: '' });

  const [formData, setFormData] = useState({
    scripId: '',
    startDate: '',
    startHour: '00',
    startMin: '00',
    endDate: '',
    endHour: '00',
    endMin: '00',
    password: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [banData, scripData] = await Promise.all([
        api.getBannedOrders(),
        api.getScrips()
      ]);
      setBannedItems(banData);
      setScrips(scripData);
    } catch (err) {
      showToast(err.message || 'Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text, type = 'success') => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast({ show: false, text: '', type: '' }), 3000);
  };

  const toggleView = () => {
    if (view === 'add') {
      setFormData({
        scripId: '',
        startDate: '',
        startHour: '00',
        startMin: '00',
        endDate: '',
        endHour: '00',
        endMin: '00',
        password: ''
      });
    }
    setView(view === 'list' ? 'add' : 'list');
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleRemoveFromBan = async () => {
    if (selectedItems.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to remove ${selectedItems.length} items from ban?`)) return;

    setSubmitting(true);
    try {
      await api.deleteBannedOrders(selectedItems);
      showToast('Items removed from ban successfully', 'success');
      setSelectedItems([]);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to remove items', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddBan = async () => {
    if (!formData.scripId || !formData.startDate || !formData.endDate) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const startTime = `${formData.startDate} ${formData.startHour}:${formData.startMin}:00`;
    const endTime = `${formData.endDate} ${formData.endHour}:${formData.endMin}:00`;

    setSubmitting(true);
    try {
      await api.createBannedOrder({
        scripId: formData.scripId,
        startTime,
        endTime
      });
      showToast('Scrip added to ban list', 'success');
      setView('list');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to add ban', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Helper for time options
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const MobileBannedItemCard = ({ item, isSelected, onToggle }) => (
    <div
      onClick={onToggle}
      className={`p-4 rounded-lg border shadow-xl mb-3 cursor-pointer transition-all ${isSelected
        ? 'bg-green-500/10 border-green-500 border-2'
        : 'bg-[#202940] border-white/5 shadow-md'
        }`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-[#01B4EA] font-bold text-sm">#{item.id}</span>
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected
          ? 'bg-[#01B4EA] border-[#01B4EA]'
          : 'bg-transparent border-white/20'
          }`}>
          {isSelected && (
            <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Scrip ID</span>
          <span className="text-white font-bold text-sm">{item.scrip_id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Start Time</span>
          <span className="text-slate-300 text-xs">{new Date(item.start_time).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">End Time</span>
          <span className="text-slate-300 text-xs">{new Date(item.end_time).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  const ListView = () => (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto">
      <div className="bg-[#202940] rounded-lg shadow-2xl p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border border-white/5">
        <p className="text-sm text-slate-400 font-medium">
          Showing <span className="text-[#01B4EA] font-bold">{bannedItems.length}</span> of <span className="text-[#01B4EA] font-bold">{bannedItems.length}</span> items.
          {selectedItems.length > 0 && (
            <span className="ml-2 text-green-600 font-semibold">({selectedItems.length} selected)</span>
          )}
        </p>
        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={toggleView}
            className="border-2 border-[#4CAF50] text-[#4CAF50] font-bold py-2.5 px-8 rounded uppercase tracking-wider text-[11px] flex-1 md:flex-initial hover:bg-[#4CAF50] hover:text-white transition-all bg-transparent"
          >
            ADD TO BAN
          </button>
          <button
            onClick={handleRemoveFromBan}
            disabled={selectedItems.length === 0 || submitting}
            className={`font-bold py-2.5 px-8 rounded uppercase tracking-wider text-[11px] flex-1 md:flex-initial transition-all flex items-center justify-center gap-2 ${selectedItems.length > 0
              ? 'bg-[#4CAF50] text-white cursor-pointer shadow-md'
              : 'bg-[#1a2035] text-slate-500 cursor-not-allowed border border-white/5'
              }`}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>REMOVE FROM BAN {selectedItems.length > 0 && `(${selectedItems.length})`}</>}
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#202940] rounded-lg shadow-2xl overflow-hidden border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-white text-[11px] font-bold border-b border-white/10 uppercase tracking-widest bg-[#1a2035]">
              <th className="px-6 py-6 w-16"></th>
              <th className="px-6 py-6 font-bold">ID ↑</th>
              <th className="px-6 py-6 font-bold">SCRIP ID</th>
              <th className="px-6 py-6 font-bold text-[#01B4EA]">START TIME</th>
              <th className="px-6 py-6 font-bold">END TIME</th>
            </tr>
          </thead>
          <tbody className="text-[11px] text-slate-300">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-[#01B4EA]" />
                    <span className="text-slate-500 tracking-widest uppercase">Loading banned orders...</span>
                  </div>
                </td>
              </tr>
            ) : bannedItems.length > 0 ? (
              bannedItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => toggleItemSelection(item.id)}
                  className={`border-b border-white/5 transition-all cursor-pointer ${selectedItems.includes(item.id)
                    ? 'bg-green-500/10'
                    : 'hover:bg-white/5'
                    }`}
                >
                  <td className="px-6 py-5">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedItems.includes(item.id)
                      ? 'bg-[#01B4EA] border-[#01B4EA]'
                      : 'bg-transparent border-white/20 shadow-sm'
                      }`}>
                      {selectedItems.includes(item.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-white font-medium">{item.id}</td>
                  <td className="px-6 py-5 text-[#00BCD4] uppercase font-bold">{item.scrip_id}</td>
                  <td className="px-6 py-5 text-slate-300 font-medium">{new Date(item.start_time).toLocaleString()}</td>
                  <td className="px-6 py-5 text-slate-300 font-medium">{new Date(item.end_time).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-slate-500 uppercase tracking-widest font-medium">
                  No banned limit orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {bannedItems.length > 0 && (
          <div className="px-6 py-4 bg-[#1a2035]/50 border-t border-white/10">
            <span className="text-[#01B4EA] text-[13px] font-bold">1</span>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {loading ? (
             <div className="flex flex-col items-center gap-2 py-10">
             <Loader2 className="w-8 h-8 animate-spin text-[#01B4EA]" />
             <span className="text-slate-500 tracking-widest uppercase text-xs">Loading...</span>
           </div>
        ) : bannedItems.length > 0 ? (
          bannedItems.map((item) => (
            <MobileBannedItemCard
              key={item.id}
              item={item}
              isSelected={selectedItems.includes(item.id)}
              onToggle={() => toggleItemSelection(item.id)}
            />
          ))
        ) : (
          <div className="text-center text-slate-500 py-8 uppercase tracking-widest text-xs">No banned limit orders found.</div>
        )}
      </div>
    </div>
  );

  const AddFormView = () => (
    <div className="bg-[#202940] rounded-lg border border-white/10 overflow-hidden max-w-4xl mx-auto w-full shadow-2xl">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1a2035]/50">
        <h3 className="text-white font-bold uppercase tracking-wider text-sm flex items-center gap-2">
            <X className="w-4 h-4 text-red-500" />
            Add New Ban
        </h3>
        <button onClick={toggleView} className="text-slate-400 hover:text-white text-xs uppercase font-bold transition-colors">Cancel</button>
      </div>

      <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Start Time</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="bg-transparent border-b border-white/20 focus:border-[#4caf50] text-white p-2 w-full text-sm focus:outline-none transition-colors"
            />
            <div className="flex items-center gap-1">
              <select 
                name="startHour"
                value={formData.startHour}
                onChange={handleInputChange}
                className="bg-[#1a2035] border border-white/10 text-white p-2 rounded text-sm focus:outline-none focus:border-[#4caf50]"
              >
                {hours.map(h => <option key={h}>{h}</option>)}
              </select>
              <span className="text-white font-bold">:</span>
              <select 
                name="startMin"
                value={formData.startMin}
                onChange={handleInputChange}
                className="bg-[#1a2035] border border-white/10 text-white p-2 rounded text-sm focus:outline-none focus:border-[#4caf50]"
              >
                {minutes.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">End Time</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className="bg-transparent border-b border-white/20 focus:border-[#4caf50] text-white p-2 w-full text-sm focus:outline-none transition-colors"
            />
            <div className="flex items-center gap-1">
              <select 
                name="endHour"
                value={formData.endHour}
                onChange={handleInputChange}
                className="bg-[#1a2035] border border-white/10 text-white p-2 rounded text-sm focus:outline-none focus:border-[#4caf50]"
              >
                {hours.map(h => <option key={h}>{h}</option>)}
              </select>
              <span className="text-white font-bold">:</span>
              <select 
                name="endMin"
                value={formData.endMin}
                onChange={handleInputChange}
                className="bg-[#1a2035] border border-white/10 text-white p-2 rounded text-sm focus:outline-none focus:border-[#4caf50]"
              >
                {minutes.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Scrip</label>
          <select 
            name="scripId"
            value={formData.scripId}
            onChange={handleInputChange}
            className="bg-[#1a2035] border border-white/10 text-white p-3 rounded text-sm focus:outline-none focus:border-[#4caf50] w-full"
          >
            <option value="">Select Scrip</option>
            {scrips.map(s => <option key={s.id} value={s.symbol}>{s.symbol}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Password</label>
          <div className="border-b border-white/20 relative">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Transaction Password"
              className="bg-transparent text-white p-2 w-full text-sm focus:outline-none focus:border-[#4caf50] transition-colors placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="md:col-span-2 pt-4">
          <button
            onClick={handleAddBan}
            disabled={submitting}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-12 rounded uppercase tracking-wider text-xs w-full transition-all flex items-center justify-center gap-2 active:scale-[0.99] shadow-lg shadow-green-500/20"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add to Ban'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-[#1a2035] min-h-screen overflow-y-auto relative">
       {/* Toast */}
       {toast.show && (
            <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded shadow-2xl transition-all border animate-in fade-in slide-in-from-top-4 ${
                toast.type === 'success' ? 'bg-[#1b2a21] border-green-500/30 text-green-400' : 'bg-[#2a1b1b] border-red-500/30 text-red-400'
            }`}>
                {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="text-[14px] font-medium tracking-wide">{toast.text}</p>
            </div>
        )}

      {view === 'list' ? <ListView /> : <AddFormView />}
    </div>
  );
};

export default BannedLimitOrdersPage;