import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // comment id
  const [repliesOpen, setRepliesOpen] = useState({}); // map commentId -> boolean
  const [replies, setReplies] = useState({}); // map commentId -> array of replies
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [docUrl, setDocUrl] = useState('');

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

  function extractCloudinaryPathFromUrl(maybeUrl) {
    try {
      const u = new URL(maybeUrl);
      const pathname = decodeURIComponent(u.pathname || '');
      const m = pathname.match(/\/(?:image|video|raw)\/upload\/(.+)$/);
      if (!m) return '';
      const afterUpload = m[1];
      return afterUpload.replace(/^v\d+\//, '');
    } catch {
      return '';
    }
  }

  const loadPost = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/posts/${id}`);
      if (res.status === 404) {
        setError('Post not found');
        setPost(null);
        return;
      }
      if (!res.ok) throw new Error('Failed to load post');
      const data = await res.json();
      // If user field is id-only, fetch public profile to display name/avatar
      let enriched = data;
      if (data && data.user && typeof data.user === 'string') {
        try {
          const ures = await api.get(`/users/${data.user}`);
          const u = await ures.json();
          if (ures.ok && u && (u.name || u.avatarUrl)) {
            enriched = { ...data, user: { _id: data.user, name: u.name || 'User', avatarUrl: u.avatarUrl || null } };
          }
        } catch {}
      }
      setPost(enriched);
      const likes = Array.isArray(data.likes) ? data.likes : [];
      const dislikes = Array.isArray(data.dislikes) ? data.dislikes : [];
      setLikesCount(likes.length);
      setDislikesCount(dislikes.length);
      if (user) {
        setLiked(likes.some(uid => String(uid) === String(user.id)));
        setDisliked(dislikes.some(uid => String(uid) === String(user.id)));
      } else {
        setLiked(false);
        setDisliked(false);
      }
    } catch (e) {
      setError(e.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  const loadComments = useCallback(async () => {
    setCommentsLoading(true);
    try {
      const res = await api.get(`/posts/${id}/comments`);
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to load comments');
      setComments(data.data || []);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [id]);

  useEffect(() => { loadPost(); }, [loadPost]);
  useEffect(() => { loadComments(); }, [loadComments]);

  // Resolve document URL for viewing
  useEffect(() => {
    async function resolveDocumentUrl() {
      setDocUrl('');
      try {
        if (!post || post.type !== 'document' || !post.mediaUrl) return;
        
        // Check if it's a local document (new format)
        if (post.mediaUrl.startsWith('/api/documents/')) {
          setDocUrl(post.mediaUrl);
        } else {
          // Handle Cloudinary documents (backward compatibility)
          const cloudinaryPath = post.docPublicId || post.mediaPublicId;
          if (cloudinaryPath) {
            setDocUrl(`/api/media/preview/${cloudinaryPath}`);
          } else {
            setDocUrl(post.mediaUrl);
          }
        }
      } catch (e) {
        console.error('Error resolving document URL:', e);
        setDocUrl(post?.mediaUrl || '');
      }
    }
    resolveDocumentUrl();
  }, [post]);


  async function handleDelete() {
    if (!post || !user) return;
    if (!confirm('Delete this post?')) return;
    try {
      const res = await api.del(`/api/posts/${post._id}`);
      if (res.status === 401) {
        logout();
        navigate('/login', { replace: true, state: { from: { pathname: `/posts/${id}` } } });
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      navigate('/', { replace: true });
    } catch (e) {
      alert(e.message || 'Failed to delete post');
    }
  }

  async function toggleLike(type) { // type: 'like' | 'dislike'
    if (!post || !user) return;
    try {
      const res = await api.post(`/api/posts/${post._id}/${type}`, {});
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to react');
      setLikesCount(data.likes);
      setDislikesCount(data.dislikes);
      if (type === 'like') { setLiked(prev => !prev); setDisliked(false); }
      else { setDisliked(prev => !prev); setLiked(false); }
    } catch {}
  }

  async function submitComment() {
    if (!user) return;
    const body = (newComment || '').trim();
    if (!body) return;
    try {
      const res = await api.post(`/api/posts/${id}/comments`, { body });
      const item = await res.json();
      if (!res.ok) throw new Error('Failed to comment');
      setComments(prev => [item, ...prev]);
      setNewComment('');
    } catch {}
  }

  async function loadReplies(parentId) {
    try {
      const res = await api.get(`/posts/${id}/comments?parent=${parentId}`);
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to load replies');
      setReplies(prev => ({ ...prev, [parentId]: data.data || [] }));
    } catch {
      setReplies(prev => ({ ...prev, [parentId]: [] }));
    }
  }

  async function toggleCommentReaction(commentId, type) { // 'like' | 'dislike'
    if (!user) return;
    try {
      const res = await api.post(`/api/posts/${id}/comments/${commentId}/reaction`, { type });
      const counts = await res.json();
      if (!res.ok) throw new Error('Failed to react on comment');
      const upd = (list) => (list || []).map(c => c._id === commentId ? { ...c, likes: new Array(counts.likes).fill(0), dislikes: new Array(counts.dislikes).fill(0) } : c);
      setComments(prev => upd(prev));
      setReplies(prev => {
        const out = { ...prev };
        Object.keys(out).forEach(pid => { out[pid] = upd(out[pid]); });
        return out;
      });
    } catch {}
  }

  async function submitReply(parentId) {
    if (!user) return;
    const body = (newComment || '').trim();
    if (!body) return;
    try {
      const res = await api.post(`/api/posts/${id}/comments`, { body, parent: parentId });
      const item = await res.json();
      if (!res.ok) throw new Error('Failed to reply');
      setReplies(prev => ({ ...prev, [parentId]: [item, ...(prev[parentId] || [])] }));
      setReplyingTo(null);
      setNewComment('');
    } catch {}
  }

  if (loading) return <div className="py-6 text-gray-600 dark:text-gray-300">Loading...</div>;
  if (error) return <div className="py-6 text-red-600">{error}</div>;
  if (!post) return null;

  const ownerId = post && typeof post.user === 'object' ? post.user?._id : post.user;
  const isOwner = user && String(ownerId) === user.id;
  const postUser = post.user && typeof post.user === 'object' ? post.user : null;
  const userName = postUser?.name || 'Unknown User';
  const userAvatar = postUser?.avatarUrl;

  return (
    <div className="py-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Back</Link>
        <div className="ml-auto flex gap-3">
          <button onClick={() => toggleLike('like')} className={`px-3 py-1 rounded ${liked ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>👍 {likesCount}</button>
          <button onClick={() => toggleLike('dislike')} className={`px-3 py-1 rounded ${disliked ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>👎 {dislikesCount}</button>
          {isOwner && (
            <>
              <Link to={`/edit/${post._id}`} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Edit</Link>
              <button onClick={handleDelete} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
            </>
          )}
        </div>
      </div>

      <header className="flex items-center gap-3">
        <img
          src={userAvatar || `data:image/svg+xml;base64,${btoa(`
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" fill="#e5e7eb"/>
              <text x="20" y="25" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">U</text>
            </svg>
          `)}`}
          alt={userName}
          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
        />
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">{userName}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
        </div>
      </header>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{post.title}</h1>

      {/* Media/body */}
      {post.type === 'image' && post.mediaUrl && (
        <div>
          <img src={post.mediaUrl} alt="" className="w-full object-contain max-h-[70vh] rounded" />
        </div>
      )}
      {post.type === 'video' && post.mediaUrl && (
        <div>
          <video src={post.mediaUrl} className="w-full max-h-[70vh] rounded" controls preload="metadata" />
        </div>
      )}
      {post.type === 'document' && post.mediaUrl && (
        <div className="w-full">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8 mb-6">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center">
                  <span className="text-4xl">{getDocumentIcon(post.docMimeType || post.mediaMimeType)}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {getDocumentFilename()}
                </h3>
                <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                  {formatFileSize(post.docSize) && (
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span>{formatFileSize(post.docSize)}</span>
                    </span>
                  )}
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Document</span>
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 space-x-3">
                <a
                  href={post.mediaUrl.startsWith('/api/documents/') 
                    ? post.mediaUrl 
                    : `/api/media/preview/${post.docPublicId || post.mediaPublicId || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open
                </a>
                <a
                  href={post.mediaUrl.startsWith('/api/documents/') 
                    ? `${post.mediaUrl}?download=true` 
                    : `/api/media/raw/${post.docPublicId || post.mediaPublicId || ''}`}
                  download={getDocumentFilename()}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </a>
              </div>
            </div>
          </div>
          
          {/* Document Preview */}
          {post.docMimeType?.includes('pdf') && (post.docPublicId || post.mediaPublicId) && (
            <div className="w-full rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white shadow-lg">
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Document Preview</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">PDF</span>
                  </div>
                </div>
              </div>
              <iframe 
                title={getDocumentFilename()}
                src={post.mediaUrl.startsWith('/api/documents/') 
                  ? post.mediaUrl 
                  : `/api/media/preview/${post.docPublicId || post.mediaPublicId}`} 
                className="w-full h-[70vh] bg-white"
                style={{ border: 'none' }}
              />
            </div>
          )}
        </div>
      )}
      {post.type === 'article' ? (
        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">{post.articleContent || post.body}</div>
      ) : (
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.body}</p>
      )}

      {/* Comments */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Comments</h2>
        {user && (
          <div className="mb-4 flex gap-2">
            <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write a comment..." className="flex-1 border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <button onClick={submitComment} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Post</button>
          </div>
        )}
        {commentsLoading ? (
          <div className="text-gray-600 dark:text-gray-300">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-gray-600 dark:text-gray-300">No comments yet</div>
        ) : (
          <div className="space-y-4">
            {comments.map(c => (
              <div key={c._id} className="flex items-start gap-3">
                <Link to={`/users/${c.user?._id || c.user}`} className="shrink-0">
                  <img src={c.user?.avatarUrl || `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\"><rect width=\"28\" height=\"28\" fill=\"#e5e7eb\"/><text x=\"14\" y=\"18\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"11\" fill=\"#6b7280\">U</text></svg>')}`} alt="" className="w-8 h-8 rounded-full object-cover border" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="min-w-0">
                    <Link to={`/users/${c.user?._id || c.user}`} className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{c.user?.name || 'User'}</Link>
                  </div>
                  <p className="mt-1 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{c.body}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => toggleCommentReaction(c._id, 'like')} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs" title="Like this comment">
                      👍 {(c.likes || []).length || 0}
                    </button>
                    <button onClick={() => toggleCommentReaction(c._id, 'dislike')} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs" title="Dislike this comment">
                      👎 {(c.dislikes || []).length || 0}
                    </button>
                    {user && (
                      <button onClick={() => { setReplyingTo(c._id); }} className="ml-1 text-xs text-indigo-600 hover:underline" title="Reply">Reply</button>
                    )}
                    <button onClick={() => { const open = !repliesOpen[c._id]; setRepliesOpen(prev => ({ ...prev, [c._id]: open })); if (open && !replies[c._id]) loadReplies(c._id); }} className="ml-auto text-xs text-gray-600 dark:text-gray-300 hover:underline" title="Toggle replies">
                      View replies
                    </button>
                  </div>
                  {replyingTo === c._id && (
                    <div className="mt-2 flex gap-2">
                      <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write a reply..." className="flex-1 border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                      <button onClick={() => submitReply(c._id)} className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm">Reply</button>
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
                            <div className="min-w-0">
                              <Link to={`/users/${r.user?._id || r.user}`} className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{r.user?.name || 'User'}</Link>
                            </div>
                            <p className="mt-1 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{r.body}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <button onClick={() => toggleCommentReaction(r._id, 'like')} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs" title="Like this reply">
                                👍 {(r.likes || []).length || 0}
                              </button>
                              <button onClick={() => toggleCommentReaction(r._id, 'dislike')} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs" title="Dislike this reply">
                                👎 {(r.dislikes || []).length || 0}
                              </button>
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
      </section>
    </div>
  );
}


