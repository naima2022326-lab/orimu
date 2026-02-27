import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Thriller', 'Supernatural', 'Isekai', 'Mecha',
  'Psychological', 'Shounen', 'Shoujo', 'Seinen', 'Josei',
];

export default function BrowseSearch({ search, onSearchChange, selectedGenre, onGenreChange }) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,15%,45%)]" />
        <Input
          placeholder="Search manga titles, authors..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-[hsl(222,47%,9%)] border-[hsl(222,30%,16%)] text-white placeholder:text-[hsl(215,15%,45%)] h-11 rounded-xl"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSearchChange('')}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-[hsl(215,15%,50%)] hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {GENRE_OPTIONS.map(genre => (
          <button
            key={genre}
            onClick={() => onGenreChange(selectedGenre === genre ? '' : genre)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 ${
              selectedGenre === genre
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                : 'bg-[hsl(222,47%,11%)] text-[hsl(215,15%,55%)] hover:text-white hover:bg-[hsl(222,47%,14%)]'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
}
