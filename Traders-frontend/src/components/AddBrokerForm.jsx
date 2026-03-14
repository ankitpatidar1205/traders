import React, { useState } from 'react';
import * as api from '../services/api';

const AddBrokerForm = ({ onBack, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        // Personal Details
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        transactionPasswordSet: '',

        // Config
        accountStatus: 'Active',
        sharePL: '0',
        shareBrokerage: '50',
        shareSwap: '10',
        brokerageShareType: 'Percentage',
        tradingClientsLimit: '10',
        subBrokersLimit: '3',

        // Permissions
        permissions: {
            subBrokerActions: 'Yes',
            payinAllowed: 'No',
            payoutAllowed: 'No',
            createClientsAllowed: 'No',
            clientTasksAllowed: 'No',
            tradeActivityAllowed: 'No',
            notificationsAllowed: 'No'
        },

        // Segments
        segments: {
            comex_commodity_future: { enabled: false, brokerageType: 'Per Crore Basis', brokerage: '', exposureType: 'Per Turnover Basis', intraday: '', holding: '' },
            comex_currency_future: { enabled: false, brokerageType: 'Per Crore Basis', brokerage: '', exposureType: 'Per Turnover Basis', intraday: '', holding: '' },
            comex_crypto_future: { enabled: false, brokerageType: 'Per Crore Basis', brokerage: '', exposureType: 'Per Turnover Basis', intraday: '', holding: '' },
            nse_all_future: { enabled: false, brokerage: '', intraday: '', holding: '' },
            nse_equity_opt_short: { enabled: false, brokerageType: 'Per Crore Basis', brokerage: '', intraday: '', holding: '' },
            nse_equity_opt: { enabled: false, brokerageType: 'Per Crore Basis', brokerage: '', intraday: '', holding: '' },
            nse_index_opt_short: { enabled: false, brokerageType: 'Per Crore Basis', brokerage: '', intraday: '', holding: '' },
            nse_index_opt: { enabled: false, brokerageType: 'Per Crore Basis', brokerage: '', intraday: '', holding: '' },
            nse_equity_spot: { enabled: false, brokerage: '', intraday: '', holding: '' },
            mcx_all_future: { enabled: false, brokerageType: 'Per Crore Basis', brokerage: '', exposureType: 'Per Turnover Basis', intraday: '', holding: '' },
            mcx_comm_opt: { enabled: false, brokerageType: 'Per Crore Basis', brokerage: '', intraday: '', holding: '' },
            mcx_comm_opt_short: { enabled: false, brokerageType: 'Per Crore Basis', brokerage: '', intraday: '', holding: '' }
        },

        // MCX Lot Wise Margins
        mcxMargins: {
            ALUMINI: { intraday: '', holding: '' },
            ALUMINIUM: { intraday: '', holding: '' },
            COPPER: { intraday: '', holding: '' },
            COTTON: { intraday: '', holding: '' },
            CRUDEOIL: { intraday: '', holding: '' },
            CRUDEOILM: { intraday: '', holding: '' },
            GOLD: { intraday: '', holding: '' },
            GOLDGUINEA: { intraday: '', holding: '' },
            GOLDM: { intraday: '', holding: '' },
            GOLDPETAL: { intraday: '', holding: '' },
            LEAD: { intraday: '', holding: '' },
            LEADMINI: { intraday: '', holding: '' },
            MCXBULLDEX: { intraday: '', holding: '' },
            NATGASMINI: { intraday: '', holding: '' },
            NATURALGAS: { intraday: '', holding: '' },
            NICKEL: { intraday: '', holding: '' },
            SILVER: { intraday: '', holding: '' },
            SILVERM: { intraday: '', holding: '' },
            SILVERMIC: { intraday: '', holding: '' },
            ZINC: { intraday: '', holding: '' },
            ZINCMINI: { intraday: '', holding: '' }
        },

        // MCX Lot Wise Brokerage
        mcxBrokerage: {
            ALUMINI: '', ALUMINIUM: '', COPPER: '', COTTON: '', CRUDEOIL: '', CRUDEOILM: '',
            GOLD: '', GOLDGUINEA: '', GOLDM: '', GOLDPETAL: '', LEAD: '', LEADMINI: '',
            MCXBULLDEX: '', NATGASMINI: '', NATURALGAS: '', NICKEL: '', SILVER: '',
            SILVERM: '', SILVERMIC: '', ZINC: '', ZINCMINI: ''
        },

        finalTransactionPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePermissionChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            permissions: { ...prev.permissions, [field]: value }
        }));
    };

    const handleSegmentChange = (segment, field, value) => {
        setFormData(prev => ({
            ...prev,
            segments: {
                ...prev.segments,
                [segment]: { ...prev.segments[segment], [field]: value }
            }
        }));
    };

    const handleMcxMarginChange = (scrip, field, value) => {
        setFormData(prev => ({
            ...prev,
            mcxMargins: {
                ...prev.mcxMargins,
                [scrip]: { ...prev.mcxMargins[scrip], [field]: value }
            }
        }));
    };

    const handleMcxBrokerageChange = (scrip, value) => {
        setFormData(prev => ({
            ...prev,
            mcxBrokerage: { ...prev.mcxBrokerage, [scrip]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Step 1: Create broker user
            const result = await api.createClient({
                fullName: `${formData.firstName} ${formData.lastName}`.trim(),
                username: formData.username,
                password: formData.password,
                role: 'BROKER'
            });

            const userId = result.id;

            // Step 2: Save broker shares + permissions + segments
            await api.updateBrokerShares(userId, {
                sharePL: formData.sharePL,
                shareBrokerage: formData.shareBrokerage,
                shareSwap: formData.shareSwap,
                brokerageType: formData.brokerageShareType,
                tradingClientsLimit: formData.tradingClientsLimit,
                subBrokersLimit: formData.subBrokersLimit,
                permissions: formData.permissions,
                segments: { segmentConfig: formData.segments, mcxMargins: formData.mcxMargins, mcxBrokerage: formData.mcxBrokerage }
            });

            if (onSave) onSave(result);
        } catch (err) {
            setError(err.message || 'Failed to create broker');
        } finally {
            setLoading(false);
        }
    };

    // Components - MATCHING THE SCREENSHOT EXACTLY
    const SectionHeader = ({ title }) => (
        <div className="w-full bg-[#4f4a4a] py-3 px-6 mb-6 mt-2 text-center">
            <h3 className="text-white text-[24px] font-bold tracking-wide">{title}:</h3>
        </div>
    );

    const InputGroup = ({ label, subtext, value, onChange, name, type = "text", placeholder = "" }) => (
        <div className="mb-8">
            <label className="block text-[#ffffff] text-[15px] font-normal mb-1">
                {label}
            </label>
            <div className="relative pt-3">
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full bg-transparent border-b border-[#4f5361] text-white opacity-90 px-0 py-1 text-base focus:outline-none focus:border-white/40 transition-all"
                    placeholder={placeholder}
                />
            </div>
            {subtext && <p className="text-[#888ea8] text-[14px] mt-2 font-normal leading-normal">{subtext}</p>}
        </div>
    );

    const PermissionRow = ({ label, value, onChange, options }) => (
        <div className="flex justify-between items-center py-1">
            <label className="text-white text-[15px] font-normal leading-tight pr-4">
                {label}
            </label>
            <div className="relative min-w-[70px]">
                <select
                    value={value}
                    onChange={onChange}
                    className="w-full bg-white text-black font-bold px-2 py-0.5 text-[14px] border border-gray-300 rounded-sm appearance-none cursor-pointer outline-none shadow-sm"
                >
                    {options.map(opt => <option key={opt} value={opt} className="bg-white">{opt}</option>)}
                </select>
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-black">
                    <i className="fa-solid fa-chevron-down text-[10px]"></i>
                </div>
            </div>
        </div>
    );

    const SelectGroup = ({ label, subtext, value, onChange, options, name }) => (
        <div className="mb-8">
            <label className="block text-white text-[15px] font-normal mb-2">
                {label}
            </label>
            <div className="relative">
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full bg-white text-black font-bold px-3 py-2 text-[15px] border border-gray-300 rounded-sm appearance-none cursor-pointer outline-none shadow-sm"
                >
                    {options.map(opt => <option key={opt} value={opt} className="bg-white">{opt}</option>)}
                </select>
                <div className="absolute right-3 top-[50%] -translate-y-1/2 pointer-events-none text-black">
                    <i className="fa-solid fa-chevron-down text-[12px]"></i>
                </div>
            </div>
            {subtext && <p className="text-[#888ea8] text-[14px] mt-2 font-normal leading-normal">{subtext}</p>}
        </div>
    );

    const SegmentBlock = ({ title, segmentKey, config }) => {
        const data = formData.segments[segmentKey];
        return (
            <div className="mb-8">
                <SectionHeader title={title} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 px-2">
                    {/* Left Column */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <input
                                type="checkbox"
                                checked={data.enabled}
                                onChange={(e) => handleSegmentChange(segmentKey, 'enabled', e.target.checked)}
                                className="w-[18px] h-[18px] bg-transparent border border-[#4f5361] rounded-sm cursor-pointer accent-[#4caf50]"
                            />
                            <span className="text-white text-[15px] font-normal">Trading Enabled</span>
                        </div>
                        <InputGroup
                            label="Brokerage"
                            value={data.brokerage}
                            onChange={(e) => handleSegmentChange(segmentKey, 'brokerage', e.target.value)}
                            name={`${segmentKey}_brokerage`}
                        />
                        <InputGroup
                            label="Intraday Exposure/Margin"
                            value={data.intraday}
                            onChange={(e) => handleSegmentChange(segmentKey, 'intraday', e.target.value)}
                            subtext="Exposure auto calculates the margin money required for any new trade entry. Calculation : turnover of a trade divided by Exposure is required margin. eg. if gold having lotsize of 100 is trading @ 45000 and exposure is 200, (45000 X 100) / 200 = 22500 is required to initiate the trade."
                        />
                    </div>
                    {/* Right Column */}
                    <div className="md:pt-0">
                        {config.hasBrokerageType && (
                            <SelectGroup
                                label="Brokerage Type"
                                value={data.brokerageType}
                                options={['Per Crore Basis', 'Per Lot Basis']}
                                onChange={(e) => handleSegmentChange(segmentKey, 'brokerageType', e.target.value)}
                            />
                        )}
                        {config.hasExposureType && (
                            <SelectGroup
                                label="Exposure Type"
                                value={data.exposureType}
                                options={['Per Turnover Basis', 'Fixed Exposure']}
                                onChange={(e) => handleSegmentChange(segmentKey, 'exposureType', e.target.value)}
                            />
                        )}
                        <InputGroup
                            label="Holding Exposure/Margin"
                            value={data.holding}
                            onChange={(e) => handleSegmentChange(segmentKey, 'holding', e.target.value)}
                            subtext="Holding Exposure auto calculates the margin money required to hold a position overnight for the next market working day. Calculation : turnover of a trade divided by Exposure is required margin. eg. if gold having lotsize of 100 is trading @ 45000 and holding exposure is 800, (45000 X 100) / 80 = 56250 is required to hold position overnight. System automatically checks at a given time around market closure to check and close all trades if margin(M2M) insufficient."
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#1b2236] font-sans flex flex-col items-center px-4">
            <div className="w-full max-w-7xl">

                {/* Main Card Wrapper with Floating Header */}
                <div className="relative bg-[#202940] w-full p-8 lg:p-12 rounded-sm shadow-2xl border border-white/5 mt-16 animate-fadeIn">

                    {/* Floating Header Ribbon */}
                    <div className="absolute -top-6 left-6 z-20">
                        {/* Main Tab */}
                        <div
                            className="px-8 py-4 rounded-md shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] min-w-[180px]"
                            style={{ background: 'linear-gradient(60deg, rgb(40, 140, 108), rgb(78, 167, 82))' }}
                        >
                            <h2 className="text-white text-[20px] font-bold m-0 tracking-wide">
                                {window.location.hash.includes('admin') ? 'Add Admin:' : 'Add Broker:'}
                            </h2>
                        </div>
                        {/* Shadow Fold/Tail Piece (The small green square behind) */}
                        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#1e7e34] -z-10 rounded-sm transform rotate-45"></div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded px-4 py-3 text-sm">
                                {error}
                            </div>
                        )}

                        {/* 1. PERSONAL DETAILS */}
                        <div className="mb-6">
                            <SectionHeader title="Personal Details" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mt-4 px-4">
                                <InputGroup label="First Name" subtext="Insert Real name of the broker. Will be visible in website" name="firstName" value={formData.firstName} onChange={handleChange} />
                                <InputGroup label="Last Name" subtext="Insert Real name of the broker. Will be visible in website" name="lastName" value={formData.lastName} onChange={handleChange} />
                                <InputGroup label="Username" subtext="username for loggin-in with, is not case sensitive. must be unique for every trader. should not contain symbols." name="username" value={formData.username} onChange={handleChange} />
                                <InputGroup label="Password" subtext="password for loggin-in with, is case sensitive." name="password" type="password" value={formData.password} onChange={handleChange} />
                                <InputGroup label="Transaction Password to set" name="transactionPasswordSet" type="password" value={formData.transactionPasswordSet} onChange={handleChange} />
                            </div>
                        </div>

                        <hr className="border-[#4f5361]/20 my-8" />

                        {/* 2. CONFIG */}
                        <div className="mb-6">
                            <SectionHeader title="Config" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mt-4 px-4">
                                <div className="mb-8 flex items-center pt-4">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                name="accountStatus"
                                                checked={formData.accountStatus === 'Active'}
                                                onChange={(e) => setFormData(prev => ({ ...prev, accountStatus: e.target.checked ? 'Active' : 'Suspended' }))}
                                                className="w-5 h-5 bg-transparent border-2 border-[#4f5361] rounded transition-all appearance-none checked:bg-[#4caf50] checked:border-[#4caf50]"
                                            />
                                            <i className="fa-solid fa-check absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-[10px] opacity-0 check-icon transition-opacity"></i>
                                        </div>
                                        <span className="text-white text-[15px] font-normal group-hover:text-white/80 transition-colors">Account Status</span>
                                    </label>
                                    <style>{`
                                        input:checked + .check-icon { opacity: 1; }
                                    `}</style>
                                </div>
                                <InputGroup label="Profit/Loss Share in %" subtext="Example: 30, will give broker 30% of total brokerage collected from clients" name="sharePL" value={formData.sharePL} onChange={handleChange} />
                                <InputGroup label="Brokerage Share in %" subtext="Example: 30, will give broker 30% of total brokerage collected from clients. This field is irrelevant if the Brokerage Share Type is set to 'Fixed'." name="shareBrokerage" value={formData.shareBrokerage} onChange={handleChange} />
                                <InputGroup label="Swap Share in %" subtext="Example: 30, will give broker 30% of total swap collected from clients" name="shareSwap" value={formData.shareSwap} onChange={handleChange} />
                                <SelectGroup label="Brokerage Share Type" subtext="If fixed is selected, Then Brokerage set in sections below like MCX, NSE, etc. will be your brokerage and any amount above that will be of broker. If Percentage is selected then Brokerage set in sections below will be the minimum brokerage which can be set in Client's account and Broker will get % wise share in brokerage set above." options={['Percentage', 'Fixed']} name="brokerageShareType" value={formData.brokerageShareType} onChange={handleChange} />
                                <InputGroup label="Trading Clients Limit" subtext="Max. no. of Trading Clients" name="tradingClientsLimit" value={formData.tradingClientsLimit} onChange={handleChange} />
                                <InputGroup label="Sub Brokers Limit" subtext="Max. no. of Sub-brokers" name="subBrokersLimit" value={formData.subBrokersLimit} onChange={handleChange} />
                            </div>
                        </div>

                        <hr className="border-[#4f5361]/20 my-8" />

                        {/* 3. PERMISSIONS */}
                        <div className="mb-6">
                            <SectionHeader title="Permissions" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 px-8 mt-4">
                                <PermissionRow label="Sub Brokers Actions (Create, Edit)" options={['Yes', 'No']} value={formData.permissions.subBrokerActions} onChange={(e) => handlePermissionChange('subBrokerActions', e.target.value)} />
                                <PermissionRow label="Payin Allowed" options={['Yes', 'No']} value={formData.permissions.payinAllowed} onChange={(e) => handlePermissionChange('payinAllowed', e.target.value)} />
                                <PermissionRow label="Payout Allowed" options={['Yes', 'No']} value={formData.permissions.payoutAllowed} onChange={(e) => handlePermissionChange('payoutAllowed', e.target.value)} />
                                <PermissionRow label="Create Clients Allowed (Create, Update and Reset Password)" options={['Yes', 'No']} value={formData.permissions.createClientsAllowed} onChange={(e) => handlePermissionChange('createClientsAllowed', e.target.value)} />
                                <PermissionRow label="Client Tasks Allowed (Account Reset, Recalculate brokerage etc.)" options={['Yes', 'No']} value={formData.permissions.clientTasksAllowed} onChange={(e) => handlePermissionChange('clientTasksAllowed', e.target.value)} />
                                <PermissionRow label="Trade Activity Allowed (Create, Update, Restore, Delete Trade)" options={['Yes', 'No']} value={formData.permissions.tradeActivityAllowed} onChange={(e) => handlePermissionChange('tradeActivityAllowed', e.target.value)} />
                                <PermissionRow label="Notifications Allowed" options={['Yes', 'No']} value={formData.permissions.notificationsAllowed} onChange={(e) => handlePermissionChange('notificationsAllowed', e.target.value)} />
                            </div>
                        </div>

                        <hr className="border-[#4f5361]/20 my-8" />

                        {/* 4. TRADING SEGMENTS - IN EXACT ORDER */}
                        <div className="space-y-2">
                            <SegmentBlock title="COMEX Commodity Future" segmentKey="comex_commodity_future" config={{ hasBrokerageType: true, hasExposureType: true }} />
                            <hr className="border-[#4f5361]/20 my-8" />
                            <SegmentBlock title="COMEX Currency Future" segmentKey="comex_currency_future" config={{ hasBrokerageType: true, hasExposureType: true }} />
                            <hr className="border-[#4f5361]/20 my-8" />
                            <SegmentBlock title="COMEX Crypto Future" segmentKey="comex_crypto_future" config={{ hasBrokerageType: true, hasExposureType: true }} />
                            <hr className="border-[#4f5361]/20 my-8" />
                            <SegmentBlock title="NSE ALL Future" segmentKey="nse_all_future" config={{ hasBrokerageType: false, hasExposureType: false }} />
                            <hr className="border-[#4f5361]/20 my-8" />
                            <SegmentBlock title="NSE Equity Options (Shortselling)" segmentKey="nse_equity_opt_short" config={{ hasBrokerageType: true, hasExposureType: false }} />
                            <hr className="border-[#4f5361]/20 my-8" />
                            <SegmentBlock title="NSE Equity Options" segmentKey="nse_equity_opt" config={{ hasBrokerageType: true, hasExposureType: false }} />
                            <hr className="border-[#4f5361]/20 my-8" />
                            <SegmentBlock title="NSE Index Options (Shortselling)" segmentKey="nse_index_opt_short" config={{ hasBrokerageType: true, hasExposureType: false }} />
                            <hr className="border-[#4f5361]/20 my-8" />
                            <SegmentBlock title="NSE Index Options" segmentKey="nse_index_opt" config={{ hasBrokerageType: true, hasExposureType: false }} />
                            <hr className="border-[#4f5361]/20 my-8" />
                            <SegmentBlock title="NSE Equity Spot" segmentKey="nse_equity_spot" config={{ hasBrokerageType: false, hasExposureType: false }} />
                            <hr className="border-[#4f5361]/20 my-8" />
                            <SegmentBlock title="MCX ALL Future" segmentKey="mcx_all_future" config={{ hasBrokerageType: true, hasExposureType: true }} />
                            <hr className="border-[#4f5361]/20 my-8" />
                            <SegmentBlock title="MCX Commodity Options (Shortselling)" segmentKey="mcx_comm_opt_short" config={{ hasBrokerageType: true, hasExposureType: false }} />
                            <hr className="border-[#4f5361]/20 my-8" />
                            <SegmentBlock title="MCX Commodity Options" segmentKey="mcx_comm_opt" config={{ hasBrokerageType: true, hasExposureType: false }} />
                            <hr className="border-[#4f5361]/20 my-8" />
                        </div>

                        {/* 5. MCX LOT WISE MARGINS */}
                        <div className="mb-6">
                            <SectionHeader title="MCX Lot wise Margins" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 px-8 mt-4">
                                {Object.keys(formData.mcxMargins).map(scrip => (
                                    <React.Fragment key={scrip}>
                                        <div className="mb-4">
                                            <label className="text-white text-[15px] font-normal block mb-1">{scrip} INTRADAY</label>
                                            <div className="relative pt-4">
                                                <input
                                                    type="text"
                                                    value={formData.mcxMargins[scrip].intraday}
                                                    onChange={(e) => handleMcxMarginChange(scrip, 'intraday', e.target.value)}
                                                    className="w-full bg-transparent border-b border-[#4f5361] text-white opacity-90 outline-none focus:border-white/40 py-1 text-base transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="text-white text-[15px] font-normal block mb-1">{scrip} HOLDING</label>
                                            <div className="relative pt-4">
                                                <input
                                                    type="text"
                                                    value={formData.mcxMargins[scrip].holding}
                                                    onChange={(e) => handleMcxMarginChange(scrip, 'holding', e.target.value)}
                                                    className="w-full bg-transparent border-b border-[#4f5361] text-white opacity-90 outline-none focus:border-white/40 py-1 text-base transition-all"
                                                />
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        <hr className="border-[#4f5361]/20 my-8" />

                        {/* 6. MCX LOT WISE BROKERAGE */}
                        <div className="mb-6">
                            <SectionHeader title="MCX Lot wise Brokerage" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 px-8 mt-4">
                                {Object.keys(formData.mcxBrokerage).map(scrip => (
                                    <div key={scrip} className="mb-4">
                                        <label className="text-white text-[15px] font-normal block mb-1">{scrip}:</label>
                                        <div className="relative pt-4">
                                            <input
                                                type="text"
                                                value={formData.mcxBrokerage[scrip]}
                                                onChange={(e) => handleMcxBrokerageChange(scrip, e.target.value)}
                                                className="w-full bg-transparent border-b border-[#4f5361] text-white opacity-90 px-0 py-1 text-base focus:outline-none focus:border-white/40 transition-all font-normal"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr className="border-[#4f5361]/20 my-8" />

                        {/* 7. TRANSACTION PASSWORD */}
                        <div className="mb-6">
                            <SectionHeader title="Transaction Password" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 px-8 mt-4">
                                <InputGroup
                                    label="Your Transaction Password"
                                    type="password"
                                    name="finalTransactionPassword"
                                    value={formData.finalTransactionPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* CREATE BUTTON */}
                        <div className="flex justify-start px-8 mt-12 pb-10">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#4caf50] hover:bg-[#43a047] text-white px-12 py-3 rounded shadow-lg shadow-green-900/40 font-bold text-xs tracking-widest uppercase transition-all disabled:opacity-60"
                            >
                                {loading ? 'CREATING...' : 'CREATE SUB BROKER'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default AddBrokerForm;