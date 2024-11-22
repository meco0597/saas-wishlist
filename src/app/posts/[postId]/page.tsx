import { Suspense } from 'react';
import PostDetailPage from '@/components/PostDetailPage';

export default function Page({ params }: { params: { postId: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostDetailPage postId={params.postId} />
    </Suspense>
  );
}