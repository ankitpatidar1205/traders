import React from 'react';
import { Check, ChevronDown, Info } from 'lucide-react';

const InputField = ({ label, name, value, onChange, type = "text", placeholder, hint, className = "" }) => (
    <div className={`mb-10 group px-2 ${className}`}>
        <label htmlFor={name} className="block text-[15px] mb-2 font-normal leading-tight text-[#bcc0cf]" style={{ letterSpacing: '0.2px' }}>
            {label}
        </label>
        <input
            id={name}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-transparent border-b border-white/20 py-1.5 text-white focus:outline-none focus:border-white/40 transition-colors text-[17px] font-normal"
            style={{ letterSpacing: '0.3px' }}
        />
        {hint && <p className="text-[13px] mt-2 font-normal leading-snug text-[#888c9b]" style={{ letterSpacing: '0.2px' }}>{hint}</p>}
    </div>
);

const SelectField = ({ label, name, value, onChange, options, hint, className = "" }) => (
    <div className={`mb-10 group px-2 ${className}`}>
        <label htmlFor={name} className="block text-[14px] mb-1 font-normal leading-tight text-[#bcc0cf]" style={{ letterSpacing: '0.2px' }}>
            {label}
        </label>
        <div className="relative">
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-white border border-slate-200 py-2.5 px-4 text-black font-extrabold outline-none rounded shadow-sm appearance-none focus:ring-2 focus:ring-[#4caf50]/20 transition-all text-sm uppercase tracking-wider cursor-pointer"
                style={{ letterSpacing: '0.3px' }}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-white text-black font-bold">
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-[#4caf50] transition-colors">
                <ChevronDown className="w-4 h-4" />
            </div>
        </div>
        {hint && <p className="text-[12px] mt-2 font-normal leading-snug text-[#888c9b]" style={{ letterSpacing: '0.2px' }}>{hint}</p>}
    </div>
);

const CheckboxField = ({ label, name, checked, onChange, disabled, className = "", tooltip }) => (
    <label htmlFor={name} className={`flex items-center gap-4 cursor-pointer group mb-10 px-2 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className="relative flex items-center justify-center">
            <input
                id={name}
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="appearance-none w-[19px] h-[19px] border border-white/30 rounded-[3px] checked:bg-[#4caf50] checked:border-[#4caf50] transition-all cursor-pointer disabled:cursor-not-allowed"
            />
            {checked && <Check className="w-3.5 h-3.5 text-white absolute pointer-events-none stroke-[3]" />}
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[15px] group-hover:text-white transition-colors text-[#bcc0cf] font-normal" style={{ letterSpacing: '0.2px' }}>{label}</span>
            {tooltip && (
                <div title={tooltip} className="cursor-help">
                    <Info className="w-4 h-4 text-slate-500 hover:text-cyan-400 transition-colors" />
                </div>
            )}
        </div>
    </label>
);

const ScripField = ({ label, value, onChange, className = "" }) => (
    <div className={`mb-8 px-2 ${className}`}>
        <label className="text-[12px] uppercase font-bold tracking-tight block mb-2 text-[#bcc0cf]" style={{ letterSpacing: '0.2px' }}>{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            className="w-full bg-transparent border-b border-white/10 py-1.5 text-white focus:outline-none focus:border-white/30 transition-colors text-[16px] font-normal"
            style={{ letterSpacing: '0.3px' }}
        />
    </div>
);

const EditMCXFutureSection = ({ formData, handleChange, handleNestedChange, globalBanAll }) => {
    // Exposure Scrips list as per images 1-4
    const exposureScrips = [
        'BULLDEX', 'GOLD', 'SILVER', 'CRUDEOIL', 'CRUDEOIL MINI', 'COPPER', 'NICKEL', 'ZINC',
        'ZINCMINI', 'LEADMINI', 'ALUMINIUM', 'ALUMINI', 'NATURALGAS', 'NATURALGAS MINI',
        'MENTHAOIL', 'COTTON', 'GOLDM', 'SILVER MIC'
    ];

    // Brokerage Scrips list as per images 4-5
    const brokerageScrips = [
        ['GOLDM', 'SILVERM'],
        ['BULLDEX', 'GOLD'],
        ['SILVER', 'CRUDEOIL'],
        ['COPPER', 'NICKEL'],
        ['ZINC', 'LEAD'],
        ['NATURALGAS', 'NATURALGAS MINI'],
        ['ALUMINIUM', 'MENTHAOIL'],
        ['COTTON', 'SILVERMIC'],
        ['ZINCMINI', 'ALUMINI'],
        ['LEADMINI', 'CRUDEOIL MINI']
    ];

    // Away Points Scrips list as per image 5-6
    const awayPointsScrips = [
        ['GOLDM', 'SILVERM'],
        ['BULLDEX', 'GOLD'],
        ['SILVER', 'CRUDEOIL'],
        ['COPPER', 'NICKEL'],
        ['ZINC', 'LEAD']
    ];

    return (
        <fieldset className="border-none p-0 m-0">
            <div className="flex items-center justify-between mb-10 px-2">
                <h3 className="text-[26px] font-normal text-white" style={{ letterSpacing: '0.2px' }}>MCX Future:</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 px-2">
                <div className="space-y-0">
                    <div className="mb-0">
                        <CheckboxField 
                            label=" MCX Trading" 
                            name="mcxTrading" 
                            checked={formData.mcxTrading} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div className="mb-0">
                        <CheckboxField 
                            label="Ban MCX Limit Order" 
                            name="banMcxLimitOrder" 
                            checked={formData.banMcxLimitOrder} 
                            onChange={handleChange} 
                            disabled={globalBanAll}
                            tooltip="If enabled, client cannot place limit orders in MCX segment."
                        />
                    </div>
                </div>
                <div className="hidden md:block"></div> { /* spacer */ }

                <InputField label="Minimum lot size required per single trade of MCX" name="mcxMinLot" value={formData.mcxMinLot} onChange={handleChange} />

                <InputField label="Maximum lot size allowed per single trade of MCX" name="mcxMaxLot" value={formData.mcxMaxLot} onChange={handleChange} />
                <InputField label="Maximum lot size allowed per script of MCX to be actively open at a time" name="mcxMaxLotScrip" value={formData.mcxMaxLotScrip} onChange={handleChange} />

                <InputField label="Max Size All Commodity" name="mcxMaxSizeAll" value={formData.mcxMaxSizeAll} onChange={handleChange} />
                <SelectField label="Mcx Brokerage Type" name="mcxBrokerageType" value={formData.mcxBrokerageType} onChange={handleChange} options={[{ value: 'per_lot', label: 'Per Lot Basis' }, { value: 'per_crore', label: 'Per Crore Basis' }]} />

                <InputField label="MCX brokerage" name="mcxBrokerage" value={formData.mcxBrokerage} onChange={handleChange} />
                <SelectField label="Exposure Mcx Type" name="mcxExposureType" value={formData.mcxExposureType} onChange={handleChange} options={[{ value: 'per_lot', label: 'Per Lot Basis' }, { value: 'per_turnover', label: 'Per Turnover Basis' }]} />

                <InputField
                    label="Min. Time to book profit (No. of Seconds)"
                    name="mcxMinTimeToBookProfit"
                    value={formData.mcxMinTimeToBookProfit}
                    onChange={handleChange}
                    placeholder="120"
                    hint="Example: 120, will hold the trade for 2 minutes before closing a trade in profit."
                />
                <SelectField
                    label="Scalping Stop Loss"
                    name="mcxScalpingStopLoss"
                    value={formData.mcxScalpingStopLoss}
                    onChange={handleChange}
                    options={[
                        { value: 'Disabled', label: 'Disabled' },
                        { value: 'Enabled', label: 'Enabled' }
                    ]}
                    hint="If Disabled, Stop Loss or Booking Loss can be done after Min. time of profit booking."
                />

                <div className="md:col-span-2 pt-6 border-t border-white/5 mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <InputField 
                        label="MCX Segment Limit" 
                        name="mcxSegmentLimit" 
                        value={formData.mcxSegmentLimit} 
                        onChange={handleChange} 
                    />
                </div>
            </div>

            {formData.mcxExposureType === 'per_lot' && (
                <div className="mt-8">
                    <h4 className="text-[17px] font-normal mb-10 px-4 border-l-2 border-[#4caf50] text-[#bcc0cf]" style={{ letterSpacing: '0.2px' }}>MCX Exposure Lot wise:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 px-2">
                        {exposureScrips.map(scrip => (
                            <React.Fragment key={scrip}>
                                <ScripField label={`${scrip} INTRADAY`} value={formData.mcxLotMargins[scrip]?.INTRADAY || '0'} onChange={(e) => handleNestedChange('mcxLotMargins', scrip, e.target.value, 'INTRADAY')} />
                                <ScripField label={`${scrip} HOLDING`} value={formData.mcxLotMargins[scrip]?.HOLDING || '0'} onChange={(e) => handleNestedChange('mcxLotMargins', scrip, e.target.value, 'HOLDING')} />
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            {formData.mcxBrokerageType === 'per_lot' && (
                <div className="mt-12 px-2">
                    <h4 className="text-[17px] font-normal mb-10 border-l-2 border-[#4caf50] pl-4 text-[#bcc0cf]" style={{ letterSpacing: '0.2px' }}>MCX Lot Wise Brokerage:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 px-2">
                        {brokerageScrips.flat().map(scrip => {
                            const scripKey = scrip === 'SILVERMIC' ? 'SILVER MIC' : scrip;
                            const displayLabel = scrip === 'SILVERMIC' ? 'SILVER MIC' : scrip;
                            return (
                                <ScripField
                                    key={scrip}
                                    label={`${displayLabel}:`}
                                    value={formData.mcxLotBrokerage[scripKey] || '0.0000'}
                                    onChange={(e) => handleNestedChange('mcxLotBrokerage', scripKey, e.target.value)}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="mt-12 px-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="px-1 md:col-span-2">
                        <h4 className="text-[17px] font-normal mb-10 border-l-2 border-[#4caf50] pl-4 text-[#bcc0cf]" style={{ letterSpacing: '0.2px' }}>Orders to be away by points in each scrip MCX:</h4>
                    </div>
                    {awayPointsScrips.flat().map(scrip => {
                        const scripKey = scrip === 'SILVERMIC' ? 'SILVER MIC' : scrip;
                        const displayLabel = scrip === 'SILVERMIC' ? 'SILVER MIC' : scrip;
                        return (
                            <ScripField
                                key={scrip}
                                label={`${displayLabel}:`}
                                value={formData.bidGaps[scripKey] || '0.0000'}
                                onChange={(e) => handleNestedChange('bidGaps', scripKey, e.target.value)}
                            />
                        );
                    })}
                </div>
            </div>
        </fieldset>
    );
};

export default EditMCXFutureSection;
