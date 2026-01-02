
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState, useRef } from 'react';
import { ArrowDownTrayIcon, PlusIcon, ViewColumnsIcon, DocumentIcon, CodeBracketIcon, XMarkIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Creation } from './CreationHistory';
import { GeminiError } from '../services/gemini';

interface LivePreviewProps {
  creation: Creation | null;
  isLoading: boolean;
  error: GeminiError | null;
  isFocused: boolean;
  onReset: () => void;
}

// Fix: Correctly augment Window interface with pdfjsLib (use uppercase Window)
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

const LoadingStep = ({ text, active, completed }: { text: string, active: boolean, completed: boolean }) => (
    <div 
      className={`flex items-center space-x-3 transition-all duration-500 ${active || completed ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-4'}`}
      aria-hidden={!active && !completed}
    >
        <div className={`w-4 h-4 flex items-center justify-center ${completed ? 'text-green-400' : active ? 'text-blue-400' : 'text-zinc-700'}`}>
            {completed ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : active ? (
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" aria-hidden="true"></div>
            ) : (
                <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full" aria-hidden="true"></div>
            )}
        </div>
        <span className={`font-mono text-xs tracking-wide uppercase ${active ? 'text-zinc-200' : completed ? 'text-zinc-400 line-through' : 'text-zinc-600'}`}>{text}</span>
    </div>
);

