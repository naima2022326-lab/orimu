import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, UserPlus, UserMinus, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function FriendsList() {
  const queryClient = useQueryClient();
  const [searchEmail, setSearchEmail] = useState('');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ['friends', user?.email],
    queryFn: () => base44.entities.Friend.filter({ follower_email: user.email, status: 'accepted' }),
    enabled: !!user,
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['pending-requests', user?.email],
    queryFn: () => base44.entities.Friend.filter({ following_email: user.email, status: 'pending' }),
    enabled: !!user,
  });

  const sendRequest = useMutation({
    mutationFn: async (email) => {
      const targetUser = await base44.entities.User.filter({ email });
      if (!targetUser || targetUser.length === 0) {
        throw new Error('User not found');
      }
      return await base44.entities.Friend.create({
        follower_email: user.email,
        following_email: email,
        following_name: targetUser[0].full_name,
        status: 'pending',
      });
    },
    onSuccess: () => {
      toast.success('Friend request sent!');
      setSearchEmail('');
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send request');
    },
  });

  const acceptRequest = useMutation({
    mutationFn: async (requestId) => {
      await base44.entities.Friend.update(requestId, { status: 'accepted' });
      // Create reverse friendship
      const request = pendingRequests.find(r => r.id === requestId);
      await base44.entities.Friend.create({
        follower_email: user.email,
        following_email: request.follower_email,
        following_name: request.follower_email,
        status: 'accepted',
      });
    },
    onSuccess: () => {
      toast.success('Friend request accepted!');
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
    },
  });

  const removeFriend = useMutation({
    mutationFn: (friendId) => base44.entities.Friend.delete(friendId),
    onSuccess: () => {
      toast.success('Friend removed');
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  const handleSendRequest = (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;
    sendRequest.mutate(searchEmail.trim());
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-400" />
          Friends
        </h2>
      </div>

      {/* Add friend */}
      <form onSubmit={handleSendRequest} className="flex gap-2">
        <Input
          type="email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          placeholder="Enter friend's email..."
          className="bg-[hsl(222,47%,9%)] border-[hsl(222,30%,18%)]"
        />
        <Button
          type="submit"
          disabled={sendRequest.isPending}
          className="bg-violet-600 hover:bg-violet-700 gap-2"
        >
          {sendRequest.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          Add
        </Button>
      </form>

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-[hsl(215,15%,55%)]">Pending Requests</h3>
          {pendingRequests.map((request) => (
            <div
              key={request.id}
              className="bg-[hsl(222,47%,9%)] rounded-lg p-3 flex items-center justify-between"
            >
              <span className="text-sm">{request.follower_email}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => acceptRequest.mutate(request.id)}
                  className="bg-green-600 hover:bg-green-700 h-8"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeFriend.mutate(request.id)}
                  className="h-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friends list */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-[hsl(215,15%,55%)]">
          My Friends ({friends.length})
        </h3>
        {friends.length === 0 ? (
          <p className="text-center text-[hsl(215,15%,50%)] py-8 text-sm">
            No friends yet. Add some to see their activity!
          </p>
        ) : (
          friends.map((friend) => (
            <div
              key={friend.id}
              className="bg-[hsl(222,47%,9%)] rounded-lg p-3 flex items-center justify-between"
            >
              <span className="text-sm font-medium">{friend.following_name}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeFriend.mutate(friend.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                <UserMinus className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
