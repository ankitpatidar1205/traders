import React, { useState, useEffect } from 'react';
import { Search, Monitor, X, Check, MoreVertical } from 'lucide-react';
import { useMarket } from '../../context/MarketContext';

const MarketWatchPage = () => {
    const { prices, watchlist, connected } = useMarket();
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedScrips, setSelectedScrips] = useState([]);
    const [bannedScrips, setBannedScrips] = useState([]); // Track banned scrips
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    const [scrips, setScrips] = useState([]);

    useEffect(() => {
        if (watchlist && watchlist.length > 0) {
            setScrips(watchlist.map(s => ({
                id: s.id,
                name: s.symbol,
                symbol: s.symbol,
                expiry: s.expiry || 'N/A',
                bid: s.bid || '0.00',
                ask: s.ask || '0.00',
                ltp: s.ltp || '0.00',
                change: s.change || '0.00',
                high: s.high || '0.00',
                low: s.low || '0.00',
                time: s.time || new Date().toLocaleTimeString()
            })));
        } else {
            // Keep dummy scrips if watchlist is empty for now, but in production we want it dynamic
            setScrips([
                { id: '1', name: 'ALUMINIUM26FEBFUT', symbol: 'ALUMINIUM26FEBFUT', expiry: '2026-02-27', bid: '309.35', ask: '309.7', ltp: '309.35', change: '0.65', high: '311.2', low: '304', time: '11:10:18' },
                { id: '2', name: 'COPPER26FEBFUT', symbol: 'COPPER26FEBFUT', expiry: '2026-02-27', bid: '1211.5', ask: '1211.75', ltp: '1211.5', change: '-0.1', high: '1225.4', low: '1181.85' },
            ]);
        }
    }, [watchlist]);

    const [successMessage, setSuccessMessage] = useState('');

    const toggleScripSelection = (id) => {
        setSelectedScrips(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSearchCheck = (e) => {
        setSearchTerm(e.target.value);
        setShowSuggestions(true);
    };

    const toggleBanStatus = (id) => {
        setBannedScrips(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
        setSuccessMessage(
            bannedScrips.includes(id)
                ? 'Scrip removed from ban list'
                : 'Scrip added to ban list'
        );
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const filteredScrips = scrips.filter(scrip =>
        scrip.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Mobile Card Component - Updated to Black Theme
    const MobileScripCard = ({ scrip, isSelected, onToggle, isBanned, onToggleBan }) => {
        const livePrice = prices[scrip.symbol] || scrip.ltp;
        return (
            <div className={`bg-black p-4 border-b border-white/5 shadow-md`}>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-4">
                        <div
                            onClick={() => onToggle(scrip.id)}
                            className={`w-6 h-6 rounded-sm cursor-pointer flex items-center justify-center transition-colors border border-slate-600 ${isSelected ? 'bg-[#01B4EA] border-[#01B4EA]' : 'bg-white'}`}
                        >
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm uppercase tracking-tight">{scrip.name}</h3>
                            <p className="text-[12px] text-slate-500">{scrip.expiry}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-6 gap-2 text-center items-center">
                    <span className="text-[#ff3b30] font-bold text-xs">{scrip.bid}</span>
                    <span className="text-[#ff3b30] font-bold text-xs">{scrip.ask}</span>
                    <span className="text-white font-bold text-xs">{livePrice}</span>
                    <span className={`font-bold text-xs ${parseFloat(scrip.change) >= 0 ? 'text-[#4caf50]' : 'text-[#ff3b30]'}`}>{scrip.change}</span>
                    <span className="text-white font-bold text-xs text-opacity-80">{scrip.high}</span>
                    <span className="text-white font-bold text-xs text-opacity-80">{scrip.low}</span>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => onToggleBan(scrip.id)}
                        className={`font-bold text-xs uppercase px-4 py-1.5 rounded shadow transition-all active:scale-95 text-white ${isBanned
                            ? 'bg-[#5cb85c]'
                            : 'bg-[#f44336]'
                            }`}
                    >
                        {isBanned ? 'REMOVE BAN' : 'ADD TO BAN'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#1a2035] overflow-hidden relative">
            <div className="flex-1 pb-24 px-6 pt-6">
                {/* Header / Search Area */}
                {/* Offset Header */}
                <div className="relative mb-12">
                    <div
                        className="absolute -top-6 left-0 right-0 rounded-md shadow-[0_4px_20px_0_rgba(0,0,0,0.14),0_7px_10px_-5px_rgba(76,175,80,0.4)] px-6 py-5 z-10"
                        style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
                    >
                        <h2 className="text-white text-xl font-bold tracking-tight">Market Watch</h2>
                    </div>
                </div>

                <div className="mt-16">
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none">
                        {successMessage && (
                            <div className="bg-slate-800/90 text-white px-6 py-2 rounded-full shadow-2xl border border-white/10 backdrop-blur-md animate-bounce text-xs font-bold uppercase tracking-wider">
                                {successMessage}
                            </div>
                        )}
                    </div>

                    <div className="relative max-w-[200px] mb-4">
                        <input
                            type="text"
                            placeholder="search"
                            value={searchTerm}
                            onChange={handleSearchCheck}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-sm text-sm focus:outline-none shadow-sm"
                        />
                        {showSuggestions && filteredScrips.length > 0 && searchTerm && (
                            <div className="absolute top-full left-0 w-full bg-white text-slate-900 shadow-xl rounded-b-md z-50 py-1 max-h-60 overflow-y-auto">
                                {filteredScrips.slice(0, 10).map((s) => (
                                    <div 
                                        key={s.id} 
                                        onClick={() => setSearchTerm(s.name)}
                                        className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-xs font-medium border-b border-slate-100 last:border-0 text-slate-700"
                                    >
                                        {s.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
                        Market: <span className={connected ? "text-green-400" : "text-red-400"}>{connected ? 'Connected' : 'Disconnected'}</span>
                    </h1>
                </div>

                {/* Desktop Table View - Updated to Black Theme as per screenshot */}
                <div className="hidden md:block">
                    <div className="bg-black overflow-hidden shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[#8a8d9b] text-sm font-semibold bg-transparent">
                                    <th className="py-4 w-16 text-center"></th>
                                    <th className="py-4 px-4 min-w-[200px]">Scrip</th>
                                    <th className="py-4 text-center">Bid</th>
                                    <th className="py-4 text-center">Ask</th>
                                    <th className="py-4 text-center">Ltp</th>
                                    <th className="py-4 text-center">Change</th>
                                    <th className="py-4 text-center">High</th>
                                    <th className="py-4 text-center">Low</th>
                                    <th className="py-4 text-right px-6"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredScrips.map((scrip) => (
                                    <tr key={scrip.id} className="bg-black border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <td className="py-4 text-center">
                                            <div
                                                onClick={() => toggleScripSelection(scrip.id)}
                                                className={`w-6 h-6 rounded-sm cursor-pointer flex items-center justify-center transition-colors mx-auto ${selectedScrips.includes(scrip.id) ? 'bg-[#01B4EA]' : 'bg-white'}`}
                                            >
                                                {selectedScrips.includes(scrip.id) && <Check className="w-4 h-4 text-white" />}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex flex-col">
                                                <span className="text-white text-[14px] font-bold tracking-tight uppercase">{scrip.name}</span>
                                                <span className="text-[10px] text-slate-500 font-medium tracking-wide">{scrip.expiry}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-center text-[#ff3b30] text-[15px] font-bold">{scrip.bid}</td>
                                        <td className="py-4 text-center text-[#ff3b30] text-[15px] font-bold">{scrip.ask}</td>
                                        <td className="py-4 text-center text-white text-[15px] font-bold">{prices[scrip.symbol] || scrip.ltp}</td>
                                        <td className={`py-4 text-center text-[15px] font-bold ${parseFloat(scrip.change) >= 0 ? 'text-[#4caf50]' : 'text-[#ff3b30]'}`}>
                                            {scrip.change}
                                        </td>
                                        <td className="py-4 text-center text-white text-[15px] font-bold">{scrip.high}</td>
                                        <td className="py-4 text-center text-white text-[15px] font-bold">{scrip.low}</td>
                                        <td className="py-4 text-right px-6">
                                            <button
                                                onClick={() => toggleBanStatus(scrip.id)}
                                                className={`text-white font-bold text-[11px] py-1.5 px-4 rounded transition-all uppercase whitespace-nowrap active:scale-95 shadow-md ${bannedScrips.includes(scrip.id)
                                                    ? 'bg-[#5cb85c]'
                                                    : 'bg-[#f44336]'
                                                    }`}
                                            >
                                                {bannedScrips.includes(scrip.id) ? 'REMOVE BAN' : 'ADD TO BAN'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card List View - Updated to Black Theme */}
                <div className="md:hidden space-y-0">
                    {filteredScrips.map((scrip) => (
                        <MobileScripCard
                            key={scrip.id}
                            scrip={scrip}
                            isSelected={selectedScrips.includes(scrip.id)}
                            onToggle={toggleScripSelection}
                            isBanned={bannedScrips.includes(scrip.id)}
                            onToggleBan={toggleBanStatus}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Floating Action Bar - Updated to White Theme as per screenshot */}
            <div className="absolute bottom-0 left-0 right-0 bg-white p-4 z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
                <div className="flex gap-4 justify-start">
                    <button
                        onClick={() => {
                            if (selectedScrips.length === 0) {
                                setSuccessMessage('Please select scrips to ban');
                                setTimeout(() => setSuccessMessage(''), 3000);
                                return;
                            }
                            setBannedScrips(prev => [...new Set([...prev, ...selectedScrips])]);
                            setSuccessMessage(`${selectedScrips.length} Scrip(s) added to ban list`);
                            setSelectedScrips([]);
                            setTimeout(() => setSuccessMessage(''), 3000);
                        }}
                        className="bg-[#9c27b0] hover:bg-[#8e24aa] text-white font-bold py-2.5 px-6 rounded-md shadow-md transition-all uppercase text-sm tracking-wide active:scale-95"
                    >
                        ADD TO BAN
                    </button>
                    <button
                        onClick={() => {
                            if (selectedScrips.length === 0) {
                                setSuccessMessage('Please select scrips to remove from ban');
                                setTimeout(() => setSuccessMessage(''), 3000);
                                return;
                            }
                            setBannedScrips(prev => prev.filter(id => !selectedScrips.includes(id)));
                            setSuccessMessage(`${selectedScrips.length} Scrip(s) removed from ban list`);
                            setSelectedScrips([]);
                            setTimeout(() => setSuccessMessage(''), 3000);
                        }}
                        className="bg-[#9c27b0] hover:bg-[#8e24aa] text-white font-bold py-2.5 px-6 rounded-md shadow-md transition-all uppercase text-sm tracking-wide active:scale-95"
                    >
                        REMOVE FROM BAN
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarketWatchPage;
