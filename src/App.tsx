import { useRouter } from 'next/router';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';

function App() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="min-h-screen bg-gray-50">
      {id ? <PostDetail /> : <PostList />}
    </div>
  );
}

export default App;