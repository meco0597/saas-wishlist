import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, increment, query, updateDoc, where } from 'firebase/firestore';
import { Post } from '@/types/post';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';

interface PostItemProps {
  post: Post;
  showFullContent?: boolean;
}

export default function PostItem({ post, showFullContent = false }: PostItemProps) {
  const [hasVoted, setHasVoted] = useState<boolean>(post.hasVoted || false);
  const { toast } = useToast();
  const router = useRouter();

  const handleVoteToggle = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to vote.",
        variant: "destructive",
      });
      return;
    }

    const userId = user.uid;
    const voteRef = collection(db, `posts/${postId}/votes`);
    const userVoteQuery = query(voteRef, where('userId', '==', userId));

    try {
      const querySnapshot = await getDocs(userVoteQuery);
      const postRef = doc(db, 'posts', postId);

      if (!querySnapshot.empty) {
        setHasVoted(false);
        const voteDoc = querySnapshot.docs[0];
        await deleteDoc(doc(db, `posts/${postId}/votes`, voteDoc.id));
        await updateDoc(postRef, { votes: increment(-1) });
      } else {
        setHasVoted(true);
        await addDoc(voteRef, { userId, timestamp: new Date() });
        await updateDoc(postRef, { votes: increment(1) });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCardClick = () => {
    if (!showFullContent) {
      router.push(`/posts/${post.id}`);
    }
  };

  return (
    <Card 
      className={`${!showFullContent ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              {post.title}
              {!showFullContent && <ExternalLink className="h-4 w-4 text-gray-400" />}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Posted {formatDistanceToNow(new Date(post.createdAt))} ago
            </p>
          </div>
          <Badge variant="secondary">{post.source}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className={`text-muted-foreground ${!showFullContent ? 'line-clamp-3' : ''}`}>
          {post.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant={hasVoted ? "default" : "outline"}
          size="sm"
          onClick={(e) => handleVoteToggle(e, post.id)}
          className="gap-2"
        >
          <ChevronUp className="h-4 w-4" />
          <span>{post.votes}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}