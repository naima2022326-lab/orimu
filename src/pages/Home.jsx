import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Compass, Sparkles, Users, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: recentHistory = [] } = useQuery({
    queryKey: ['recent-history'],
    queryFn: () => base44.entities.ReadingHistory.list('-read_at', 5),
  });

  const { data: libraryManga = [] } = useQuery({
    queryKey: ['library-count'],
    queryFn: () => base44.entities.Manga.filter({ in_library: true }),
  });

  const readingManga = libraryManga.filter(m => m.category === 'reading');
  const completedCount = libraryManga.filter(m => m.category === 'completed').length;

  const quickLinks = [
    { label: 'My Library', icon: BookOpen, page: 'Library', color: 'from-violet-600 to-purple-700', desc: `${libraryManga.length} manga` },
    { label: 'Browse', icon: Compass, page: 'Browse', color: 'from-purple-600 to-violet-700', desc: 'Find new titles' },
    { label: 'For You', icon: Sparkles, page: 'Recommendations', color: 'from-amber-500 to-orange-600', desc: 'AI picks' },
    { label: 'Friends', icon: Users, page: 'Friends', color: 'from-green-600 to-teal-700', desc: 'See activity' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-black text-white">
          {user ? `Welcome back, ${user.full_name?.split(' ')[0]} 👋` : 'Welcome to Yorimu 👋'}
        </h1>
        <p className="text-[hsl(215,15%,50%)] mt-1">Your manga reading dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[hsl(222,47%,9%)] border border-[hsl(222,30%,12%)] rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-violet-400">{libraryManga.length}</p>
          <p className="text-sm text-[hsl(215,15%,50%)] mt-1">In Library</p>
        </div>
        <div className="bg-[hsl(222,47%,9%)] border border-[hsl(222,30%,12%)] rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-green-400">{completedCount}</p>
          <p className="text-sm text-[hsl(215,15%,50%)] mt-1">Completed</p>
        </div>
        <div className="bg-[hsl(222,47%,9%)] border border-[hsl(222,30%,12%)] rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-purple-400">{recentHistory.length}</p>
          <p className="text-sm text-[hsl(215,15%,50%)] mt-1">Chapters Read</p>
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map(({ label, icon: Icon, page, color, desc }) => (
            <Link key={page} to={createPageUrl(page)}>
              <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 hover:scale-105 transition-transform cursor-pointer h-full`}>
                <Icon className="w-7 h-7 text-white mb-3" />
                <p className="font-bold text-white text-sm">{label}</p>
                <p className="text-white/70 text-xs mt-1">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Currently Reading */}
      {readingManga.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              Currently Reading
            </h2>
            <Link to={createPageUrl('Library')} className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {readingManga.slice(0, 8).map(m => (
              <Link
                key={m.id}
                to={createPageUrl(`MangaDetail?id=${m.id}`)}
                className="flex-shrink-0 w-28 group"
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[hsl(222,47%,12%)] mb-2">
                  {m.cover_url ? (
                    <img src={m.cover_url} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-[hsl(215,15%,30%)]" />
                    </div>
                  )}
                  {m.total_chapters > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[hsl(222,47%,20%)]">
                      <div
                        className="h-full bg-violet-500"
                        style={{ width: `${Math.min(100, ((m.last_read_chapter || 0) / m.total_chapters) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-white truncate font-medium">{m.title}</p>
                <p className="text-xs text-[hsl(215,15%,45%)]">Ch. {m.last_read_chapter || 0}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent History */}
      {recentHistory.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-400" />
              Recently Read
            </h2>
            <Link to={createPageUrl('History')} className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentHistory.map((h, i) => (
              <div key={i} className="bg-[hsl(222,47%,9%)] border border-[hsl(222,30%,12%)] rounded-xl p-3 flex items-center gap-3">
                {h.manga_cover && (
                  <img src={h.manga_cover} alt="" className="w-10 h-14 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{h.manga_title}</p>
                  <p className="text-xs text-[hsl(215,15%,45%)]">Chapter {h.chapter_number}</p>
                </div>
                <p className="text-xs text-[hsl(215,15%,40%)] flex-shrink-0">
                  {new Date(h.read_at || h.created_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state CTA */}
      {libraryManga.length === 0 && (
        <div className="bg-gradient-to-br from-violet-600/10 to-purple-900/10 border border-violet-500/20 rounded-2xl p-8 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-violet-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Start Your Collection</h3>
          <p className="text-[hsl(215,15%,55%)] text-sm">Browse thousands of manga titles and build your library.</p>
          <Link to={createPageUrl('Browse')}>
            <Button className="bg-violet-600 hover:bg-violet-700 rounded-xl px-8">Browse Manga</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
