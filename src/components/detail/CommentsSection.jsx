import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CommentsSection({ mangaId }) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', mangaId],
    queryFn: () => base44.entities.Comment.filter({ manga_id: mangaId }, '-created_date'),
    enabled: !!mangaId,
  });

  const addComment = useMutation({
    mutationFn: async (data) => {
      const newComment = await base44.entities.Comment.create(data);
      await base44.entities.Activity.create({
        user_email: user.email,
        user_name: user.full_name,
        activity_type: 'commented',
        manga_id: mangaId,
        details: data.comment.substring(0, 100),
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

  const deleteComment = useMutation({
    mutationFn: (id) => base44.entities.Comment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', mangaId] });
      toast.success('Comment deleted');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addComment.mutate({
      manga_id: mangaId,
      comment: comment.trim(),
      rating: rating || null,
      user_name: user?.full_name || 'Anonymous',
      user_email: user?.email || 'anonymous',
    });
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;
  }

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xl font-bold text-white">Reviews & Comments</h3>

      {/* Add comment form */}
      {user && (
        <form onSubmit={handleSubmit} className="bg-[hsl(222,47%,9%)] rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[hsl(215,15%,55%)]">Your rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star * 2)}
                className="transition-colors"
              >
                <Star
                  className={`w-5 h-5 ${
                    star * 2 <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && <span className="text-violet-400 text-sm ml-2">{rating}/10</span>}
          </div>

          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="bg-[hsl(222,47%,12%)] border-[hsl(222,30%,18%)] text-white min-h-[100px]"
          />

          <Button
            type="submit"
            disabled={!comment.trim() || addComment.isPending}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Post Comment
          </Button>
        </form>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-[hsl(215,15%,45%)] py-8">No comments yet. Be the first!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="bg-[hsl(222,47%,9%)] rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-white">{c.user_name}</span>
                    {c.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-yellow-400">{c.rating}/10</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-[hsl(215,15%,45%)]">
                    {new Date(c.created_date).toLocaleDateString()}
                  </span>
                </div>
                {user && c.user_email === user.email && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteComment.mutate(c.id)}
                    className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-[hsl(210,20%,85%)] text-sm leading-relaxed">{c.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
