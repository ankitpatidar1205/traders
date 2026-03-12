import React from 'react';

const dummyNotifications = [
    { id: 1, title: 'NO CARRY FORWARD IN MARKET', message: 'NO CARRY FORWARD IN MARKET positions sq. Off @ closing', createdAt: '2026-02-13 10:20:05' },
    { id: 2, title: 'Update', message: 'પૈસે જમા કરવા સે પહેલા હંમેશા એપ્લિકેશન માં અપડેટેડ બેંક ડિટેલ્સ ચેક કરે', createdAt: '2026-02-12 06:12:04' },
    { id: 3, title: 'Payin details', message: 'Always check updated bank details in application before deposit', createdAt: '2026-02-11 06:04:16' },
    { id: 4, title: 'Payin details', message: 'Always check updated bank details in application before deposit', createdAt: '2026-02-10 08:42:09' },
    { id: 5, title: 'No carry forward', message: 'No carry forward', createdAt: '2026-02-09 22:57:24' },
    { id: 6, title: 'Pacify idfc payin closes', message: '-', createdAt: '2026-02-09 12:11:23' },
    { id: 7, title: 'Pacify account closed', message: '-', createdAt: '2026-02-09 12:11:10' },
    { id: 8, title: 'Account details changed', message: '-', createdAt: '2026-02-09 12:11:00' },
    { id: 9, title: 'Account details changed', message: '-', createdAt: '2026-02-09 12:10:51' },
    { id: 10, title: 'Update', message: 'Always check updated bank details in app before deposit', createdAt: '2026-02-09 08:49:15' },
    { id: 11, title: 'Payin Details', message: 'always check updated bank details in app before deposit.', createdAt: '2026-02-08 23:25:40' },
    { id: 12, title: 'HI', message: 'Hello', createdAt: '2025-09-07 23:54:58' },
    { id: 13, title: 'MARKET CLOSE', message: 'Dear Trader, Tomorrow NSE and MCX Market remain close due to election in Maharastra, however MCX evening Session will be started at 5.00 pm to 11.55pm.', createdAt: '2024-11-19 14:51:44' },
    { id: 14, title: 'Software update', message: 'Don\'t take any fresh position.... software is in update 2-3 days lagenge', createdAt: '2024-10-23 10:59:06' },
    { id: 15, title: 'Software update', message: 'Don\'t take any fresh position for 2-3 days software is in update.... kindly co-operate', createdAt: '2024-10-23 10:55:12' },
    { id: 16, title: 'Dear traders,', message: 'Tomorrow NSE market will remain Closed on account of Moharram, MCX Market will Start at 5 pm Evening and will run till 11:30 pm', createdAt: '2024-07-16 10:17:39' },
    { id: 17, title: 'Important ELECTION RESULT', message: 'DUE TO HEAVY VOLATILITY EXPECTED IN DURING ELECTION RESULT, APPLICABLE INTRADAY MARGIN 50% AND HOLDING MARGIN 20% FOR FUTURE AND INTRADAY AND HOLDING 1X FOR OPTIONS; ALSO PENDING OR ADVANCE ORDER REMAINS DISABLED FROM 3RD JUNE MARKET OPEN TO 5TH JUNE MARKET CLOSE. FOR MORE INFORMATION CONTACT YOUR BROKER.', createdAt: '2024-06-03 05:39:12' },
    { id: 18, title: 'Important ELECTION RESULT', message: 'DUE TO HEAVY VOLATILITY EXPECTED IN DURING ELECTION RESULT, APPLICABLE INTRADAY MARGIN 50% AND HOLDING MARGIN 20% FOR FUTURE AND INTRADAY AND HOLDING 1X FOR OPTIONS; ALSO PENDING OR ADVANCE ORDER REMAINS DISABLED FROM 3RD JUNE MARKET OPEN TO 5TH JUNE MARKET CLOSE. FOR MORE INFORMATION CONTACT YOUR BROKER.', createdAt: '2024-05-31 10:13:23' },
    { id: 19, title: 'Important ELECTION RESULT', message: 'DUE TO HEAVY VOLATILITY EXPECTED IN DURING ELECTION RESULT, APPLICABLE INTRADAY MARGIN 50% AND HOLDING MARGIN 20% FOR FUTURE AND INTRADAY AND HOLDING 1X FOR OPTIONS; ALSO PENDING OR ADVANCE ORDER REMAINS DISABLED FROM 3RD JUNE MARKET OPEN TO 5TH JUNE MARKET CLOSE. FOR MORE INFORMATION CONTACT YOUR BROKER.', createdAt: '2024-05-31 10:09:50' },
    { id: 20, title: 'Important:', message: 'Dear Traders, Kindly note that holding margin are change from Monday Towards. Kindly refer below new holding margin. Mini Future 100x Equity Future 100x Index Option Buying 2x Stock Option Buying 2x Index Option Buying 2x No change on intraday margin. Kindly check holding margin in active trade section and maintain required margin for holding. Regards, United exchange Administration.', createdAt: '2024-04-13 11:15:41' },
];

