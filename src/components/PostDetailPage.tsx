import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, deleteDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Post } from '@/types/post';
import { Comment } from '@/types/comment';
import PostItem from './PostItem';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, MessageSquare } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface PostDetailPageProps {
  postId: string;
}

export default function PostDetailPage({ postId }: PostDetailPageProps) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      
      try {
        const postDoc = await getDoc(doc(db, 'posts', postId));
        if (postDoc.exists()) {
          setPost({ id: postDoc.id, ...postDoc.data() } as Post);
        } else {
          toast({
            title: "Post not found",
            description: "The requested post could not be found.",
            variant: "destructive",
          });
          router.push('/');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load post details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();

    // Subscribe to comments
    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const newComments: Comment[] = [];
      snapshot.forEach((doc) => {
        newComments.push({ id: doc.id, ...doc.data() } as Comment);
      });
      setComments(newComments);
    });

    return () => unsubscribe();
  }, [postId, router, toast]);

  const handleDelete = async () => {
    if (!post) return;

    try {
      await deleteDoc(doc(db, 'posts', post.id));
      toast({
        title: "Success",
        description: "Post deleted successfully.",
      });
      router.push('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const isAuthor = currentUser?.uid === post.userId;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Posts
        </Button>

        {isAuthor && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/posts/${post.id}/edit`)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your post.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <PostItem post={post} showFullContent />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold">
              Comments ({comments.length})
            </h2>
          </div>

          <div className="space-y-8">
            <CommentForm postId={post.id} onCommentAdded={() => {}} />
            
            {comments.length > 0 ? (
              <CommentList comments={comments} />
            ) : (
              <p className="text-center text-gray-500 py-4">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}