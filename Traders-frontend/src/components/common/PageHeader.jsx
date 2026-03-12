import React from 'react';

const PageHeader = ({ title, children }) => {
    return (
        <div
            className="w-full flex items-center justify-between px-6 py-5 mb-8 rounded-md shadow-[0_4px_20px_0_rgba(0,0,0,0.14),0_7px_10px_-5px_rgba(76,175,80,0.4)]"
            style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)' }}
        >
            <h2 className="text-white text-lg font-bold uppercase tracking-wide">
                {title}
            </h2>
            <div className="flex items-center gap-4">
                {children}
            </div>
        </div>
    );
};

export default PageHeader;
