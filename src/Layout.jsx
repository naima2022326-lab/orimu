import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BookOpen, Compass, Clock, Settings, Library, Sparkles, Users, Home, UserCircle } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Home', icon: Home, page: 'Home' },
  { name: 'Library', icon: Library, page: 'Library' },
  { name: 'Browse', icon: Compass, page: 'Browse' },
  { name: 'For You', icon: Sparkles, page: 'Recommendations' },
  { name: 'Friends', icon: Users, page: 'Friends' },
  { name: 'History', icon: Clock, page: 'History' },
  { name: 'Offline', icon: BookOpen, page: 'Offline' },
  { name: 'Profile', icon: UserCircle, page: 'Profile' },
  { name: 'Settings', icon: Settings, page: 'Settings' },
];

export default function Layout({ children, currentPageName }) {
  // Hide nav on Reader page
  const hideNav = currentPageName === 'Reader';

  return (
    <div className="min-h-screen bg-[hsl(222,47%,6%)] text-[hsl(210,20%,95%)]">
      {/* Top bar */}
      {!hideNav && (
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[hsl(222,47%,6%)]/80 border-b border-[hsl(222,30%,12%)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black text-violet-400 hover:text-violet-300 transition-colors" style={{ fontFamily: 'serif', letterSpacing: '0.15em' }}>
                  夜
                </span>
                <span className="text-2xl font-black text-violet-400 hover:text-violet-300 transition-colors" style={{ fontFamily: 'serif', letterSpacing: '0.15em' }}>
                  理
                </span>
                <span className="text-2xl font-black text-violet-400 hover:text-violet-300 transition-colors" style={{ fontFamily: 'serif', letterSpacing: '0.15em' }}>
                  夢
                </span>
              </div>
              <span className="text-sm font-medium text-violet-400/70 tracking-wider">YORIMU</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    currentPageName === item.page
                      ? 'bg-violet-600/15 text-violet-300'
                      : 'text-[hsl(215,15%,55%)] hover:text-white hover:bg-[hsl(222,47%,12%)]'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className={hideNav ? '' : 'pb-20 md:pb-6'}>
        {children}
      </main>

      {/* Mobile bottom nav */}
      {!hideNav && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[hsl(222,47%,7%)]/95 backdrop-blur-xl border-t border-[hsl(222,30%,12%)]">
          <div className="flex items-center justify-around h-16 px-2">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.name}
                to={createPageUrl(item.page)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  currentPageName === item.page
                    ? 'text-violet-400'
                    : 'text-[hsl(215,15%,45%)]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
