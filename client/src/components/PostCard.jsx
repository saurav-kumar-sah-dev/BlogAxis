import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useFollowState } from '../hooks/useFollowState';
import ReportButton from './ReportButton';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
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
    <article className="group bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
      {/* Media */}
      {post.type === 'image' && post.mediaUrl && (
        <Link to={`/posts/${post._id}`} className="relative block">
          <img src={post.mediaUrl} alt="" className="w-full object-cover max-h-[60vh] sm:h-56" />
        </Link>
      )}
      {post.type === 'video' && post.mediaUrl && (
        <Link to={`/posts/${post._id}`} className="relative block">
          <video src={post.mediaUrl} className="w-full max-h-[60vh] sm:max-h-80" controls preload="metadata" />
          {typeof post.videoDurationSec === 'number' && (
            <div className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
              {Math.floor(post.videoDurationSec / 60)}:{String(post.videoDurationSec % 60).padStart(2, '0')}
            </div>
          )}
        </Link>
      )}
      {post.type === 'document' && post.mediaUrl && (
        <Link to={`/posts/${post._id}`} className="block">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">{getDocumentIcon(post.docMimeType || post.mediaMimeType)}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {getDocumentFilename()}
                </h3>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(post.docSize)}
                  </span>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Click to view
                  </span>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Document</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* User info header */}
        <div className="flex items-center gap-3 mb-3">
          <Link 
            to={userId ? `/users/${userId}` : '#'} 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src={userAvatar || `data:image/svg+xml;base64,${btoa(`
                <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" fill="#e5e7eb"/>
                  <text x="20" y="25" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">U</text>
                </svg>
              `)}`}
              alt={userName}
              className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </Link>
          {shouldShowFollow && (
            <button
              onClick={handleToggleFollow}
              disabled={followLoading}
              className={`ml-auto px-3 py-1 rounded-lg text-xs font-medium transition-colors ${isFollowing ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'} ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {followLoading ? '⏳' : (isFollowing ? 'Unfollow' : 'Follow')}
            </button>
          )}
        </div>

        <div className="flex justify-between items-start gap-3">
          <Link to={`/posts/${post._id}`} className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 hover:underline">{post.title}</Link>
          <div className="flex gap-3 shrink-0">
            {isOwner && (
              <>
                <Link className="text-blue-600 dark:text-blue-400 hover:underline text-sm" to={`/edit/${post._id}`}>Edit</Link>
                <button className="text-red-600 dark:text-red-400 hover:underline text-sm" onClick={() => onDelete(post._id)}>Delete</button>
              </>
            )}
            {!isOwner && user && (
              <ReportButton 
                targetType="post" 
                targetId={post._id} 
                targetTitle={post.title}
                className="text-sm"
              />
            )}
          </div>
        </div>
        {post.type !== 'article' && (
          <p className="mt-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-line line-clamp-3">{post.body}</p>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center gap-3">
          <button onClick={toggleLike} className={`px-3 py-1 rounded-lg text-xs sm:text-sm ${liked ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
            👍 {likes}
          </button>
          <button onClick={toggleDislike} className={`px-3 py-1 rounded-lg text-xs sm:text-sm ${disliked ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
            👎 {dislikes}
          </button>
          <Link to={`/posts/${post._id}`} className="ml-auto px-3 py-1 rounded-lg text-xs sm:text-sm bg-blue-600 text-white hover:bg-blue-700">
            Read more
          </Link>
          <button onClick={openComments} className="px-3 py-1 rounded-lg text-xs sm:text-sm bg-indigo-600 text-white hover:bg-indigo-700">
            💬 Comments ({commentCount})
          </button>
        </div>
      </div>

      {/* Comments Modal */}
      {commentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCommentOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Comments</h4>
              <button onClick={() => setCommentOpen(false)} className="text-gray-500 hover:text-gray-700">✖</button>
            </div>
            {user && (
              <div className="mb-4 flex gap-2">
                <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write a comment..." className="flex-1 border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                <button onClick={() => submitComment(null)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Post</button>
              </div>
            )}
            {commentLoading ? (
              <div className="p-4 text-gray-600 dark:text-gray-300">Loading...</div>
            ) : comments.length === 0 ? (
              <div className="p-4 text-gray-600 dark:text-gray-300">No comments yet</div>
            ) : (
              <div className="space-y-4">
                {comments.map(c => (
                  <div key={c._id} className="flex items-start gap-3">
                    <Link to={`/users/${c.user?._id || c.user}`} className="shrink-0">
                      <img src={c.user?.avatarUrl || `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\"><rect width=\"28\" height=\"28\" fill=\"#e5e7eb\"/><text x=\"14\" y=\"18\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"11\" fill=\"#6b7280\">U</text></svg>')}`} alt="" className="w-8 h-8 rounded-full object-cover border" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <Link to={`/users/${c.user?._id || c.user}`} className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{c.user?.name || 'User'}</Link>
                          {c.user?.username && <div className="text-xs text-gray-500 truncate">@{c.user.username}</div>}
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{c.body}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button onClick={() => toggleCommentLike(c._id, 'like')} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs" title="Like this comment">
                          👍 {(c.likes || []).length || 0}
                        </button>
                        <button onClick={() => toggleCommentLike(c._id, 'dislike')} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs" title="Dislike this comment">
                          👎 {(c.dislikes || []).length || 0}
                        </button>
                        {user && <button onClick={() => { setReplyingTo(c._id); }} className="ml-2 text-xs text-indigo-600 hover:underline" title="Reply">Reply</button>}
                        {/* Edit/Delete for own comment */}
                        {user && String(c.user?._id || c.user) === String(user.id) && (
                          <>
                            <button onClick={() => { setReplyingTo(null); setNewComment(c.body); }} className="ml-2 text-xs text-gray-600 hover:underline" title="Edit">Edit</button>
                            <button onClick={async () => {
                              if (!confirm('Delete this comment?')) return;
                              try {
                                const res = await api.del(`/posts/${post._id}/comments/${c._id}`);
                                if (!res.ok) throw new Error();
                                setComments(prev => prev.filter(x => x._id !== c._id));
                                setCommentCount(cnt => Math.max(0, cnt - 1));
                              } catch {}
                            }} className="ml-2 text-xs text-red-600 hover:underline" title="Delete">Delete</button>
                          </>
                        )}
                        <button onClick={() => { const open = !repliesOpen[c._id]; setRepliesOpen(prev => ({ ...prev, [c._id]: open })); if (open && !replies[c._id]) loadReplies(c._id); }} className="ml-auto text-xs text-gray-600 dark:text-gray-300 hover:underline" title="Toggle replies">
                          View replies
                        </button>
                      </div>
                      {replyingTo === c._id && (
                        <div className="mt-2 flex gap-2">
                          <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write a reply..." className="flex-1 border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                          <button onClick={() => submitComment(c._id)} className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm">Reply</button>
                          <button onClick={() => { setReplyingTo(null); setNewComment(''); }} className="px-2 py-2 rounded-lg text-sm">Cancel</button>
                        </div>
                      )}
                      {repliesOpen[c._id] && (
                        <div className="mt-3 pl-6 border-l border-gray-200 dark:border-gray-700 space-y-3">
                          {(replies[c._id] || []).map(r => (
                            <div key={r._id} className="flex items-start gap-3">
                              <Link to={`/users/${r.user?._id || r.user}`} className="shrink-0">
                                <img src={r.user?.avatarUrl || `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\"><rect width=\"28\" height=\"28\" fill=\"#e5e7eb\"/><text x=\"14\" y=\"18\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"11\" fill=\"#6b7280\">U</text></svg>')}`} alt="" className="w-7 h-7 rounded-full object-cover border" />
                              </Link>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="min-w-0">
                                    <Link to={`/users/${r.user?._id || r.user}`} className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{r.user?.name || 'User'}</Link>
                                    {r.user?.username && <div className="text-[11px] text-gray-500 truncate">@{r.user.username}</div>}
                                  </div>
                                </div>
                                <p className="mt-1 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{r.body}</p>
                                <div className="mt-1 flex items-center gap-2">
                                  <button onClick={() => toggleCommentLike(r._id, 'like')} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs" title="Like this comment">
                                    👍 {(r.likes || []).length || 0}
                                  </button>
                                  <button onClick={() => toggleCommentLike(r._id, 'dislike')} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs" title="Dislike this comment">
                                    👎 {(r.dislikes || []).length || 0}
                                  </button>
                                  {user && String(r.user?._id || r.user) === String(user.id) && (
                                    <>
                                      <button onClick={async () => {
                                        const text = prompt('Edit reply:', r.body);
                                        if (text == null) return;
                                        try {
                                          const res = await api.put(`/posts/${post._id}/comments/${r._id}`, { body: text });
                                          const updated = await res.json();
                                          if (!res.ok) throw new Error();
                                          setReplies(prev => ({ ...prev, [c._id]: (prev[c._id] || []).map(x => x._id === r._id ? updated : x) }));
                                        } catch {}
                                      }} className="ml-2 text-xs text-gray-600 hover:underline" title="Edit">Edit</button>
                                      <button onClick={async () => {
                                        if (!confirm('Delete this reply?')) return;
                                        try {
                                          const res = await api.del(`/posts/${post._id}/comments/${r._id}`);
                                          if (!res.ok) throw new Error();
                                          setReplies(prev => ({ ...prev, [c._id]: (prev[c._id] || []).filter(x => x._id !== r._id) }));
                                          setCommentCount(cnt => Math.max(0, cnt - 1));
                                        } catch {}
                                      }} className="ml-2 text-xs text-red-600 hover:underline" title="Delete">Delete</button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}