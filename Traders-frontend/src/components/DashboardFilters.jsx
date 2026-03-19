import React from 'react';

const DashboardFilters = () => {
  return (
    <div className="space-y-[1px] bg-[#0b111e] border border-white/10 rounded-sm shadow-2xl overflow-hidden mb-6">
      {/* Row 1: Export Trades */}
      <div className="grid grid-cols-12 bg-white">
        <div className="col-span-12 md:col-span-3 border-r border-slate-300">
             <input 
                type="text" 
                placeholder="From Date" 
                onFocus={(e) => e.target.type = 'date'}
                onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                className="w-full h-12 px-4 text-[#333] text-[14px] focus:outline-none placeholder:text-slate-500 font-bold" 
             />
        </div>
        <div className="col-span-12 md:col-span-3 border-r border-slate-300">
             <input 
                type="text" 
                placeholder="To Date" 
                onFocus={(e) => e.target.type = 'date'}
                onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                className="w-full h-12 px-4 text-[#333] text-[14px] focus:outline-none placeholder:text-slate-500 font-bold" 
             />
        </div>
        <div className="col-span-12 md:col-span-6 bg-[#0b111e] p-[2px]">
            <button 
                onClick={() => alert("Export Trades functionality")}
                className="w-full h-11 bg-[#1eb9d8] hover:bg-[#17a2b8] text-white text-[13px] font-bold uppercase tracking-widest transition-all rounded-sm shadow-inner"
            >
            EXPORT TRADES
            </button>
        </div>
      </div>

       {/* Row 2: Download PDF */}
       <div className="grid grid-cols-12 bg-white border-t border-slate-300">
        <div className="col-span-12 md:col-span-3 border-r border-slate-300">
             <input 
                type="text" 
                placeholder="From Date" 
                onFocus={(e) => e.target.type = 'date'}
                onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                className="w-full h-12 px-4 text-[#333] text-[14px] focus:outline-none placeholder:text-slate-500 font-bold" 
             />
        </div>
        <div className="col-span-12 md:col-span-3 border-r border-slate-300">
             <input 
                type="text" 
                placeholder="To Date" 
                onFocus={(e) => e.target.type = 'date'}
                onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                className="w-full h-12 px-4 text-[#333] text-[14px] focus:outline-none placeholder:text-slate-500 font-bold" 
             />
        </div>
        <div className="col-span-12 md:col-span-6 bg-[#0b111e] p-[2px]">
            <button 
                onClick={() => alert("Download PDF functionality")}
                className="w-full h-11 bg-[#1eb9d8] hover:bg-[#17a2b8] text-white text-[13px] font-bold uppercase tracking-widest transition-all rounded-sm shadow-inner"
            >
            DOWNLOAD TRADES PDF
            </button>
        </div>
      </div>

       {/* Row 3: Export Funds */}
       <div className="grid grid-cols-12 bg-white border-t border-slate-300">
        <div className="col-span-12 md:col-span-3 border-r border-slate-300">
             <input 
                type="text" 
                placeholder="From Date" 
                onFocus={(e) => e.target.type = 'date'}
                onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                className="w-full h-12 px-4 text-[#333] text-[14px] focus:outline-none placeholder:text-slate-500 font-bold" 
             />
        </div>
        <div className="col-span-12 md:col-span-3 border-r border-slate-300">
             <input 
                type="text" 
                placeholder="To Date" 
                onFocus={(e) => e.target.type = 'date'}
                onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                className="w-full h-12 px-4 text-[#333] text-[14px] focus:outline-none placeholder:text-slate-500 font-bold" 
             />
        </div>
        <div className="col-span-12 md:col-span-6 bg-[#0b111e] p-[2px]">
            <button 
                onClick={() => alert("Export Funds functionality")}
                className="w-full h-11 bg-[#1eb9d8] hover:bg-[#17a2b8] text-white text-[13px] font-bold uppercase tracking-widest transition-all rounded-sm shadow-inner"
            >
            EXPORT FUNDS
            </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;
