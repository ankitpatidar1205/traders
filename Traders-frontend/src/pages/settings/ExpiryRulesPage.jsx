import React, { useState } from 'react';
import * as api from '../../services/api';

// ── Reusable field components ─────────────────────────────────────────────────

const SelectField = ({ label, name, value, onChange, options }) => (
    <div className="mb-8">
        <label className="block text-[13px] font-semibold mb-2" style={{ color: '#5b8dd9' }}>
            {label}
        </label>
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-transparent border-b border-white/10 py-2 pr-8 text-white text-[14px] focus:outline-none focus:border-[#5cb85c] appearance-none transition-colors cursor-pointer"
                style={{ color: '#fff' }}
            >
                {options.map(o => (
                    <option key={o.value} value={o.value} style={{ background: '#1a2035' }}>
                        {o.label}
                    </option>
                ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</span>
        </div>
    </div>
);

const InputField = ({ label, name, value, onChange, placeholder = '0', hint }) => (
    <div className="mb-8">
        <label className="block text-[13px] font-semibold mb-2" style={{ color: '#5b8dd9' }}>
            {label}
        </label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-transparent border-b border-white/10 py-2 text-white text-[14px] focus:outline-none focus:border-[#5cb85c] transition-colors"
        />
        {hint && <p className="text-[11px] mt-1.5 text-slate-500">{hint}</p>}
    </div>
);

const ScripField = ({ label, name, value, onChange }) => (
    <div className="mb-4">
        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>
            {label}
        </label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-transparent border-b border-white/10 py-1.5 text-white text-[13px] focus:outline-none focus:border-[#5cb85c] transition-colors"
        />
    </div>
);

// ── MCX Away Points scrips (as seen in screenshot) ────────────────────────────
const DEFAULT_AWAY_POINTS = {
    MCXBULLDEX: '0', GOLD: '0', SILVER: '0', CRUDEOIL: '0',
    COPPER: '0', NICKEL: '0', ZINC: '0', LEAD: '0',
    NATURALGAS: '0', MENTHAOIL: '0', COTTON: '0', GOLDM: '0',
    SILVERM: '0', 'SILVER MIC': '0',
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const ExpiryRulesPage = () => {
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const [formData, setFormData] = useState({
        autoSquareOff: 'No',
        expirySquareOffTime: '11:30',
        allowExpiringScrip: 'No',
        daysBeforeExpiry: '0',
        mcxOptionsAwayPoints: { ...DEFAULT_AWAY_POINTS },
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAwayPointChange = (scrip, value) => {
        setFormData(prev => ({
            ...prev,
            mcxOptionsAwayPoints: { ...prev.mcxOptionsAwayPoints, [scrip]: value },
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateExpiryRules?.(formData);
            setToast({ show: true, message: 'Expiry rules saved successfully!', type: 'success' });
        } catch (err) {
            setToast({ show: true, message: err?.message || 'Failed to save expiry rules.', type: 'error' });
        } finally {
            setSaving(false);
            setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
        }
    };

    return (
        <div className="min-h-full bg-[#1a2035] px-4 sm:px-8 md:px-12 py-6 md:py-10 pb-24 overflow-y-auto custom-scrollbar">

            {/* ── Toast ── */}
            {toast.show && (
                <div
                    className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-xl text-sm font-bold transition-all ${
                        toast.type === 'success'
                            ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                            : 'bg-red-500/20 border border-red-500/30 text-red-400'
                    }`}
                >
                    {toast.message}
                </div>
            )}

            <div className="max-w-5xl mx-auto">

                {/* ── Page Header ── */}
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-white tracking-tight">Expiry Rules</h1>
                    <p className="text-slate-500 text-sm mt-1">Configure global expiry and square-off settings for all trading clients.</p>
                </div>

                {/* ── Card ── */}
                <div className="bg-[#1f283e] rounded-xl border border-white/5 shadow-2xl p-6 md:p-10">

                    {/* ── Section Title ── */}
                    <div className="mb-8 pb-4 border-b border-white/5">
                        <h2 className="text-[18px] font-bold text-white">Expiry Rules:</h2>
                    </div>

                    {/* ── Main Fields Grid ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
                        <SelectField
                            label="Auto Square-off on Expiry Day"
                            name="autoSquareOff"
                            value={formData.autoSquareOff}
                            onChange={handleChange}
                            options={[{ value: 'No', label: 'NO' }, { value: 'Yes', label: 'YES' }]}
                        />
                        <InputField
                            label="Square-off Time"
                            name="expirySquareOffTime"
                            value={formData.expirySquareOffTime}
                            onChange={handleChange}
                            placeholder="11:30"
                            hint="Time in HH:MM format (e.g. 11:30)"
                        />
                        <SelectField
                            label="Allow buying of expiring scrip"
                            name="allowExpiringScrip"
                            value={formData.allowExpiringScrip}
                            onChange={handleChange}
                            options={[{ value: 'No', label: 'NO' }, { value: 'Yes', label: 'YES' }]}
                        />
                        <InputField
                            label="Days before expiry to stop buying"
                            name="daysBeforeExpiry"
                            value={formData.daysBeforeExpiry}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>

                    {/* ── MCX Options Away Points ── */}
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <h4 className="text-[13px] text-slate-400 uppercase font-bold tracking-widest mb-6">
                            MCX Options Away Points:
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-2">
                            {Object.entries(formData.mcxOptionsAwayPoints).map(([scrip, val]) => (
                                <ScripField
                                    key={scrip}
                                    label={`${scrip}:`}
                                    name={scrip}
                                    value={val}
                                    onChange={(e) => handleAwayPointChange(scrip, e.target.value)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* ── Save Button ── */}
                    <div className="mt-10 pt-6 border-t border-white/5 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-10 py-3 rounded-lg text-white font-bold text-sm uppercase tracking-widest transition-all shadow-lg disabled:opacity-60"
                            style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)', boxShadow: '0 4px 15px rgba(76,175,80,0.3)' }}
                        >
                            {saving ? 'Saving…' : 'Save Expiry Rules'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ExpiryRulesPage;
