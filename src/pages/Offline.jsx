import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Download, Trash2, BookOpen, HardDrive, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';

export default function Offline() {
  const queryClient = useQueryClient();

  const { data: offlineChapters = [], isLoading } = useQuery({
    queryKey: ['offline-chapters'],
    queryFn: () => base44.entities.OfflineChapter.list('-downloaded_at', 500),
  });

  const deleteChapter = useMutation({
    mutationFn: (id) => base44.entities.OfflineChapter.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offline-chapters'] });
      toast.success('Chapter removed');
    },
  });

  const clearAll = useMutation({
    mutationFn: async () => {
      await Promise.all(offlineChapters.map(ch => base44.entities.OfflineChapter.delete(ch.id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offline-chapters'] });
      toast.success('All offline chapters cleared');
    },
  });

  // Group by manga
  const groupedChapters = offlineChapters.reduce((acc, ch) => {
    if (!acc[ch.manga_id]) {
      acc[ch.manga_id] = {
        manga_title: ch.manga_title,
        chapters: [],
      };
    }
    acc[ch.manga_id].chapters.push(ch);
    return acc;
  }, {});

  const totalSize = offlineChapters.reduce((sum, ch) => sum + (ch.pages?.length || 0), 0);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <HardDrive className="w-6 h-6 text-violet-400" />
            Offline Reading
          </h1>
          <p className="text-sm text-[hsl(215,15%,55%)] mt-1">
            {offlineChapters.length} chapter{offlineChapters.length !== 1 ? 's' : ''} • ~{totalSize} pages
          </p>
        </div>
        {offlineChapters.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearAll.mutate()}
            disabled={clearAll.isPending}
            className="border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            {clearAll.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </>
            )}
          </Button>
        )}
      </div>

      {offlineChapters.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <Download className="w-16 h-16 text-[hsl(215,15%,25%)] mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">No offline chapters</h3>
            <p className="text-sm text-[hsl(215,15%,50%)]">
              Download chapters from the reader to access them offline
            </p>
          </div>
          <Link to={createPageUrl('Library')}>
            <Button className="bg-violet-600 hover:bg-violet-700 mt-4">
              Browse Library
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedChapters).map(([mangaId, data]) => (
            <div key={mangaId} className="bg-[hsl(222,47%,9%)] rounded-2xl p-5 border border-[hsl(222,30%,12%)]">
              <h3 className="text-lg font-semibold mb-4">{data.manga_title}</h3>
              <div className="space-y-2">
                {data.chapters.map((ch) => (
                  <div
                    key={ch.id}
                    className="flex items-center justify-between p-3 bg-[hsl(222,47%,11%)] rounded-xl hover:bg-[hsl(222,47%,13%)] transition-colors"
                  >
                    <Link
                      to={createPageUrl('Reader') + `?manga_id=${mangaId}&chapter=${ch.chapter_number}`}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <BookOpen className="w-5 h-5 text-violet-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">Chapter {ch.chapter_number}</p>
                        <p className="text-xs text-[hsl(215,15%,45%)]">
                          {ch.pages?.length || 0} pages • {moment(ch.downloaded_at).fromNow()}
                        </p>
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteChapter.mutate(ch.id)}
                      disabled={deleteChapter.isPending}
                      className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
