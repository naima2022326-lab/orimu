import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { User, LogOut, Bell, Shield, BookOpen, Info, Eye, EyeOff, Palette } from 'lucide-react';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState({
    newChapters: true,
    friendActivity: true,
    recommendations: false,
  });
  const [privacy, setPrivacy] = useState({
    showReadingActivity: true,
    showLibrary: true,
  });
  const [reader, setReader] = useState({
    autoNextChapter: true,
    keepScreenOn: false,
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    // Load saved prefs
    const saved = localStorage.getItem('yorimu_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.notifications) setNotifications(parsed.notifications);
      if (parsed.privacy) setPrivacy(parsed.privacy);
      if (parsed.reader) setReader(parsed.reader);
    }
  }, []);

  const saveSettings = (key, value) => {
    const current = JSON.parse(localStorage.getItem('yorimu_settings') || '{}');
    localStorage.setItem('yorimu_settings', JSON.stringify({ ...current, [key]: value }));
  };

  const handleNotification = (key, val) => {
    const updated = { ...notifications, [key]: val };
    setNotifications(updated);
    saveSettings('notifications', updated);
  };

  const handlePrivacy = (key, val) => {
    const updated = { ...privacy, [key]: val };
    setPrivacy(updated);
    saveSettings('privacy', updated);
  };

  const handleReader = (key, val) => {
    const updated = { ...reader, [key]: val };
    setReader(updated);
    saveSettings('reader', updated);
  };

  const SwitchRow = ({ label, desc, checked, onChange }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm text-white font-medium">{label}</p>
        {desc && <p className="text-xs text-[hsl(215,15%,50%)] mt-0.5">{desc}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Profile */}
      <Card className="bg-[hsl(222,47%,9%)] border-[hsl(222,30%,14%)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <User className="w-4 h-4 text-violet-400" /> Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-lg font-bold text-white">
                  {(user.full_name || user.email)[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user.full_name || 'User'}</p>
                  <p className="text-xs text-[hsl(215,15%,50%)]">{user.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => base44.auth.logout()}
                className="text-[hsl(215,15%,55%)] hover:text-red-400 hover:bg-red-500/10 rounded-xl gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>
          ) : (
            <p className="text-sm text-[hsl(215,15%,50%)]">Loading...</p>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-[hsl(222,47%,9%)] border-[hsl(222,30%,14%)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-violet-400" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-[hsl(222,30%,14%)]">
          <SwitchRow label="New Chapters" desc="Get notified when new chapters are available" checked={notifications.newChapters} onChange={(v) => handleNotification('newChapters', v)} />
          <SwitchRow label="Friend Activity" desc="When friends add or read manga" checked={notifications.friendActivity} onChange={(v) => handleNotification('friendActivity', v)} />
          <SwitchRow label="Recommendations" desc="Weekly personalized picks" checked={notifications.recommendations} onChange={(v) => handleNotification('recommendations', v)} />
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="bg-[hsl(222,47%,9%)] border-[hsl(222,30%,14%)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-400" /> Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-[hsl(222,30%,14%)]">
          <SwitchRow label="Show Reading Activity" desc="Let friends see what you're reading" checked={privacy.showReadingActivity} onChange={(v) => handlePrivacy('showReadingActivity', v)} />
          <SwitchRow label="Public Library" desc="Allow friends to browse your library" checked={privacy.showLibrary} onChange={(v) => handlePrivacy('showLibrary', v)} />
        </CardContent>
      </Card>

      {/* Reader */}
      <Card className="bg-[hsl(222,47%,9%)] border-[hsl(222,30%,14%)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-400" /> Reader
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-[hsl(222,30%,14%)]">
          <SwitchRow label="Auto-advance Chapter" desc="Automatically load next chapter" checked={reader.autoNextChapter} onChange={(v) => handleReader('autoNextChapter', v)} />
          <SwitchRow label="Keep Screen On" desc="Prevent screen from sleeping while reading" checked={reader.keepScreenOn} onChange={(v) => handleReader('keepScreenOn', v)} />
        </CardContent>
      </Card>

      {/* About */}
      <Card className="bg-[hsl(222,47%,9%)] border-[hsl(222,30%,14%)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-violet-400" /> About Yorimu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 pb-4 border-b border-[hsl(222,30%,14%)] mb-4">
            <div className="flex gap-0.5 text-3xl font-black" style={{ fontFamily: 'serif' }}>
              <span className="text-violet-400">夜</span>
              <span className="text-violet-400">理</span>
              <span className="text-violet-400">夢</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-violet-400">YORIMU</h3>
              <p className="text-xs text-[hsl(215,15%,50%)]">Version 1.0.0</p>
            </div>
          </div>
          <p className="text-sm text-[hsl(215,15%,55%)] leading-relaxed">
            Yorimu is a manga reading tracker. Manage your library, track progress, discover new titles, and read with friends.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
