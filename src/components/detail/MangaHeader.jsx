import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Star, Calendar, User, Palette } from 'lucide-react';

export default function MangaHeader({ manga }) {
  const statusColors = {
    ongoing: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    completed: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    hiatus: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
  };

  return (
    <div className="relative">
      {/* Background blur */}
      {manga.cover_url && (
        <div className="absolute inset-0 h-64 overflow-hidden">
          <img src={manga.cover_url} className="w-full h-full object-cover blur-3xl opacity-20 scale-110" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(222,47%,6%)]/80 to-[hsl(222,47%,6%)]" />
        </div>
      )}

      <div className="relative pt-6 pb-4 flex flex-col sm:flex-row gap-6">
        {/* Cover */}
        <div className="w-36 sm:w-44 shrink-0 mx-auto sm:mx-0">
          <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/5">
            {manga.cover_url ? (
              <img src={manga.cover_url} alt={manga.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-600/30 to-indigo-900/40 flex items-center justify-center">
                <BookOpen className="w-14 h-14 text-violet-400/50" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">{manga.title}</h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-[hsl(215,15%,55%)] mb-4">
            {manga.author && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> {manga.author}
              </span>
            )}
            {manga.artist && manga.artist !== manga.author && (
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> {manga.artist}
              </span>
            )}
            {manga.year && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {manga.year}
              </span>
            )}
            {manga.rating > 0 && (
              <span className="flex items-center gap-1.5 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {manga.rating.toFixed(1)}
              </span>
            )}
          </div>

          {manga.status && (
            <Badge className={`${statusColors[manga.status] || statusColors.ongoing} border mb-3 text-xs`}>
              {manga.status?.charAt(0).toUpperCase() + manga.status?.slice(1)}
            </Badge>
          )}

          {manga.genres?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start mb-4">
              {manga.genres.map(g => (
                <span key={g} className="px-2 py-0.5 rounded-md bg-[hsl(222,47%,14%)] text-[hsl(215,15%,65%)] text-[11px] font-medium">
                  {g}
                </span>
              ))}
            </div>
          )}

          {manga.description && (
            <p className="text-sm text-[hsl(215,15%,55%)] leading-relaxed line-clamp-4 sm:line-clamp-none">
              {manga.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
