import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, Grid3X3, LayoutList, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'reading', label: 'Reading' },
  { value: 'plan_to_read', label: 'Plan to Read' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'uncategorized', label: 'Uncategorized' },
];

export default function LibraryFilters({
  search, onSearchChange,
  category, onCategoryChange,
  viewMode, onViewModeChange,
  sortBy, onSortChange
}) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,15%,45%)]" />
        <Input
          placeholder="Search library..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-[hsl(222,47%,9%)] border-[hsl(222,30%,16%)] text-white placeholder:text-[hsl(215,15%,45%)] h-11 rounded-xl focus:ring-violet-500/30 focus:border-violet-500/50"
        />
      </div>

      {/* Category tabs + controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                category === cat.value
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-[hsl(215,15%,55%)] hover:text-white hover:bg-[hsl(222,47%,14%)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
            className="h-8 w-8 text-[hsl(215,15%,55%)] hover:text-white hover:bg-[hsl(222,47%,14%)]"
          >
            {viewMode === 'grid' ? <LayoutList className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[hsl(215,15%,55%)] hover:text-white hover:bg-[hsl(222,47%,14%)]"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[hsl(222,47%,9%)] border-[hsl(222,30%,16%)]">
              <DropdownMenuLabel className="text-[hsl(215,15%,55%)] text-xs">Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[hsl(222,30%,16%)]" />
              {[
                { value: 'title', label: 'Title' },
                { value: 'recent', label: 'Recently updated' },
                { value: 'unread', label: 'Unread count' },
              ].map(s => (
                <DropdownMenuItem
                  key={s.value}
                  onClick={() => onSortChange(s.value)}
                  className={`text-sm cursor-pointer ${sortBy === s.value ? 'text-violet-400' : 'text-[hsl(210,20%,90%)]'}`}
                >
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
