import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import TextareaAutosize from 'react-textarea-autosize';

interface CommentFormProps {
  postId: string;
  onCommentAdded: () => void;
}

export default function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const user = auth.currentUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to comment.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Validation Error",
        description: "Comment cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'comments'), {
        postId,
        userId: user.uid,
        userDisplayName: user.displayName || 'Anonymous User',
        content: content.trim(),
        createdAt: new Date().toISOString(),
      });

      setContent('');
      onCommentAdded();
      
      toast({
        title: "Success",
        description: "Your comment has been added.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
        <TextareaAutosize
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          minRows={2}
          className="w-full resize-none border-0 bg-transparent p-0 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
        />
        <div className="flex justify-end border-t border-gray-100 pt-2">
          <Button 
            type="submit" 
            disabled={isSubmitting || !content.trim()}
            size="sm"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>
    </form>
  );
}