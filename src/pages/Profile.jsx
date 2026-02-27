import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BookOpen, Star, Clock, TrendingUp, Users, CheckCircle, BarChart2, UserPlus, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import moment from 'moment';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: libraryManga = [] } = useQuery({
    queryKey: ['library-manga'],
    queryFn: () => base44.entities.Manga.filter({ in_library: true }),
  });

  const { data: history = [] } = useQuery({
    queryKey: ['full-history'],
    queryFn: () => base44.entities.ReadingHistory.list('-read_at', 200),
  });

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ['friends', user?.email],
    queryFn: () => base44.entities.Friend.filter({ follower_email: user.email, status: 'accepted' }),
    enabled: !!user,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['friend-requests', user?.email],
    queryFn: () => base44.entities.Friend.filter({ following_email: user.email, status: 'pending' }),
    enabled: !!user,
  });

  const sendRequest = useMutation({
    mutationFn: async (targetEmail) => {
      const targetUser = await base44.entities.User.filter({ email: targetEmail });
      if (!targetUser || targetUser.length === 0) throw new Error('User not found');
      return base44.entities.Friend.create({
        follower_email: user.email,
        following_email: targetEmail,
        following_name: targetUser[0].full_name,
        status: 'pending',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('Friend request sent!');
      setEmail('');
    },
    onError: (err) => toast.error(err.message || 'Could not send request'),
  });

  const acceptRequest = useMutation({
    mutationFn: (id) => base44.entities.Friend.update(id, { status: 'accepted' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('Accepted!');
    },
  });

  const rejectRequest = useMutation({
    mutationFn: (id) => base44.entities.Friend.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friend-requests'] }),
  });

  const removeFriend = useMutation({
    mutationFn: (id) => base44.entities.Friend.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('Removed');
    },
  });

  const totalChapters = history.length;
  const completedManga = libraryManga.filter(m => m.category === 'completed').length;
  const readingManga = libraryManga.filter(m => m.category === 'reading').length;
  const avgRating = libraryManga.filter(m => m.rating).length > 0
    ? (libraryManga.filter(m => m.rating).reduce((sum, m) => sum + m.rating, 0) / libraryManga.filter(m => m.rating).length).toFixed(1)
    : '—';

  const allGenres = libraryManga.flatMap(m => m.genres || []);
  const genreCounts = allGenres.reduce((acc, g) => { acc[g] = (acc[g] || 0) + 1; return acc; }, {});
  const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (!user) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-[hsl(222,47%,9%)] border border-[hsl(222,30%,12%)] rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-3xl font-black text-white shrink-0">
          {(user.full_name || user.email)[0].toUpperCase()}
        </div>
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl font-black text-white">{user.full_name || 'Reader'}</h1>
          <p className="text-[hsl(215,15%,55%)] text-sm">{user.email}</p>
          <p className="text-violet-400 text-xs mt-1">Member since {moment(user.created_date).format('MMMM YYYY')}</p>
        </div>
        <Link to={createPageUrl('Settings')}>
          <Button variant="outline" size="sm" className="border-violet-500/30 text-violet-400 hover:text-violet-300">Edit Profile</Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: 'In Library', value: libraryManga.length, color: 'text-violet-400' },
          { icon: CheckCircle, label: 'Completed', value: completedManga, color: 'text-green-400' },
          { icon: Clock, label: 'Chapters Read', value: totalChapters, color: 'text-purple-400' },
          { icon: Star, label: 'Avg Rating', value: avgRating, color: 'text-yellow-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-[hsl(222,47%,9%)] border border-[hsl(222,30%,12%)] rounded-2xl p-4 text-center">
            <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-[hsl(215,15%,50%)] mt-1">{label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="stats">
        <TabsList className="bg-[hsl(222,47%,9%)] border border-[hsl(222,30%,12%)]">
          <TabsTrigger value="stats" className="data-[state=active]:bg-violet-600">Reading Stats</TabsTrigger>
          <TabsTrigger value="friends" className="data-[state=active]:bg-violet-600">
            Friends {requests.length > 0 && <span className="ml-1.5 bg-violet-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{requests.length}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-6 mt-6">
          {/* Category breakdown */}
          <div className="bg-[hsl(222,47%,9%)] border border-[hsl(222,30%,12%)] rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-violet-400" /> Library Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Reading', count: readingManga, color: 'bg-violet-500' },
                { label: 'Completed', count: completedManga, color: 'bg-green-500' },
                { label: 'Plan to Read', count: libraryManga.filter(m => m.category === 'plan_to_read').length, color: 'bg-blue-500' },
                { label: 'On Hold', count: libraryManga.filter(m => m.category === 'on_hold').length, color: 'bg-yellow-500' },
                { label: 'Dropped', count: libraryManga.filter(m => m.category === 'dropped').length, color: 'bg-red-500' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm text-[hsl(215,15%,55%)] w-28">{label}</span>
                  <div className="flex-1 h-2 bg-[hsl(222,47%,14%)] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all`}
                      style={{ width: libraryManga.length > 0 ? `${(count / libraryManga.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm text-white font-medium w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top genres */}
          {topGenres.length > 0 && (
            <div className="bg-[hsl(222,47%,9%)] border border-[hsl(222,30%,12%)] rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-violet-400" /> Top Genres</h3>
              <div className="flex flex-wrap gap-2">
                {topGenres.map(([genre, count]) => (
                  <span key={genre} className="bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm px-3 py-1 rounded-full">
                    {genre} <span className="text-violet-500 text-xs">({count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent history */}
          {history.length > 0 && (
            <div className="bg-[hsl(222,47%,9%)] border border-[hsl(222,30%,12%)] rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-violet-400" /> Recent Reading</h3>
              <div className="space-y-2">
                {history.slice(0, 8).map((h, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    {h.manga_cover && <img src={h.manga_cover} alt="" className="w-8 h-11 rounded object-cover shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-white truncate">{h.manga_title}</p>
                      <p className="text-xs text-[hsl(215,15%,45%)]">Chapter {h.chapter_number}</p>
                    </div>
                    <p className="text-xs text-[hsl(215,15%,40%)] shrink-0">{moment(h.read_at || h.created_date).fromNow()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="friends" className="mt-6 space-y-4">
          {/* Add friend */}
          <form
            onSubmit={(e) => { e.preventDefault(); if (email.trim()) sendRequest.mutate(email.trim()); }}
            className="bg-[hsl(222,47%,9%)] rounded-xl p-4 flex gap-3"
          >
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Add friend by email..."
              className="bg-[hsl(222,47%,12%)] border-[hsl(222,30%,18%)] text-white"
            />
            <Button type="submit" disabled={!email.trim() || sendRequest.isPending} className="bg-violet-600 hover:bg-violet-700 gap-2 shrink-0">
              <UserPlus className="w-4 h-4" /> Add
            </Button>
          </form>

          {/* Pending requests */}
          {requests.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-[hsl(215,15%,50%)] font-medium px-1">Pending Requests</p>
              {requests.map((req) => (
                <div key={req.id} className="bg-[hsl(222,47%,9%)] rounded-xl p-4 flex items-center justify-between">
                  <p className="text-sm text-white">{req.follower_email}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => acceptRequest.mutate(req.id)} className="bg-green-600 hover:bg-green-700"><Check className="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => rejectRequest.mutate(req.id)} className="border-red-500/30 text-red-400"><X className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Friends list */}
          {loadingFriends ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>
          ) : friends.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-[hsl(215,15%,25%)] mx-auto mb-3" />
              <p className="text-[hsl(215,15%,45%)] text-sm">No friends yet — add some above!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <div key={friend.id} className="bg-[hsl(222,47%,9%)] rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-700/40 flex items-center justify-center text-sm font-bold text-violet-300">
                      {(friend.following_name || friend.following_email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{friend.following_name}</p>
                      <p className="text-xs text-[hsl(215,15%,55%)]">{friend.following_email}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeFriend.mutate(friend.id)} className="text-red-400/60 hover:text-red-400 text-xs">Remove</Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
