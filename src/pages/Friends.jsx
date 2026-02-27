import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Check, X, Loader2, Video, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Friends() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ['friends', user?.email],
    queryFn: () => base44.entities.Friend.filter({ follower_email: user.email, status: 'accepted' }),
    enabled: !!user,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['friend-requests', user?.email],
    queryFn: () => base44.entities.Friend.filter({ following_email: user.email, status: 'pending' }),
    enabled: !!user,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['friend-activities', user?.email],
    queryFn: async () => {
      const friendEmails = friends.map(f => f.following_email);
      if (friendEmails.length === 0) return [];
      const allActivities = await Promise.all(
        friendEmails.map(email => base44.entities.Activity.filter({ user_email: email }, '-created_date', 10))
      );
      return allActivities.flat().sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 20);
    },
    enabled: friends.length > 0,
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
      toast.success('Friend request accepted!');
    },
  });

  const rejectRequest = useMutation({
    mutationFn: (id) => base44.entities.Friend.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      toast.success('Request declined');
    },
  });

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-[hsl(215,15%,55%)]">Please log in to view friends</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-violet-400" />
        <h1 className="text-2xl font-bold">Friends</h1>
      </div>

      <Tabs defaultValue="friends" className="space-y-6">
        <TabsList className="bg-[hsl(222,47%,9%)] border border-[hsl(222,30%,12%)]">
          <TabsTrigger value="friends" className="data-[state=active]:bg-violet-600">
            Friends ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="data-[state=active]:bg-violet-600">
            Requests ({requests.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-violet-600">
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4">
          {/* Add friend */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) sendRequest.mutate(email.trim());
            }}
            className="bg-[hsl(222,47%,9%)] rounded-xl p-4 flex gap-3"
          >
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter friend's email..."
              className="bg-[hsl(222,47%,12%)] border-[hsl(222,30%,18%)] text-white"
            />
            <Button type="submit" disabled={!email.trim() || sendRequest.isPending} className="bg-violet-600 hover:bg-violet-700 gap-2">
              <UserPlus className="w-4 h-4" />
              Add
            </Button>
          </form>

          {/* Friends list */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
            </div>
          ) : friends.length === 0 ? (
            <p className="text-center text-[hsl(215,15%,45%)] py-12">No friends yet</p>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <div key={friend.id} className="bg-[hsl(222,47%,9%)] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{friend.following_name}</p>
                    <p className="text-sm text-[hsl(215,15%,55%)]">{friend.following_email}</p>
                  </div>
                  <Link to={createPageUrl('VideoChat') + `?with=${friend.following_email}`}>
                    <Button variant="outline" size="sm" className="gap-2 border-violet-500/30 text-violet-400 hover:text-violet-300">
                      <Video className="w-4 h-4" />
                      Video Chat
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-2">
          {requests.length === 0 ? (
            <p className="text-center text-[hsl(215,15%,45%)] py-12">No pending requests</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="bg-[hsl(222,47%,9%)] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Friend request from</p>
                  <p className="text-sm text-[hsl(215,15%,55%)]">{req.follower_email}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => acceptRequest.mutate(req.id)}
                    className="bg-green-600 hover:bg-green-700 gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectRequest.mutate(req.id)}
                    className="border-red-500/30 text-red-400 hover:text-red-300 gap-1"
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-center text-[hsl(215,15%,45%)] py-12">No recent activity</p>
          ) : (
            activities.map((act, i) => (
              <div key={i} className="bg-[hsl(222,47%,9%)] rounded-xl p-4 flex gap-4">
                {act.manga_cover && (
                  <img src={act.manga_cover} alt="" className="w-12 h-16 object-cover rounded" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-white">
                    <span className="font-medium text-violet-400">{act.user_name}</span>
                    {' '}
                    {act.activity_type === 'read_chapter' && 'read a chapter of'}
                    {act.activity_type === 'added_manga' && 'added'}
                    {act.activity_type === 'rated_manga' && 'rated'}
                    {act.activity_type === 'commented' && 'commented on'}
                    {' '}
                    <span className="font-medium">{act.manga_title}</span>
                  </p>
                  {act.details && <p className="text-xs text-[hsl(215,15%,55%)] mt-1">{act.details}</p>}
                  <p className="text-xs text-[hsl(215,15%,45%)] mt-1">
                    {new Date(act.created_date).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
