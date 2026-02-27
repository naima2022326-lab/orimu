import React from 'react';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

export default function EmptyLibrary() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center mb-6">
        <BookOpen className="w-10 h-10 text-violet-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Your library is empty</h3>
      <p className="text-[hsl(215,15%,55%)] text-sm text-center max-w-sm mb-6">
        Browse and add manga to your library to start tracking your reading progress.
      </p>
      <Link to={createPageUrl('Browse')}>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-6">
          Browse Manga
        </Button>
      </Link>
    </div>
  );
}
