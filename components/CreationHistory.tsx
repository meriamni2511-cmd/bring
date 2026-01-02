
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ClockIcon, ArrowRightIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';

export interface Creation {
  id: string;
  name: string;
  html: string;
  originalImage?: string; // Base64 data URL
  timestamp: Date;
}

interface CreationHistoryProps {
  history: Creation[];
  onSelect: (creation: Creation) => void;
}

export const CreationHistory: React.FC<CreationHistoryProps> = ({ history, onSelect }) => {
  if (history.length === 0) return null;

  return (
    <nav className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700" aria-label="Creation history archive">
      <div className="flex items-center space-x-3 mb-3 px-2">
        <ClockIcon className="w-4 h-4 text-zinc-500" aria-hidden="true" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Archive</h2>
        <div className="h-px flex-1 bg-zinc-800"></div>
      </div>
      
      {/* Horizontal Scroll Container for Compact Layout */}
      <div className="flex overflow-x-auto space-x-4 pb-4 px-2 scrollbar-hide">
        {history.map((item, index) => {
          const isPdf = item.originalImage?.startsWith('data:application/pdf');
          const timeString = item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              aria-label={`Restore ${item.name}, created at ${timeString}`}
              style={{ animationDelay: `${index * 80}ms` }}
              className="animate-entrance group flex-shrink-0 relative flex flex-col text-left w-44 h-28 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 rounded-lg transition-all duration-200 overflow-hidden shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="p-4 flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-1.5 bg-zinc-800 rounded group-hover:bg-zinc-700 transition-colors border border-zinc-700/50" aria-hidden="true">
                      {isPdf ? (
                          <DocumentIcon className="w-4 h-4 text-zinc-400" />
                      ) : item.originalImage ? (
                          <PhotoIcon className="w-4 h-4 text-zinc-400" />
                      ) : (
                          <DocumentIcon className="w-4 h-4 text-zinc-400" />
                      )}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-400">
                    {timeString}
                  </span>
                </div>
                
                <div className="mt-auto">
                  <h3 className="text-sm font-medium text-zinc-300 group-hover:text-white truncate">
                    {item.name}
                  </h3>
                  <div className="flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0" aria-hidden="true">
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">Restore</span>
                    <ArrowRightIcon className="w-3 h-3 text-blue-400" />
                  </div>
                </div>
              </div>
              
              {/* Subtle hover overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" aria-hidden="true" />
            </button>
          );
        })}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </nav>
  );
};
