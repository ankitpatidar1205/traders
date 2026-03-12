import React from 'react';

const DashboardFilters = () => {
  return (
    <div className="space-y-4 mb-6">
      {/* Row 1: Export Trades */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-3 bg-white">
             <input type="text" placeholder="From Date" className="w-full h-10 px-3 text-slate-800 text-sm border border-slate-300 placeholder:text-slate-500" />
        </div>
        <div className="col-span-12 md:col-span-3 bg-white">
             <input type="text" placeholder="To Date" className="w-full h-10 px-3 text-slate-800 text-sm border border-slate-300 placeholder:text-slate-500" />
        </div>
        <div className="col-span-12 md:col-span-6">
            <button 
                onClick={() => alert("Export Trades functionality would happen here")}
                className="w-full h-10 bg-[#17a2b8] hover:bg-[#138496] text-white text-xs font-bold uppercase tracking-wide transition-colors shadow-sm rounded-sm"
            >
            EXPORT TRADES
            </button>
        </div>
      </div>

       {/* Row 2: Download PDF */}
       <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-3 bg-white">
             <input type="text" placeholder="From Date" className="w-full h-10 px-3 text-slate-800 text-sm border border-slate-300 placeholder:text-slate-500" />
        </div>
        <div className="col-span-12 md:col-span-3 bg-white">
             <input type="text" placeholder="To Date" className="w-full h-10 px-3 text-slate-800 text-sm border border-slate-300 placeholder:text-slate-500" />
        </div>
        <div className="col-span-12 md:col-span-6">
            <button 
                onClick={() => alert("Download Trades PDF functionality would happen here")}
                className="w-full h-10 bg-[#17a2b8] hover:bg-[#138496] text-white text-xs font-bold uppercase tracking-wide transition-colors shadow-sm rounded-sm"
            >
            DOWNLOAD TRADES PDF
            </button>
        </div>
      </div>

       {/* Row 3: Export Funds */}
       <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-3 bg-white">
             <input type="text" placeholder="From Date" className="w-full h-10 px-3 text-slate-800 text-sm border border-slate-300 placeholder:text-slate-500" />
        </div>
        <div className="col-span-12 md:col-span-3 bg-white">
             <input type="text" placeholder="To Date" className="w-full h-10 px-3 text-slate-800 text-sm border border-slate-300 placeholder:text-slate-500" />
        </div>
        <div className="col-span-12 md:col-span-6">
            <button 
                onClick={() => alert("Export Funds functionality would happen here")}
                className="w-full h-10 bg-[#17a2b8] hover:bg-[#138496] text-white text-xs font-bold uppercase tracking-wide transition-colors shadow-sm rounded-sm"
            >
            EXPORT FUNDS
            </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;
