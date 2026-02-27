import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Activity, BookOpen, Star, MessageSquare, PlusCircle, Loader2 } from 'lucide-react';
import moment from 'moment';

export default function ActivityFeed() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: friends = [] } = useQuery({
    queryKey: ['friends', user?.email],
    queryFn: () => base44.entities.Friend.filter({ follower_email: user.email, status: 'accepted' }),
    enabled: !!user,
  });

  const friendEmails = friends.map(f => f.following_email);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['friend-activities', friendEmails],
    queryFn: async () => {
      if (friendEmails.length === 0) return [];
      // Get activities from friends
      const allActivities = await base44.entities.Activity.list('-created_date', 50);
      return allActivities.filter(a => friendEmails.includes(a.user_email));
    },
    enabled: friendEmails.length > 0,
  });

  const getActivityIcon = (type) => {
    switch (type) {
      case 'read_chapter': return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'added_manga': return <PlusCircle className="w-4 h-4 text-green-400" />;
      case 'rated_manga': return <Star className="w-4 h-4 text-yellow-400" />;
      case 'commented': return <MessageSquare className="w-4 h-4 text-purple-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Activity className="w-5 h-5 text-violet-400" />
        Friends Activity
      </h2>

      {activities.length === 0 ? (
        <p className="text-center text-[hsl(215,15%,50%)] py-8 text-sm">
          No activity from friends yet. Add friends to see what they're reading!
        </p>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-[hsl(222,47%,9%)] rounded-lg p-3 flex items-start gap-3"
            >
              <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.activity_type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium text-white">{activity.user_name}</span>
                  <span className="text-[hsl(215,15%,55%)] mx-1">
                    {activity.activity_type === 'read_chapter' && 'read a chapter of'}
                    {activity.activity_type === 'added_manga' && 'added to library'}
                    {activity.activity_type === 'rated_manga' && 'rated'}
                    {activity.activity_type === 'commented' && 'commented on'}
                  </span>
                  {activity.manga_id && (
                    <Link
                      to={createPageUrl(`MangaDetail?mangaId=${activity.manga_id}`)}
                      className="font-medium text-violet-400 hover:text-violet-300"
                    >
                      {activity.manga_title}
                    </Link>
                  )}
                </p>
                <p className="text-xs text-[hsl(215,15%,45%)] mt-1">
                  {moment(activity.created_date).fromNow()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
