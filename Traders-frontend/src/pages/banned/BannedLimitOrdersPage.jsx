import React, { useState } from 'react';
import { Trash2, ChevronUp } from 'lucide-react';

const BannedLimitOrdersPage = () => {
  const [view, setView] = useState('list');
  const [selectedItems, setSelectedItems] = useState([]);
  const [bannedItems, setBannedItems] = useState([
    { id: 35, scripId: 'CUB24DECFUT', startTime: '2024-12-16 17:16:00', endTime: '2024-12-16 17:17:00' },
    { id: 36, scripId: 'GOLD24JANFUT', startTime: '2024-12-17 09:00:00', endTime: '2024-12-17 10:00:00' },
    { id: 37, scripId: 'SILVER24FEBFUT', startTime: '2024-12-18 11:30:00', endTime: '2024-12-18 12:30:00' },
    { id: 38, scripId: 'CRUDE24MARFUT', startTime: '2024-12-19 14:00:00', endTime: '2024-12-19 15:00:00' }
  ]);

  const toggleView = () => setView(view === 'list' ? 'add' : 'list');

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleRemoveFromBan = () => {
    if (selectedItems.length > 0) {
      const count = selectedItems.length;
      setBannedItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);

      // Success notification
      alert(`Successfully removed ${count} item${count > 1 ? 's' : ''} from ban list!`);
    }
  };

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
          <span className="text-white font-bold text-sm">{item.scripId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Start Time</span>
          <span className="text-slate-300 text-xs">{item.startTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">End Time</span>
          <span className="text-slate-300 text-xs">{item.endTime}</span>
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
            disabled={selectedItems.length === 0}
            className={`font-bold py-2.5 px-8 rounded uppercase tracking-wider text-[11px] flex-1 md:flex-initial transition-all ${selectedItems.length > 0
              ? 'bg-[#4CAF50] text-white cursor-pointer shadow-md'
              : 'bg-[#1a2035] text-slate-500 cursor-not-allowed border border-white/5'
              }`}
          >
            REMOVE FROM BAN {selectedItems.length > 0 && `(${selectedItems.length})`}
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#202940] rounded-lg shadow-2xl overflow-hidden border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-white text-[11px] font-bold border-b border-white/10 uppercase tracking-widest bg-[#1a2035]">
              <th className="px-6 py-6 w-16"></th>
              <th className="px-6 py-6">
                <div className="flex items-center gap-1 cursor-pointer">
                  ID <ChevronUp className="w-3 h-3 text-[#01B4EA]" />
                </div>
              </th>
              <th className="px-6 py-6">SCRIP ID</th>
              <th className="px-6 py-6 text-[#01B4EA]">START TIME</th>
              <th className="px-6 py-6">END TIME</th>
            </tr>
          </thead>
          <tbody className="text-[11px] text-slate-700">
            {bannedItems.map((item) => (
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
                <td className="px-6 py-5 text-slate-300 uppercase">{item.scripId}</td>
                <td className="px-6 py-5 text-slate-300">{item.startTime}</td>
                <td className="px-6 py-5 text-slate-300">{item.endTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 bg-[#1a2035]/50 border-t border-white/10">
          <span className="text-[#01B4EA] text-[13px] font-bold">1</span>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {bannedItems.map((item) => (
          <MobileBannedItemCard
            key={item.id}
            item={item}
            isSelected={selectedItems.includes(item.id)}
            onToggle={() => toggleItemSelection(item.id)}
          />
        ))}
        {bannedItems.length === 0 && (
          <div className="text-center text-slate-500 py-8">No banned limit orders found.</div>
        )}
      </div>
    </div>
  );

  const AddFormView = () => (
    <div className="bg-[#202940] rounded-lg border border-white/10 overflow-hidden max-w-4xl mx-auto w-full shadow-2xl">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1a2035]/50">
        <h3 className="text-white font-bold uppercase tracking-wider text-sm">Add New Ban</h3>
        <button onClick={toggleView} className="text-slate-400 hover:text-white text-xs uppercase font-bold transition-colors">Cancel</button>
      </div>

      <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Start Time</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Start Date"
              className="bg-transparent border-b border-white/20 focus:border-[#4caf50] text-white p-2 w-full text-sm focus:outline-none transition-colors"
            />
            <div className="flex items-center gap-1">
              <select className="bg-[#1a2035] border border-white/10 text-white p-2 rounded text-sm focus:outline-none focus:border-[#4caf50]">
                <option>00</option>
              </select>
              <span className="text-white font-bold">:</span>
              <select className="bg-[#1a2035] border border-white/10 text-white p-2 rounded text-sm focus:outline-none focus:border-[#4caf50]">
                <option>00</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">End Time</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="End Date"
              className="bg-transparent border-b border-white/20 focus:border-[#4caf50] text-white p-2 w-full text-sm focus:outline-none transition-colors"
            />
            <div className="flex items-center gap-1">
              <select className="bg-[#1a2035] border border-white/10 text-white p-2 rounded text-sm focus:outline-none focus:border-[#4caf50]">
                <option>00</option>
              </select>
              <span className="text-white font-bold">:</span>
              <select className="bg-[#1a2035] border border-white/10 text-white p-2 rounded text-sm focus:outline-none focus:border-[#4caf50]">
                <option>00</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Scrip</label>
          <select className="bg-[#1a2035] border border-white/10 text-white p-3 rounded text-sm focus:outline-none focus:border-[#4caf50] w-full">
            <option>Select Scrip</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Password</label>
          <div className="border-b border-white/20 relative">
            <input
              type="password"
              placeholder="Transaction Password"
              className="bg-transparent text-white p-2 w-full text-sm focus:outline-none focus:border-[#4caf50] transition-colors placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="md:col-span-2 pt-4">
          <button
            onClick={toggleView}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-12 rounded uppercase tracking-wider text-xs w-full transition-all"
          >
            Add to Ban
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-[#1a2035] h-full overflow-y-auto">
      {view === 'list' ? <ListView /> : <AddFormView />}
    </div>
  );
};

export default BannedLimitOrdersPage;