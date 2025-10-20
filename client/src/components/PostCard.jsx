import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useState, Fragment } from 'react';
import { api } from '../api/client';
import { useFollowState } from '../hooks/useFollowState';
import ReportButton from './ReportButton';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const ownerId = post && typeof post.user === 'object' ? post.user?._id : post.user;
  const isOwner = user && String(ownerId) === user.id;
  const [likes, setLikes] = useState(post.likesCount || 0);
  const [dislikes, setDislikes] = useState(post.dislikesCount || 0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentCount, setCommentCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null); // comment id
  const [repliesOpen, setRepliesOpen] = useState({}); // map commentId -> boolean
  const [replies, setReplies] = useState({}); // map commentId -> array of replies

  // Get user info from post
  const postUser = post.user && typeof post.user === 'object' ? post.user : null;
  const userName = postUser?.name || 'Unknown User';
  const userAvatar = postUser?.avatarUrl;
  const userId = postUser?._id;
  
  // Use global follow state (after userId is defined)
  const { isFollowing, loading: followLoading, shouldShowFollow, toggleFollow } = useFollowState(userId);

  // Initialize reactions state
  useEffect(() => {
    let cancelled = false;
    async function loadReactions() {
      try {
        const res = await api.get(`/posts/${post._id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setLikes((data.likes || []).length || 0);
        setDislikes((data.dislikes || []).length || 0);
        if (user) {
          setLiked((data.likes || []).some(id => String(id) === String(user.id)));
          setDisliked((data.dislikes || []).some(id => String(id) === String(user.id)));
        } else {
          setLiked(false); setDisliked(false);
        }
      } catch {}
    }
    loadReactions();
    return () => { cancelled = true; };
  }, [post._id, user]);

  // Load comment count lightweight
  useEffect(() => {
    let cancelled = false;
    async function loadCount() {
      try {
        const res = await api.get(`/posts/${post._id}/comments?limit=1`);
        const data = await res.json();
        if (!res.ok) throw new Error();
        if (!cancelled) setCommentCount(Number(data.total || 0));
      } catch {}
    }
    loadCount();
    return () => { cancelled = true; };
  }, [post._id]);

  async function toggleLike() {
    if (!user) return;
    try {
      const res = await api.post(`/posts/${post._id}/like`, {});
      const data = await res.json();
      if (!res.ok) throw new Error();
      setLikes(data.likes); setDislikes(data.dislikes);
      setLiked(prev => !prev); setDisliked(false);
    } catch {}
  }

  async function toggleDislike() {
    if (!user) return;
    try {
      const res = await api.post(`/posts/${post._id}/dislike`, {});
      const data = await res.json();
      if (!res.ok) throw new Error();
      setLikes(data.likes); setDislikes(data.dislikes);
      setDisliked(prev => !prev); setLiked(false);
    } catch {}
  }

  async function openComments() {
    setCommentOpen(true);
    setCommentLoading(true);
    try {
      const res = await api.get(`/posts/${post._id}/comments`);
      const data = await res.json();
      if (!res.ok) throw new Error();
      setComments(data.data || []);
      setCommentCount(Number(data.total || 0));
    } catch {
      setComments([]);
    } finally {
      setCommentLoading(false);
    }
  }

  async function submitComment(parent = null) {
    if (!user) return;
    const body = (newComment || '').trim();
    if (!body) return;
    try {
      const res = await api.post(`/posts/${post._id}/comments`, { body, parent });
      const item = await res.json();
      if (!res.ok) throw new Error();
      if (parent) {
        setReplies(prev => ({ ...prev, [parent]: [item, ...(prev[parent] || [])] }));
        setReplyingTo(null);
      } else {
        setComments(prev => [item, ...prev]);
      }
      setNewComment('');
      setCommentCount(c => c + 1);
    } catch {}
  }

  async function loadReplies(parentId) {
    try {
      const res = await api.get(`/posts/${post._id}/comments?parent=${parentId}`);
      const data = await res.json();
      if (!res.ok) throw new Error();
      setReplies(prev => ({ ...prev, [parentId]: data.data || [] }));
    } catch {
      setReplies(prev => ({ ...prev, [parentId]: [] }));
    }
  }

  async function toggleCommentLike(commentId, type) { // type: 'like' | 'dislike'
    if (!user) return;
    try {
      const res = await api.post(`/posts/${post._id}/comments/${commentId}/reaction`, { type });
      const counts = await res.json();
      if (!res.ok) throw new Error();
      const upd = (list) => (list || []).map(c => c._id === commentId ? { ...c, likes: new Array(counts.likes).fill(0), dislikes: new Array(counts.dislikes).fill(0) } : c);
      setComments(prev => upd(prev));
      setReplies(prev => {
        const out = { ...prev };
        Object.keys(out).forEach(pid => { out[pid] = upd(out[pid]); });
        return out;
      });
    } catch {}
  }

  async function handleToggleFollow(ev) {
    ev.preventDefault();
    if (!shouldShowFollow || followLoading) return;
    try {
      await toggleFollow();
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  function getDocumentIcon(mimeType) {
    if (!mimeType) return '📄';
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📘';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📗';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📙';
    if (mimeType.includes('text')) return '📝';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗜️';
    return '📄';
  }

  function formatFileSize(bytes) {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  function getDocumentFilename() {
    if (post?.docOriginalName) return post.docOriginalName;
    const base = (post?.title || 'document').replace(/[^a-z0-9\-_. ]/gi, '').trim() || 'document';
    const mime = post?.docMimeType || post?.mediaMimeType || '';
    const fromMime = (
      mime.includes('pdf') ? 'pdf' :
      mime.includes('msword') ? 'doc' :
      mime.includes('wordprocessingml') ? 'docx' :
      mime.includes('presentationml') ? 'pptx' :
      mime.includes('powerpoint') ? 'ppt' :
      mime.includes('spreadsheetml') ? 'xlsx' :
      mime.includes('excel') ? 'xls' :
      mime.startsWith('text/') ? 'txt' : ''
    );
    if (fromMime) return `${base}.${fromMime}`;
    return base;
  }





  return (
    <Fragment>
    <article className="group bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-200 ease-out flex flex-col border border-white/20 dark:border-gray-700/50 hover:scale-[1.02] hover:-translate-y-1 will-change-transform overflow-hidden">
      {/* Enhanced Media */}
      {post.type === 'image' && post.mediaUrl && (
        <Link to={`/posts/${post._id}`} className="relative block group/media">
          <div className="relative overflow-hidden rounded-t-3xl">
            <img src={post.mediaUrl} alt="" className="w-full object-cover max-h-[60vh] sm:h-56 group-hover/media:scale-102 transition-transform duration-500 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl px-3 py-1 shadow-lg">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">📸 Image</span>
            </div>
          </div>
        </Link>
      )}
      {post.type === 'video' && post.mediaUrl && (
        <Link to={`/posts/${post._id}`} className="relative block group/media">
          <div className="relative overflow-hidden rounded-t-3xl">
            <video src={post.mediaUrl} className="w-full max-h-[60vh] sm:max-h-80 group-hover/media:scale-102 transition-transform duration-500 ease-out" controls preload="metadata" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl px-3 py-1 shadow-lg">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">🎥 Video</span>
            </div>
            {typeof post.videoDurationSec === 'number' && (
              <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-2xl text-sm font-semibold shadow-lg">
                ⏱️ {Math.floor(post.videoDurationSec / 60)}:{String(post.videoDurationSec % 60).padStart(2, '0')}
              </div>
            )}
          </div>
        </Link>
      )}
      {post.type === 'document' && post.mediaUrl && (
        <Link to={`/posts/${post._id}`} className="block group/document">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-t-3xl p-6 hover:shadow-xl transition-all duration-200 ease-out group-hover/document:scale-[1.02]">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center group-hover/document:scale-105 group-hover/document:rotate-3 transition-all duration-200 ease-out">
                  <span className="text-3xl">{getDocumentIcon(post.docMimeType || post.mediaMimeType)}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover/document:text-blue-600 dark:group-hover/document:text-blue-400 transition-colors">
                  {getDocumentFilename()}
                </h3>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-lg">
                    📏 {formatFileSize(post.docSize)}
                  </span>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                    👆 Click to view
                  </span>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-lg">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Document</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center group-hover/document:bg-blue-200 dark:group-hover/document:bg-blue-800 group-hover/document:scale-110 transition-all duration-200 ease-out">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}
      {post.type === 'article' && (
        <div className="p-4">
          <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none whitespace-pre-wrap">{post.articleContent || post.body}</div>
        </div>
      )}
      <div className="p-6 sm:p-8 flex-1 flex flex-col">
        {/* Enhanced User info header */}
        <div className="flex items-start justify-between gap-1 mb-4 w-full">
          <Link 
            to={userId ? `/users/${userId}` : '#'} 
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 ease-out group/user flex-shrink-0 min-w-0"
          >
            <div className="relative">
              <img
                src={userAvatar || `data:image/svg+xml;base64,${btoa(`
                  <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="40" fill="#e5e7eb"/>
                    <text x="20" y="25" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">U</text>
                  </svg>
                `)}`}
                alt={userName}
                className="w-10 h-10 rounded-2xl object-cover border-2 border-white/30 dark:border-gray-600/30 shadow-lg group-hover/user:scale-105 transition-transform duration-300"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full shadow-lg"></div>
            </div>
            <div className="min-w-0 max-w-[120px] sm:max-w-[160px]">
              <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover/user:text-blue-600 dark:group-hover/user:text-blue-400 transition-colors truncate">{userName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                <span>📅</span>
                <span className="truncate">{new Date(post.createdAt).toLocaleDateString()}</span>
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-1 flex-shrink-0">
            {shouldShowFollow && (
              <button
                onClick={handleToggleFollow}
                disabled={followLoading}
                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-200 ease-out shadow-sm hover:shadow-md hover:scale-[1.02] flex items-center justify-center ${isFollowing ? 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-100 hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'} ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isFollowing ? 'Unfollow' : 'Follow'}
              >
                {followLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>{isFollowing ? '✅' : '➕'}</span>
                )}
              </button>
            )}
            {!isOwner && user && (
              <ReportButton 
                key={`report-post-${post._id}`}
                targetType="post" 
                targetId={post._id} 
                targetTitle={post.title}
                className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 ease-out shadow-sm hover:shadow-md hover:scale-[1.02] flex items-center justify-center"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
          <Link to={`/posts/${post._id}`} className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 group/title flex-1 min-w-0">
            <span className="group-hover/title:bg-gradient-to-r group-hover/title:from-blue-600 group-hover/title:to-purple-600 group-hover/title:bg-clip-text group-hover/title:text-transparent break-words">
              {post.title}
            </span>
          </Link>
          <div className="flex gap-2 shrink-0 self-start">
            {isOwner && (
              <>
                <Link 
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 ease-out shadow-md hover:shadow-lg hover:scale-[1.02]" 
                  to={`/edit/${post._id}`}
                >
                  ✏️ Edit
                </Link>
                <button 
                  className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 ease-out shadow-md hover:shadow-lg hover:scale-[1.02]" 
                  onClick={() => onDelete(post._id)}
                >
                  🗑️ Delete
                </button>
              </>
            )}
          </div>
        </div>
        {post.type !== 'article' && (
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-line line-clamp-3 leading-relaxed mb-4 break-words overflow-hidden">{post.body}</p>
        )}

        {/* Enhanced Actions */}
        <div className="mt-auto pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full overflow-hidden">
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                onClick={toggleLike} 
                className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-200 ease-out shadow-md hover:shadow-lg hover:scale-[1.02] ${liked ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-100 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20'}`}
              >
                <span className="flex items-center gap-1">
                  👍 {likes}
                </span>
              </button>
              <button 
                onClick={toggleDislike} 
                className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-200 ease-out shadow-md hover:shadow-lg hover:scale-[1.02] ${disliked ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-100 hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/20 dark:hover:to-pink-900/20'}`}
              >
                <span className="flex items-center gap-1">
                  👎 {dislikes}
                </span>
              </button>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <Link 
                to={`/posts/${post._id}`} 
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 ease-out shadow-md hover:shadow-lg hover:scale-[1.02]"
              >
                <span className="flex items-center gap-1">
                  📖 Read more
                </span>
              </Link>
              <button 
                onClick={openComments} 
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 ease-out shadow-md hover:shadow-lg hover:scale-[1.02]"
              >
                <span className="flex items-center gap-1">
                  💬 {commentCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>

    {/* Enhanced Comments Modal */}
    {commentOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Enhanced backdrop with blur */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={() => setCommentOpen(false)} 
        />
        
        {/* Enhanced modal container */}
        <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden border border-white/20 dark:border-gray-700/50">
          {/* Enhanced header */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">💬</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">Comments</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</p>
                </div>
              </div>
              <button 
                onClick={() => setCommentOpen(false)} 
                className="p-2 rounded-2xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-all duration-200 ease-out hover:scale-110"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>
          </div>

          {/* Enhanced comment input */}
          {user && (
            <div className="p-6 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/20 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <img
                    src={user.avatarUrl || `data:image/svg+xml;base64,${btoa(`
                      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="40" fill="#e5e7eb"/>
                        <text x="20" y="25" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">U</text>
                      </svg>
                    `)}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-2xl object-cover border-2 border-white/30 dark:border-gray-600/30 shadow-lg"
                  />
                </div>
                <div className="flex-1">
                  <input 
                    value={newComment} 
                    onChange={e => setNewComment(e.target.value)} 
                    placeholder="Write a comment..." 
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-out shadow-lg hover:shadow-xl" 
                  />
                </div>
                <button 
                  onClick={() => submitComment(null)} 
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 ease-out shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                  <span className="flex items-center gap-2">
                    <span>📝</span>
                    <span>Post</span>
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Enhanced comments list */}
          <div className="max-h-96 overflow-y-auto p-6">
            {commentLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative mb-4">
                  <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💭</div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No comments yet</h3>
                <p className="text-gray-600 dark:text-gray-400">Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-4">
              {comments.map(c => (
                <div key={c._id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-200 ease-out">
                  <div className="flex items-start gap-3">
                  <Link to={`/users/${c.user?._id || c.user}`} className="shrink-0 group/avatar">
                    <img src={c.user?.avatarUrl || `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\"><rect width=\"32\" height=\"32\" fill=\"#e5e7eb\"/><text x=\"16\" y=\"20\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"12\" fill=\"#6b7280\">U</text></svg>')}`} alt="" className="w-10 h-10 rounded-2xl object-cover border-2 border-white/30 dark:border-gray-600/30 shadow-lg group-hover/avatar:scale-105 transition-transform duration-300" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="min-w-0">
                        <Link to={`/users/${c.user?._id || c.user}`} className="text-sm font-semibold text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {c.user?.name || 'User'}
                        </Link>
                        {c.user?.username && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                            <span>@</span>
                            <span>{c.user.username}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed mb-3">{c.body}</p>
                    
                    {/* Enhanced action buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button 
                        onClick={() => toggleCommentLike(c._id, 'like')} 
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300 text-xs font-medium hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-200 ease-out hover:scale-[1.02]" 
                        title="Like this comment"
                      >
                        <span className="flex items-center gap-1">
                          👍 {(c.likes || []).length || 0}
                        </span>
                      </button>
                      <button 
                        onClick={() => toggleCommentLike(c._id, 'dislike')} 
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 text-red-700 dark:text-red-300 text-xs font-medium hover:from-red-200 hover:to-pink-200 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 transition-all duration-200 ease-out hover:scale-[1.02]" 
                        title="Dislike this comment"
                      >
                        <span className="flex items-center gap-1">
                          👎 {(c.dislikes || []).length || 0}
                        </span>
                      </button>
                      {user && (
                        <button 
                          onClick={() => { setReplyingTo(c._id); }} 
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium hover:from-blue-200 hover:to-indigo-200 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200 ease-out hover:scale-[1.02]" 
                          title="Reply"
                        >
                          💬 Reply
                        </button>
                      )}
                      {/* Edit/Delete for own comment */}
                      {user && String(c.user?._id || c.user) === String(user.id) && (
                        <>
                          <button 
                            onClick={() => { setReplyingTo(null); setNewComment(c.body); }} 
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 ease-out hover:scale-[1.02]" 
                            title="Edit"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={async () => {
                              if (!confirm('Delete this comment?')) return;
                              try {
                                const res = await api.del(`/posts/${post._id}/comments/${c._id}`);
                                if (!res.ok) throw new Error();
                                setComments(prev => prev.filter(x => x._id !== c._id));
                                setCommentCount(cnt => Math.max(0, cnt - 1));
                              } catch {}
                            }} 
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 text-red-700 dark:text-red-300 text-xs font-medium hover:from-red-200 hover:to-pink-200 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 transition-all duration-200 ease-out hover:scale-[1.02]" 
                            title="Delete"
                          >
                            🗑️ Delete
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => { const open = !repliesOpen[c._id]; setRepliesOpen(prev => ({ ...prev, [c._id]: open })); if (open && !replies[c._id]) loadReplies(c._id); }} 
                        className="ml-auto px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-700 dark:text-purple-300 text-xs font-medium hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-200 ease-out hover:scale-[1.02]" 
                        title="Toggle replies"
                      >
                        <span className="flex items-center gap-1">
                          💬 View replies
                        </span>
                      </button>
                    </div>
                    {replyingTo === c._id && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                        <div className="flex gap-3">
                          <input 
                            value={newComment} 
                            onChange={e => setNewComment(e.target.value)} 
                            placeholder="Write a reply..." 
                            className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-out" 
                          />
                          <button 
                            onClick={() => submitComment(c._id)} 
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 ease-out hover:scale-[1.02]"
                          >
                            📝 Reply
                          </button>
                          <button 
                            onClick={() => { setReplyingTo(null); setNewComment(''); }} 
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 ease-out hover:scale-[1.02]"
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    {repliesOpen[c._id] && (
                      <div className="mt-4 pl-6 border-l-2 border-gradient-to-b from-blue-200 to-purple-200 dark:from-blue-700 dark:to-purple-700 space-y-3">
                        {(replies[c._id] || []).map(r => (
                          <div key={r._id} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/30 dark:border-gray-700/30 shadow-md">
                            <div className="flex items-start gap-3">
                              <Link to={`/users/${r.user?._id || r.user}`} className="shrink-0">
                                <img src={r.user?.avatarUrl || `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\"><rect width=\"24\" height=\"24\" fill=\"#e5e7eb\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"10\" fill=\"#6b7280\">U</text></svg>')}`} alt="" className="w-8 h-8 rounded-xl object-cover border border-white/30 dark:border-gray-600/30 shadow-md" />
                              </Link>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="min-w-0">
                                    <Link to={`/users/${r.user?._id || r.user}`} className="text-xs font-semibold text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                      {r.user?.name || 'User'}
                                    </Link>
                                    {r.user?.username && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        @{r.user.username}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(r.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                                <p className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed mb-2">{r.body}</p>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => toggleCommentLike(r._id, 'like')} 
                                    className="px-2 py-1 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300 text-xs hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-200 ease-out hover:scale-[1.02]" 
                                    title="Like this reply"
                                  >
                                    👍 {(r.likes || []).length || 0}
                                  </button>
                                  <button 
                                    onClick={() => toggleCommentLike(r._id, 'dislike')} 
                                    className="px-2 py-1 rounded-lg bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 text-red-700 dark:text-red-300 text-xs hover:from-red-200 hover:to-pink-200 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 transition-all duration-200 ease-out hover:scale-[1.02]" 
                                    title="Dislike this reply"
                                  >
                                    👎 {(r.dislikes || []).length || 0}
                                  </button>
                                  {user && String(r.user?._id || r.user) === String(user.id) && (
                                    <>
                                      <button 
                                        onClick={async () => {
                                          const text = prompt('Edit reply:', r.body);
                                          if (text == null) return;
                                          try {
                                            const res = await api.put(`/posts/${post._id}/comments/${r._id}`, { body: text });
                                            const updated = await res.json();
                                            if (!res.ok) throw new Error();
                                            setReplies(prev => ({ ...prev, [c._id]: (prev[c._id] || []).map(x => x._id === r._id ? updated : x) }));
                                          } catch {}
                                        }} 
                                        className="px-2 py-1 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 text-xs hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 ease-out hover:scale-[1.02]" 
                                        title="Edit"
                                      >
                                        ✏️ Edit
                                      </button>
                                      <button 
                                        onClick={async () => {
                                          if (!confirm('Delete this reply?')) return;
                                          try {
                                            const res = await api.del(`/posts/${post._id}/comments/${r._id}`);
                                            if (!res.ok) throw new Error();
                                            setReplies(prev => ({ ...prev, [c._id]: (prev[c._id] || []).filter(x => x._id !== r._id) }));
                                            setCommentCount(cnt => Math.max(0, cnt - 1));
                                          } catch {}
                                        }} 
                                        className="px-2 py-1 rounded-lg bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 text-red-700 dark:text-red-300 text-xs hover:from-red-200 hover:to-pink-200 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 transition-all duration-200 ease-out hover:scale-[1.02]" 
                                        title="Delete"
                                      >
                                        🗑️ Delete
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </Fragment>
  );
}