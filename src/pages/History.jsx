import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, Trash2, BookOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, isToday, isYesterday } from 'date-fns';

export default function History() {
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['reading-history'],
    queryFn: () => base44.entities.ReadingHistory.list('-created_date', 100),
  });

  const clearHistory = useMutation({
    mutationFn: async () => {
      for (const h of history) {
        await base44.entities.ReadingHistory.delete(h.id);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reading-history'] }),
  });

  // Group by date
  const grouped = history.reduce((acc, item) => {
    const date = new Date(item.created_date);
    let label;
    if (isToday(date)) label = 'Today';
    else if (isYesterday(date)) label = 'Yesterday';
    else label = format(date, 'MMM d, yyyy');
    
    if (!acc[label]) acc[label] = [];
    acc[label].push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">History</h1>
        {history.length > 0 && (
          <Button
            variant="ghost"
            onClick={() => { if (confirm('Clear all history?')) clearHistory.mutate(); }}
            className="text-[hsl(215,15%,50%)] hover:text-red-400 hover:bg-red-500/10 rounded-xl gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(222,47%,11%)] flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-[hsl(215,15%,30%)]" />
          </div>
          <p className="text-[hsl(215,15%,50%)] text-sm">No reading history yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <h3 className="text-xs font-semibold text-[hsl(215,15%,40%)] uppercase tracking-wider mb-3">{dateLabel}</h3>
              <div className="space-y-1">
                {items.map(item => (
                  <Link
                    key={item.id}
                    to={createPageUrl('MangaDetail') + `?id=${item.manga_id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-[hsl(222,47%,10%)] transition-colors group"
                  >
                    <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-[hsl(222,47%,12%)]">
                      {item.manga_cover ? (
                        <img src={item.manga_cover} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-violet-400/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.manga_title}</p>
                      <p className="text-xs text-[hsl(215,15%,45%)] mt-0.5">Chapter {item.chapter_number}</p>
                    </div>
                    <span className="text-[10px] text-[hsl(215,15%,35%)] shrink-0">
                      {format(new Date(item.created_date), 'h:mm a')}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
