import React, { useState } from 'react';
import { X } from 'lucide-react';

const ResetAccountPage = ({ client, onClose, onResetConfirm }) => {
    const [transactionPassword, setTransactionPassword] = useState('');

    const clientName = client?.fullName || 'Demo ji';
    const clientUsername = client?.username || 'Demo0174';
    const clientId = client?.id || '3705377';

    const handleReset = (e) => {
        e.preventDefault();
        if (onResetConfirm) {
            onResetConfirm(transactionPassword);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#1a2035] z-50 flex flex-col overflow-hidden">
            {/* <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #1a2035; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4CAF50; border-radius: 4px; }
            `}</style> */}

            {/* Top Bar - Green matches ClientDetailPage */}
            <div className="bg-[#4caf50] h-14 flex items-center justify-between px-6 shadow-md shrink-0">
                {/* Back Button */}
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-white font-bold uppercase text-sm hover:bg-black/10 px-3 py-1.5 rounded transition-colors"
                >
                    <span className="fa-solid fa-arrow-left text-base"></span>
                    <span>Back</span>
                </button>
                <div className="flex items-center gap-4 text-white">
                    <button className="hover:bg-black/10 p-2 rounded-full transition-colors">
                        <span className="fa-solid fa-info-circle w-5 h-5 flex items-center justify-center"></span>
                    </button>
                    <div className="flex items-center gap-2 font-bold uppercase text-sm cursor-pointer hover:bg-black/10 px-3 py-1.5 rounded transition-colors">
                        <span className="bg-white/20 p-1 rounded-full"><span className="fa-solid fa-save w-4 h-4 flex items-center justify-center"></span></span>
                        Demo pannel
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar LINKS from HTML */}
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
                        <div key={item.label} className={`text-slate-400 text-[13px] flex items-center gap-3 py-2.5 px-4 rounded hover:bg-white/5 cursor-pointer transition-colors ${item.label === 'Trading Clients' ? 'bg-[#4caf50] text-white shadow-lg shadow-green-900/40' : ''}`}>
                            <div className="w-5 h-5 flex items-center justify-center opacity-80">
                                <span className={`${item.icon.includes('fa-') ? item.icon : 'fa-solid ' + item.icon} text-sm`}></span>
                            </div>
                            <span className="truncate tracking-wide font-normal">{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 bg-[#1a2035]">
                    <div className="max-w-4xl mx-auto mt-10">

                        {/* Header Badge */}
                        <div className="relative z-20 mb-[-1.5rem] ml-4 inline-block">
                            <div
                                className="px-6 py-3 rounded-md shadow-2xl"
                                style={{ background: 'linear-gradient(60deg, #66bb6a, #43a047)' }}
                            >
                                <h4 className="text-white text-base font-bold m-0 tracking-tight">
                                    Reset Account
                                </h4>
                            </div>
                        </div>

                        {/* Main Content Card (Material Dashboard Dark Style) */}
                        <div className="bg-[#202940] rounded shadow-[0_4px_20px_0_rgba(0,0,0,.5)] border-none p-5 pt-10">
                            <div className="card-body p-2">
                                <p className="text-[#eeeeee] text-[15px] font-normal leading-relaxed mb-10">
                                    You are about to clear all history of User {clientName} ({clientUsername}) (ID: {clientId}).
                                    All trades, Brokerage and Profit/Loss of the user will be deleted and can not be recovered.
                                    However, Ledger Balance of the user would remain the same and all Deposit and Withdrawal
                                    transactions would remain in the system. Enter Transaction Password to continue.
                                </p>

                                <form onSubmit={handleReset} className="mt-6">
                                    <div className="flex flex-col md:flex-row items-end gap-x-8 gap-y-6">
                                        <div className="flex-1 min-w-[250px] group relative">
                                            <label className="block text-sm mb-2 font-light text-[#bcc0cf]/70 transition-colors group-focus-within:text-[#9c27b0]">
                                                Transaction Password
                                            </label>
                                            <input
                                                type="password"
                                                value={transactionPassword}
                                                onChange={(e) => setTransactionPassword(e.target.value)}
                                                className="w-full bg-transparent border-b border-[#555] py-1.5 text-white focus:outline-none focus:border-[#9c27b0] transition-all text-base"
                                                placeholder=""
                                                autoFocus
                                            />
                                            {/* Purple indicator from screenshot */}
                                            <div className="absolute bottom-0 left-0 h-0.5 bg-[#9c27b0] w-0 group-focus-within:w-full transition-all duration-300"></div>
                                        </div>

                                        <div className="pb-0.5">
                                            <button
                                                type="submit"
                                                className="px-8 py-2.5 rounded text-white font-bold text-[11px] uppercase tracking-widest transition-all shadow-lg hover:shadow-2xl active:scale-95"
                                                style={{ background: 'linear-gradient(60deg, #66bb6a, #43a047)' }}
                                            >
                                                Reset Account
                                            </button>
                                        </div>
                                    </div>
                                    <div className="h-[1px] w-full bg-[#555]/20 mt-10 rounded-full"></div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetAccountPage;
