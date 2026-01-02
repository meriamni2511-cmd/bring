
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useCallback, useState, useEffect } from 'react';
import { ArrowUpTrayIcon, CpuChipIcon } from '@heroicons/react/24/outline';

interface InputAreaProps {
  onGenerate: (prompt: string, file?: File) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

const CyclingText = () => {
    const words = [
        "a napkin sketch",
        "a whiteboard plan",
        "a floor layout",
        "a board game",
        "a legacy diagram",
        "a custom interface"
    ];
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setIndex(prev => (prev + 1) % words.length);
                setFade(true);
            }, 600);
        }, 3500);
        return () => clearInterval(interval);
    }, [words.length]);

    return (
        <span className={`inline-block transition-all duration-700 transform ${fade ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-4 blur-md'} text-blue-400 font-bold italic`}>
            {words[index]}
        </span>
    );
};

export const InputArea: React.FC<InputAreaProps> = ({ onGenerate, isGenerating, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      onGenerate("", file);
    } else {
      alert("Please upload an image or PDF.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isGenerating) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [disabled, isGenerating]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!disabled && !isGenerating) {
        setIsDragging(true);
    }
  }, [disabled, isGenerating]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 perspective-1000 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
      <div 
        className={`relative group transition-all duration-500 ${isDragging ? 'scale-[1.02]' : ''}`}
      >
        {/* Glow effect on hover */}
        <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-0 transition duration-500 group-hover:opacity-20 ${isDragging ? 'opacity-40' : ''}`}></div>
        
        <label
          className={`
            relative flex flex-col items-center justify-center
            h-64 sm:h-72 md:h-[24rem]
            bg-zinc-900/40 
            backdrop-blur-xl
            rounded-2xl border border-dashed
            cursor-pointer overflow-hidden
            transition-all duration-500
            ${isDragging 
              ? 'border-blue-500 bg-zinc-900/60 shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)]' 
              : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/50'
            }
            ${isGenerating ? 'pointer-events-none' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
            <div className="absolute inset-0 bg-dot-grid opacity-[0.05] pointer-events-none"></div>
            
            <div className={`absolute top-6 left-6 w-6 h-6 border-l-2 border-t-2 transition-all duration-500 ${isDragging ? 'border-blue-500' : 'border-zinc-700 opacity-50'}`}></div>
            <div className={`absolute top-6 right-6 w-6 h-6 border-r-2 border-t-2 transition-all duration-500 ${isDragging ? 'border-blue-500' : 'border-zinc-700 opacity-50'}`}></div>
            <div className={`absolute bottom-6 left-6 w-6 h-6 border-l-2 border-b-2 transition-all duration-500 ${isDragging ? 'border-blue-500' : 'border-zinc-700 opacity-50'}`}></div>
            <div className={`absolute bottom-6 right-6 w-6 h-6 border-r-2 border-b-2 transition-all duration-500 ${isDragging ? 'border-blue-500' : 'border-zinc-700 opacity-50'}`}></div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-8 p-8 w-full">
                <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center transition-all duration-500 ${isDragging ? 'scale-110 rotate-3' : 'group-hover:-translate-y-2'}`}>
                    <div className={`absolute inset-0 rounded-2xl bg-zinc-800 border border-zinc-700 shadow-2xl flex items-center justify-center ${isGenerating ? 'animate-pulse' : ''}`}>
                        {isGenerating ? (
                            <CpuChipIcon className="w-10 h-10 md:w-12 md:h-12 text-blue-400 animate-spin-slow" />
                        ) : (
                            <ArrowUpTrayIcon className={`w-10 h-10 md:w-12 md:h-12 text-zinc-400 transition-all duration-500 ${isDragging ? 'text-blue-400' : 'group-hover:text-zinc-200'}`} />
                        )}
                    </div>
                </div>

                <div className="space-y-4 w-full">
                    <h3 className="flex flex-col items-center justify-center text-2xl sm:text-3xl md:text-5xl text-zinc-100 font-bold tracking-tight gap-4">
                        <span>Turn</span>
                        <div className="h-10 sm:h-12 md:h-16 flex items-center justify-center w-full">
                           <CyclingText />
                        </div>
                        <span>into reality</span>
                    </h3>
                    <p className="text-zinc-500 text-sm sm:text-lg font-medium tracking-wide">
                        <span className="hidden md:inline">Drop any file</span>
                        <span className="md:hidden">Tap</span> to begin transformation
                    </p>
                </div>
            </div>

            <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={isGenerating || disabled}
            />
        </label>
      </div>
    </div>
  );
};
