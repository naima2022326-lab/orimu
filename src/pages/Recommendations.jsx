import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function Recommendations() {
  const queryClient = useQueryClient();

  const { data: libraryManga = [] } = useQuery({
    queryKey: ['library-manga'],
    queryFn: () => base44.entities.Manga.filter({ in_library: true }),
  });

  const { data: readingHistory = [] } = useQuery({
    queryKey: ['reading-history'],
    queryFn: () => base44.entities.ReadingHistory.list('-created_date', 50),
  });

  const { data: recommendations = [], isLoading: loadingRecs, refetch } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      // Analyze user data
      const genres = [...new Set(libraryManga.flatMap(m => m.genres || []))];
      const topManga = libraryManga.slice(0, 5).map(m => m.title);
      const recentlyRead = [...new Set(readingHistory.slice(0, 10).map(h => h.manga_title))];

      const prompt = `Based on a manga reader's preferences, recommend 12 NEW manga titles they would enjoy.

User's Library (${libraryManga.length} manga):
- Top titles: ${topManga.join(', ')}
- Favorite genres: ${genres.slice(0, 8).join(', ')}
- Recently read: ${recentlyRead.slice(0, 5).join(', ')}

Provide 12 diverse recommendations with real manga that match their taste. Include popular and hidden gems.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  author: { type: "string" },
                  genres: { type: "array", items: { type: "string" } },
                  rating: { type: "number" },
                  reason: { type: "string" },
                  cover_url: { type: "string" },
                }
              }
            }
          }
        }
      });

      return response.recommendations || [];
    },
    enabled: libraryManga.length > 0,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const addToLibrary = useMutation({
    mutationFn: async (manga) => {
      return await base44.entities.Manga.create({
        title: manga.title,
        description: manga.description,
        author: manga.author,
        genres: manga.genres,
        rating: manga.rating,
        cover_url: manga.cover_url,
        status: 'ongoing',
        in_library: true,
        category: 'plan_to_read',
        last_read_chapter: 0,
        total_chapters: 0,
        source: 'AI Recommendation',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-manga'] });
      toast.success('Added to library!');
    },
  });

  if (libraryManga.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-violet-400" />
          Recommendations
        </h1>
        <div className="text-center py-24 space-y-4">
          <TrendingUp className="w-16 h-16 text-[hsl(215,15%,25%)] mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Build Your Library First</h3>
            <p className="text-sm text-[hsl(215,15%,50%)] mb-6">
              Add some manga to your library so we can recommend similar titles
            </p>
            <Link to={createPageUrl('Browse')}>
              <Button className="bg-violet-600 hover:bg-violet-700">
                Browse Manga
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-violet-400" />
            For You
          </h1>
          <p className="text-sm text-[hsl(215,15%,55%)] mt-1">
            AI-powered recommendations based on your library
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={loadingRecs}
          className="gap-2 border-violet-500/30 text-violet-400 hover:text-violet-300"
        >
          {loadingRecs ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh
        </Button>
      </div>

      {loadingRecs ? (
        <div className="flex items-center justify-center py-24 text-violet-400">
          <Loader2 className="w-8 h-8 animate-spin mr-3" />
          <span>Analyzing your taste...</span>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="relative group">
                <div className="relative">
                  <Link to="#" className="block">
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[hsl(222,47%,9%)] border border-[hsl(222,30%,12%)] group-hover:border-violet-500/50 transition-all duration-300">
                      {rec.cover_url ? (
                        <img 
                          src={rec.cover_url} 
                          alt={rec.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-violet-400/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                  <div className="mt-2 px-1">
                    <h3 className="text-xs font-medium text-white line-clamp-2 group-hover:text-violet-300 transition-colors">
                      {rec.title}
                    </h3>
                    {rec.reason && (
                      <p className="text-[10px] text-[hsl(215,15%,45%)] mt-1 line-clamp-2">
                        {rec.reason}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => addToLibrary.mutate(rec)}
                  disabled={addToLibrary.isPending}
                  className="absolute top-2 right-2 bg-violet-600/90 hover:bg-violet-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
