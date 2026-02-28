import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize, Minimize, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DownloadButton from '../components/reader/DownloadButton';

export default function Reader() {
  const urlParams = new URLSearchParams(window.location.search);
  const mangaId = urlParams.get('manga_id');
  const chapter = parseInt(urlParams.get('chapter')) || 1;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: manga } = useQuery({
    queryKey: ['manga', mangaId],
    queryFn: () => base44.entities.Manga.filter({ id: mangaId }),
    select: (data) => data?.[0],
    enabled: !!mangaId,
  });

  // Check for offline chapter
  const { data: offlineChapters = [] } = useQuery({
    queryKey: ['offline-chapter', mangaId, chapter],
    queryFn: () => base44.entities.OfflineChapter.filter({ 
      manga_id: mangaId,
      chapter_number: chapter 
    }),
    enabled: !!mangaId,
  });

  const offlineChapter = offlineChapters[0];
  const hasOfflinePages = offlineChapter?.pages?.length > 0;

  // Mark chapter as read
  useEffect(() => {
    if (manga && chapter > (manga.last_read_chapter || 0)) {
      base44.entities.Manga.update(mangaId, { last_read_chapter: chapter });
      base44.entities.ReadingHistory.create({
        manga_id: mangaId,
        manga_title: manga.title,
        manga_cover: manga.cover_url,
        chapter_number: chapter,
        read_at: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ['manga', mangaId] });
    }
  }, [manga, chapter, mangaId]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const goToChapter = (ch) => {
    navigate(createPageUrl('Reader') + `?manga_id=${mangaId}&chapter=${ch}`, { replace: true });
  };

  const canPrev = chapter > 1;
  const canNext = manga && chapter < (manga.total_chapters || 0);

  // Auto-hide controls
  useEffect(() => {
    let timeout;
    if (showControls) {
      timeout = setTimeout(() => setShowControls(false), 4000);
    }
    return () => clearTimeout(timeout);
  }, [showControls]);

  return (
    <div
      className="min-h-screen bg-black flex flex-col cursor-pointer select-none"
      onClick={() => setShowControls(!showControls)}
    >
      {/* Top controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-transparent pt-3 pb-8 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <Link
                to={createPageUrl('MangaDetail') + `?id=${mangaId}`}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate max-w-[200px]">{manga?.title}</p>
                  <p className="text-xs text-white/50">Chapter {chapter}</p>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reader content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-2xl w-full space-y-8">
          {hasOfflinePages ? (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-white mb-1">Chapter {chapter}</h2>
                <p className="text-sm text-violet-400">Offline Mode • {offlineChapter.pages.length} pages</p>
              </div>
              {offlineChapter.pages.map((pageUrl, idx) => (
                <img
                  key={idx}
                  src={pageUrl}
                  alt={`Page ${idx + 1}`}
                  className="w-full rounded-xl shadow-2xl"
                  loading="lazy"
                />
              ))}
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-[hsl(222,47%,8%)] rounded-2xl p-12 space-y-4">
                <BookOpen className="w-16 h-16 text-violet-400/40 mx-auto" />
                <h2 className="text-xl font-semibold text-white">Chapter {chapter}</h2>
                <p className="text-sm text-[hsl(215,15%,50%)]">
                  {manga?.title}
                </p>
                <p className="text-xs text-[hsl(215,15%,35%)] max-w-sm mx-auto">
                  This is a manga tracker. Download this chapter for offline reading or connect to external sources.
                </p>
                {manga && (
                  <div className="pt-4">
                    <DownloadButton manga={manga} chapterNumber={chapter} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/90 to-transparent pb-4 pt-10 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                onClick={() => canPrev && goToChapter(chapter - 1)}
                disabled={!canPrev}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl gap-2 disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" /> Previous
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60 font-medium">
                  {chapter} / {manga?.total_chapters || '?'}
                </span>
              </div>

              <Button
                variant="ghost"
                onClick={() => canNext && goToChapter(chapter + 1)}
                disabled={!canNext}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl gap-2 disabled:opacity-30"
              >
                Next <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
