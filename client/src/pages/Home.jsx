import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import SearchBar from '../components/SearchBar';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';

const LIMIT = 5;

export default function Home() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT, ...(search ? { search } : {}) });
      const res = await api.get(`/posts?${params.toString()}`);
      const data = await res.json();
      setPosts(data.data || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  useEffect(() => {
    const id = setTimeout(() => { setPage(1); loadPosts(); }, 350);
    return () => clearTimeout(id);
  }, [search]); // eslint-disable-line

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      const res = await api.del(`/api/posts/${id}`);
      if (res.status === 401) {
        toast.error('Session expired. Please log in again.');
        logout();
        navigate('/login', { replace: true, state: { from: { pathname: '/' } } });
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');

      toast.success('Post deleted');
      setPosts((cur) => cur.filter((p) => p._id !== id));
      setTotal((t) => (t > 0 ? t - 1 : 0));
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center gap-3">
        <SearchBar value={search} onChange={setSearch} />
        <div className="text-sm text-gray-500 dark:text-gray-400">{total} results</div>
      </div>

      {loading ? (
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((p) => (
              <PostCard key={p._id} post={p} onDelete={handleDelete} />
            ))}
          </div>
          {posts.length === 0 && <div className="text-gray-500 dark:text-gray-400 text-center">No posts found.</div>}
          <Pagination
            page={page}
            total={total}
            limit={LIMIT}
            onPrev={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        </>
      )}
    </div>
  );
}