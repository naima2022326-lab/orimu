import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';

export default function CommentsSection({ mangaId }) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', mangaId],
    queryFn: () => base44.entities.Comment.filter({ manga_id: mangaId }, '-created_date'),
  });

  const addComment = useMutation({
    mutationFn: async (data) => {
      const newComment = await base44.entities.Comment.create(data);
      // Create activity
      await base44.entities.Activity.create({
        user_email: user.email,
        user_name: user.full_name,
        activity_type: 'commented',
        manga_id: mangaId,
        details: `Commented on manga`,
      });
      return newComment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', mangaId] });
      setComment('');
      setRating(0);
      toast.success('Comment posted!');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    addComment.mutate({
      manga_id: mangaId,
      comment: comment.trim(),
      rating: rating || null,
      user_name: user.full_name,
      user_email: user.email,
    });
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
      <h2 className="text-xl font-bold flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-violet-400" />
        Comments & Reviews
      </h2>

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="bg-[hsl(222,47%,9%)] rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[hsl(215,15%,55%)]">Your Rating:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-4 h-4 ${
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-[hsl(215,15%,35%)]'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && <span className="text-sm text-violet-400">{rating}/10</span>}
        </div>

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this manga..."
          className="bg-[hsl(222,47%,12%)] border-[hsl(222,30%,18%)] min-h-24"
        />

        <Button
          type="submit"
          disabled={addComment.isPending}
          className="bg-violet-600 hover:bg-violet-700"
        >
          {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Comment'}
        </Button>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-[hsl(215,15%,50%)] py-8 text-sm">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="bg-[hsl(222,47%,9%)] rounded-xl p-4 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-white">{c.user_name}</p>
                  <p className="text-xs text-[hsl(215,15%,45%)]">
                    {moment(c.created_date).fromNow()}
                  </p>
                </div>
                {c.rating && (
                  <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">{c.rating}/10</span>
                  </div>
                )}
              </div>
              <p className="text-[hsl(215,15%,70%)] text-sm leading-relaxed">{c.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
