import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MangaCard from '../components/library/MangaCard';
import { Loader2, Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Thriller', 'Supernatural', 'Isekai', 'Mecha',
  'Psychological', 'Shounen', 'Shoujo', 'Seinen', 'Josei',
];

const YEARS = Array.from({ length: 35 }, (_, i) => (2024 - i).toString());

export default function Browse() {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();

  const { data: allManga = [], isLoading } = useQuery({
    queryKey: ['browse-manga'],
    queryFn: () => base44.entities.Manga.list('-created_date', 200),
  });

  const addToLibrary = useMutation({
    mutationFn: async (manga) => {
      const existing = await base44.entities.Manga.filter({ external_id: manga.external_id, source: manga.source });
      if (existing.length > 0) {
        await base44.entities.Manga.update(existing[0].id, { in_library: true });
        return existing[0];
      }
      return await base44.entities.Manga.create({
        ...manga,
        in_library: true,
        category: 'plan_to_read',
        last_read_chapter: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['browse-manga'] });
      queryClient.invalidateQueries({ queryKey: ['library-manga'] });
      toast.success('Added to library!');
    },
  });

  const activeFilterCount = [selectedGenre, selectedStatus, selectedYear, authorFilter].filter(Boolean).length;

  const filtered = allManga.filter(m => {
    const matchSearch = !search || m.title?.toLowerCase().includes(search.toLowerCase()) || m.author?.toLowerCase().includes(search.toLowerCase());
    const matchGenre = !selectedGenre || m.genres?.includes(selectedGenre);
    const matchStatus = !selectedStatus || m.status === selectedStatus;
    const matchYear = !selectedYear || String(m.year) === selectedYear;
    const matchAuthor = !authorFilter || m.author?.toLowerCase().includes(authorFilter.toLowerCase());
    return matchSearch && matchGenre && matchStatus && matchYear && matchAuthor;
  });

  const clearFilters = () => {
    setSelectedGenre('');
    setSelectedStatus('');
    setSelectedYear('');
    setAuthorFilter('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Browse</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={`gap-2 border-[hsl(222,30%,18%)] ${activeFilterCount > 0 ? 'border-violet-500/50 text-violet-400' : 'text-[hsl(215,15%,55%)]'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters {activeFilterCount > 0 && <span className="bg-violet-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>}
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,15%,45%)]" />
        <Input
          placeholder="Search manga titles, authors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[hsl(222,47%,9%)] border-[hsl(222,30%,16%)] text-white placeholder:text-[hsl(215,15%,45%)] h-11 rounded-xl"
        />
        {search && (
          <Button variant="ghost" size="icon" onClick={() => setSearch('')} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-[hsl(215,15%,50%)] hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="bg-[hsl(222,47%,9%)] border border-[hsl(222,30%,14%)] rounded-2xl p-4 mb-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-[hsl(215,15%,50%)] mb-1.5 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="bg-[hsl(222,47%,12%)] border-[hsl(222,30%,18%)] text-white h-9">
                  <SelectValue placeholder="Any status" />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(222,47%,12%)] border-[hsl(222,30%,18%)]">
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="hiatus">Hiatus</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-[hsl(215,15%,50%)] mb-1.5 block">Release Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-[hsl(222,47%,12%)] border-[hsl(222,30%,18%)] text-white h-9">
                  <SelectValue placeholder="Any year" />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(222,47%,12%)] border-[hsl(222,30%,18%)] max-h-48">
                  {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-[hsl(215,15%,50%)] mb-1.5 block">Author</label>
              <Input
                placeholder="Filter by author..."
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                className="bg-[hsl(222,47%,12%)] border-[hsl(222,30%,18%)] text-white h-9 text-sm"
              />
            </div>
          </div>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[hsl(215,15%,50%)] hover:text-white gap-1.5">
              <X className="w-3 h-3" /> Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Genre chips */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {GENRE_OPTIONS.map(genre => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(selectedGenre === genre ? '' : genre)}
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

      {isLoading ? (
        <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 text-violet-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <SearchIcon className="w-12 h-12 text-[hsl(215,15%,30%)] mx-auto mb-4" />
          <p className="text-[hsl(215,15%,50%)] text-sm mb-2">
            {search || activeFilterCount > 0 ? 'No results found for your filters.' : 'No manga in the database yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          {filtered.map((m, idx) => (
            <div key={m.id || idx} className="relative group">
              <MangaCard manga={m} />
              {m.external_id && !m.id && (
                <Button
                  size="sm"
                  onClick={() => addToLibrary.mutate(m)}
                  disabled={addToLibrary.isPending}
                  className="absolute bottom-2 left-2 right-2 bg-violet-600 hover:bg-violet-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Add to Library
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
