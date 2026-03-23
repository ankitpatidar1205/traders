import React, { useState, useEffect, useRef } from 'react';
import { X, Save, ArrowLeft, Info, Check, ChevronDown, Settings, User, Lock, Key, FileUp, ShieldCheck, Eye, FileText, Globe } from 'lucide-react';
import * as api from '../../services/api';
import EditMCXFutureSection from './EditMCXFutureSection';
import ComexForm from './ComexForm';
import ForexForm from './ForexForm';
import CryptoForm from './CryptoForm';

const InputField = ({ label, name, value, onChange, type = "text", placeholder, hint, className = "", disabled }) => (
    <div className={`mb-10 group px-2 ${className} ${disabled ? 'opacity-50' : ''}`}>
        <label htmlFor={name} className="block text-[15px] mb-2 font-normal leading-tight text-[#bcc0cf]">
            {label}
        </label>
        <input
            id={name}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full bg-transparent border-b border-white/20 py-1.5 text-white focus:outline-none focus:border-white/40 transition-colors text-[17px] font-normal ${disabled ? 'cursor-not-allowed' : ''}`}
        />
        {hint && <p className="text-[13px] mt-2 font-normal leading-snug text-[#888c9b]">{hint}</p>}
    </div>
);

const SelectField = ({ label, name, value, onChange, options, hint, className = "", disabled }) => (
    <div className={`mb-10 group px-2 ${className} ${disabled ? 'opacity-50' : ''}`}>
        <label htmlFor={name} className="block text-[14px] mb-1 font-normal leading-tight text-[#bcc0cf]">
            {label}
        </label>
        <div className="relative">
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full bg-white border border-slate-200 py-2.5 px-4 text-black font-extrabold outline-none rounded shadow-sm appearance-none focus:ring-2 focus:ring-[#4caf50]/20 transition-all text-sm uppercase tracking-wider cursor-pointer ${disabled ? 'cursor-not-allowed' : ''}`}
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
        {hint && <p className="text-[12px] mt-2 font-normal leading-snug text-[#888c9b]">{hint}</p>}
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
            <span className="text-[15px] group-hover:text-white transition-colors text-[#bcc0cf] font-normal">{label}</span>
            {tooltip && (
                <div title={tooltip} className="cursor-help">
                    <Info className="w-4 h-4 text-slate-500 hover:text-cyan-400 transition-colors" />
                </div>
            )}
        </div>
    </label>
);

const SectionHeader = ({ title, rightControl }) => (
    <div className="flex items-center justify-between mb-10 px-2">
        <h3 className="text-[26px] font-normal text-white">{title}</h3>
        {rightControl && <div>{rightControl}</div>}
    </div>
);

const ScripField = ({ label, value, onChange, name, className = "" }) => (
    <div className={`mb-8 ${className}`}>
        <label className="text-[12px] uppercase font-bold tracking-tight block mb-2 text-[#bcc0cf]">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            className="w-full bg-transparent border-b border-white/10 py-1.5 text-white focus:outline-none focus:border-white/30 transition-colors text-[16px] font-normal"
        />
    </div>
);

