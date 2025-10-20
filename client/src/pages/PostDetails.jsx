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
  
  // Loading states
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  
  // Image navigation states
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [shouldFocusComments, setShouldFocusComments] = useState(false);

  // Image navigation functions
  const nextImage = () => {
    if (Array.isArray(post?.mediaUrl)) {
      setCurrentImageIndex((prev) => (prev + 1) % post.mediaUrl.length);
    }
  };

  const prevImage = () => {
    if (Array.isArray(post?.mediaUrl)) {
      setCurrentImageIndex((prev) => (prev - 1 + post.mediaUrl.length) % post.mediaUrl.length);
    }
  };

  // Reset image index when post changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [post?._id]);

  // Keyboard navigation for images
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (Array.isArray(post?.mediaUrl) && post.mediaUrl.length > 1) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prevImage();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          nextImage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [post?.mediaUrl, nextImage, prevImage]);

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

  // If URL contains #comments, scroll into view after comments load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash === '#comments') {
      setShouldFocusComments(true);
    }
  }, []);

  useEffect(() => {
    if (!shouldFocusComments) return;
    if (commentsLoading) return;
    const el = document.getElementById('comments');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShouldFocusComments(false);
    }
  }, [shouldFocusComments, commentsLoading]);

  // Resolve document URL for viewing
  useEffect(() => {
    async function resolveDocumentUrl() {
      setDocUrl('');
      try {
        if (!post || post.type !== 'document' || !post.mediaUrl) return;
        
        // All documents are now stored in Cloudinary
        setDocUrl(post.mediaUrl);
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
      const res = await api.del(`/posts/${post._id}`);
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
      const res = await api.post(`/posts/${post._id}/${type}`, {});
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
    setIsSubmittingComment(true);
    try {
      const res = await api.post(`/posts/${id}/comments`, { body });
      const item = await res.json();
      if (!res.ok) throw new Error('Failed to comment');
      setComments(prev => [item, ...prev]);
      setNewComment('');
    } catch {} finally {
      setIsSubmittingComment(false);
    }
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
      const res = await api.post(`/posts/${id}/comments/${commentId}/reaction`, { type });
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
    setIsSubmittingReply(true);
    try {
      const res = await api.post(`/posts/${id}/comments`, { body, parent: parentId });
      const item = await res.json();
      if (!res.ok) throw new Error('Failed to reply');
      setReplies(prev => ({ ...prev, [parentId]: [item, ...(prev[parentId] || [])] }));
      setReplyingTo(null);
      setNewComment('');
    } catch {} finally {
      setIsSubmittingReply(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 ease-out hover:scale-[1.02]"
          >
            <span>←</span>
            <span>Back to Posts</span>
          </Link>
        </div>

        {/* Main Post Card */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
          {/* Post Header */}
          <div className="p-6 sm:p-8 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link to={`/users/${postUser?._id || post.user}`} className="group">
                  <img
                    src={userAvatar || `data:image/svg+xml;base64,${btoa(`
                      <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                        <rect width="48" height="48" fill="#e5e7eb"/>
                        <text x="24" y="30" text-anchor="middle" font-family="Arial" font-size="18" fill="#6b7280">U</text>
                      </svg>
                    `)}`}
                    alt={userName}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white/30 dark:border-gray-600/30 shadow-lg group-hover:scale-105 transition-transform duration-200"
                  />
                </Link>
                <div>
                  <Link 
                    to={`/users/${postUser?._id || post.user}`} 
                    className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {userName}
                  </Link>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <span>📅</span>
                    {new Date(post.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleLike('like')} 
                  className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-200 ease-out hover:scale-[1.02] shadow-md hover:shadow-lg ${
                    liked 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-100 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    👍 {likesCount}
                  </span>
                </button>
                <button 
                  onClick={() => toggleLike('dislike')} 
                  className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-200 ease-out hover:scale-[1.02] shadow-md hover:shadow-lg ${
                    disliked 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-100 hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/20 dark:hover:to-pink-900/20'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    👎 {dislikesCount}
                  </span>
                </button>
                {isOwner && (
                  <>
                    <Link 
                      to={`/edit/${post._id}`} 
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 ease-out hover:scale-[1.02] shadow-md hover:shadow-lg"
                    >
                      ✏️ Edit
                    </Link>
                    <button 
                      onClick={handleDelete} 
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-200 ease-out hover:scale-[1.02] shadow-md hover:shadow-lg"
                    >
                      🗑️ Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Post Title */}
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
              {post.title}
            </h1>
          </div>

          {/* Media Content */}
          {post.type === 'image' && post.mediaUrl && (
            <div className="relative">
              {Array.isArray(post.mediaUrl) ? (
                // Multiple images with navigation
                <div className="relative">
                  <img 
                    src={post.mediaUrl[currentImageIndex]} 
                    alt={`${post.title} - Image ${currentImageIndex + 1}`} 
                    className="w-full object-contain max-h-[80vh] rounded-2xl mx-auto block shadow-lg" 
                    onError={(e) => {
                      console.error('Failed to load image:', post.mediaUrl[currentImageIndex]);
                      e.target.style.display = 'none';
                    }}
                  />
                  
                  {/* Navigation arrows */}
                  {post.mediaUrl.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 ease-out hover:scale-110"
                        aria-label="Previous image"
                      >
                        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 ease-out hover:scale-110"
                        aria-label="Next image"
                      >
                        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                  
                  {/* Image counter and dots */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {currentImageIndex + 1} / {post.mediaUrl.length}
                      </span>
                      <div className="flex gap-1">
                        {post.mediaUrl.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              index === currentImageIndex 
                                ? 'bg-blue-500 dark:bg-blue-400' 
                                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Single image
                <img 
                  src={post.mediaUrl} 
                  alt={post.title} 
                  className="w-full object-contain max-h-[80vh] rounded-2xl mx-auto block shadow-lg" 
                  onError={(e) => {
                    console.error('Failed to load image:', post.mediaUrl);
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl px-3 py-1 shadow-lg">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  📸 {Array.isArray(post.mediaUrl) ? `${post.mediaUrl.length} Images` : 'Image'}
                </span>
              </div>
            </div>
          )}
          {post.type === 'video' && post.mediaUrl && (
            <div className="relative">
              <video 
                src={post.mediaUrl} 
                className="w-full max-h-[80vh] rounded-2xl mx-auto block shadow-lg" 
                controls 
                preload="metadata" 
              />
              <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl px-3 py-1 shadow-lg">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">🎥 Video</span>
              </div>
            </div>
          )}
          {post.type === 'document' && post.mediaUrl && (
            <div className="p-6 sm:p-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-3xl p-8 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl shadow-lg flex items-center justify-center">
                      <span className="text-5xl">{getDocumentIcon(post.docMimeType || post.mediaMimeType)}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                      {getDocumentFilename()}
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-600 dark:text-gray-400">
                      {formatFileSize(post.docSize) && (
                        <span className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-xl">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span>{formatFileSize(post.docSize)}</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-xl">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Document</span>
                      </span>
                    </div>
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
                src={`https://docs.google.com/gview?url=${encodeURIComponent(post.mediaUrl)}&embedded=true`} 
                className="w-full h-[70vh] bg-white"
                style={{ border: 'none' }}
              />
            </div>
          )}

          {(post.docMimeType?.includes('msword') ||
            post.docMimeType?.includes('officedocument') ||
            post.docMimeType?.includes('excel') ||
            post.docMimeType?.includes('powerpoint') ||
            post.mediaMimeType?.includes('msword') ||
            post.mediaMimeType?.includes('officedocument') ||
            post.mediaMimeType?.includes('excel') ||
            post.mediaMimeType?.includes('powerpoint')) &&
            (post.docPublicId || post.mediaPublicId) && (
            <div className="w-full rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white shadow-lg">
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Document Preview</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Doc/Sheet/Slide</span>
                  </div>
                </div>
              </div>
              <iframe 
                title={getDocumentFilename()}
                src={`https://docs.google.com/gview?url=${encodeURIComponent(post.mediaUrl)}&embedded=true`}
                className="w-full h-[70vh] bg-white"
                style={{ border: 'none' }}
              />
            </div>
          )}

        </div>
      )}
          {/* Text Content */}
          <div className="p-6 sm:p-8">
            {post.type === 'article' ? (
              <div className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
                {post.articleContent || post.body}
              </div>
            ) : (
              <div className="text-lg leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {post.body}
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div id="comments" className="mt-8 sm:mt-12">
          <div className="bg-white/98 dark:bg-gray-800/98 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/50 overflow-hidden">
            {/* Comments Header */}
            <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-blue-500/20 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg sm:text-xl">💬</span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Comments</h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</p>
                </div>
              </div>
            </div>

            {/* Comment Input */}
            {user && (
              <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-gray-50/80 via-blue-50/80 to-purple-50/80 dark:from-gray-800/80 dark:via-blue-900/20 dark:to-purple-900/20 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-shrink-0 flex items-center gap-3">
                    <img
                      src={user.avatarUrl || `data:image/svg+xml;base64,${btoa(`
                        <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                          <rect width="40" height="40" fill="#e5e7eb"/>
                          <text x="20" y="25" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">U</text>
                        </svg>
                      `)}`}
                      alt={user.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover border-2 border-white/30 dark:border-gray-600/30 shadow-lg"
                    />
                    <div className="hidden sm:block">
                      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Share your thoughts</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <textarea 
                      value={newComment} 
                      onChange={e => setNewComment(e.target.value)} 
                      placeholder="Share your thoughts..." 
                      rows="3"
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-lg hover:shadow-xl resize-none" 
                    />
                  </div>
                  <div className="flex sm:flex-col gap-2 sm:gap-0">
                    <button 
                      onClick={submitComment}
                      disabled={isSubmittingComment}
                      className={`px-4 sm:px-6 py-2 sm:py-3 text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 ease-out shadow-lg flex items-center justify-center gap-2 ${
                        isSubmittingComment 
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-75' 
                          : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:scale-[1.02] hover:shadow-xl'
                      }`}
                    >
                      {isSubmittingComment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm sm:text-base">Posting...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm sm:text-base">📝</span>
                          <span className="text-sm sm:text-base">Post</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Comments List */}
            <div className="p-4 sm:p-6 lg:p-8">
              {commentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Loading comments...</span>
                  </div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No comments yet</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {comments.map(c => (
                    <div key={c._id} className="bg-gradient-to-r from-white/90 via-blue-50/50 to-purple-50/50 dark:from-gray-800/90 dark:via-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.01]">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <Link to={`/users/${c.user?._id || c.user}`} className="shrink-0 group">
                          <img 
                            src={c.user?.avatarUrl || `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"40\" height=\"40\"><rect width=\"40\" height=\"40\" fill=\"#e5e7eb\"/><text x=\"20\" y=\"25\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"16\" fill=\"#6b7280\">U</text></svg>')}`} 
                            alt="" 
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover border-2 border-white/30 dark:border-gray-600/30 shadow-lg group-hover:scale-105 transition-transform duration-200" 
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                            <div className="min-w-0">
                              <Link 
                                to={`/users/${c.user?._id || c.user}`} 
                                className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                              >
                                {c.user?.name || 'User'}
                              </Link>
                              {c.user?.username && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                                  <span>@</span>
                                  <span>{c.user.username}</span>
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed mb-3 break-words">
                            {c.body}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <button 
                              onClick={() => toggleCommentReaction(c._id, 'like')} 
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300 text-xs sm:text-sm font-medium hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-200 ease-out hover:scale-[1.02] shadow-sm" 
                              title="Like this comment"
                            >
                              👍 {(c.likes || []).length || 0}
                            </button>
                            <button 
                              onClick={() => toggleCommentReaction(c._id, 'dislike')} 
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium hover:from-red-200 hover:to-pink-200 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 transition-all duration-200 ease-out hover:scale-[1.02] shadow-sm" 
                              title="Dislike this comment"
                            >
                              👎 {(c.dislikes || []).length || 0}
                            </button>
                            {user && (
                              <button 
                                onClick={() => { setReplyingTo(c._id); }} 
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-medium hover:from-blue-200 hover:to-indigo-200 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200 ease-out hover:scale-[1.02] shadow-sm" 
                                title="Reply"
                              >
                                💬 Reply
                              </button>
                            )}
                            <button 
                              onClick={() => { const open = !repliesOpen[c._id]; setRepliesOpen(prev => ({ ...prev, [c._id]: open })); if (open && !replies[c._id]) loadReplies(c._id); }} 
                              className="ml-auto px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-medium hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-200 ease-out hover:scale-[1.02] shadow-sm" 
                              title="Toggle replies"
                            >
                              {repliesOpen[c._id] ? '🔼 Hide' : '🔽 View'} replies
                            </button>
                          </div>
                          
                          {/* Reply Input */}
                          {replyingTo === c._id && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                              <div className="flex flex-col sm:flex-row gap-3">
                                <textarea 
                                  value={newComment} 
                                  onChange={e => setNewComment(e.target.value)} 
                                  placeholder="Write a reply..." 
                                  rows="2"
                                  className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none" 
                                />
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => submitReply(c._id)}
                                    disabled={isSubmittingReply}
                                    className={`px-4 py-2 rounded-xl text-white font-semibold transition-all duration-200 ${
                                      isSubmittingReply 
                                        ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-75' 
                                        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:scale-[1.02]'
                                    }`}
                                  >
                                    {isSubmittingReply ? (
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Replying...</span>
                                      </div>
                                    ) : (
                                      'Reply'
                                    )}
                                  </button>
                                  <button 
                                    onClick={() => { setReplyingTo(null); setNewComment(''); }} 
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 hover:scale-[1.02]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Replies */}
                          {repliesOpen[c._id] && (
                            <div className="mt-4 pl-4 sm:pl-6 border-l-2 border-gradient-to-b from-blue-200 to-purple-200 dark:from-blue-700 dark:to-purple-700 space-y-3 sm:space-y-4">
                              {(replies[c._id] || []).map(r => (
                                <div key={r._id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200/30 dark:border-gray-700/30 shadow-md hover:shadow-lg transition-all duration-200">
                                  <div className="flex items-start gap-3">
                                    <Link to={`/users/${r.user?._id || r.user}`} className="shrink-0 group">
                                      <img 
                                        src={r.user?.avatarUrl || `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\"><rect width=\"32\" height=\"32\" fill=\"#e5e7eb\"/><text x=\"16\" y=\"20\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"12\" fill=\"#6b7280\">U</text></svg>')}`} 
                                        alt="" 
                                        className="w-8 h-8 rounded-xl object-cover border border-white/30 dark:border-gray-600/30 shadow-md group-hover:scale-105 transition-transform duration-200" 
                                      />
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                                        <div className="min-w-0">
                                          <Link 
                                            to={`/users/${r.user?._id || r.user}`} 
                                            className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                                          >
                                            {r.user?.name || 'User'}
                                          </Link>
                                          {r.user?.username && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                              @{r.user.username}
                                            </div>
                                          )}
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {new Date(r.createdAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed mb-2 break-words">
                                        {r.body}
                                      </p>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <button 
                                          onClick={() => toggleCommentReaction(r._id, 'like')} 
                                          className="px-2 py-1 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300 text-xs hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-200 ease-out hover:scale-[1.02]" 
                                          title="Like this reply"
                                        >
                                          👍 {(r.likes || []).length || 0}
                                        </button>
                                        <button 
                                          onClick={() => toggleCommentReaction(r._id, 'dislike')} 
                                          className="px-2 py-1 rounded-lg bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 text-red-700 dark:text-red-300 text-xs hover:from-red-200 hover:to-pink-200 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 transition-all duration-200 ease-out hover:scale-[1.02]" 
                                          title="Dislike this reply"
                                        >
                                          👎 {(r.dislikes || []).length || 0}
                                        </button>
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
      </div>
    </div>
  );
}


