import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BookOpen } from 'lucide-react';

export default function MangaListItem({ manga }) {
  const unread = manga.total_chapters > 0 ? manga.total_chapters - manga.last_read_chapter : 0;

  return (
    <Link to={createPageUrl('MangaDetail') + `?id=${manga.id}`}>
      <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-[hsl(222,47%,12%)] transition-colors group">
        <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0">
          {manga.cover_url ? (
            <img src={manga.cover_url} alt={manga.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-600/30 to-indigo-900/40 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-violet-400/50" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white truncate">{manga.title}</h3>
          <p className="text-xs text-[hsl(215,15%,50%)] mt-0.5">
            Ch. {manga.last_read_chapter || 0} / {manga.total_chapters || '?'}
          </p>
        </div>
        {unread > 0 && (
          <div className="bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0">
            {unread}
          </div>
        )}
      </div>
    </Link>
  );
}
