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
    <div className="fixed bottom-4 right-6 bg-[#001244]/90 backdrop-blur-md border border-[#97c2f8]/30 shadow-2xl rounded-full px-4 py-1.5 text-xs text-[#aebfe2] flex items-center gap-2.5 z-20 pointer-events-none no-print">
      <span className="font-semibold text-[#f1f7ff]">{words} {words === 1 ? 'word' : 'words'}</span>
      <span className="text-[#97c2f8]/40">•</span>
      <span>{characters} chars</span>
      <span className="text-[#97c2f8]/40">•</span>
      <span className="text-[#97c2f8]">~{readingTimeMinutes} min read</span>
    </div>
  );
};
