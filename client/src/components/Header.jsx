import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AccountSwitcher from './AccountSwitcher';

export default function Header() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [unread, setUnread] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState([]);

  useEffect(() => {
    let timer;
    async function load() {
      try {
        if (!user) { setUnread(0); setNotifItems([]); return; }
        const res = await api.get('/api/notifications?limit=10');
        if (!res.ok) return;
        const data = await res.json();
        setUnread(data.unreadCount || 0);
        setNotifItems(data.data || []);
      } catch {}
      finally {
        timer = setTimeout(load, 30000);
      }
    }
    load();
    return () => { if (timer) clearTimeout(timer); };
  }, [user]);

  // Debounced search
  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); setOpen(false); setHighlighted(-1); return; }
    const id = setTimeout(async () => {
      try {
        const res = await api.get(`/api/users/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) return;
        const data = await res.json();
        setResults(Array.isArray(data) ? data.slice(0, 8) : []);
        setOpen(true);
        setHighlighted(-1);
      } catch {}
    }, 200);
    return () => clearTimeout(id);
  }, [query]);

  function handleKeyDown(e) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min((h < 0 ? -1 : h) + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlighted >= 0 && results[highlighted]) {
        navigate(`/users/${results[highlighted]._id}`);
        setOpen(false);
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <header className="relative overflow-visible w-full">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-90"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)'
        }}
      />
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-20 animate-pulse" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full opacity-20 animate-pulse" style={{ background: 'rgba(255,255,255,0.1)' }} />
      </div>

      <div className="relative z-10 flex items-center justify-between py-6 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
            <span className="text-2xl">✨</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">BlogAxis</h1>
            <p className="text-xs text-white/80 hidden sm:block">Your central hub for blogging</p>
          </div>
        </Link>

        {/* Search + Navigation */}
        <nav className="flex items-center gap-2 sm:gap-4 relative w-full md:w-auto">
          {/* Mobile search */}
          <div className="flex-1 md:hidden relative">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onKeyDown={handleKeyDown}
              placeholder="Search users by name, username, place..."
              className="w-full px-3 py-2 rounded-lg bg-white/95 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow"
            />
            {open && (
              <div ref={listRef} className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl z-50 max-h-72 overflow-auto border border-gray-100">
                {results.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">No users found</div>
                ) : (
                  results.map((u, idx) => (
                    <button
                      key={u._id}
                      onMouseDown={(ev) => ev.preventDefault()}
                      onClick={() => { setOpen(false); setQuery(''); navigate(`/users/${u._id}`); }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-3 ${idx === highlighted ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                    >
                      <img src={u.avatarUrl || `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\"><rect width=\"28\" height=\"28\" fill=\"#e5e7eb\"/><text x=\"14\" y=\"18\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"11\" fill=\"#6b7280\">U</text></svg>')}`} alt="" className="w-7 h-7 rounded-full object-cover border" />
                      <div className="min-w-0">
                        <div className="text-sm text-gray-900 truncate">{u.name}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {u.username && <span>@{u.username}</span>}
                          {u.place && <span className="ml-1">• {u.place}</span>}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Desktop search */}
          <div className="hidden md:block w-72 relative">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onKeyDown={handleKeyDown}
              placeholder="Search users by name, username, place..."
              className="w-full px-3 py-2 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow"
            />
            {open && (
              <div ref={listRef} className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl z-50 max-h-80 overflow-auto border border-gray-100">
                {results.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">No users found</div>
                ) : (
                  results.map((u, idx) => (
                    <button
                      key={u._id}
                      onMouseDown={(ev) => ev.preventDefault()}
                      onClick={() => { setOpen(false); setQuery(''); navigate(`/users/${u._id}`); }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-3 ${idx === highlighted ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                    >
                      <img src={u.avatarUrl || `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\"><rect width=\"28\" height=\"28\" fill=\"#e5e7eb\"/><text x=\"14\" y=\"18\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"11\" fill=\"#6b7280\">U</text></svg>')}`} alt="" className="w-7 h-7 rounded-full object-cover border" />
                      <div className="min-w-0">
                        <div className="text-sm text-gray-900 truncate">{u.name}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {u.username && <span>@{u.username}</span>}
                          {u.place && <span className="ml-1">• {u.place}</span>}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <Link 
            to="/" 
            className="px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300 text-sm font-medium"
          >
            🏠 Home
          </Link>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          {user && (
            <div className="relative">
              <button onClick={()=>setNotifOpen(o=>!o)} className="p-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300 relative" title="Notifications">
                🔔
                {unread > 0 && <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white rounded-full px-1">{unread}</span>}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-xl shadow-2xl z-[1000] max-h-96 overflow-auto">
                  <div className="p-2 text-sm font-semibold border-b">Notifications</div>
                  {notifItems.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">No notifications</div>
                  ) : notifItems.map(n => {
                    const getNotificationIcon = (type) => {
                      const icons = {
                        follow: '👥',
                        like_post: '👍',
                        dislike_post: '👎',
                        comment: '💬',
                        reply: '↩️',
                        new_report: '🚩',
                        warning: '⚠️',
                        content_hidden: '🙈',
                        content_unhidden: '👁️',
                        content_deleted: '🗑️',
                        account_suspended: '⏸️',
                        account_unsuspended: '▶️',
                        account_banned: '🚫',
                        account_deleted: '💀'
                      };
                      return icons[type] || '🔔';
                    };

                    const getNotificationText = (n) => {
                      switch (n.type) {
                        case 'follow':
                          return `${n.fromUser?.name || 'Someone'} started following you`;
                        case 'like_post':
                          return `${n.fromUser?.name || 'Someone'} liked your post "${n.post?.title || 'Untitled'}"`;
                        case 'dislike_post':
                          return `${n.fromUser?.name || 'Someone'} disliked your post "${n.post?.title || 'Untitled'}"`;
                        case 'comment':
                          return `${n.fromUser?.name || 'Someone'} commented on your post "${n.post?.title || 'Untitled'}"`;
                        case 'reply':
                          return `${n.fromUser?.name || 'Someone'} replied to your comment`;
                        case 'new_report':
                          return `New report received for review`;
                        case 'warning':
                          return `Warning: ${n.details || 'You have received a warning'}`;
                        case 'content_hidden':
                          return `Your post "${n.post?.title || 'content'}" has been hidden`;
                        case 'content_unhidden':
                          return `Your post "${n.post?.title || 'content'}" has been made visible`;
                        case 'content_deleted':
                          return `Your ${n.comment ? 'comment' : 'post'} has been deleted`;
                        case 'account_suspended':
                          return `Your account has been suspended`;
                        case 'account_unsuspended':
                          return `Your account has been unsuspended`;
                        case 'account_banned':
                          return `Your account has been banned`;
                        case 'account_deleted':
                          return `Your account has been deleted`;
                        default:
                          return `${n.type.replace('_', ' ')} notification`;
                      }
                    };

                    const handleNotificationClick = async () => {
                      // Mark notification as read if it's not already read
                      if (!n.read) {
                        try {
                          await api.put(`/api/notifications/${n._id}/read`);
                          // Update the notification in the local state
                          setNotifItems(prev => prev.map(notif => 
                            notif._id === n._id ? { ...notif, read: true } : notif
                          ));
                          // Update unread count
                          setUnread(prev => Math.max(0, prev - 1));
                        } catch (error) {
                          console.error('Error marking notification as read:', error);
                        }
                      }
                      
                      setNotifOpen(false);
                      if (n.post) {
                        navigate(`/posts/${n.post._id || n.post}`);
                      } else if (n.fromUser && n.type === 'follow') {
                        navigate(`/users/${n.fromUser._id || n.fromUser}`);
                      } else if (n.type === 'new_report') {
                        navigate('/moderation');
                      }
                    };

                    return (
                      <div key={n._id} className={`p-3 border-b text-sm flex items-start gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${!n.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`} onClick={handleNotificationClick}>
                        <div className="text-lg">{getNotificationIcon(n.type)}</div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{getNotificationText(n)}</div>
                          {n.details && n.type !== 'warning' && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{n.details}</div>
                          )}
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            api.del(`/api/notifications/${n._id}`).then(() => {
                              setNotifItems(list => list.filter(x => x._id !== n._id));
                              // Update unread count if the deleted notification was unread
                              if (!n.read) {
                                setUnread(prev => Math.max(0, prev - 1));
                              }
                            }).catch(() => {});
                          }} 
                          className="text-xs text-red-600 hover:underline"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                  <div className="p-2">
                    <div className="flex gap-2">
                      <button onClick={async()=>{ 
                        try { 
                          await api.post('/api/notifications/read-all', {}); 
                          setUnread(0);
                          // Update all notifications to read in local state
                          setNotifItems(prev => prev.map(notif => ({ ...notif, read: true })));
                        } catch {} 
                      }} className="flex-1 text-center px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">Mark all read</button>
                      <button onClick={async()=>{ try { await api.del('/api/notifications'); setNotifItems([]); setUnread(0);} catch {} }} className="px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-sm text-red-700">Delete all</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {user ? (
            <>
              <Link 
                to="/compose" 
                className="px-4 py-2 rounded-lg bg-white text-gray-800 hover:bg-gray-100 transition-all duration-300 text-sm font-semibold shadow-lg"
              >
                ✍️ Compose
              </Link>
              
              {/* Account Switcher */}
              <AccountSwitcher />
              
              <Link 
                to="/profile" 
                className="flex items-center"
                title={user.name}
              >
                <img
                  src={user.avatarUrl || `data:image/svg+xml;utf8,${encodeURIComponent('<svg width="36" height="36" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="36" rx="18" fill="#ffffff33"/><rect x="1" y="1" width="34" height="34" rx="17" fill="#ffffff55"/><text x="18" y="23" text-anchor="middle" font-family="Arial" font-size="14" fill="#1f2937">U</text></svg>')}`}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-white/50 shadow-md hover:scale-105 transition-transform duration-200"
                />
              </Link>
              {user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="px-3 py-2 rounded-lg bg-yellow-300/90 text-gray-800 hover:bg-yellow-300 transition-all duration-300 text-sm font-semibold shadow"
                >
                  🛡️ Admin
                </Link>
              )}
              <button 
                onClick={() => { logout(); navigate('/'); }} 
                className="px-3 py-2 rounded-lg bg-red-500/80 backdrop-blur-sm text-white hover:bg-red-600/80 transition-all duration-300 text-sm font-medium"
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300 text-sm font-medium"
              >
                🔑 Login
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 rounded-lg bg-white text-gray-800 hover:bg-gray-100 transition-all duration-300 text-sm font-semibold shadow-lg"
              >
                📝 Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}