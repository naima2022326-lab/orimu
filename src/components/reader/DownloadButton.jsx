import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Download, Check, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DownloadButton({ manga, chapterNumber, chapterId }) {
  const queryClient = useQueryClient();
  
  const { data: offlineChapters = [] } = useQuery({
    queryKey: ['offline-chapters', manga.id],
    queryFn: () => base44.entities.OfflineChapter.filter({ 
      manga_id: manga.id,
      chapter_number: chapterNumber 
    }),
  });

  const isDownloaded = offlineChapters.length > 0;

  const downloadChapter = useMutation({
    mutationFn: async () => {
      // Get chapter pages from backend
      const response = await base44.functions.invoke('getChapterPages', {
        manga_id: manga.id,
        chapter_id: chapterId || `ch-${chapterNumber}`,
        source: manga.source || 'mangadex',
      });

      if (!response.pages || response.pages.length === 0) {
        throw new Error('No pages available for download');
      }

      // Save to database
      await base44.entities.OfflineChapter.create({
        manga_id: manga.id,
        manga_title: manga.title,
        chapter_number: chapterNumber,
        chapter_id: chapterId || `ch-${chapterNumber}`,
        pages: response.pages,
        downloaded_at: new Date().toISOString(),
        source: manga.source || 'mangadex',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offline-chapters'] });
      toast.success(`Chapter ${chapterNumber} downloaded for offline reading`);
    },
    onError: (err) => {
      toast.error(err.message || 'Download failed');
    },
  });

  const deleteChapter = useMutation({
    mutationFn: () => base44.entities.OfflineChapter.delete(offlineChapters[0].id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offline-chapters'] });
      toast.success('Offline chapter removed');
    },
  });

  if (isDownloaded) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => deleteChapter.mutate()}
        disabled={deleteChapter.isPending}
        className="gap-2 border-green-500/30 text-green-400 hover:text-green-300 hover:bg-green-500/10"
      >
        {deleteChapter.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Check className="w-4 h-4" />
            Downloaded
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadChapter.mutate()}
      disabled={downloadChapter.isPending}
      className="gap-2 border-[hsl(222,30%,18%)] text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
    >
      {downloadChapter.isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Download
        </>
      )}
    </Button>
  );
}
