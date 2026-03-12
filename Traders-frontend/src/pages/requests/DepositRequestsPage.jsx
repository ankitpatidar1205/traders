import React, { useState } from 'react';

const DepositRequestsPage = () => {
    const [depositRequests, setDepositRequests] = useState([
        {
            id: 758,
            name: "Priyadarshini",
            username: "SHRE0294",
            ledgerBalance: "",
            availableBalance: "",
            broker: "rk002 (323)",
            time: "28-Jul-2025 11:03 am",
            proofImage: "https://via.placeholder.com/60x100?text=Proof"
        },
        {
            id: 755,
            name: "MLB",
            username: "SHRE021",
            ledgerBalance: "",
            availableBalance: "",
            broker: "jp001 (390)",
            time: "25-Jul-2025 03:58 pm",
            proofImage: "https://via.placeholder.com/60x100?text=Proof"
        },
        {
            id: 754,
            name: "MLB",
            username: "SHRE021",
            ledgerBalance: "",
            availableBalance: "",
            broker: "jp001 (390)",
            time: "25-Jul-2025 03:58 pm",
            proofImage: "https://via.placeholder.com/60x100?text=Proof"
        },
        {
            id: 753,
            name: "Dummy User",
            username: "SHRE999",
            ledgerBalance: "1000",
            availableBalance: "1000",
            broker: "test001 (100)",
            time: "24-Jul-2025 10:00 am",
            proofImage: "https://via.placeholder.com/60x100?text=Proof"
        },
        {
            id: 752,
            name: "Sample Account",
            username: "SHRE123",
            ledgerBalance: "5000",
            availableBalance: "5000",
            broker: "brk005 (555)",
            time: "23-Jul-2025 02:30 pm",
            proofImage: "https://via.placeholder.com/60x100?text=Proof"
        }
    ]);

    const handleRemove = (id) => {
        if (window.confirm('Are you sure you want to remove this request?')) {
            setDepositRequests(prev => prev.filter(req => req.id !== id));
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1a2035]  space-y-8 text-[#a0aec0] overflow-y-auto">
            <div className="mb-6">
                <span className="text-sm font-medium">Showing <span className="text-white font-bold">5</span> of <span className="text-white font-bold">5</span> items.</span>
            </div>

            <div className="flex-1 bg-[#202940] rounded-lg border border-white/5 overflow-hidden flex flex-col shadow-2xl">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="sticky top-0 bg-[#202940] z-20 border-b border-white/5">
                            <tr className="text-white text-[14px] font-bold tracking-tight">
                                <th className="px-8 py-6 w-32">ID <span className="text-[10px] ml-1 opacity-50">↑↑</span></th>
                                <th className="px-8 py-6">User Details</th>
                                <th className="px-8 py-6">Broker</th>
                                <th className="px-8 py-6">File</th>
                                <th className="px-8 py-6">Time</th>
                                <th className="px-8 py-6 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px] bg-[#1a2035]">
                            {depositRequests.map((req, idx) => (
                                <tr key={req.id} className="border-b border-white/5 group hover:bg-white/[0.02] transition-all duration-200">
                                    <td className="px-8 py-10 align-middle text-white font-bold">{req.id}</td>
                                    <td className="px-8 py-10">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">Name: </span>
                                                <span className="text-blue-400 font-bold">{req.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">Username: </span>
                                                <span className="text-white font-bold">{req.username}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">Ledger Balance: </span>
                                                <span className="text-white font-bold">{req.ledgerBalance || ''}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">Available Balance: </span>
                                                <span className="text-white font-bold">{req.availableBalance || ''}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-10 align-middle">
                                        <span className="text-[#3b82f6] font-medium active:text-blue-300 cursor-pointer">{req.broker}</span>
                                    </td>
                                    <td className="px-8 py-10 align-middle">
                                        <div className="relative group/img">
                                            <div className="w-[100px] h-[140px] bg-black/40 rounded flex flex-col items-center justify-center overflow-hidden border border-white/5 relative shadow-xl">
                                                <img
                                                    src={req.proofImage}
                                                    alt="Deposit Proof"
                                                    className="w-full h-full object-cover opacity-60 group-hover/img:opacity-100 transition-all duration-300"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-center px-2">Deposit Proof</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-10 align-middle text-white font-medium opacity-90">
                                        {req.time}
                                    </td>
                                    <td className="px-8 py-10 align-middle text-right">
                                        <button
                                            onClick={() => handleRemove(req.id)}
                                            className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold py-2.5 px-8 rounded shadow-lg transition-all active:scale-95 text-[11px] tracking-widest"
                                        >
                                            REMOVE
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DepositRequestsPage;
