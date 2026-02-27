import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Heart, HeartOff, Play, Trash2, Loader2 } from 'lucide-react';
import MangaHeader from '../components/detail/MangaHeader';
import ChapterList from '../components/detail/ChapterList';
import CommentsSection from '../components/detail/CommentsSection';
import { toast } from 'sonner';

export default function MangaDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const mangaId = urlParams.get('id');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: manga, isLoading } = useQuery({
    queryKey: ['manga', mangaId],
    queryFn: () => base44.entities.Manga.filter({ id: mangaId }),
    select: (data) => data?.[0],
    enabled: !!mangaId,
  });

  const updateManga = useMutation({
    mutationFn: (data) => base44.entities.Manga.update(mangaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manga', mangaId] });
      queryClient.invalidateQueries({ queryKey: ['library-manga'] });
    },
  });

  const deleteManga = useMutation({
    mutationFn: () => base44.entities.Manga.delete(mangaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['browse-manga'] });
      queryClient.invalidateQueries({ queryKey: ['library-manga'] });
      navigate(createPageUrl('Library'));
    },
  });

  const toggleLibrary = () => {
    updateManga.mutate({ in_library: !manga.in_library });
    toast.success(manga.in_library ? 'Removed from library' : 'Added to library');
  };

  const handleReadChapter = async (chapterNum) => {
    if (chapterNum > (manga.last_read_chapter || 0)) {
      await base44.entities.Manga.update(mangaId, { last_read_chapter: chapterNum });
      await base44.entities.ReadingHistory.create({
        manga_id: mangaId,
        manga_title: manga.title,
        manga_cover: manga.cover_url,
        chapter_number: chapterNum,
        read_at: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ['manga', mangaId] });
    }
    navigate(createPageUrl('Reader') + `?manga_id=${mangaId}&chapter=${chapterNum}`);
  };

  if (isLoading || !manga) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  const nextChapter = (manga.last_read_chapter || 0) + 1;
  const canContinue = nextChapter <= (manga.total_chapters || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
      {/* Back */}
      <Link to={createPageUrl('Library')} className="inline-flex items-center gap-2 text-sm text-[hsl(215,15%,55%)] hover:text-white transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <MangaHeader manga={manga} />

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 py-5 border-y border-[hsl(222,30%,12%)] my-4">
        {canContinue && (
          <Button
            onClick={() => handleReadChapter(nextChapter)}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2 flex-1 sm:flex-none"
          >
            <Play className="w-4 h-4" />
            {manga.last_read_chapter > 0 ? `Continue Ch. ${nextChapter}` : 'Start Reading'}
          </Button>
        )}

        <Button
          variant="outline"
          onClick={toggleLibrary}
          className={`rounded-xl gap-2 border-[hsl(222,30%,18%)] ${
            manga.in_library
              ? 'text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/15'
              : 'text-[hsl(215,15%,65%)] hover:text-white hover:bg-[hsl(222,47%,12%)]'
          }`}
        >
          {manga.in_library ? <HeartOff className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
          {manga.in_library ? 'Remove' : 'Add to Library'}
        </Button>

        {manga.in_library && (
          <Select
            value={manga.category || 'uncategorized'}
            onValueChange={(val) => updateManga.mutate({ category: val })}
          >
            <SelectTrigger className="w-40 bg-[hsl(222,47%,9%)] border-[hsl(222,30%,16%)] text-white rounded-xl text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[hsl(222,47%,9%)] border-[hsl(222,30%,16%)]">
              {['reading', 'plan_to_read', 'completed', 'on_hold', 'dropped', 'uncategorized'].map(cat => (
                <SelectItem key={cat} value={cat} className="text-[hsl(210,20%,90%)]">
                  {cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => { if (confirm('Delete this manga?')) deleteManga.mutate(); }}
          className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl ml-auto"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Chapters */}
      <ChapterList manga={manga} onReadChapter={handleReadChapter} />

      {/* Comments */}
      <CommentsSection mangaId={mangaId} />
    </div>
  );
}
