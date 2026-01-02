
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { Hero } from './components/Hero';
import { InputArea } from './components/InputArea';
import { LivePreview } from './components/LivePreview';
import { CreationHistory, Creation } from './components/CreationHistory';
import { bringToLife, GeminiError } from './services/gemini';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';

const App: React.FC = () => {
  const [activeCreation, setActiveCreation] = useState<Creation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<GeminiError | null>(null);
  const [history, setHistory] = useState<Creation[]>([]);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initHistory = async () => {
      const saved = localStorage.getItem('gemini_app_history');
      let loadedHistory: Creation[] = [];

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          loadedHistory = parsed.map((item: any) => ({
              ...item,
              timestamp: new Date(item.timestamp)
          }));
        } catch (e) {
          console.error("Failed to load history", e);
        }
      }

      if (loadedHistory.length > 0) {
        setHistory(loadedHistory);
      } else {
        try {
           const exampleUrls = [
               'https://storage.googleapis.com/sideprojects-asronline/bringanythingtolife/vibecode-blog.json',
               'https://storage.googleapis.com/sideprojects-asronline/bringanythingtolife/cassette.json',
               'https://storage.googleapis.com/sideprojects-asronline/bringanythingtolife/chess.json'
           ];

           const examples = await Promise.all(exampleUrls.map(async (url) => {
               const res = await fetch(url);
               if (!res.ok) return null;
               const data = await res.json();
               return {
                   ...data,
                   timestamp: new Date(data.timestamp || Date.now()),
                   id: data.id || crypto.randomUUID()
               };
           }));
           
           const validExamples = examples.filter((e): e is Creation => e !== null);
           setHistory(validExamples);
        } catch (e) {
            console.error("Failed to load examples", e);
        }
      }
    };

    initHistory();
  }, []);

  useEffect(() => {
    if (history.length > 0) {
        try {
            localStorage.setItem('gemini_app_history', JSON.stringify(history));
        } catch (e) {
            console.warn("Local storage full or error saving history", e);
        }
    }
  }, [history]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleGenerate = async (promptText: string, file?: File) => {
    setIsGenerating(true);
    setActiveCreation(null);
    setError(null);

    try {
      let imageBase64: string | undefined;
      let mimeType: string | undefined;

      if (file) {
        imageBase64 = await fileToBase64(file);
        mimeType = file.type.toLowerCase();
      }

      const html = await bringToLife(promptText, imageBase64, mimeType);
      
      if (html) {
        const newCreation: Creation = {
          id: crypto.randomUUID(),
          name: file ? file.name : 'New Creation',
          html: html,
          originalImage: imageBase64 && mimeType ? `data:${mimeType};base64,${imageBase64}` : undefined,
          timestamp: new Date(),
        };
        setActiveCreation(newCreation);
        setHistory(prev => [newCreation, ...prev]);
      }

    } catch (err: any) {
      console.error("Failed to generate:", err);
      setError(err instanceof GeminiError ? err : new GeminiError(err.message || "Unknown Error"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setActiveCreation(null);
    setIsGenerating(false);
    setError(null);
  };

  const handleSelectCreation = (creation: Creation) => {
    setActiveCreation(creation);
    setError(null);
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = event.target?.result as string;
            const parsed = JSON.parse(json);
            if (parsed.html && parsed.name) {
                const importedCreation: Creation = {
                    ...parsed,
                    timestamp: new Date(parsed.timestamp || Date.now()),
                    id: parsed.id || crypto.randomUUID()
                };
                setHistory(prev => {
                    const exists = prev.some(c => c.id === importedCreation.id);
                    return exists ? prev : [importedCreation, ...prev];
                });
                setActiveCreation(importedCreation);
                setError(null);
            } else {
                alert("Invalid creation file format.");
            }
        } catch (err) {
            console.error("Import error", err);
            alert("Failed to import creation.");
        }
        if (importInputRef.current) importInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const isFocused = !!activeCreation || isGenerating || !!error;

  return (
    <div className="h-[100dvh] bg-zinc-950 bg-dot-grid text-zinc-50 selection:bg-blue-500/30 overflow-y-auto overflow-x-hidden relative flex flex-col scroll-smooth">
      
      <main 
        className={`
          min-h-full flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10 
          transition-all duration-1000 cubic-bezier(0.2, 0.8, 0.2, 1)
          ${isFocused 
            ? 'opacity-0 scale-95 blur-2xl pointer-events-none translate-y-8' 
            : 'opacity-100 scale-100 blur-0 translate-y-0'
          }
        `}
      >
        <div className="flex-1 flex flex-col justify-center items-center w-full py-16 md:py-24">
          <div className="w-full mb-12">
              <Hero />
          </div>
          <div className="w-full flex justify-center mb-16">
              <InputArea onGenerate={handleGenerate} isGenerating={isGenerating} disabled={isFocused} />
          </div>
        </div>
        
        <footer className="flex-shrink-0 pb-12 w-full mt-auto flex flex-col items-center gap-12">
            <div className="w-full">
                <CreationHistory history={history} onSelect={handleSelectCreation} />
            </div>
            
            <a 
              href="https://x.com/ammaar" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="View creator Ammaar's profile on X"
              className="group flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-all duration-500"
            >
              <span className="text-zinc-600 group-hover:text-blue-400 text-[10px] font-mono tracking-widest uppercase transition-colors" aria-hidden="true">Digital Crafting Engine</span>
              <span className="text-zinc-500 group-hover:text-zinc-200 text-xs font-bold transition-colors">Created by @ammaar</span>
            </a>
        </footer>
      </main>

      <LivePreview
        creation={activeCreation}
        isLoading={isGenerating}
        error={error}
        isFocused={isFocused}
        onReset={handleReset}
      />

      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-700 ${isFocused ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100'}`}>
        <button 
            onClick={handleImportClick}
            aria-label="Import and restore a previously exported artifact session"
            className="group flex items-center space-x-3 p-3 px-4 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-full hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-300 shadow-2xl focus-visible:ring-2 focus-visible:ring-blue-500"
            title="Import Artifact"
        >
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-200 hidden sm:inline" aria-hidden="true">Restore Session</span>
            <ArrowUpTrayIcon className="w-4 h-4 text-zinc-400 group-hover:text-blue-400" aria-hidden="true" />
        </button>
        <input 
            type="file" 
            ref={importInputRef} 
            onChange={handleImportFile} 
            accept=".json" 
            className="hidden" 
            aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default App;