const UpdateClientPage = ({ client, onClose, onSave, onLogout, onNavigate }) => {
    const [loading, setLoading] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [saveError, setSaveError] = useState('');
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [brokers, setBrokers] = useState([]);
    const [existingDocs, setExistingDocs] = useState({});
    const profileRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [formData, setFormData] = useState({
        // 1. Personal Details
        fullName: client?.full_name || client?.fullName || '',
        mobile: client?.mobile || '',
        username: client?.username || '',
        password: '',
        city: client?.city || '',

        // 2. Config
        isDemoAccount: client?.is_demo === 1 || client?.demoAccount === 'Yes' || false,
        allowFreshEntry: client?.allowFreshEntry || false,
        allowOrdersBetweenHL: client?.allowOrdersBetweenHL !== undefined ? client.allowOrdersBetweenHL : true,
        tradeEquityUnits: client?.tradeEquityUnits || false,
        accountStatus: client?.status !== 'Inactive' ? true : false,
        autoCloseTrades: client?.autoCloseTrades || false,
        autoClosePercentage: client?.autoClosePercentage || '90',
        notifyPercentage: client?.notifyPercentage || '70',
        banAllSegmentLimitOrder: client?.banAllSegmentLimitOrder || false,

        // 3. MCX Futures
        mcxTrading: client?.mcxTrading !== undefined ? client.mcxTrading : true,
        banMcxLimitOrder: client?.banMcxLimitOrder || false,
        mcxMinTimeToBookProfit: client?.mcxMinTimeToBookProfit || '120',
        mcxScalpingStopLoss: client?.mcxScalpingStopLoss || 'Disabled',
        mcxMinLot: client?.mcxMinLot || '1',
        mcxMaxLot: client?.mcxMaxLot || '100',
        mcxMaxLotScrip: client?.mcxMaxLotScrip || '1000',
        mcxMaxSizeAll: client?.mcxMaxSizeAll || '5000',
        mcxBrokerageType: client?.mcxBrokerageType || 'per_crore',
        mcxBrokerage: client?.mcxBrokerage || '800',
        mcxExposureType: client?.mcxExposureType || 'per_turnover',
        mcxIntradayMargin: client?.mcxIntradayMargin || '500',
        mcxHoldingMargin: client?.mcxHoldingMargin || '100',
        mcxLotMargins: client?.mcxLotMargins || {
            BULLDEX: { INTRADAY: '10000', HOLDING: '10000', LOT: '1' },
            GOLD: { INTRADAY: '10000', HOLDING: '10000', LOT: '1' },
            SILVER: { INTRADAY: '15000', HOLDING: '40000', LOT: '1' },
            CRUDEOIL: { INTRADAY: '10000', HOLDING: '10000', LOT: '1' },
            'CRUDEOIL MINI': { INTRADAY: '10000', HOLDING: '10000', LOT: '1' },
            COPPER: { INTRADAY: '10000', HOLDING: '10000', LOT: '1' },
            NICKEL: { INTRADAY: '10000', HOLDING: '10000', LOT: '1' },
            ZINC: { INTRADAY: '10000', HOLDING: '10000', LOT: '1' },
            ZINCMINI: { INTRADAY: '1000', HOLDING: '1000', LOT: '1' },
            LEAD: { INTRADAY: '1000', HOLDING: '1000', LOT: '1' },
            LEADMINI: { INTRADAY: '1000', HOLDING: '1000', LOT: '1' },
            ALUMINIUM: { INTRADAY: '1000', HOLDING: '1000', LOT: '1' },
            ALUMINI: { INTRADAY: '1000', HOLDING: '1000', LOT: '1' },
            NATURALGAS: { INTRADAY: '1000', HOLDING: '1000', LOT: '1' },
            'NATURALGAS MINI': { INTRADAY: '1000', HOLDING: '1000', LOT: '1' },
            MENTHAOIL: { INTRADAY: '1000', HOLDING: '1000', LOT: '1' },
            COTTON: { INTRADAY: '1000', HOLDING: '1000', LOT: '1' },
            GOLDM: { INTRADAY: '1000', HOLDING: '1000', LOT: '1' },
            SILVERM: { INTRADAY: '1000', HOLDING: '1000', LOT: '1' },
            'SILVER MIC': { INTRADAY: '1000', HOLDING: '1000', LOT: '1' }
        },
        mcxLotBrokerage: client?.mcxLotBrokerage || {
            GOLDM: '100.0000', SILVERM: '100.0000', BULLDEX: '500.0000', GOLD: '200.0000', SILVER: '150.0000',
            CRUDEOIL: '100.0000', COPPER: '100.0000', NICKEL: '100.0000', ZINC: '100.0000', LEAD: '100.0000',
            NATURALGAS: '100.0000', 'NATURALGAS MINI': '100.0000', ALUMINIUM: '100.0000', MENTHAOIL: '100.0000',
            COTTON: '100.0000', 'SILVER MIC': '100.0000', ZINCMINI: '100.0000', ALUMINI: '100.0000',
            LEADMINI: '100.0000', 'CRUDEOIL MINI': '110.0000'
        },
        bidGaps: client?.bidGaps || {
            GOLDM: '0.0000', SILVERM: '0.0000', BULLDEX: '0.0000', GOLD: '0.0000', SILVER: '0.0000',
            CRUDEOIL: '0.0000', COPPER: '0.0000', NICKEL: '0.0000', ZINC: '0.0000', LEAD: '0.0000',
            NATURALGAS: '0.0000', 'NATURALGAS MINI': '0.0000', ALUMINIUM: '0.0000', MENTHAOIL: '0.0000',
            COTTON: '0.0000', 'SILVER MIC': '0.0000', ZINCMINI: '0.0000', ALUMINI: '0.0000',
            LEADMINI: '0.0000', 'CRUDEOIL MINI': '0.0000'
        },

        // 4. Equity Futures
        equityTrading: client?.equityTrading !== undefined ? client.equityTrading : true,
        banEquityLimitOrder: client?.banEquityLimitOrder || false,
        equitySegmentLimit: client?.equitySegmentLimit || '50',
        equityMinTimeToBookProfit: client?.equityMinTimeToBookProfit || '120',
        equityScalpingStopLoss: client?.equityScalpingStopLoss || 'Disabled',
        equityBrokerage: client?.equityBrokerage || '800',
        equityMinLot: client?.equityMinLot || '1',
        equityMaxLot: client?.equityMaxLot || '100',
        equityMinIndexLot: client?.equityMinIndexLot || '1',
        equityMaxIndexLot: client?.equityMaxIndexLot || '100',
        equityMaxScrip: client?.equityMaxScrip || '500',
        equityMaxIndexScrip: client?.equityMaxIndexScrip || '500',
        equityMaxSizeAll: client?.equityMaxSizeAll || '2000',
        equityMaxSizeAllIndex: client?.equityMaxSizeAllIndex || '2000',
        equityIntradayMargin: client?.equityIntradayMargin || '500',
        equityHoldingMargin: client?.equityHoldingMargin || '100',
        equityOrdersAway: client?.equityOrdersAway || '5',

        // 5. Options Config
        indexOptionsTrading: client?.indexOptionsTrading !== undefined ? client.indexOptionsTrading : true,
        equityOptionsTrading: client?.equityOptionsTrading !== undefined ? client.equityOptionsTrading : true,
        mcxOptionsTrading: client?.mcxOptionsTrading || false,
        banOptionsLimitOrder: client?.banOptionsLimitOrder || false,
        optionsMinTimeToBookProfit: client?.optionsMinTimeToBookProfit || '120',
        optionsScalpingStopLoss: client?.optionsScalpingStopLoss || 'Disabled',
        optionsIndexBrokerageType: client?.optionsIndexBrokerageType || 'per_lot',
        optionsIndexBrokerage: client?.optionsIndexBrokerage || '20.0000',
        optionsEquityBrokerageType: client?.optionsEquityBrokerageType || 'per_lot',
        optionsEquityBrokerage: client?.optionsEquityBrokerage || '20.0000',
        optionsMcxBrokerageType: client?.optionsMcxBrokerageType || 'per_lot',
        optionsMcxBrokerage: client?.optionsMcxBrokerage || '20.0000',
        optionsMinBidPrice: client?.optionsMinBidPrice || '1.0000',
        optionsIndexShortSelling: client?.optionsIndexShortSelling || 'No',
        optionsEquityShortSelling: client?.optionsEquityShortSelling || 'No',
        optionsMcxShortSelling: client?.optionsMcxShortSelling || 'No',
        optionsEquityMinLot: client?.optionsEquityMinLot || '0',
        optionsEquityMaxLot: client?.optionsEquityMaxLot || '50',
        optionsIndexMinLot: client?.optionsIndexMinLot || '0',
        optionsIndexMaxLot: client?.optionsIndexMaxLot || '20',
        optionsMcxMinLot: client?.optionsMcxMinLot || '0',
        optionsMcxMaxLot: client?.optionsMcxMaxLot || '50',
        optionsEquityMaxScrip: client?.optionsEquityMaxScrip || '200',
        optionsIndexMaxScrip: client?.optionsIndexMaxScrip || '200',
        optionsMcxMaxScrip: client?.optionsMcxMaxScrip || '200',
        optionsMaxEquitySizeAll: client?.optionsMaxEquitySizeAll || '200',
        optionsMaxIndexSizeAll: client?.optionsMaxIndexSizeAll || '200',
        optionsMaxMcxSizeAll: client?.optionsMaxMcxSizeAll || '200',
        optionsIndexIntraday: client?.optionsIndexIntraday || '5',
        optionsIndexHolding: client?.optionsIndexHolding || '2.000000',
        optionsEquityIntraday: client?.optionsEquityIntraday || '5',
        optionsEquityHolding: client?.optionsEquityHolding || '2',
        optionsMcxIntraday: client?.optionsMcxIntraday || '5',
        optionsMcxHolding: client?.optionsMcxHolding || '2',
        optionsOrdersAway: client?.optionsOrdersAway || '0.00',

        // 6. Expiry Rules
        autoSquareOff: 'No',
        expirySquareOffTime: '11:30',
        allowExpiringScrip: 'No',
        daysBeforeExpiry: '0',
        mcxOptionsAwayPoints: {
            MCXBULLDEX: '0', GOLD: '0', SILVER: '0', CRUDEOIL: '0', COPPER: '0',
            NICKEL: '0', ZINC: '0', LEAD: '0', NATURALGAS: '0', MENTHAOIL: '0',
            COTTON: '0', GOLDM: '0', SILVERM: '0', 'SILVER MIC': '0'
        },

        // 7. International Segments
        comexTrading: client?.comexTrading || false,
        comexConfig: client?.comexConfig || {
            brokerage: '0', brokerageType: 'per_crore', minLot: '0', maxLot: '0',
            maxLotScrip: '0', maxSizeAll: '0', intradayMargin: '0', holdingMargin: '0',
            ordersAway: '0', banLimitOrder: false, minTimeToBookProfit: '120', scalpingStopLoss: 'Disabled'
        },
        forexTrading: client?.forexTrading || false,
        forexConfig: client?.forexConfig || {
            brokerage: '0', brokerageType: 'per_crore', minLot: '0', maxLot: '0',
            maxLotScrip: '0', maxSizeAll: '0', intradayMargin: '0', holdingMargin: '0',
            ordersAway: '0', banLimitOrder: false, minTimeToBookProfit: '120', scalpingStopLoss: 'Disabled'
        },
        cryptoTrading: client?.cryptoTrading || false,
        cryptoConfig: client?.cryptoConfig || {
            brokerage: '0', brokerageType: 'per_crore', minLot: '0', maxLot: '0',
            maxLotScrip: '0', maxSizeAll: '0', intradayMargin: '0', holdingMargin: '0',
            ordersAway: '0', banLimitOrder: false, minTimeToBookProfit: '120', scalpingStopLoss: 'Disabled'
        },

        // 8. Other
        notes: client?.notes || '',
        parentId: client?.parent_id || '',
        transactionPassword: '',

        // 8. Kyc / Documents
        documents: client?.documents || {
            panCard: null,
            aadhaarFront: null,
            aadhaarBack: null,
            bankStatement: null,
            additionalDoc: null
        },
        kycStatus: 'Pending'
    });

    // Load full profile from API on mount
    useEffect(() => {
        const loadProfile = async () => {
            if (!client?.id) { setLoadingProfile(false); return; }
            try {
                const data = await api.getClientById(client.id);
                const profile = data.profile || {};
                const settings = data.settings || {};
                const config = settings.config || {};
                const docs = data.documents || {};

                // Store existing document URLs for display
                setExistingDocs({
                    panCard: docs.pan_screenshot || null,
                    aadhaarFront: docs.aadhar_front || null,
                    aadhaarBack: docs.aadhar_back || null,
                    bankStatement: docs.bank_proof || null
                });

                // Merge config_json data into form if available
                setFormData(prev => ({
                    ...prev,
                    fullName: profile.full_name || prev.fullName,
                    mobile: profile.mobile || prev.mobile,
                    username: profile.username || prev.username,
                    city: profile.city || prev.city,
                    isDemoAccount: profile.is_demo === 1,
                    accountStatus: profile.status !== 'Inactive',
                    // Settings fields
                    allowFreshEntry: settings.allow_fresh_entry === 1,
                    allowOrdersBetweenHL: settings.allow_orders_between_hl === 1,
                    tradeEquityUnits: settings.trade_equity_units === 1,
                    notifyPercentage: String(settings.notify_at_m2m_pct || '70'),
                    banAllSegmentLimitOrder: settings.ban_all_segment_limit_order === 1,
                    // Initial load from global for legacy data, overridden by config below
                    mcxMinTimeToBookProfit: String(settings.min_time_to_book_profit || '120'),
                    mcxScalpingStopLoss: settings.scalping_sl_enabled === 1 ? 'Enabled' : 'Disabled',
                    equityMinTimeToBookProfit: String(settings.min_time_to_book_profit || '120'),
                    equityScalpingStopLoss: settings.scalping_sl_enabled === 1 ? 'Enabled' : 'Disabled',
                    optionsMinTimeToBookProfit: String(settings.min_time_to_book_profit || '120'),
                    optionsScalpingStopLoss: settings.scalping_sl_enabled === 1 ? 'Enabled' : 'Disabled',
                    autoCloseTrades: settings.scalping_sl_enabled === 1,
                    // Merge all config_json fields (MCX, Equity, Options, etc.)
                    ...(Object.keys(config).length > 0 ? {
                        mcxTrading: config.mcxTrading ?? prev.mcxTrading,
                        mcxMinLot: config.mcxMinLot ?? prev.mcxMinLot,
                        banMcxLimitOrder: config.banMcxLimitOrder ?? prev.banMcxLimitOrder,
                        mcxMinTimeToBookProfit: config.mcxMinTimeToBookProfit ?? prev.mcxMinTimeToBookProfit,
                        mcxScalpingStopLoss: config.mcxScalpingStopLoss ?? prev.mcxScalpingStopLoss,
                        mcxMaxLot: config.mcxMaxLot ?? prev.mcxMaxLot,
                        mcxMaxLotScrip: config.mcxMaxLotScrip ?? prev.mcxMaxLotScrip,
                        mcxMaxSizeAll: config.mcxMaxSizeAll ?? prev.mcxMaxSizeAll,
                        mcxBrokerageType: config.mcxBrokerageType ?? prev.mcxBrokerageType,
                        mcxBrokerage: config.mcxBrokerage ?? prev.mcxBrokerage,
                        mcxExposureType: config.mcxExposureType ?? prev.mcxExposureType,
                        mcxIntradayMargin: config.mcxIntradayMargin ?? prev.mcxIntradayMargin,
                        mcxHoldingMargin: config.mcxHoldingMargin ?? prev.mcxHoldingMargin,
                        mcxLotMargins: config.mcxLotMargins ?? prev.mcxLotMargins,
                        mcxLotBrokerage: config.mcxLotBrokerage ?? prev.mcxLotBrokerage,
                        bidGaps: config.bidGaps ?? prev.bidGaps,
                        equityTrading: config.equityTrading ?? prev.equityTrading,
                        equityBrokerage: config.equityBrokerage ?? prev.equityBrokerage,
                        equityMinLot: config.equityMinLot ?? config.equityMinQty ?? prev.equityMinLot,
                        banEquityLimitOrder: config.banEquityLimitOrder ?? prev.banEquityLimitOrder,
                        equitySegmentLimit: config.equitySegmentLimit ?? prev.equitySegmentLimit,
                        equityMinTimeToBookProfit: config.equityMinTimeToBookProfit ?? prev.equityMinTimeToBookProfit,
                        equityScalpingStopLoss: config.equityScalpingStopLoss ?? prev.equityScalpingStopLoss,
                        equityMaxLot: config.equityMaxLot ?? config.equityMaxQty ?? prev.equityMaxLot,
                        equityMinIndexLot: config.equityMinIndexLot ?? config.equityMinIndexQty ?? prev.equityMinIndexLot,
                        equityMaxIndexLot: config.equityMaxIndexLot ?? config.equityMaxIndexQty ?? prev.equityMaxIndexLot,
                        equityMaxScrip: config.equityMaxScrip ?? prev.equityMaxScrip,
                        equityMaxIndexScrip: config.equityMaxIndexScrip ?? prev.equityMaxIndexScrip,
                        equityMaxSizeAll: config.equityMaxSizeAll ?? prev.equityMaxSizeAll,
                        equityMaxSizeAllIndex: config.equityMaxSizeAllIndex ?? prev.equityMaxSizeAllIndex,
                        equityIntradayMargin: config.equityIntradayMargin ?? prev.equityIntradayMargin,
                        equityHoldingMargin: config.equityHoldingMargin ?? prev.equityHoldingMargin,
                        equityOrdersAway: config.equityOrdersAway ?? prev.equityOrdersAway,
                        indexOptionsTrading: config.indexOptionsTrading ?? prev.indexOptionsTrading,
                        equityOptionsTrading: config.equityOptionsTrading ?? prev.equityOptionsTrading,
                        mcxOptionsTrading: config.mcxOptionsTrading ?? prev.mcxOptionsTrading,
                        optionsIndexBrokerageType: config.optionsIndexBrokerageType ?? prev.optionsIndexBrokerageType,
                        optionsIndexBrokerage: config.optionsIndexBrokerage ?? prev.optionsIndexBrokerage,
                        optionsEquityBrokerageType: config.optionsEquityBrokerageType ?? prev.optionsEquityBrokerageType,
                        optionsEquityBrokerage: config.optionsEquityBrokerage ?? prev.optionsEquityBrokerage,
                        optionsMcxBrokerageType: config.optionsMcxBrokerageType ?? prev.optionsMcxBrokerageType,
                        banOptionsLimitOrder: config.banOptionsLimitOrder ?? prev.banOptionsLimitOrder,
                        optionsMcxBrokerage: config.optionsMcxBrokerage ?? prev.optionsMcxBrokerage,
                        optionsMinTimeToBookProfit: config.optionsMinTimeToBookProfit ?? prev.optionsMinTimeToBookProfit,
                        optionsScalpingStopLoss: config.optionsScalpingStopLoss ?? prev.optionsScalpingStopLoss,
                        optionsMinBidPrice: config.optionsMinBidPrice ?? prev.optionsMinBidPrice,
                        optionsIndexShortSelling: config.optionsIndexShortSelling ?? prev.optionsIndexShortSelling,
                        optionsEquityShortSelling: config.optionsEquityShortSelling ?? prev.optionsEquityShortSelling,
                        optionsMcxShortSelling: config.optionsMcxShortSelling ?? prev.optionsMcxShortSelling,
                        optionsEquityMinLot: config.optionsEquityMinLot ?? prev.optionsEquityMinLot,
                        optionsEquityMaxLot: config.optionsEquityMaxLot ?? prev.optionsEquityMaxLot,
                        optionsIndexMinLot: config.optionsIndexMinLot ?? prev.optionsIndexMinLot,
                        optionsIndexMaxLot: config.optionsIndexMaxLot ?? prev.optionsIndexMaxLot,
                        optionsMcxMinLot: config.optionsMcxMinLot ?? prev.optionsMcxMinLot,
                        optionsMcxMaxLot: config.optionsMcxMaxLot ?? prev.optionsMcxMaxLot,
                        optionsEquityMaxScrip: config.optionsEquityMaxScrip ?? prev.optionsEquityMaxScrip,
                        optionsIndexMaxScrip: config.optionsIndexMaxScrip ?? prev.optionsIndexMaxScrip,
                        optionsMcxMaxScrip: config.optionsMcxMaxScrip ?? prev.optionsMcxMaxScrip,
                        optionsMaxEquitySizeAll: config.optionsMaxEquitySizeAll ?? prev.optionsMaxEquitySizeAll,
                        optionsMaxIndexSizeAll: config.optionsMaxIndexSizeAll ?? prev.optionsMaxIndexSizeAll,
                        optionsMaxMcxSizeAll: config.optionsMaxMcxSizeAll ?? prev.optionsMaxMcxSizeAll,
                        optionsIndexIntraday: config.optionsIndexIntraday ?? prev.optionsIndexIntraday,
                        optionsIndexHolding: config.optionsIndexHolding ?? prev.optionsIndexHolding,
                        optionsEquityIntraday: config.optionsEquityIntraday ?? prev.optionsEquityIntraday,
                        optionsEquityHolding: config.optionsEquityHolding ?? prev.optionsEquityHolding,
                        optionsMcxIntraday: config.optionsMcxIntraday ?? prev.optionsMcxIntraday,
                        optionsMcxHolding: config.optionsMcxHolding ?? prev.optionsMcxHolding,
                        optionsOrdersAway: config.optionsOrdersAway ?? prev.optionsOrdersAway,
                        autoClosePct: config.autoClosePct ?? prev.autoClosePct,
                        autoClosePercentage: config.autoClosePercentage ?? prev.autoClosePercentage,
                        notifyPercentage: config.notifyPercentage ?? prev.notifyPercentage,
                        autoSquareOff: config.autoSquareOff ?? prev.autoSquareOff,
                        expirySquareOffTime: config.expirySquareOffTime ?? prev.expirySquareOffTime,
                        allowExpiringScrip: config.allowExpiringScrip ?? prev.allowExpiringScrip,
                        daysBeforeExpiry: config.daysBeforeExpiry ?? prev.daysBeforeExpiry,
                        mcxOptionsAwayPoints: config.mcxOptionsAwayPoints ?? prev.mcxOptionsAwayPoints,
                        comexConfig: config.comexConfig ?? prev.comexConfig,
                        forexConfig: config.forexConfig ?? prev.forexConfig,
                        cryptoConfig: config.cryptoConfig ?? prev.cryptoConfig,
                        notes: config.notes ?? prev.notes,
                        parentId: profile.parent_id ?? prev.parentId,
                    } : {
                        parentId: profile.parent_id ?? prev.parentId,
                    })
                }));
            } catch (err) {
                console.error('Failed to load profile:', err);
            } finally {
                setLoadingProfile(false);
            }
        };
        loadProfile();
    }, [client?.id]);

    // Fetch brokers for dropdown
    useEffect(() => {
        const fetchBrokers = async () => {
            try {
                const data = await api.getClients({ role: 'BROKER' });
                setBrokers(data || []);
            } catch (err) {
                console.error('Failed to fetch brokers:', err);
            }
        };
        fetchBrokers();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNestedChange = (parent, field, value, subField = null) => {
        setFormData(prev => {
            const newParent = { ...prev[parent] };
            if (subField) {
                newParent[field] = { ...newParent[field], [subField]: value };
            } else {
                newParent[field] = value;
            }
            return { ...prev, [parent]: newParent };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!client?.id) return;
        setLoading(true);
        setSaveError('');
        try {
            const userId = client.id;

            // Step 1: Update user profile with all basic fields
            await api.updateUser(userId, {
                fullName: formData.fullName,
                mobile: formData.mobile,
                city: formData.city,
                isDemo: formData.isDemoAccount,
                status: formData.accountStatus ? 'Active' : 'Inactive',
                parentId: formData.parentId || null
            });

            // Step 2: Update client settings + ALL config as JSON
            const configToSave = { ...formData };
            delete configToSave.documents;
            delete configToSave.password;

            await api.updateClientSettings(userId, {
                allowFreshEntry: formData.allowFreshEntry,
                allowOrdersBetweenHL: formData.allowOrdersBetweenHL,
                tradeEquityUnits: formData.tradeEquityUnits,
                autoClosePct: formData.autoClosePercentage,
                notifyPct: formData.notifyPercentage,
                banAllSegmentLimitOrder: formData.banAllSegmentLimitOrder ? 1 : 0,
                config: configToSave
            });

            // Step 3: Update password if provided
            if (formData.password) {
                await api.updateUserPasswords(userId, {
                    newPassword: formData.password
                });
            }

            // Step 4: Upload new documents if any files selected
            const docs = formData.documents || {};
            const hasNewFiles = Object.values(docs).some(v => v instanceof File);
            if (hasNewFiles) {
                const docFormData = new FormData();
                if (docs.panCard instanceof File) docFormData.append('panScreenshot', docs.panCard);
                if (docs.aadhaarFront instanceof File) docFormData.append('aadharFront', docs.aadhaarFront);
                if (docs.aadhaarBack instanceof File) docFormData.append('aadharBack', docs.aadhaarBack);
                if (docs.bankStatement instanceof File) docFormData.append('bankProof', docs.bankStatement);
                await api.updateDocuments(userId, docFormData);
            }

            onSave(formData);
        } catch (err) {
            setSaveError(err.message || 'Failed to update client');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#1a2035] z-50 flex flex-col overflow-hidden text-slate-300">
            {/* Top Bar - Green as per screenshot */}
            <div className="bg-[#4caf50] h-14 flex items-center justify-between px-4 shadow-md shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-white hover:bg-black/10 px-3 py-1.5 rounded transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-[14px] font-bold uppercase tracking-tight">Back</span>
                    </button>
                </div>
                <div className="flex items-center gap-4 text-white">
                    <button className="hover:bg-black/10 p-1 rounded-full transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>

                    {/* Profile Dropdown Container */}
                    <div className="relative" ref={profileRef}>
                        <div
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            className="flex items-center gap-2 font-bold uppercase text-[12px] cursor-pointer hover:bg-black/10 px-3 py-1.5 rounded transition-colors tracking-tight select-none"
                        >
                            <User className="w-4 h-4 text-white/80" />
                            DEMO PANNEL
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Dropdown Menu */}
                        {showProfileDropdown && (
                            <div className="absolute right-0 mt-3 w-64 bg-white rounded shadow-2xl overflow-hidden z-50 border border-gray-100 animate-in fade-in zoom-in duration-200 origin-top-right">
                                {/* Ledger Balance Section */}
                                <div className="px-5 py-4 border-b border-gray-100">
                                    <p className="text-[#333] text-[14px] font-medium">
                                        Ledger-Balance: <span className="font-bold">0</span>
                                    </p>
                                </div>

                                {/* Action Items */}
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            if (onNavigate) onNavigate('change-password');
                                            setShowProfileDropdown(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-5 py-3 text-[#333] hover:bg-gray-50 transition-colors text-[13px] font-medium text-left"
                                    >
                                        <Lock className="w-4 h-4 text-gray-400" />
                                        Change Login Password
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (onNavigate) onNavigate('change-transaction-password');
                                            setShowProfileDropdown(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-5 py-3 text-[#333] hover:bg-gray-50 transition-colors text-[13px] font-medium text-left"
                                    >
                                        <Key className="w-4 h-4 text-gray-400" />
                                        Change Transaction Password
                                    </button>
                                </div>

                                {/* Logout Button */}
                                <div className="p-3">
                                    <button
                                        onClick={() => {
                                            if (onLogout) onLogout();
                                            setShowProfileDropdown(false);
                                        }}
                                        className="w-full bg-[#f44336] hover:bg-[#d32f2f] text-white py-2.5 rounded text-[13px] font-bold uppercase transition-all shadow-md"
                                    >
                                        Log out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Placeholder */}
                <div className="w-64 bg-[#1a2035] border-r border-white/5 hidden lg:flex flex-col p-4 space-y-1.5 shrink-0 overflow-y-auto custom-scrollbar">
                    <div className="text-slate-400 text-[11px] font-bold uppercase tracking-widest pb-4 mb-2 border-b border-white/5 px-2">Dashboard</div>
                    {[
                        { icon: 'fa-table-columns', label: 'DashBoard' },
                        { icon: 'fa-chart-line', label: 'Market Watch' },
                        { icon: 'fa-bell', label: 'Notifications' },
                        { icon: 'fa-list-ul', label: 'Action Ledger' },
                        { icon: 'fa-briefcase', label: 'Active Positions' },
                        { icon: 'fa-box-archive', label: 'Closed Positions' },
                        { icon: 'fa-user-tie', label: 'Trading Clients', active: true },
                        { icon: 'fa-arrow-right-arrow-left', label: 'Trades' },
                        { icon: 'fa-users-rectangle', label: 'Group Trades' },
                        { icon: 'fa-clock-rotate-left', label: 'Closed Trades' },
                        { icon: 'fa-trash-can', label: 'Deleted Trades' },
                        { icon: 'fa-hourglass-half', label: 'Pending Orders' },
                        { icon: 'fa-wallet', label: 'Trader Funds' },
                        { icon: 'fa-users', label: 'Users' },
                        { icon: 'fa-arrow-up-right-dots', label: 'Tickers' },
                        { icon: 'fa-ban', label: 'Banned Limit Orders' },
                        { icon: 'fa-building-columns', label: 'Bank Details' },
                        { icon: 'fa-address-card', label: 'Accounts' },
                        { icon: 'fa-network-wired', label: 'Broker Accounts' },
                        { icon: 'fa-key', label: 'Change Login Password' },
                        { icon: 'fa-shield-halved', label: 'Change Transaction Password' },
                        { icon: 'fa-money-bill-transfer', label: 'Withdrawal Requests' },
                        { icon: 'fa-file-invoice-dollar', label: 'Deposit Requests' },
                        { icon: 'fa-right-from-bracket', label: 'Log Out' }
                    ].map((item) => (
                        <div
                            key={item.label}
                            className={`text-slate-400 text-[13px] flex items-center justify-between py-2.5 px-3 rounded hover:bg-white/5 cursor-pointer transition-colors ${item.active ? 'bg-[#4caf50] text-white shadow-lg' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`fa-solid ${item.icon} text-xs`}></span>
                                <span className="truncate">{item.label}</span>
                            </div>
                            {item.label === 'Market Watch' && <span className="text-[10px] opacity-60" style={{ color: '#bcc0cf' }}>{new Date().toLocaleTimeString()}</span>}
                        </div>
                    ))}
                </div>

                {/* Form Wrapper */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-4 md:px-6 py-2 bg-[#1a2035]">
                    <div className="max-w-6xl mx-auto mt-4 mb-6">
                        <div className="flex justify-end mb-4">
                            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        {/* Floating Card Header (3D Ribbon Style) */}
                        <div className="relative z-20 -mb-8 ml-4 flex flex-col items-start">
                            <div
                                className="px-6 py-4 rounded-md shadow-xl relative z-10"
                                style={{ background: 'linear-gradient(60deg, rgb(40, 140, 108), rgb(78, 167, 82))' }}
                            >
                                <h2 className="text-white text-base font-normal leading-none tracking-tight">
                                    Update Trading Client:
                                </h2>
                            </div>
                            {/* The 3D fold decorator */}
                            <div className="w-4 h-4 bg-[#388e3c] -mt-2 ml-2 rounded-sm rotate-45 relative z-0"></div>
                        </div>

                        {/* Main Card */}
                        <div className="bg-[#202940] rounded shadow-2xl p-10 pt-16 border border-white/5">
                            {loadingProfile ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="text-center">
                                        <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-slate-400 text-sm">Loading profile data...</p>
                                    </div>
                                </div>
                            ) : null}
                            <form onSubmit={handleSubmit} style={{ display: loadingProfile ? 'none' : 'block' }}>
                                <div className="space-y-12">
                                    {/* PERSONAL DETAILS */}
                                    <fieldset className="border-none p-0 m-0">
                                        <SectionHeader title="Personal Details:" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                             <InputField label="Name" name="fullName" value={formData.fullName} onChange={handleChange} hint="Insert Real name of the trader. Will be visible in trading App" />
                                            <SelectField 
                                                label="Dealer/Broker Mapping" 
                                                name="parentId" 
                                                value={formData.parentId} 
                                                onChange={handleChange} 
                                                options={[
                                                    { value: '', label: 'Admin (Master)' },
                                                    ...brokers.map(b => ({ value: b.id, label: `${b.username} (${b.full_name || ''})` }))
                                                ]} 
                                                hint="Select which admin/broker this client belongs to"
                                            />
                                            <InputField label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} hint="Optional" />
                                            <InputField label="Username" name="username" value={formData.username} onChange={handleChange} hint="Username cannot be changed." disabled />
                                            <InputField label="Password" name="password" value={formData.password} onChange={handleChange} type="text" hint="password for loggin-in with, is case sensitive. Leave Blank if you want password remain unchanged." />
                                            <InputField label="City" name="city" value={formData.city} onChange={handleChange} hint="Optional" />
                                        </div>
                                    </fieldset>

                                    <hr className="border-white/5" />

                                    {/* CONFIG */}
                                    <fieldset className="border-none p-0 m-0">
                                        <SectionHeader title="Config:" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                            <CheckboxField label="demo account?" name="isDemoAccount" checked={formData.isDemoAccount} onChange={handleChange} />
                                            <CheckboxField label="Allow order between high and low" name="allowOrdersBetweenHL" checked={formData.allowOrdersBetweenHL} onChange={handleChange} />
                                            <CheckboxField label="Allow Fresh Entry Order above high & below low?" name="allowFreshEntry" checked={formData.allowFreshEntry} onChange={handleChange} />
                                            <CheckboxField label="Ban All Segment Limit Order" name="banAllSegmentLimitOrder" checked={formData.banAllSegmentLimitOrder} onChange={handleChange} />
                                            <CheckboxField label="Trade equity as units instead of lots." name="tradeEquityUnits" checked={formData.tradeEquityUnits} onChange={handleChange} />
                                            <CheckboxField label="Account Status" name="accountStatus" checked={formData.accountStatus} onChange={handleChange} />
                                            <CheckboxField label="Auto Close Trades if condition met" name="autoCloseTrades" checked={formData.autoCloseTrades} onChange={handleChange} />

                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 mt-4">
                                            <InputField label="auto-Close all active trades when the losses reach % of Ledger-balance" name="autoClosePercentage" value={formData.autoClosePercentage} onChange={handleChange} hint="Example: 95, will close when losses reach 95% of ledger balance" />
                                            <InputField label="Notify client when the losses reach % of Ledger-balance" name="notifyPercentage" value={formData.notifyPercentage} onChange={handleChange} hint="Example: 70, will send notification to customer every 5-minutes until losses cross 70% of ledger balance" />
                                        </div>
                                    </fieldset>

                                    <hr className="border-white/5" />

                                    {/* MCX FUTURES */}
                                    <EditMCXFutureSection
                                        formData={formData}
                                        handleChange={handleChange}
                                        handleNestedChange={handleNestedChange}
                                        globalBanAll={formData.banAllSegmentLimitOrder}
                                    />

                                    <hr className="border-white/5" />

                                    {/* EQUITY FUTURES */}
                                    <fieldset className="border-none p-0 m-0">
                                        <SectionHeader title="Equity Futures" />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 px-2 mb-4">
                                            <div className="space-y-0">
                                                <div className="mb-0">
                                                    <CheckboxField 
                                                        label=" Equity Trading" 
                                                        name="equityTrading" 
                                                        checked={formData.equityTrading} 
                                                        onChange={handleChange} 
                                                    />
                                                </div>
                                                <div className="mb-0">
                                                    <CheckboxField 
                                                        label="Ban Equity Limit Order" 
                                                        name="banEquityLimitOrder" 
                                                        checked={formData.banEquityLimitOrder} 
                                                        onChange={handleChange}
                                                        disabled={formData.banAllSegmentLimitOrder}
                                                        tooltip="If enabled, client cannot place limit orders in Equity Futures segment."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">

                                            <div className="mt-4">
                                                <InputField label="Equity Segment Limit" name="equitySegmentLimit" value={formData.equitySegmentLimit} onChange={handleChange} />
                                            </div>

                                            <InputField label="Min. Time to book profit (No. of Seconds)" name="equityMinTimeToBookProfit" value={formData.equityMinTimeToBookProfit} onChange={handleChange} hint="Example: 120, will hold the trade for 2 minutes before closing a trade in profit" />
                                            <SelectField label="Scalping Stop Loss" name="equityScalpingStopLoss" value={formData.equityScalpingStopLoss} onChange={handleChange} options={[{ value: 'Disabled', label: 'Disabled' }, { value: 'Enabled', label: 'Enabled' }]} hint="If Disabled, Stop Loss or Booking Loss can be done after Min. time of profit booking." />
                                            <InputField label="Equity brokerage Per Crore" name="equityBrokerage" value={formData.equityBrokerage} onChange={handleChange} />
                                            <InputField label="Minimum lot size required per single trade of Equity" name="equityMinLot" value={formData.equityMinLot} onChange={handleChange} />
                                            <InputField label="Maximum lot size allowed per single trade of Equity" name="equityMaxLot" value={formData.equityMaxLot} onChange={handleChange} />
                                            <InputField label="Minimum lot size required per single trade of Equity INDEX" name="equityMinIndexLot" value={formData.equityMinIndexLot} onChange={handleChange} />
                                            <InputField label="Maximum lot size allowed per single trade of Equity INDEX" name="equityMaxIndexLot" value={formData.equityMaxIndexLot} onChange={handleChange} />
                                            <InputField label="Maximum quantity size allowed per script of Equity to be actively open at a time" name="equityMaxScrip" value={formData.equityMaxScrip} onChange={handleChange} />
                                            <InputField label="Maximum quantity size allowed per script of Equity INDEX to be actively open at a time" name="equityMaxIndexScrip" value={formData.equityMaxIndexScrip} onChange={handleChange} />
                                            <InputField label="Max Size All Equity" name="equityMaxSizeAll" value={formData.equityMaxSizeAll} onChange={handleChange} />
                                            <InputField label="Max Size All Index" name="equityMaxSizeAllIndex" value={formData.equityMaxSizeAllIndex} onChange={handleChange} />
                                            <InputField label="Intraday Exposure/Margin Equity" name="equityIntradayMargin" value={formData.equityIntradayMargin} onChange={handleChange} hint="Exposure auto calculates the margin money required..." />
                                            <InputField label="Holding Exposure/Margin Equity" name="equityHoldingMargin" value={formData.equityHoldingMargin} onChange={handleChange} hint="Holding Exposure auto calculates the margin money required..." />
                                            <InputField label="Orders to be away by % from current price Equity" name="equityOrdersAway" value={formData.equityOrdersAway} onChange={handleChange} />
                                        </div>
                                    </fieldset>

                                    <hr className="border-white/5" />

                                    {/* OPTIONS CONFIG */}
                                    <fieldset className="border-none p-0 m-0">
                                        <SectionHeader title="Option Config" />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 px-2 mb-8 items-start">
                                            <div className="space-y-0">
                                                <div className="mb-0">
                                                    <CheckboxField 
                                                        label=" Options Trading" 
                                                        name="indexOptionsTrading" 
                                                        checked={formData.indexOptionsTrading} 
                                                        onChange={handleChange} 
                                                    />
                                                </div>
                                                <div className="mb-0">
                                                    <CheckboxField 
                                                        label="Ban Option Limit Order" 
                                                        name="banOptionsLimitOrder" 
                                                        checked={formData.banOptionsLimitOrder} 
                                                        onChange={handleChange}
                                                        disabled={formData.banAllSegmentLimitOrder}
                                                        tooltip="If enabled, client cannot place limit orders in Options segment."
                                                    />
                                                </div>
                                                <CheckboxField label="Equity Options Trading" name="equityOptionsTrading" checked={formData.equityOptionsTrading} onChange={handleChange} />
                                            </div>
                                            <div className="space-y-0">
                                                <CheckboxField label="MCX Options Trading" name="mcxOptionsTrading" checked={formData.mcxOptionsTrading} onChange={handleChange} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">

                                            <InputField label="Min. Time to book profit (No. of Seconds)" name="optionsMinTimeToBookProfit" value={formData.optionsMinTimeToBookProfit} onChange={handleChange} hint="Example: 120, will hold the trade for 2 minutes before closing a trade in profit" />
                                            <SelectField label="Scalping Stop Loss" name="optionsScalpingStopLoss" value={formData.optionsScalpingStopLoss} onChange={handleChange} options={[{ value: 'Disabled', label: 'Disabled' }, { value: 'Enabled', label: 'Enabled' }]} hint="If Disabled, Stop Loss or Booking Loss can be done after Min. time of profit booking." />
                                            <SelectField label="Options Index Brokerage Type" name="optionsIndexBrokerageType" value={formData.optionsIndexBrokerageType} onChange={handleChange} options={[{ value: 'per_lot', label: 'Per Lot Basis' }, { value: 'per_crore', label: 'Per Crore Basis' }]} />
                                            <InputField label="Options Index brokerage" name="optionsIndexBrokerage" value={formData.optionsIndexBrokerage} onChange={handleChange} />

                                            <SelectField label="Options Equity Brokerage Type" name="optionsEquityBrokerageType" value={formData.optionsEquityBrokerageType} onChange={handleChange} options={[{ value: 'per_lot', label: 'Per Lot Basis' }, { value: 'per_crore', label: 'Per Crore Basis' }]} />
                                            <InputField label="Options Equity brokerage" name="optionsEquityBrokerage" value={formData.optionsEquityBrokerage} onChange={handleChange} />

                                            <SelectField label="Options MCX Brokerage Type" name="optionsMcxBrokerageType" value={formData.optionsMcxBrokerageType} onChange={handleChange} options={[{ value: 'per_lot', label: 'Per Lot Basis' }, { value: 'per_crore', label: 'Per Crore Basis' }]} />
                                            <InputField label="Options MCX brokerage" name="optionsMcxBrokerage" value={formData.optionsMcxBrokerage} onChange={handleChange} />

                                            <InputField label="Options Min. Bid Price" name="optionsMinBidPrice" value={formData.optionsMinBidPrice} onChange={handleChange} />
                                            <div className="hidden md:block"></div>

                                            <SelectField label="Options Index Short Selling Allowed (Sell First and Buy later)" name="optionsIndexShortSelling" value={formData.optionsIndexShortSelling} onChange={handleChange} options={[{ value: 'No', label: 'No' }, { value: 'Yes', label: 'Yes' }]} />
                                            <SelectField label="Options Equity Short Selling Allowed (Sell First and Buy later)" name="optionsEquityShortSelling" value={formData.optionsEquityShortSelling} onChange={handleChange} options={[{ value: 'No', label: 'No' }, { value: 'Yes', label: 'Yes' }]} />
                                            <SelectField label="MCX Options Short Selling Allowed (Sell First and Buy later)" name="optionsMcxShortSelling" value={formData.optionsMcxShortSelling} onChange={handleChange} options={[{ value: 'No', label: 'No' }, { value: 'Yes', label: 'Yes' }]} />
                                            <div className="hidden md:block"></div>

                                            <InputField label="Minimum lot size required per single trade of Equity Options" name="optionsEquityMinLot" value={formData.optionsEquityMinLot} onChange={handleChange} />
                                            <InputField label="Maximum lot size allowed per single trade of Equity Options" name="optionsEquityMaxLot" value={formData.optionsEquityMaxLot} onChange={handleChange} />

                                            <InputField label="Minimum lot size required per single trade of Equity INDEX Options" name="optionsIndexMinLot" value={formData.optionsIndexMinLot} onChange={handleChange} />
                                            <InputField label="Maximum lot size allowed per single trade of Equity INDEX Options" name="optionsIndexMaxLot" value={formData.optionsIndexMaxLot} onChange={handleChange} />

                                            <InputField label="Minimum lot size required per single trade of MCX Options" name="optionsMcxMinLot" value={formData.optionsMcxMinLot} onChange={handleChange} />
                                            <InputField label="Maximum lot size allowed per single trade of MCX Options" name="optionsMcxMaxLot" value={formData.optionsMcxMaxLot} onChange={handleChange} />

                                            <InputField label="Maximum lot size allowed per scrip of Equity Options to be actively open at a time" name="optionsEquityMaxScrip" value={formData.optionsEquityMaxScrip} onChange={handleChange} />
                                            <InputField label="Maximum lot size allowed per scrip of Equity INDEX Options to be actively open at a time" name="optionsIndexMaxScrip" value={formData.optionsIndexMaxScrip} onChange={handleChange} />

                                            <InputField label="Maximum lot size allowed per scrip of MCX Options to be actively open at a time" name="optionsMcxMaxScrip" value={formData.optionsMcxMaxScrip} onChange={handleChange} />
                                            <div className="hidden md:block"></div>

                                            <InputField label="Max Size All Equity Options" name="optionsMaxEquitySizeAll" value={formData.optionsMaxEquitySizeAll} onChange={handleChange} />
                                            <InputField label="Max Size All Index Options" name="optionsMaxIndexSizeAll" value={formData.optionsMaxIndexSizeAll} onChange={handleChange} />
                                            <InputField label="Max Size All MCX Options" name="optionsMaxMcxSizeAll" value={formData.optionsMaxMcxSizeAll} onChange={handleChange} />
                                            <div className="hidden md:block"></div>

                                            <InputField
                                                label="Intraday Exposure/Margin Options Index"
                                                name="optionsIndexIntraday"
                                                value={formData.optionsIndexIntraday}
                                                onChange={handleChange}
                                                hint="Exposure auto calculates the margin money required for any new trade entry. Calculation : turnover of a trade divided by Exposure is required margin. e.g. if gold having lotsize of 100 is trading @ 45000 and exposure is 200, (45000 X 100) / 200 = 22500 is required to initiate the trade."
                                            />
                                            <InputField
                                                label="Holding Exposure/Margin Options Index"
                                                name="optionsIndexHolding"
                                                value={formData.optionsIndexHolding}
                                                onChange={handleChange}
                                                hint="Holding Exposure auto calculates the margin money required to hold a position overnight for the next market working day. Calculation : turnover of a trade divided by Exposure is required margin. eg. if gold having lot size of 100 is trading @ 45000 and holding exposure is 800, (45000 X 100) / 80 = 56250 is required to hold position overnight. System automatically checks at a given time around market closure to check and close all trades if margin(M2M) insufficient."
                                            />

                                            <InputField
                                                label="Intraday Exposure/Margin Options Equity"
                                                name="optionsEquityIntraday"
                                                value={formData.optionsEquityIntraday}
                                                onChange={handleChange}
                                                hint="Exposure auto calculates the margin money required for any new trade entry. Calculation : turnover of a trade divided by Exposure is required margin. e.g. if gold having lotsize of 100 is trading @ 45000 and exposure is 200, (45000 X 100) / 200 = 22500 is required to initiate the trade."
                                            />
                                            <InputField
                                                label="Holding Exposure/Margin Options Equity"
                                                name="optionsEquityHolding"
                                                value={formData.optionsEquityHolding}
                                                onChange={handleChange}
                                                hint="Holding Exposure auto calculates the margin money required to hold a position overnight for the next market working day. Calculation : turnover of a trade divided by Exposure is required margin. eg. if gold having lot size of 100 is trading @ 45000 and holding exposure is 800, (45000 X 100) / 80 = 56250 is required to hold position overnight. System automatically checks at a given time around market closure to check and close all trades if margin(M2M) insufficient."
                                            />

                                            <InputField
                                                label="Intraday Exposure/Margin Options MCX"
                                                name="optionsMcxIntraday"
                                                value={formData.optionsMcxIntraday}
                                                onChange={handleChange}
                                                hint="Exposure auto calculates the margin money required for any new trade entry. Calculation : turnover of a trade divided by Exposure is required margin. e.g. if gold having lotsize of 100 is trading @ 45000 and exposure is 200, (45000 X 100) / 200 = 22500 is required to initiate the trade."
                                            />
                                            <InputField
                                                label="Holding Exposure/Margin Options MCX"
                                                name="optionsMcxHolding"
                                                value={formData.optionsMcxHolding}
                                                onChange={handleChange}
                                                hint="Holding Exposure auto calculates the margin money required to hold a position overnight for the next market working day. Calculation : turnover of a trade divided by Exposure is required margin. eg. if gold having lot size of 100 is trading @ 45000 and holding exposure is 800, (45000 X 100) / 80 = 56250 is required to hold position overnight. System automatically checks at a given time around market closure to check and close all trades if margin(M2M) insufficient."
                                            />

                                            <InputField label="Orders to be away by % from current price in Options" name="optionsOrdersAway" value={formData.optionsOrdersAway} onChange={handleChange} />
                                        </div>
                                    </fieldset>


                                    {/* INTERNATIONAL SEGMENTS */}
                                    <fieldset className="border-none p-0 m-0">
                                        <div className="flex items-center gap-3 mb-8 px-2">
                                            <h3 className="text-[20px] font-black text-white uppercase tracking-tight">International Segments (Comex, Forex, Crypto):</h3>
                                        </div>

                                        <div className="space-y-6 px-2">
                                            {/* COMEX */}
                                            <div className="bg-[#1a202e] rounded-xl p-6 border border-white/5 overflow-hidden transition-all duration-500">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div>
                                                        <h4 className="text-[16px] font-black text-cyan-400 uppercase tracking-wider border-l-2 border-cyan-400 pl-3">Comex Commodities</h4>
                                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 pl-3">Global Commodity Exchange Settings</p>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex items-center gap-3 bg-[#202940] px-4 py-2 rounded-lg border border-white/5">
                                                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Status</span>
                                                            <input type="checkbox" name="comexTrading" checked={formData.comexTrading} onChange={handleChange} className="w-5 h-5 rounded accent-[#4caf50] cursor-pointer" />
                                                            <span className={`text-[11px] font-black uppercase tracking-wider ${formData.comexTrading ? 'text-green-400' : 'text-slate-500'}`}>{formData.comexTrading ? 'ENABLED' : 'DISABLED'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {formData.comexTrading && (
                                                    <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
                                                        <ComexForm 
                                                            config={formData.comexConfig}
                                                            onChange={(field, val) => handleNestedChange('comexConfig', field, val)}
                                                            globalBanAll={formData.banAllSegmentLimitOrder}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* FOREX */}
                                            <div className="bg-[#1a202e] rounded-xl p-6 border border-white/5 overflow-hidden transition-all duration-500">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div>
                                                        <h4 className="text-[16px] font-black text-green-400 uppercase tracking-wider border-l-2 border-green-400 pl-3">Forex / Currency</h4>
                                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 pl-3">Universal Currency Trading Parameters</p>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex items-center gap-3 bg-[#202940] px-4 py-2 rounded-lg border border-white/5">
                                                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Status</span>
                                                            <input type="checkbox" name="forexTrading" checked={formData.forexTrading} onChange={handleChange} className="w-5 h-5 rounded accent-[#4caf50] cursor-pointer" />
                                                            <span className={`text-[11px] font-black uppercase tracking-wider ${formData.forexTrading ? 'text-green-400' : 'text-slate-500'}`}>{formData.forexTrading ? 'ENABLED' : 'DISABLED'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {formData.forexTrading && (
                                                    <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
                                                        <ForexForm 
                                                            config={formData.forexConfig}
                                                            onChange={(field, val) => handleNestedChange('forexConfig', field, val)}
                                                            globalBanAll={formData.banAllSegmentLimitOrder}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* CRYPTO */}
                                            <div className="bg-[#1a202e] rounded-xl p-6 border border-white/5 overflow-hidden transition-all duration-500">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div>
                                                        <h4 className="text-[16px] font-black text-orange-400 uppercase tracking-wider border-l-2 border-orange-400 pl-3">Crypto (Bitcoin/ETH)</h4>
                                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 pl-3">Cryptocurrency Asset Execution Hub</p>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex items-center gap-3 bg-[#202940] px-4 py-2 rounded-lg border border-white/5">
                                                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Status</span>
                                                            <input type="checkbox" name="cryptoTrading" checked={formData.cryptoTrading} onChange={handleChange} className="w-5 h-5 rounded accent-[#4caf50] cursor-pointer" />
                                                            <span className={`text-[11px] font-black uppercase tracking-wider ${formData.cryptoTrading ? 'text-green-400' : 'text-slate-500'}`}>{formData.cryptoTrading ? 'ENABLED' : 'DISABLED'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {formData.cryptoTrading && (
                                                    <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
                                                        <CryptoForm 
                                                            config={formData.cryptoConfig}
                                                            onChange={(field, val) => handleNestedChange('cryptoConfig', field, val)}
                                                            globalBanAll={formData.banAllSegmentLimitOrder}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </fieldset>

                                    <hr className="border-white/5" />

                                    {/* KYC / DOCUMENT VERIFICATION */}
                                    <fieldset className="border-none p-0 m-0">
                                        <div className="flex items-center gap-3 mb-8 px-2">
                                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                                <ShieldCheck className="w-5 h-5 text-orange-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-[20px] font-black text-white uppercase tracking-tight">Kyc / Document Verification</h3>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Official Identity & Compliance Documents</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-2">
                                            {[
                                                { key: 'panCard', label: 'PAN Card', id: 'edit-doc-pan' },
                                                { key: 'aadhaarFront', label: 'Aadhaar Front', id: 'edit-doc-aadhaar-f' },
                                                { key: 'aadhaarBack', label: 'Aadhaar Back', id: 'edit-doc-aadhaar-b' },
                                                { key: 'bankStatement', label: 'Bank Proof / Cheque', id: 'edit-doc-bank' }
                                            ].map(doc => {
                                                const file = formData.documents[doc.key];
                                                const existingUrl = existingDocs[doc.key];
                                                const hasFile = file instanceof File;
                                                const hasExisting = !!existingUrl;
                                                const isPdfFile = hasFile && file.type === 'application/pdf';
                                                const isPdfUrl = hasExisting && (existingUrl.toLowerCase().endsWith('.pdf') || existingUrl.includes('/pdf'));
                                                const viewUrl = hasFile ? URL.createObjectURL(file) : existingUrl;

                                                return (
                                                    <div key={doc.key} className="space-y-3">
                                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{doc.label}</label>
                                                        <div className="relative group">
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                id={doc.id}
                                                                accept="image/*,.pdf"
                                                                onChange={(e) => handleNestedChange('documents', doc.key, e.target.files[0])}
                                                            />
                                                            <label htmlFor={doc.id} className="flex flex-col items-center justify-center h-48 rounded-2xl bg-black/40 border-2 border-dashed border-white/10 hover:border-green-500/50 hover:bg-black/60 transition-all overflow-hidden cursor-pointer">
                                                                {hasFile ? (
                                                                    <div className="w-full h-full relative flex flex-col items-center justify-center">
                                                                        {isPdfFile ? (
                                                                            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-red-900/20 rounded-2xl">
                                                                                <FileText className="w-16 h-16 text-red-400 opacity-50" />
                                                                            </div>
                                                                        ) : file.type?.startsWith('image/') ? (
                                                                            <img src={URL.createObjectURL(file)} alt={doc.label} className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-70" />
                                                                        ) : null}
                                                                        <div className="relative z-10 flex flex-col items-center gap-2">
                                                                            <div className="w-10 h-10 rounded-full bg-green-500/30 backdrop-blur flex items-center justify-center">
                                                                                <Check className="w-5 h-5 text-green-400" />
                                                                            </div>
                                                                            <span className="text-[9px] font-black text-green-300 bg-black/60 px-2 py-1 rounded max-w-[120px] truncate">{file.name}</span>
                                                                            <span className="text-[8px] text-slate-400">Click to change</span>
                                                                        </div>
                                                                    </div>
                                                                ) : hasExisting ? (
                                                                    <div className="w-full h-full relative flex flex-col items-center justify-center">
                                                                        {isPdfUrl ? (
                                                                            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-red-900/20 rounded-2xl">
                                                                                <FileText className="w-16 h-16 text-red-400 opacity-50" />
                                                                            </div>
                                                                        ) : (
                                                                            <img src={existingUrl} alt={doc.label} crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-70" onError={(e) => { e.target.style.display = 'none'; }} />
                                                                        )}
                                                                        <div className="relative z-10 flex flex-col items-center gap-2">
                                                                            <div className="w-10 h-10 rounded-full bg-green-500/30 backdrop-blur flex items-center justify-center">
                                                                                <Check className="w-5 h-5 text-green-400" />
                                                                            </div>
                                                                            <span className="text-[9px] font-black text-green-300 bg-black/60 px-2 py-1 rounded">UPLOADED</span>
                                                                            <span className="text-[8px] text-slate-400">Click to replace</span>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-all">
                                                                            <FileUp className="w-6 h-6 text-slate-600 group-hover:text-green-400" />
                                                                        </div>
                                                                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Upload {doc.label}</span>
                                                                        <p className="text-[9px] text-slate-600 mt-2 font-bold uppercase underline">Click to Browse</p>
                                                                    </>
                                                                )}
                                                            </label>
                                                            {(hasFile || hasExisting) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(viewUrl, '_blank'); }}
                                                                    className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-blue-600/80 hover:bg-blue-500 flex items-center justify-center transition-all shadow-lg"
                                                                    title="View Document"
                                                                >
                                                                    <Eye className="w-4 h-4 text-white" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </fieldset>

                                    <hr className="border-white/5" />

                                    {/* OTHER SECTION */}
                                    <fieldset className="border-none p-0 m-0 pb-10">
                                        <SectionHeader title="Other:" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 px-2">
                                            <InputField label="Notes" name="notes" value={formData.notes} onChange={handleChange} placeholder="" />
                                            <InputField label="Transaction Password" name="transactionPassword" value={formData.transactionPassword} onChange={handleChange} type="password" />
                                        </div>

                                        {/* Save Button */}
                                        <div className="pt-4 px-2">
                                            {saveError && (
                                                <div className="mb-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded px-4 py-2 text-sm">
                                                    {saveError}
                                                </div>
                                            )}
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-12 py-3 text-white rounded font-bold text-sm uppercase transition-all shadow-md active:scale-95 hover:bg-[#43a047] disabled:opacity-60"
                                                style={{ background: '#5cb85c' }}
                                            >
                                                {loading ? 'UPDATING...' : 'UPDATE CLIENT'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="ml-4 px-12 py-3 text-white rounded font-bold text-sm uppercase transition-all shadow-md active:scale-95 bg-slate-600 hover:bg-slate-700"
                                            >
                                                CANCEL
                                            </button>
                                        </div>
                                    </fieldset>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default UpdateClientPage;
