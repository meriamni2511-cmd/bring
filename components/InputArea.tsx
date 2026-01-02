
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { ArrowUpTrayIcon, CpuChipIcon, SparklesIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

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
        <span 
          aria-live="polite"
          className={`inline-block transition-all duration-700 transform ${fade ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-4 blur-md'} text-blue-400 font-bold italic`}
        >
            {words[index]}
        </span>
    );
};

export const InputArea: React.FC<InputAreaProps> = ({ onGenerate, isGenerating, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [promptValue, setPromptValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      onGenerate(promptValue, file);
    } else {
      alert("Please upload an image or PDF.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isGenerating) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [disabled, isGenerating, promptValue]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isGenerating) {
        setIsDragging(true);
    }
  }, [disabled, isGenerating]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isGenerating || disabled) return;
    onGenerate(promptValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 perspective-1000 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
      <div 
        className={`relative group transition-all duration-500 flex flex-col gap-4 ${isDragging ? 'scale-[1.04]' : 'scale-100'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Glow effect on hover and drag */}
        <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-0 transition duration-500 group-hover:opacity-20 ${isDragging ? 'opacity-60 blur-2xl' : ''}`}></div>
        
        <div
          className={`
            relative flex flex-col items-center justify-center
            h-64 sm:h-72 md:h-80
            bg-zinc-900/40 
            backdrop-blur-xl
            rounded-2xl border border-dashed
            transition-all duration-500
            ${isDragging 
              ? 'border-blue-400 bg-zinc-900/60 shadow-[0_0_60px_-10px_rgba(59,130,246,0.5)] border-solid' 
              : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/50'
            }
            ${isGenerating ? 'pointer-events-none opacity-80' : ''}
          `}
        >
            <div className="absolute inset-0 bg-dot-grid opacity-[0.05] pointer-events-none" aria-hidden="true"></div>
            
            <div className={`absolute top-6 left-6 w-6 h-6 border-l-2 border-t-2 transition-all duration-500 ${isDragging ? 'border-blue-500' : 'border-zinc-700 opacity-50'}`} aria-hidden="true"></div>
            <div className={`absolute top-6 right-6 w-6 h-6 border-r-2 border-t-2 transition-all duration-500 ${isDragging ? 'border-blue-500' : 'border-zinc-700 opacity-50'}`} aria-hidden="true"></div>
            <div className={`absolute bottom-6 left-6 w-6 h-6 border-l-2 border-b-2 transition-all duration-500 ${isDragging ? 'border-blue-500' : 'border-zinc-700 opacity-50'}`} aria-hidden="true"></div>
            <div className={`absolute bottom-6 right-6 w-6 h-6 border-r-2 border-b-2 transition-all duration-500 ${isDragging ? 'border-blue-500' : 'border-zinc-700 opacity-50'}`} aria-hidden="true"></div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-6 p-8 w-full cursor-pointer" onClick={() => inputRef.current?.click()}>
                <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-500 ${isDragging ? 'scale-110 rotate-3' : 'group-hover:-translate-y-2'}`}>
                    <div className={`absolute inset-0 rounded-2xl bg-zinc-800 border border-zinc-700 shadow-2xl flex items-center justify-center ${isGenerating ? 'animate-pulse' : ''}`}>
                        {isGenerating ? (
                            <CpuChipIcon className="w-8 h-8 md:w-10 md:h-10 text-blue-400 animate-spin" aria-hidden="true" />
                        ) : (
                            <ArrowUpTrayIcon className={`w-8 h-8 md:w-10 md:h-10 text-zinc-400 transition-all duration-500 ${isDragging ? 'text-blue-400' : 'group-hover:text-zinc-200'}`} aria-hidden="true" />
                        )}
                    </div>
                </div>

                <div className="space-y-2 w-full">
                    <h3 className="flex flex-col items-center justify-center text-xl sm:text-2xl md:text-3xl text-zinc-100 font-bold tracking-tight gap-2">
                        <span>Turn</span>
                        <div className="h-8 sm:h-10 md:h-12 flex items-center justify-center w-full">
                           <CyclingText />
                        </div>
                        <span>into reality</span>
                    </h3>
                    <p className={`text-zinc-500 text-sm font-medium tracking-wide transition-colors duration-300 ${isDragging ? 'text-blue-300' : ''}`}>
                        {isDragging ? 'Release to transform artifact' : (
                          <>
                            <span className="hidden md:inline">Drop any file</span>
                            <span className="md:hidden">Tap</span> to upload
                          </>
                        )}
                    </p>
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={isGenerating || disabled}
                aria-hidden="true"
            />
        </div>

        {/* Unified Text Input for Prompts */}
        <div className="relative group/input flex-shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-1000">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur opacity-0 group-focus-within/input:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-all duration-300">
                <div className="pl-4 flex items-center justify-center text-zinc-600">
                    <SparklesIcon className="w-5 h-5" />
                </div>
                <input 
                    type="text"
                    value={promptValue}
                    onChange={(e) => setPromptValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isGenerating || disabled}
                    placeholder="Describe what you want to build..."
                    className="w-full bg-transparent px-4 py-4 text-zinc-200 placeholder-zinc-600 outline-none font-medium text-sm sm:text-base"
                    aria-label="Generation prompt description"
                />
                <button
                    onClick={() => handleSubmit()}
                    disabled={!promptValue.trim() || isGenerating || disabled}
                    className={`mr-2 p-2 rounded-lg transition-all duration-300 flex items-center justify-center ${promptValue.trim() ? 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95' : 'text-zinc-700 cursor-not-allowed'}`}
                    aria-label="Send prompt"
                >
                    <PaperAirplaneIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="absolute top-full left-0 right-0 mt-2 flex justify-between items-center px-1">
                <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">Alt text generation</span>
                <span className="text-[10px] text-zinc-700 font-mono">Press Enter to spark life</span>
            </div>
        </div>
      </div>
    </div>
  );
};
