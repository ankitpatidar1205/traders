import React, { useState } from 'react';
import { X } from 'lucide-react';

const DeleteClientPage = ({ client, onClose, onDeleteConfirm }) => {
    const [transactionPassword, setTransactionPassword] = useState('');

    const clientName = client?.fullName || 'Demo ji';
    const clientUsername = client?.username || 'Demo0174';
    const clientId = client?.id || '3705377';

    const handleDelete = (e) => {
        e.preventDefault();
        if (onDeleteConfirm) {
            onDeleteConfirm(transactionPassword);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#1a2035] z-50 flex flex-col overflow-hidden text-slate-300">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #1a2035; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4CAF50; border-radius: 4px; }
            `}</style>

            {/* Top Bar */}
            <div className="bg-[#4caf50] h-14 flex items-center justify-between px-6 shadow-md shrink-0">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-white font-bold uppercase text-sm hover:bg-black/10 px-3 py-1.5 rounded transition-colors"
                >
                    <span className="fa-solid fa-arrow-left text-base"></span>
                    <span>Back</span>
                </button>
                <div className="flex items-center gap-4 text-white font-bold uppercase text-sm">
                    <button onClick={onClose} className="hover:bg-black/10 p-2 rounded-full transition-colors">
                        <span className="fa-solid fa-xmark w-5 h-5 flex items-center justify-center font-bold"></span>
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-black/10 px-3 py-1.5 rounded transition-colors">
                        <span className="bg-white/20 p-1 rounded-full text-xs">
                            <span className="fa-solid fa-save"></span>
                        </span>
                        Demo pannel
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 bg-[#1a2035] border-r border-white/5 hidden lg:flex flex-col p-4 space-y-2 shrink-0 overflow-y-auto custom-scrollbar">
                    <div className="logo py-4 border-b border-white/10 mb-4 px-2">
                        <span className="text-white font-bold text-lg tracking-wider">DASHBOARD</span>
                    </div>
                    {[
                        { icon: 'fa-table-columns', label: 'DashBoard' },
                        { icon: 'fa-arrow-trend-up', label: 'Market Watch' },
                        { icon: 'fa-bell', label: 'Notifications' },
                        { icon: 'fa-podcast', label: 'Action Ledger' },
                        { icon: 'fa-certificate', label: 'Active Positions' },
                        { icon: 'fa-certificate', label: 'Closed Positions' },
                        { icon: 'fa-regular fa-face-flushed', label: 'Trading Clients' },
                        { icon: 'fa-tag', label: 'Trades' },
                        { icon: 'fa-tag', label: 'Group Trades' },
                        { icon: 'fa-tag', label: 'Closed Trades' },
                        { icon: 'fa-tag', label: 'Deleted Trades' },
                        { icon: 'fa-swatchbook', label: 'Pending Orders' },
                        { icon: 'fa-circle-dollar-to-slot', label: 'Trader Funds' },
                        { icon: 'fa-user-group', label: 'Users' },
                        { icon: 'fa-calculator', label: 'Tickers' },
                        { icon: 'fa-calculator', label: 'Banned Limit Orders' },
                        { icon: 'fa-calculator', label: 'Bank Details' },
                        { icon: 'fa-calculator', label: 'Bank Details for new clients' },
                        { icon: 'fa-calculator', label: 'Accounts' },
                        { icon: 'fa-calculator', label: 'Broker Accounts' },
                        { icon: 'fa-user', label: 'Change Login Password' },
                        { icon: 'fa-gear', label: 'Change Transaction Password' },
                        { icon: 'fa-gear', label: 'Withdrawal Requests' },
                        { icon: 'fa-gear', label: 'Deposit Requests' },
                        { icon: 'fa-bell', label: 'Negative Balance Txns' },
                        { icon: 'fa-sign-out-alt', label: 'Log Out' }
                    ].map((item) => (
                        <div key={item.label} className={`text-slate-400 text-[13px] flex items-center gap-3 py-2.5 px-4 rounded hover:bg-white/5 cursor-pointer transition-colors ${item.label === 'Trading Clients' ? 'bg-[#4caf50] text-white shadow-lg' : ''}`}>
                            <div className="w-5 h-5 flex items-center justify-center opacity-80 text-sm">
                                <span className={`${item.icon.includes('fa-') ? item.icon : 'fa-solid ' + item.icon}`}></span>
                            </div>
                            <span className="truncate tracking-wide">{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 bg-[#1a2035]">
                    <div className="max-w-4xl mx-auto mt-12">
                        <div className="flex justify-end mb-4">
                            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Box Header Badge */}
                        <div className="relative z-20 mb-[-1.5rem] ml-4 inline-block">
                            <div className="px-6 py-4 rounded-md shadow-2xl" style={{ background: 'linear-gradient(60deg, #66bb6a, #43a047)' }}>
                                <h4 className="text-white text-lg font-bold m-0 tracking-tight">
                                    Delete Trading Client
                                </h4>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="bg-[#202940] rounded-lg shadow-[0_4px_20px_0_rgba(0,0,0,.5)] p-5 pt-12">
                            <div className="p-2">
                                <p className="text-[#eeeeee] text-[15px] font-normal leading-relaxed mb-10">
                                    You are about to delete trading client {clientName} {clientUsername} ({clientId}). Please Note, once deleted, you will not be able to recover this account. Enter Transaction Password to continue.
                                </p>

                                <form onSubmit={handleDelete} className="mt-6">
                                    <div className="flex flex-col md:flex-row items-end gap-x-8 gap-y-10 w-full mb-10">
                                        <div className="flex-1 group relative w-full md:w-auto">
                                            <label className="block text-sm mb-4 font-light text-[#bcc0cf] transition-colors group-focus-within:text-[#4caf50]">
                                                Transaction Password
                                            </label>
                                            <input
                                                type="password"
                                                value={transactionPassword}
                                                onChange={(e) => setTransactionPassword(e.target.value)}
                                                className="w-full bg-transparent border-b border-[#555] py-2 text-white focus:outline-none focus:border-[#4caf50] transition-all text-sm"
                                                placeholder=""
                                            />
                                        </div>

                                        <div className="pb-1">
                                            <button
                                                type="submit"
                                                className="px-8 py-2.5 rounded text-white font-bold text-[11px] uppercase tracking-widest transition-all shadow-md hover:shadow-lg active:scale-95"
                                                style={{ background: 'linear-gradient(60deg, #66bb6a, #43a047)' }}
                                            >
                                                DELETE ACCOUNT
                                            </button>
                                        </div>
                                    </div>
                                    <div className="h-[1px] w-full bg-white/5 mt-10 rounded-full"></div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteClientPage;
