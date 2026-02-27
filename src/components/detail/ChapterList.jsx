import React from 'react';
import { BookOpen, Eye } from 'lucide-react';
import DownloadButton from '../reader/DownloadButton';

export default function ChapterList({ manga, onReadChapter }) {
  const totalChapters = manga.total_chapters || 0;
  const lastRead = manga.last_read_chapter || 0;
  
  if (totalChapters === 0) {
    return (
      <div className="text-center py-12 text-[hsl(215,15%,50%)] text-sm">
        No chapters available
      </div>
    );
  }

  // Generate chapter list
  const chapters = Array.from({ length: totalChapters }, (_, i) => ({
    number: totalChapters - i,
    isRead: (totalChapters - i) <= lastRead,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">{totalChapters} Chapters</h2>
        <span className="text-xs text-[hsl(215,15%,50%)]">{lastRead} read</span>
      </div>
      
      <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
        {chapters.map(ch => (
          <div
            key={ch.number}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition-all duration-200 group ${
              ch.isRead
                ? 'bg-[hsl(222,47%,9%)] text-[hsl(215,15%,40%)]'
                : 'bg-[hsl(222,47%,10%)] text-white hover:bg-[hsl(222,47%,13%)]'
            }`}
          >
            <button
              onClick={() => onReadChapter(ch.number)}
              className="flex items-center gap-3 flex-1 text-left"
            >
              <BookOpen className={`w-4 h-4 ${ch.isRead ? 'text-[hsl(215,15%,30%)]' : 'text-violet-400'}`} />
              <span className="font-medium">Chapter {ch.number}</span>
            </button>
            <div className="flex items-center gap-2">
              {ch.isRead && <Eye className="w-3.5 h-3.5" />}
              <DownloadButton manga={manga} chapterNumber={ch.number} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