const NotificationsPage = () => {
    return (
        <div className="flex flex-col h-full bg-[#1a2035] space-y-8 overflow-y-auto">
            {/* Header Action */}
            <div className="flex justify-start">
                <button className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white text-[11px] font-bold py-2.5 px-5 rounded shadow uppercase tracking-wider transition-all active:scale-95">
                    SEND NOTIFICATION
                </button>
            </div>

            {/* Table Container */}
            <div className="bg-[#1f283e]/40 rounded-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="text-white text-base font-bold">
                                <th className="px-6 py-5 border-b border-white/5 w-[15%]">Title</th>
                                <th className="px-6 py-5 border-b border-white/5 w-[70%]">Message</th>
                                <th className="px-6 py-5 border-b border-white/5 text-right w-[15%] pr-12">Delivered at</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {dummyNotifications.map((n) => (
                                <tr key={n.id} className="hover:bg-white/5 transition-colors align-top">
                                    <td className="px-6 py-5 text-[13px] text-slate-300 font-bold uppercase leading-tight">
                                        {n.title}
                                    </td>
                                    <td className="px-6 py-5 text-[13px] text-slate-300 font-normal leading-relaxed">
                                        {n.message}
                                    </td>
                                    <td className="px-6 py-5 text-[12px] text-slate-400 text-right pr-12 font-medium whitespace-nowrap">
                                        {n.createdAt.split(' ').map((part, idx) => (
                                            <div key={idx} className={idx === 1 ? "mt-0.5" : ""}>{part}</div>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Premium Pagination */}
            <div className="flex items-center gap-2 py-6 select-none">
                <span className="text-[#8890a5] text-lg font-bold cursor-pointer hover:text-white transition-colors">&lt;&lt;</span>
                <div className="w-8 h-8 flex items-center justify-center bg-white/90 text-[#1a2035] rounded-full text-sm font-bold cursor-pointer shadow-md">
                    1
                </div>
                {[2, 3].map((num) => (
                    <div key={num} className="w-8 h-8 flex items-center justify-center bg-white/10 text-[#8890a5] rounded-full text-sm font-bold cursor-pointer hover:bg-white/20 hover:text-white transition-all">
                        {num}
                    </div>
                ))}
                <span className="text-[#8890a5] font-bold px-1">...</span>
                {[42, 43].map((num) => (
                    <div key={num} className="w-8 h-8 flex items-center justify-center bg-white/10 text-[#8890a5] rounded-full text-sm font-bold cursor-pointer hover:bg-white/20 hover:text-white transition-all">
                        {num}
                    </div>
                ))}
                <span className="text-[#8890a5] text-lg font-bold cursor-pointer hover:text-white transition-colors">&gt;&gt;</span>
            </div>
        </div>
    );
};

export default NotificationsPage;



