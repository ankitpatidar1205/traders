import React, { useState, useEffect } from 'react';
import { Settings, Save, Lock, ArrowLeft, ShieldCheck, Info, Check, ChevronDown } from 'lucide-react';
import * as api from '../../services/api';

const GlobalSettingsPage = ({ onBack, clientId = null, clientName = '' }) => {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState(null);
    const [transactionPassword, setTransactionPassword] = useState('');
    const [toast, setToast] = useState({ message: '', type: 'success' });

    useEffect(() => {
        fetchSettings();
    }, [clientId]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = clientId 
                ? await api.getClientSettings(clientId) 
                : await api.getGlobalSettings();
            
            // Extract nested config if it's client data
            const configData = clientId ? (data?.config || data) : data;

            setSettings(configData || {
                comex: { enabled: true, brokerageType: 'Per Crore', brokerage: 1000, minLots: 0, maxLots: 5, maxLotsPerScrip: 3, maxSize: 10, intradayExposure: 300, holdingExposure: 100, ordersAwayPct: 0 },
                forex: { enabled: true, brokerageType: 'Per Crore', brokerage: 1000, minLots: 0, maxLots: 5, maxLotsPerScrip: 2, maxSize: 10, intradayExposure: 100, holdingExposure: 50, ordersAwayPct: 0 },
                crypto: { enabled: true, brokerageType: 'Per Crore', brokerage: 1000, minLots: 0, maxLots: 5, maxLotsPerScrip: 2, maxSize: 10, intradayExposure: 50, holdingExposure: 20, ordersAwayPct: 0 }
            });
        } catch (err) {
            console.error('Failed to fetch settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!transactionPassword) {
            alert('Please enter Transaction Password');
            return;
        }
        try {
            if (clientId) {
                await api.updateClientSettings(clientId, { config: settings, transactionPassword });
            } else {
                await api.updateGlobalSettings({ ...settings, transactionPassword });
            }
            alert('Settings updated successfully!');
        } catch (err) {
            alert('Update failed: ' + err.message);
        }
    };

    if (loading) return <div className="text-white p-10">Loading...</div>;

    const ConfigSection = ({ title, type, data, onChange }) => (
        <div className="mb-16">
            <p className="text-[#f44336] text-[12px] mb-1 italic font-medium opacity-90">{title.split(' ')[0]} Config not set yet</p>
            <h3 className="text-white text-[24px] font-bold mb-8">{title}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-10">
                {/* Left Column */}
                <div className="space-y-10">
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center">
                            <input 
                                type="checkbox" 
                                checked={data.enabled} 
                                onChange={e => onChange(type, 'enabled', e.target.checked)}
                                className="appearance-none w-[18px] h-[18px] border border-white/30 rounded-[2px] bg-transparent checked:bg-blue-600 transition-all cursor-pointer"
                            />
                            {data.enabled && <Check className="absolute w-3.5 h-3.5 text-white pointer-events-none stroke-[3]" />}
                        </div>
                        <span className="text-[#bcc0cf] text-[14px] font-normal">{type.charAt(0).toUpperCase() + type.slice(1)} Trading</span>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[14px] text-[#bcc0cf] font-normal block">{type.charAt(0).toUpperCase() + type.slice(1)} brokerage</label>
                        <input 
                            type="number" 
                            value={data.brokerage} 
                            onChange={e => onChange(type, 'brokerage', e.target.value)}
                            className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-white text-[16px] font-bold focus:outline-none focus:border-white/40 transition-colors"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[14px] text-[#bcc0cf] font-normal block">Maximum lots allowed per single trade of {type}</label>
                        <input 
                            type="number" 
                            value={data.maxLots} 
                            onChange={e => onChange(type, 'maxLots', e.target.value)}
                            className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-white text-[16px] font-bold focus:outline-none focus:border-white/40 transition-colors"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[14px] text-[#bcc0cf] font-normal block">Max Size All {type}</label>
                        <input 
                            type="number" 
                            value={data.maxSize} 
                            onChange={e => onChange(type, 'maxSize', e.target.value)}
                            className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-white text-[16px] font-bold focus:outline-none focus:border-white/40 transition-colors"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[14px] text-[#bcc0cf] font-normal block">Holding Exposure/Margin {type}</label>
                        <input 
                            type="number" 
                            value={data.holdingExposure} 
                            onChange={e => onChange(type, 'holdingExposure', e.target.value)}
                            className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-white text-[16px] font-bold focus:outline-none focus:border-white/40 transition-colors"
                        />
                        <p className="text-[12px] text-[#888c9b] mt-3 leading-relaxed font-normal">
                            Holding Exposure auto calculates the margin money required to hold a position overnight for the next market working day. Calculation : turnover of a trade divided by Exposure is required margin. eg. if gold having lot size of 100 is trading @ 45000 and holding exposure is 800, (45000 X 100) / 80 = 56250 is required to hold position overnight. System automatically checks at a given time around market closure to check and close all trades if margin(M2M) insufficient.
                        </p>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-10">
                    <div className="space-y-1 relative">
                        <label className="text-[14px] text-[#bcc0cf] font-normal block">{type.charAt(0).toUpperCase() + type.slice(1)} brokerage type</label>
                        <div className="relative border-b border-white/20">
                            <select 
                                value={data.brokerageType} 
                                onChange={e => onChange(type, 'brokerageType', e.target.value)}
                                className="w-full bg-transparent px-0 py-2 text-white text-[16px] font-bold focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="Per Crore" className="bg-[#1a2035]">Per Crore</option>
                                <option value="Per Lot" className="bg-[#1a2035]">Per Lot</option>
                            </select>
                            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[14px] text-[#bcc0cf] font-normal block">Minimum lots required per single trade of {type}</label>
                        <input 
                            type="number" 
                            value={data.minLots} 
                            onChange={e => onChange(type, 'minLots', e.target.value)}
                            className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-white text-[16px] font-bold focus:outline-none focus:border-white/40 transition-colors"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[14px] text-[#bcc0cf] font-normal block">Maximum lots allowed per scrip of {type} to be actively open at a time</label>
                        <input 
                            type="number" 
                            value={data.maxLotsPerScrip} 
                            onChange={e => onChange(type, 'maxLotsPerScrip', e.target.value)}
                            className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-white text-[16px] font-bold focus:outline-none focus:border-white/40 transition-colors"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[14px] text-[#bcc0cf] font-normal block">Intraday Exposure/Margin {type}</label>
                        <input 
                            type="number" 
                            value={data.intradayExposure} 
                            onChange={e => onChange(type, 'intradayExposure', e.target.value)}
                            className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-white text-[16px] font-bold focus:outline-none focus:border-white/40 transition-colors"
                        />
                        <p className="text-[12px] text-[#888c9b] mt-3 leading-relaxed font-normal">
                            Exposure auto calculates the margin money required for any new trade entry. Calculation : turnover of a trade devided by Exposure is required margin. eg. if gold having lotsize of 100 is trading @ 45000 and exposure is 200, (45000 X 100) / 200 = 22500 is required to initiate the trade.
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[14px] text-[#bcc0cf] font-normal block">Orders to be away by % from current price {type}</label>
                        <input 
                            type="number" 
                            value={data.ordersAwayPct} 
                            onChange={e => onChange(type, 'ordersAwayPct', e.target.value)}
                            className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-white text-[16px] font-bold focus:outline-none focus:border-white/40 transition-colors"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const updateField = (type, field, value) => {
        setSettings(prev => ({
            ...prev,
            [type]: { ...prev[type], [field]: value }
        }));
    };

    return (
        <div className="min-h-screen bg-[#1a2035] p-10 pb-32 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h2 className="text-3xl font-bold text-white tracking-tight uppercase">
                            {clientId ? `Settings: ${clientName}` : 'Global Settings'}
                        </h2>
                    </div>
                    <button className="bg-[#4caf50] hover:bg-[#43a047] text-white px-8 py-3 rounded font-bold text-sm shadow-xl transition-all shadow-green-500/20 uppercase tracking-widest">
                        Set Margins
                    </button>
                </div>

                <div className="space-y-16">
                    <ConfigSection title="Comex Config:" type="comex" data={settings.comex} onChange={updateField} />
                    <ConfigSection title="Forex Config:" type="forex" data={settings.forex} onChange={updateField} />
                    <ConfigSection title="Crypto Config:" type="crypto" data={settings.crypto} onChange={updateField} />
                </div>

                <div className="mt-16 pt-16 border-t border-white/10">
                    <div className="max-w-md">
                        <label className="text-[13px] text-slate-300 font-medium mb-3 block">Transaction Password</label>
                        <div className="relative">
                            <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                type="password" 
                                value={transactionPassword}
                                onChange={e => setTransactionPassword(e.target.value)}
                                className="w-full bg-transparent border-b border-white/20 pl-7 pr-0 py-2 text-white text-lg font-bold focus:outline-none focus:border-green-500 transition-colors"
                                placeholder="Enter Password"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex justify-start">
                    <button 
                        onClick={handleSave}
                        className="bg-[#4caf50] hover:bg-[#43a047] text-white px-12 py-3 rounded font-bold text-sm shadow-2xl transition-all shadow-green-500/20 uppercase tracking-widest flex items-center gap-3"
                    >
                        <Save className="w-5 h-5" /> SAVE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GlobalSettingsPage;
