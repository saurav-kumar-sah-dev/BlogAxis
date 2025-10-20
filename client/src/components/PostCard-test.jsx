import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useFollowState } from '../hooks/useFollowState';
import ReportButton from './ReportButton';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [commentOpen, setCommentOpen] = useState(false);

  function authNavigate(ev, targetPath) {
    if (user) return;
    ev.preventDefault();
    navigate('/login', { replace: false, state: { from: location, next: targetPath } });
  }

  return (
    <article className="group bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden flex flex-col border border-white/20 dark:border-gray-700/50 hover:scale-105">
      <div className="p-6 sm:p-8 flex-1 flex flex-col">
        <Link to={`/posts/${post._id}`} onClick={(e) => authNavigate(e, `/posts/${post._id}`)} className="text-lg font-bold">
          {post.title}
        </Link>
        <p className="mt-2">{post.body}</p>
        <div className="mt-4 flex gap-2">
          <Link to={`/posts/${post._id}`} onClick={(e) => authNavigate(e, `/posts/${post._id}`)} className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm">Read more</Link>
          <Link to={`/posts/${post._id}#comments`} onClick={(e) => authNavigate(e, `/posts/${post._id}#comments`)} className="px-3 py-1.5 rounded bg-purple-600 text-white text-sm">Comments</Link>
        </div>
      </div>

      {commentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden border border-white/20 dark:border-gray-700/50">
            <div className="p-6">
              <h4>Comments</h4>
              <p>Comment content here</p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
