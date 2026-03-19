import React from 'react';
import { ChevronDown } from 'lucide-react';

const InputField = ({ label, name, value, onChange, type = "text", placeholder, hint }) => (
    <div className="mb-6 group px-2">
        <label htmlFor={name} className="block text-sm mb-1 font-light text-[#bcc0cf]">
            {label}
        </label>
        <input
            id={name}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-transparent border-b border-slate-700 py-1 text-white focus:outline-none focus:border-[#4caf50] transition-colors text-sm font-bold"
        />
        {hint && <p className="text-[11px] mt-2 font-light leading-relaxed text-[#8b8f9a]">
            {hint}
        </p>}
    </div>
);

const SelectField = ({ label, name, options, value, onChange }) => (
    <div className="mb-6 group px-2">
        <label htmlFor={name} className="block text-sm mb-1 font-light text-[#bcc0cf]">
            {label}
        </label>
        <div className="relative">
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-transparent border-b border-slate-700 py-1 text-white focus:outline-none focus:border-[#4caf50] transition-colors text-sm font-bold appearance-none cursor-pointer"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-[#1a2035] text-white">{opt.label}</option>
                ))}
            </select>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
            </div>
        </div>
    </div>
);

const CheckboxField = ({ label, name, checked, onChange, disabled }) => (
    <label className={`flex items-center gap-3 cursor-pointer group px-2 mb-6 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className="relative flex items-center justify-center">
            <input
                id={name}
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="appearance-none w-5 h-5 border border-slate-600 rounded-sm checked:bg-[#4caf50] checked:border-[#4caf50] transition-all cursor-pointer disabled:cursor-not-allowed"
            />
        </div>
        <span className="text-sm text-[#bcc0cf] group-hover:text-white transition-colors uppercase font-bold tracking-wider">{label}</span>
    </label>
);

const ForexForm = ({ config, onChange, globalBanAll }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            <div>
                <InputField 
                    label="Forex brokerage" 
                    name="brokerage" 
                    value={config.brokerage} 
                    onChange={(e) => onChange(e.target.name, e.target.value)} 
                />
                <InputField 
                    label="Maximum lots allowed per single trade of forex" 
                    name="maxLot" 
                    value={config.maxLot} 
                    onChange={(e) => onChange(e.target.name, e.target.value)} 
                />
                    <InputField 
                    label="Max Size All forex" 
                    name="maxSizeAll" 
                    value={config.maxSizeAll} 
                    onChange={(e) => onChange(e.target.name, e.target.value)} 
                />
                <InputField 
                    label="Holding Exposure/Margin forex" 
                    name="holdingMargin" 
                    value={config.holdingMargin} 
                    onChange={(e) => onChange(e.target.name, e.target.value)} 
                    hint="Holding Exposure auto calculates the margin money required to hold a position overnight for the next market working day. Calculation : turnover of a trade divided by Exposure is required margin. eg. if gold having lot size of 100 is trading @ 45000 and holding exposure is 800, (45000 X 100) / 80 = 56250 is required to hold position overnight. System automatically checks at a given time around market closure to check and close all trades if margin(M2M) insufficient."
                />
            </div>
            <div>
                <SelectField 
                    label="Forex brokerage type" 
                    name="brokerageType" 
                    value={config.brokerageType} 
                    onChange={(e) => onChange(e.target.name, e.target.value)}
                    options={[
                        { value: 'per_crore', label: 'Per Crore' },
                        { value: 'per_lot', label: 'Per Lot' }
                    ]}
                />
                <InputField 
                    label="Minimum lots required per single trade of forex" 
                    name="minLot" 
                    value={config.minLot} 
                    onChange={(e) => onChange(e.target.name, e.target.value)} 
                />
                <InputField 
                    label="Maximum lots allowed per scrip of forex to be actively open at a time" 
                    name="maxLotScrip" 
                    value={config.maxLotScrip} 
                    onChange={(e) => onChange(e.target.name, e.target.value)} 
                />
                <InputField 
                    label="Intraday Exposure/Margin forex" 
                    name="intradayMargin" 
                    value={config.intradayMargin} 
                    onChange={(e) => onChange(e.target.name, e.target.value)} 
                    hint="Exposure auto calculates the margin money required for any new trade entry. Calculation : turnover of a trade divided by Exposure is required margin. eg. if gold having lotsize of 100 is trading @ 45000 and exposure is 200, (45000 X 100) / 200 = 22500 is required to initiate the trade."
                />
                <InputField 
                    label="Orders to be away by % from current price forex" 
                    name="ordersAway" 
                    value={config.ordersAway} 
                    onChange={(e) => onChange(e.target.name, e.target.value)} 
                />
                <div className="mt-4">
                    <InputField 
                        label="Forex Segment Limit" 
                        name="segmentLimit" 
                        value={config.segmentLimit} 
                        onChange={(e) => onChange('segmentLimit', e.target.value)} 
                        placeholder="10" 
                    />
                </div>
            </div>
        </div>
    );
};

export default ForexForm;
