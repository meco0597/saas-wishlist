import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Post } from '@/types/post';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SourceSelect from './SourceSelect';

interface EditPostPageProps {
  postId: string;
}

export default function EditPostPage({ postId }: EditPostPageProps) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const { toast } = useToast();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      
      try {
        const postDoc = await getDoc(doc(db, 'posts', postId));
        if (postDoc.exists()) {
          const postData = { id: postDoc.id, ...postDoc.data() } as Post;
          setPost(postData);
          setTitle(postData.title);
          setDescription(postData.description);
          setSource(postData.source);
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
  }, [postId, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!post || !currentUser) return;
    
    if (currentUser.uid !== post.userId) {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to edit this post.",
        variant: "destructive",
      });
      return;
    }

    if (!title || !description || !source) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateDoc(doc(db, 'posts', postId), {
        title,
        description,
        source,
      });

      toast({
        title: "Success",
        description: "Post updated successfully.",
      });
      router.push(`/posts/${postId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
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

  if (!post || (currentUser?.uid !== post.userId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Unauthorized</h1>
          <p className="mt-2 text-gray-600">You don't have permission to edit this post.</p>
          <Button
            variant="ghost"
            onClick={() => router.push(`/posts/${postId}`)}
            className="mt-4"
          >
            Back to Post
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/posts/${postId}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Post
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="min-h-[150px]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="source" className="text-sm font-medium text-gray-700">
              Source
            </label>
            <SourceSelect value={source} onValueChange={setSource} />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/posts/${postId}`)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}