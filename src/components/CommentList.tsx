import { formatDistanceToNow } from 'date-fns';
import { Comment } from '@/types/comment';
import { UserCircle } from 'lucide-react';

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <div className="flex-shrink-0">
            <UserCircle className="h-8 w-8 text-gray-400" />
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {comment.userDisplayName}
              </span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt))} ago
              </span>
            </div>
            <p className="mt-1 text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}