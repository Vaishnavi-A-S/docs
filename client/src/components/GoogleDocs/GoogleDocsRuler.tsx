import React from 'react';

export const GoogleDocsRuler: React.FC = () => {
  return (
    <div className="w-full bg-[#f8f9fa] border-b border-[#e0e0e0] h-4 flex justify-center no-print select-none">
      <div className="w-full max-w-[850px] h-full bg-white relative flex items-center shadow-2xs">
        {/* Left Margin Indicator (Blue Google Docs Arrow/Triangle) */}
        <div className="absolute left-[72px] top-0 bottom-0 flex flex-col items-center z-10 cursor-ew-resize" title="Left margin (1 inch)">
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#1a73e8]" />
          <div className="w-[1px] h-2 bg-[#1a73e8]" />
        </div>

        {/* Measurement Ticks & Inch Numbers */}
        <div className="w-full h-full flex justify-between px-[72px] items-center text-[9px] font-sans text-slate-400">
          {[1, 2, 3, 4, 5, 6, 7].map(num => (
            <div key={num} className="flex-1 flex flex-col items-center relative h-full justify-end pb-0.5">
              {/* Tick marks */}
              <div className="absolute -left-0.5 top-0 w-[1px] h-1.5 bg-slate-300" />
              <div className="absolute left-1/4 top-0 w-[1px] h-1 bg-slate-200" />
              <div className="absolute left-2/4 top-0 w-[1px] h-1.5 bg-slate-300" />
              <div className="absolute left-3/4 top-0 w-[1px] h-1 bg-slate-200" />
              <span className="leading-none text-[8px] text-slate-400 font-medium">{num}</span>
            </div>
          ))}
        </div>

        {/* Right Margin Indicator */}
        <div className="absolute right-[72px] top-0 bottom-0 flex flex-col items-center z-10 cursor-ew-resize" title="Right margin (1 inch)">
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#1a73e8]" />
          <div className="w-[1px] h-2 bg-[#1a73e8]" />
        </div>
      </div>
    </div>
  );
};
