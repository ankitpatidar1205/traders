import React from 'react';
import { TrendingUp } from 'lucide-react';

/**
 * NetHoldingMarginCard - Segment-wise margin breakdown
 * Shows: NSE Equity, NSE Futures, NSE Options, MCX + Total
 */
const NetHoldingMarginCard = ({ marginData = null }) => {
    // Default/demo data if no API data provided
    const data = marginData || {
        nseEquity: 125000,
        nseFutures: 80000,
        nseOptions: 45500,
        mcx: 210000,
    };

    const total = data.nseEquity + data.nseFutures + data.nseOptions + data.mcx;

    const formatAmount = (amount) => {
        return '₹ ' + amount.toLocaleString('en-IN', { minimumFractionDigits: 0 });
    };

    const segments = [
        { label: 'NSE Equity Margin', value: data.nseEquity, color: '#3b82f6' },
        { label: 'NSE Futures Margin', value: data.nseFutures, color: '#f59e0b' },
        { label: 'NSE Options Margin', value: data.nseOptions, color: '#8b5cf6' },
        { label: 'MCX Margin', value: data.mcx, color: '#ef4444' },
    ];

    return (
        <div className="margin-card">
            {/* Header */}
            <div className="margin-card-header flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Net Holding Margin</span>
            </div>

            {/* Segment Rows */}
            <div>
                {segments.map((seg, i) => (
                    <div key={i} className="margin-card-row">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ background: seg.color }}
                            />
                            <span className="text-slate-300">{seg.label}</span>
                        </div>
                        <span className="text-white font-semibold tabular-nums">
                            {formatAmount(seg.value)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="margin-card-total">
                <span className="text-white">TOTAL MARGIN</span>
                <span className="text-[#4ade80] text-lg tabular-nums">{formatAmount(total)}</span>
            </div>
        </div>
    );
};

export default NetHoldingMarginCard;
