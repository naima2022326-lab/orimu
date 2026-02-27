import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BookOpen } from 'lucide-react';

export default function MangaCard({ manga }) {
  const progress = manga.total_chapters > 0
    ? Math.round((manga.last_read_chapter / manga.total_chapters) * 100)
    : 0;

  return (
    <Link to={createPageUrl('MangaDetail') + `?id=${manga.id}`}>
      <div className="group relative rounded-xl overflow-hidden bg-[hsl(222,47%,9%)] transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-violet-500/10">
        <div className="aspect-[2/3] relative overflow-hidden">
          {manga.cover_url ? (
            <img
              src={manga.cover_url}
              alt={manga.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-600/30 to-indigo-900/40 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-violet-400/50" />
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          
          {/* Unread badge */}
          {manga.total_chapters > 0 && manga.last_read_chapter < manga.total_chapters && (
            <div className="absolute top-2 right-2 bg-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              {manga.total_chapters - manga.last_read_chapter}
            </div>
          )}

          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2">
              {manga.title}
            </h3>
          </div>
        </div>

        {/* Progress bar */}
        {progress > 0 && (
          <div className="h-0.5 bg-[hsl(222,30%,16%)]">
            <div
              className="h-full bg-violet-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}
