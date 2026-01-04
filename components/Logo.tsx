
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`relative bg-[#1e3a8a] rounded-full flex items-center justify-center overflow-hidden border border-white/20 ${className}`}>
      {/* Diagonal Line */}
      <div className="absolute w-[150%] h-[1px] bg-white rotate-[35deg] transform origin-center"></div>
      
      {/* S - Top Left */}
      <span className="absolute top-[15%] left-[18%] text-white font-serif font-bold leading-none select-none" style={{ fontSize: '110%' }}>
        S
      </span>
      
      {/* A - Bottom Right */}
      <span className="absolute bottom-[15%] right-[18%] text-white font-serif font-bold leading-none select-none" style={{ fontSize: '110%' }}>
        A
      </span>
    </div>
  );
};

export default Logo;
