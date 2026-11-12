import React from 'react';

interface WordCounterProps {
  content: string;
}

export const WordCounter: React.FC<WordCounterProps> = ({ content }) => {
  // Strip HTML tags
  const plainText = content.replace(/<[^>]+>/g, ' ').trim();
  
  const words = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const characters = plainText.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="fixed bottom-4 right-6 bg-white/95 backdrop-blur-sm border border-slate-200/90 shadow-md rounded-full px-3.5 py-1.5 text-xs text-slate-500 flex items-center gap-2.5 z-20 pointer-events-none no-print">
      <span className="font-medium text-slate-700">{words} {words === 1 ? 'word' : 'words'}</span>
      <span className="text-slate-300">•</span>
      <span>{characters} chars</span>
      <span className="text-slate-300">•</span>
      <span>~{readingTimeMinutes} min read</span>
    </div>
  );
};
