import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LibraryFilters from '../components/library/LibraryFilters';
import MangaCard from '../components/library/MangaCard';
import MangaListItem from '../components/library/MangaListItem';
import EmptyLibrary from '../components/library/EmptyLibrary';
import { Loader2 } from 'lucide-react';

export default function Library() {
  const navigate = useNavigate();
  useEffect(() => {
    const seen = localStorage.getItem('yorimu_welcome_seen');
    if (!seen) navigate(createPageUrl('Welcome'));
  }, [navigate]);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');

  const { data: manga = [], isLoading } = useQuery({
    queryKey: ['library-manga'],
    queryFn: () => base44.entities.Manga.filter({ in_library: true }, '-updated_date'),
  });

  const filtered = manga
    .filter(m => {
      const matchSearch = !search || m.title?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'all' || m.category === category;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'unread') return ((b.total_chapters - b.last_read_chapter) || 0) - ((a.total_chapters - a.last_read_chapter) || 0);
      return new Date(b.updated_date) - new Date(a.updated_date);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-bold mb-6">Library</h1>
      
      <LibraryFilters
        search={search} onSearchChange={setSearch}
        category={category} onCategoryChange={setCategory}
        viewMode={viewMode} onViewModeChange={setViewMode}
        sortBy={sortBy} onSortChange={setSortBy}
      />

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        search || category !== 'all' ? (
          <p className="text-center text-[hsl(215,15%,50%)] py-24 text-sm">No manga found matching your filters.</p>
        ) : (
          <EmptyLibrary />
        )
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 mt-6">
          {filtered.map(m => <MangaCard key={m.id} manga={m} />)}
        </div>
      ) : (
        <div className="mt-4 space-y-1">
          {filtered.map(m => <MangaListItem key={m.id} manga={m} />)}
        </div>
      )}
    </div>
  );
}
