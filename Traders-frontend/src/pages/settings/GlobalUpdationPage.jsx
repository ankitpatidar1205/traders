import React, { useState } from 'react';
import {
    Users, LayoutGrid, Settings2, ShieldCheck, AlertTriangle, ArrowRight, History,
    CheckCircle2, Search, Activity, RotateCcw, ShieldAlert, Cpu, Lock, UserCheck,
    Database, MapPin, X, Info, Layers
} from 'lucide-react';
import { globalBatchUpdate } from '../../services/api';

const GlobalUpdationPage = () => {
    const [step, setStep] = useState(1);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [execResult, setExecResult] = useState(null);
    const [selection, setSelection] = useState({
        target: 'All Users',
        segment: 'MCX',
        parameter: 'Brokerage',
        newValue: ''
    });

    const executeInjection = async () => {
        setIsExecuting(true);
        try {
            const result = await globalBatchUpdate({
                target: selection.target,
                segment: selection.segment,
                parameter: selection.parameter,
                value: selection.newValue,
            });
            setExecResult({ success: true, message: result?.message || 'Batch update applied successfully' });
            setShowConfirmModal(false);
            setStep(1);
            setSelection({ target: 'All Users', segment: 'MCX', parameter: 'Brokerage', newValue: '' });
        } catch (err) {
            setExecResult({ success: false, message: err.message || 'Execution failed' });
            setShowConfirmModal(false);
        } finally {
            setIsExecuting(false);
        }
    };

    const steps = [
        { id: 1, title: 'Target', icon: Users, desc: 'Scope Selection' },
        { id: 2, title: 'Segment', icon: LayoutGrid, desc: 'Asset Class' },
        { id: 3, title: 'Value', icon: Settings2, desc: 'Parameter Logic' },
        { id: 4, title: 'Simulate', icon: Activity, desc: 'Impact Audit' }
    ];

    const targets = ['All Users', 'Selected Group', 'Active Users Only', 'Dealer Specific'];
    const segments = ['MCX', 'Equity', 'Options', 'Comex', 'Forex', 'Crypto'];
    const parameters = ['Brokerage', 'Leverage', 'Max Lot', 'Margin', 'Exposure Multiplier'];

    // Simulation Data Logic
    const startSimulation = () => {
        setIsSimulating(true);
        setTimeout(() => {
            setIsSimulating(false);
            setStep(4);
        }, 2000);
    };

    return (
        <div className=" space-y-8 animate-fade-in custom-scrollbar bg-[#1a2035] min-h-screen">
            {/* Enterprise Header */}
            <div className="bg-gradient-to-r from-[#202940] to-[#151c2c] p-10 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Database className="w-64 h-64 text-white" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-xl shadow-inner">
                                <ShieldCheck className="w-8 h-8 text-[#4CAF50]" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tighter">Global Batch Execution</h2>
                                <p className="text-[#4CAF50] text-[10px] font-black uppercase tracking-[0.2em] mt-1 italic">Enterprise Surveillance & Control Mode</p>
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm max-w-2xl font-medium leading-relaxed opacity-80 border-l-2 border-white/10 pl-6">
                            Inject global parameters into the live trading engine. This tool bypasses per-account overrides and enforces universal risk/brokerage logic. <b>Simulation and audit logs are mandatory for every execution.</b>
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button className="flex items-center justify-center gap-3 bg-[#2d3748] hover:bg-slate-700 text-white px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/10 shadow-lg group">
                            <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                            Emergency Revert
                        </button>
                    </div>
                </div>
            </div>

            {/* Precision Stepper */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {steps.map((s) => (
                    <div
                        key={s.id}
                        onClick={() => s.id < step && setStep(s.id)}
                        className={`p-6 rounded-2xl border transition-all duration-500 flex items-center gap-5 cursor-pointer group hover:scale-[1.02] ${step === s.id ? 'bg-[#01B4EA]/10 border-[#01B4EA] shadow-[0_0_30px_rgba(1,180,234,0.1)]' : step > s.id ? 'bg-[#4CAF50]/10 border-[#4CAF50]/40' : 'bg-[#202940] border-white/5 opacity-40'}`}
                    >
                        <div className={`p-4 rounded-xl border transition-all duration-300 ${step === s.id ? 'bg-[#01B4EA] text-white shadow-xl shadow-[#01B4EA]/30 scale-110' : step > s.id ? 'bg-[#4CAF50] text-white' : 'bg-[#151c2c] text-white/20'}`}>
                            <s.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${step === s.id ? 'text-[#01B4EA]' : step > s.id ? 'text-[#4CAF50]' : 'text-slate-500'}`}>Node 0{s.id}</p>
                            <h4 className="text-white font-bold text-sm tracking-tight group-hover:translate-x-1 transition-transform">{s.title}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Execution Core */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 bg-[#202940] rounded-2xl border border-white/5 shadow-3xl relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#01B4EA] to-transparent opacity-30"></div>

                    <div className="p-12">
                        {step === 1 && (
                            <div className="space-y-10 animate-fade-in">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                                        <Users className="w-6 h-6 text-[#01B4EA]" /> Define Target Scope
                                    </h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Select the user cluster for this injection</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {targets.map(t => (
                                        <button
                                            key={t}
                                            onClick={() => { setSelection({ ...selection, target: t }); setStep(2); }}
                                            className={`p-8 rounded-2xl text-left border transition-all flex flex-col gap-3 group relative overflow-hidden ${selection.target === t ? 'bg-[#01B4EA]/10 border-[#01B4EA] shadow-xl' : 'bg-[#151c2c] border-white/5 hover:border-white/20 hover:bg-[#1a2333]'}`}
                                        >
                                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                                                <Users className="w-24 h-24 text-white" />
                                            </div>
                                            <div className="flex justify-between items-center w-full relative z-10">
                                                <span className="text-white font-black text-lg tracking-tight">{t}</span>
                                                <ArrowRight className={`w-5 h-5 transition-all ${selection.target === t ? 'translate-x-0 text-[#01B4EA] scale-125' : 'opacity-0 translate-x-4'}`} />
                                            </div>
                                            <p className="text-slate-500 text-xs font-bold italic opacity-70 relative z-10">Batch injection focused on {t.toLowerCase()} cluster.</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-10 animate-fade-in">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                                        <Layers className="w-6 h-6 text-[#4CAF50]" /> Asset Class Mapping
                                    </h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Select the segment for parameter override</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
                                    {segments.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => { setSelection({ ...selection, segment: s }); setStep(3); }}
                                            className={`p-10 rounded-2xl border transition-all flex flex-col items-center gap-6 group hover:scale-[1.05] relative overflow-hidden ${selection.segment === s ? 'bg-[#4CAF50]/10 border-[#4CAF50] shadow-2xl shadow-[#4CAF50]/10' : 'bg-[#151c2c] border-white/5 hover:border-white/10'}`}
                                        >
                                            <div className={`p-6 rounded-2xl transition-all duration-500 ${selection.segment === s ? 'bg-[#4CAF50] text-white shadow-xl shadow-[#4CAF50]/30' : 'bg-[#202940] text-slate-600 group-hover:text-slate-300 shadow-inner'}`}>
                                                <LayoutGrid className="w-8 h-8" />
                                            </div>
                                            <span className="text-white font-black text-xs uppercase tracking-[0.3em] font-mono">{s}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-10 animate-fade-in">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                                        <Settings2 className="w-6 h-6 text-[#01B4EA]" /> Injection Logic
                                    </h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Select field and define the universal value</p>
                                </div>
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {parameters.map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setSelection({ ...selection, parameter: p })}
                                                className={`p-6 rounded-xl text-center border transition-all text-[10px] font-black uppercase tracking-widest ${selection.parameter === p ? 'bg-[#01B4EA]/10 border-[#01B4EA] text-white shadow-lg' : 'bg-[#151c2c] border-white/5 text-slate-500 hover:text-slate-300'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="pt-10 border-t border-white/5 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-[#4CAF50]" /> Injected Field Value
                                            </label>
                                            <span className="text-red-500 text-[10px] font-bold uppercase italic">* Surveillance Rule: 50% limit change max</span>
                                        </div>
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder="NODE VALUE: [0.00]"
                                            className="w-full bg-[#151c2c] border-2 border-white/5 text-white rounded-2xl p-8 text-4xl font-black tracking-tighter focus:outline-none focus:border-[#4CAF50] transition-all placeholder:text-slate-900 shadow-inner text-center"
                                            value={selection.newValue}
                                            onChange={(e) => setSelection({ ...selection, newValue: e.target.value })}
                                        />
                                        <button
                                            disabled={!selection.newValue || isSimulating}
                                            onClick={startSimulation}
                                            className="w-full bg-[#4CAF50] hover:bg-green-600 disabled:opacity-30 disabled:cursor-wait text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-sm shadow-2xl shadow-[#4CAF50]/20 transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
                                        >
                                            {isSimulating ? (
                                                <> <Activity className="w-5 h-5 animate-spin" /> Analyzing Impact Nodes...</>
                                            ) : (
                                                <> <ShieldCheck className="w-6 h-6" /> Run Enterprise Simulation</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-10 animate-fade-in">
                                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl flex gap-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-[2s]">
                                        <ShieldAlert className="w-32 h-32 text-red-500" />
                                    </div>
                                    <ShieldAlert className="w-12 h-12 text-red-500 flex-shrink-0 mt-1 animate-pulse" />
                                    <div className="space-y-2 relative z-10">
                                        <h4 className="text-red-500 font-black text-xl uppercase tracking-tighter">Impact Risk: HIGH CRITICAL</h4>
                                        <p className="text-red-200/60 text-sm font-medium italic leading-relaxed max-w-lg">
                                            Executing this batch will override <span className="text-white font-black underline">8,421 production accounts</span>. This action cannot be paused once committed. Snapshot backup initiated by Surveillance Node #42.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-8 border-y border-white/5">
                                    <div className="space-y-6">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Info className="w-4 h-4" /> Cluster Metadata
                                        </p>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-sm py-4 border-b border-white/5 mx-2"><span className="text-slate-400 font-bold uppercase text-[10px]">Total Node Reach:</span> <span className="text-white font-black">8,421 Users</span></div>
                                            <div className="flex justify-between items-center text-sm py-4 border-b border-white/5 mx-2"><span className="text-slate-400 font-bold uppercase text-[10px]">Leverage Increase:</span> <span className="text-red-500 font-black">+42.0%</span></div>
                                            <div className="flex justify-between items-center text-sm py-4 mx-2"><span className="text-slate-400 font-bold uppercase text-[10px]">Exposure Impact:</span> <span className="text-yellow-500 font-black">~12.8Cr Est.</span></div>
                                        </div>
                                    </div>
                                    <div className="bg-[#151c2c] p-10 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner group relative">
                                        <div className="absolute top-4 left-4">
                                            <Activity className="w-6 h-6 text-[#4CAF50]/30 group-hover:text-[#4CAF50] transition-colors" />
                                        </div>
                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] mb-4">Injected Target Value</p>
                                        <span className="text-6xl font-black text-[#4CAF50] tracking-tighter drop-shadow-lg scale-110">{selection.newValue}</span>
                                        <p className="text-[9px] text-slate-700 font-bold mt-6 uppercase tracking-widest border-t border-white/5 pt-4 w-full">Final Surveillance Override Value</p>
                                    </div>
                                </div>

                                <div className="flex gap-6">
                                    <button onClick={() => setStep(1)} className="flex-1 bg-[#2d3748] hover:bg-slate-700 text-white font-black py-6 rounded-2xl uppercase tracking-widest text-xs transition-all border border-white/5">Abort Injection</button>
                                    <button
                                        onClick={() => setShowConfirmModal(true)}
                                        className="flex-[2] bg-[#4CAF50] hover:bg-green-600 text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-sm shadow-2xl shadow-[#4CAF50]/30 transition-all flex items-center justify-center gap-4 group active:scale-[0.98]"
                                    >
                                        <Lock className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                        Commit Phase 01: Finalize
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Surveillance Side Panel */}
                <div className="space-y-6">
                    <div className="bg-[#202940] p-8 rounded-2xl border border-white/5 shadow-xl">
                        <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                            <History className="w-5 h-5 text-[#01B4EA]" />
                            Audit Ledger (Last 48h)
                        </h3>
                        <div className="space-y-6">
                            {[
                                { user: 'Ad-Master', date: 'T-1h:20m', change: 'NSE Leverage -> 20.0', type: 'High', ip: '192.168.1.1' },
                                { user: 'Ad-Master', date: 'T-8h:45m', change: 'MCX Brokerage -> 50.0', type: 'Norm', ip: '192.168.1.1' }
                            ].map((job, i) => (
                                <div key={i} className="p-5 bg-[#151c2c] rounded-xl border border-white/5 group hover:border-[#01B4EA]/30 transition-all relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 w-1 h-full ${job.type === 'High' ? 'bg-red-500' : 'bg-[#4CAF50]'}`}></div>
                                    <div className="flex justify-between text-[9px] font-black mb-2 px-1">
                                        <span className="text-slate-500 uppercase">{job.date}</span>
                                        <span className="text-[#01B4EA]">{job.user} [{job.ip}]</span>
                                    </div>
                                    <p className="text-slate-200 text-xs font-black tracking-tight">{job.change}</p>
                                    <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-[8px] font-black uppercase text-[#4CAF50] hover:underline">Revert Node</button>
                                        <button className="text-[8px] font-black uppercase text-[#01B4EA] hover:underline">View Proof</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-10 py-5 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] border border-white/5 rounded-xl hover:bg-white/5 hover:text-white transition-all">Deep Surveillance Audit</button>
                    </div>

                    <div className="bg-gradient-to-br from-[#01B4EA]/20 to-blue-900/10 p-10 rounded-2xl border border-[#01B4EA]/10 text-center relative group overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none group-hover:scale-150 transition-transform duration-[10s]">
                            <Activity className="w-full h-full text-white" />
                        </div>
                        <Activity className="w-14 h-14 text-[#01B4EA] mx-auto mb-6 drop-shadow-xl animate-pulse" />
                        <h4 className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-2">Live Affected Reach</h4>
                        <p className="text-5xl font-black text-white tracking-tighter">8,421</p>
                        <p className="text-slate-500 text-[9px] font-black uppercase mt-4 tracking-widest opacity-60">Production Units Linked <br /> to "All Users" Node</p>
                    </div>
                </div>
            </div>

            {/* Final Confirmation Modal - Safe Execution Mode */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in">
                    <div className="bg-[#151c2c] w-full max-w-xl rounded-3xl border border-red-500/30 shadow-[0_0_100px_rgba(239,68,68,0.2)] overflow-hidden relative animate-slide-up">
                        <div className="p-12 space-y-10">
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                    <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tighter">Commit Production Batch?</h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Surveillance Checkpoint: Signature Required</p>
                            </div>

                            <div className="bg-[#202940] p-8 rounded-2xl border border-white/5 space-y-6 shadow-inner">
                                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Injection Field</p>
                                        <p className="text-white font-black text-sm uppercase">{selection.parameter}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Live Reach</p>
                                        <p className="text-[#4CAF50] font-black text-sm">8,421 Users</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Old Value (AVG)</p>
                                        <p className="text-slate-400 font-black text-sm italic">Mixed Nodes</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">New Node Value</p>
                                        <p className="text-[#01B4EA] font-black text-2xl tracking-tighter">{selection.newValue}</p>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-white/5 space-y-4">
                                    <div className="flex justify-between text-[10px] font-black">
                                        <span className="text-slate-600 uppercase">Admin Node:</span>
                                        <span className="text-white uppercase tracking-widest">Ad-Master [Super-Audit]</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black">
                                        <span className="text-slate-600 uppercase">Origin IP:</span>
                                        <span className="text-white tracking-tighter">11.45.281.09 (Mumbai Node)</span>
                                    </div>
                                </div>
                            </div>

                            {execResult && (
                                <div className={`p-4 rounded-xl text-sm font-bold text-center ${execResult.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                    {execResult.message}
                                </div>
                            )}
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={executeInjection}
                                    disabled={isExecuting}
                                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-wait text-white font-black py-5 rounded-2xl uppercase tracking-[0.3em] text-sm shadow-xl shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    {isExecuting ? <><Activity className="w-4 h-4 animate-spin" /> Executing...</> : 'Execute Batch Injection'}
                                </button>
                                <button onClick={() => setShowConfirmModal(false)} className="w-full bg-[#2d3748] hover:bg-slate-700 text-white font-black py-5 rounded-2xl uppercase tracking-[0.3em] text-sm transition-all text-opacity-50 hover:text-opacity-100">
                                    Cancel & Return
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
};

export default GlobalUpdationPage;
