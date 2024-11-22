import { useState } from 'react';
import PostList from './PostList';
import FilterBar from './FilterBar';
import PostForm from './PostForm';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function HomePage() {
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [filterSource, setFilterSource] = useState('All sources');
  const [sortOrder, setSortOrder] = useState<'most' | 'least'>('most');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Feature Requests</h1>
        <Button onClick={() => setIsPostFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      <FilterBar
        filterSource={filterSource}
        setFilterSource={setFilterSource}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      <PostList
        filterSource={filterSource}
        sortOrder={sortOrder}
      />

      <PostForm
        isOpen={isPostFormOpen}
        setIsOpen={setIsPostFormOpen}
      />
    </div>
  );
}