const PdfRenderer = ({ dataUrl }: { dataUrl: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderPdf = async () => {
      // Fix: Now window.pdfjsLib is correctly typed
      if (!window.pdfjsLib) {
        setError("PDF library not initialized");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const loadingTask = window.pdfjsLib.getDocument(dataUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 2.0 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext).promise;
        setLoading(false);
      } catch (err) {
        console.error("Error rendering PDF:", err);
        setError("Could not render PDF preview.");
        setLoading(false);
      }
    };
    renderPdf();
  }, [dataUrl]);

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-6 text-center" role="alert">
            <DocumentIcon className="w-12 h-12 mb-3 opacity-50 text-red-400" aria-hidden="true" />
            <p className="text-sm mb-2 text-red-400/80">{error}</p>
        </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10" aria-label="Loading PDF preview">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        )}
        <canvas 
            ref={canvasRef} 
            className={`max-w-full max-h-full object-contain shadow-xl border border-zinc-800/50 rounded transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
        />
    </div>
  );
};

export const LivePreview: React.FC<LivePreviewProps> = ({ creation, isLoading, error, isFocused, onReset }) => {
    const [loadingStep, setLoadingStep] = useState(0);
    const [showSplitView, setShowSplitView] = useState(false);

    useEffect(() => {
        if (isLoading) {
            setLoadingStep(0);
            const interval = setInterval(() => {
                setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
            }, 2000); 
            return () => clearInterval(interval);
        } else {
            setLoadingStep(0);
        }
    }, [isLoading]);

    useEffect(() => {
        if (creation?.originalImage) {
            setShowSplitView(true);
        } else {
            setShowSplitView(false);
        }
    }, [creation]);

    const handleExport = () => {
        if (!creation) return;
        const dataStr = JSON.stringify(creation, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${creation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_artifact.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isLoading ? "Processing application" : error ? "Generation error" : creation ? `Previewing ${creation.name}` : "Live Preview"}
      className={`
        fixed z-40 flex flex-col
        rounded-lg overflow-hidden border border-zinc-800 bg-[#0E0E10] shadow-2xl
        transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1)
        ${isFocused
          ? 'inset-2 md:inset-4 opacity-100 scale-100'
          : 'top-1/2 left-1/2 w-[90%] h-[60%] -translate-x-1/2 -translate-y-1/2 opacity-0 scale-95 pointer-events-none'
        }
      `}
    >
      <div className="bg-[#121214] px-4 py-3 flex items-center justify-between border-b border-zinc-800 shrink-0">
        <div className="flex items-center space-x-3 w-32">
           <div className="flex space-x-2 group/controls">
                <button 
                  onClick={onReset}
                  aria-label="Close Preview"
                  className="w-3 h-3 rounded-full bg-zinc-700 group-hover/controls:bg-red-500 hover:!bg-red-600 transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  <XMarkIcon className="w-2 h-2 text-black opacity-0 group-hover/controls:opacity-100" aria-hidden="true" />
                </button>
                <div className="w-3 h-3 rounded-full bg-zinc-700 group-hover/controls:bg-yellow-500 transition-colors"></div>
                <div className="w-3 h-3 rounded-full bg-zinc-700 group-hover/controls:bg-green-500 transition-colors"></div>
           </div>
        </div>
        
        <div className="flex items-center space-x-2 text-zinc-500" aria-hidden="true">
            <CodeBracketIcon className="w-3 h-3" />
            <span className="text-[11px] font-mono uppercase tracking-wider">
                {isLoading ? 'System Processing...' : error ? 'Process Halted' : creation ? creation.name : 'Preview Mode'}
            </span>
        </div>

        <div className="flex items-center justify-end space-x-1 w-32">
            {!isLoading && creation && (
                <>
                    {creation.originalImage && (
                         <button 
                            onClick={() => setShowSplitView(!showSplitView)}
                            aria-label={showSplitView ? "Show application only" : "Show side-by-side comparison"}
                            title={showSplitView ? "Show App Only" : "Compare with Original"}
                            className={`p-1.5 rounded-md transition-all ${showSplitView ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                        >
                            <ViewColumnsIcon className="w-4 h-4" aria-hidden="true" />
                        </button>
                    )}

                    <button 
                        onClick={handleExport}
                        aria-label="Export artifact as JSON file"
                        title="Export Artifact (JSON)"
                        className="text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 rounded-md hover:bg-zinc-800"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4" aria-hidden="true" />
                    </button>

                    <button 
                        onClick={onReset}
                        aria-label="Start a new artifact upload"
                        title="New Upload"
                        className="ml-2 flex items-center space-x-1 text-xs font-bold bg-white text-black hover:bg-zinc-200 px-3 py-1.5 rounded-md transition-colors"
                    >
                        <PlusIcon className="w-3 h-3" aria-hidden="true" />
                        <span className="hidden sm:inline">New</span>
                    </button>
                </>
            )}
            {error && (
                <button 
                    onClick={onReset}
                    aria-label="Return to upload area"
                    className="flex items-center space-x-1 text-xs font-bold bg-zinc-800 text-zinc-100 hover:bg-zinc-700 px-3 py-1.5 rounded-md transition-colors"
                >
                    <ArrowPathIcon className="w-3 h-3" aria-hidden="true" />
                    <span>Back</span>
                </button>
            )}
        </div>
      </div>

      <div className="relative w-full flex-1 bg-[#09090b] flex overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 w-full" aria-busy="true">
             <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 mb-6 text-blue-500 animate-spin-slow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-zinc-100 font-mono text-lg tracking-tight">Constructing Environment</h3>
                    <p className="text-zinc-500 text-sm mt-2">Interpreting visual data...</p>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={(loadingStep + 1) * 25} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(loadingStep + 1) * 25}%` }}></div>
                </div>
                 <div className="border border-zinc-800 bg-black/50 rounded-lg p-4 space-y-3 font-mono text-sm">
                     <LoadingStep text="Analyzing visual inputs" active={loadingStep === 0} completed={loadingStep > 0} />
                     <LoadingStep text="Identifying UI patterns" active={loadingStep === 1} completed={loadingStep > 1} />
                     <LoadingStep text="Generating functional logic" active={loadingStep === 2} completed={loadingStep > 2} />
                     <LoadingStep text="Compiling preview" active={loadingStep === 3} completed={loadingStep > 3} />
                 </div>
             </div>
          </div>
        ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 w-full animate-in fade-in zoom-in-95 duration-500" role="alert">
                <div className="max-w-sm w-full bg-zinc-900/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto">
                        <ExclamationTriangleIcon className="w-8 h-8 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-zinc-100 font-bold text-xl tracking-tight">Generation Failed</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            {error.message}
                        </p>
                    </div>
                    <div className="pt-4">
                        <button 
                            onClick={onReset}
                            className="w-full py-3 px-4 bg-zinc-100 hover:bg-white text-black font-bold rounded-xl transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                            Try Another Artifact
                        </button>
                        <p className="mt-4 text-[10px] uppercase tracking-widest text-zinc-600 font-mono">
                            Error Code: {error.type}
                        </p>
                    </div>
                </div>
            </div>
        ) : creation?.html ? (
          <>
            {showSplitView && creation.originalImage && (
                <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-zinc-800 bg-[#0c0c0e] relative flex flex-col shrink-0">
                    <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur text-zinc-400 text-[10px] font-mono uppercase px-2 py-1 rounded border border-zinc-800">
                        Input Source
                    </div>
                    <div className="w-full h-full p-6 flex items-center justify-center overflow-hidden">
                        {creation.originalImage.startsWith('data:application/pdf') ? (
                            <PdfRenderer dataUrl={creation.originalImage} />
                        ) : (
                            <img 
                                src={creation.originalImage} 
                                alt="Original Input provided by user" 
                                className="max-w-full max-h-full object-contain shadow-xl border border-zinc-800/50 rounded"
                            />
                        )}
                    </div>
                </div>
            )}
            <div className={`relative h-full bg-white transition-all duration-500 ${showSplitView && creation.originalImage ? 'w-full md:w-1/2 h-1/2 md:h-full' : 'w-full'}`}>
                 <iframe
                    title={`Interactive application: ${creation.name}`}
                    srcDoc={creation.html}
                    className="w-full h-full"
                    sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
                />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
