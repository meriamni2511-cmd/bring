
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState } from 'react';
import { DocumentTextIcon, CalculatorIcon, PuzzlePieceIcon, ClipboardDocumentCheckIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { CursorArrowRaysIcon, ChartBarIcon, SparklesIcon } from '@heroicons/react/24/solid';

const DrawingTransformation = ({ 
  initialIcon: InitialIcon, 
  finalIcon: FinalIcon, 
  label,
  delay, 
  x, 
  y,
  rotation = 0
}: { 
  initialIcon: React.ElementType, 
  finalIcon: React.ElementType, 
  label: string,
  delay: number,
  x: string,
  y: string,
  rotation?: number
}) => {
  const [stage, setStage] = useState(0); 

  useEffect(() => {
    const cycle = () => {
      setStage(0);
      setTimeout(() => setStage(1), 500); 
      setTimeout(() => setStage(2), 3500); 
    };

    const startTimeout = setTimeout(() => {
      cycle();
      const interval = setInterval(cycle, 12000);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  return (
    <div 
      className="absolute transition-all duration-1000 ease-in-out z-0 pointer-events-none"
      style={{ top: y, left: x, transform: `rotate(${rotation}deg)` }}
    >
      <div className={`relative w-24 h-32 md:w-32 md:h-44 rounded-2xl backdrop-blur-xl transition-all duration-1000 ${stage === 2 ? 'bg-zinc-800/60 border-zinc-500/30 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] scale-110 -translate-y-4' : 'bg-zinc-900/20 border-zinc-800/50 scale-100 border border-dashed'}`}>
        
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[9px] md:text-[11px] font-mono font-bold px-3 py-1 rounded-full shadow-lg transition-all duration-700 ${stage === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {label}
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <div className={`absolute transition-all duration-1000 flex items-center justify-center ${stage === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
             <InitialIcon className="w-10 h-10 md:w-14 md:h-14 text-zinc-600 stroke-1" />
             <div className="absolute -inset-4 border border-zinc-700/20 opacity-40"></div>
          </div>

          <div className={`absolute transition-all duration-700 flex flex-col items-center ${stage === 2 ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-75 blur-md'}`}>
             <FinalIcon className="w-12 h-12 md:w-16 md:h-16 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
             {stage === 2 && (
               <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-full border border-zinc-700/40">
                 <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                 <div className="w-10 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 w-full animate-[shimmer_2s_infinite]"></div>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Hero: React.FC = () => {
  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="hidden lg:block">
            <DrawingTransformation initialIcon={ClipboardDocumentCheckIcon} finalIcon={SparklesIcon} label="PATENT" delay={0} x="6%" y="12%" rotation={-4} />
        </div>
        <div className="hidden md:block">
            <DrawingTransformation initialIcon={PuzzlePieceIcon} finalIcon={CursorArrowRaysIcon} label="GAME" delay={3000} x="85%" y="70%" rotation={3} />
        </div>
        <div className="hidden lg:block">
            <DrawingTransformation initialIcon={NewspaperIcon} finalIcon={ChartBarIcon} label="DASHBOARD" delay={6000} x="82%" y="10%" rotation={2} />
        </div>
        <div className="hidden md:block">
            <DrawingTransformation initialIcon={DocumentTextIcon} finalIcon={CalculatorIcon} label="APPLICATION" delay={4500} x="8%" y="68%" rotation={-2} />
        </div>
        
        {/* Background Glow Beams */}
        <div className="absolute top-[-10%] left-[20%] w-[60%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-[pulse-glow_8s_infinite] opacity-30"></div>
      </div>

      <div className="text-center relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-24">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold tracking-widest uppercase mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
           <SparklesIcon className="w-4 h-4" />
           <span>Intelligence Enabled UI</span>
        </div>
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter mb-8 leading-[0.95] text-gradient animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Bring anything <br/>
          to <span className="relative">
            life
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 358 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 21C61 11.5 142.5 5.5 355 5.5" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </span>.
        </h1>
        <p className="text-lg sm:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-light animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          Gemini sees the interactive DNA in every artifact. Transform sketches, maps, diagrams, and notes into functional software experiences in seconds.
        </p>
      </div>
    </>
  );
};
