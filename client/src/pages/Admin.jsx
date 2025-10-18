import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('users');
  
  const tabs = [
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'posts', label: 'Posts', icon: '📝' },
    { id: 'moderation', label: 'Moderation', icon: '🚩' },
    { id: 'audit', label: 'Audit Trail', icon: '📋' }
  ];

  const handleTabClick = (tabId) => {
    if (tabId === 'moderation') {
      navigate('/moderation');
    } else if (tabId === 'audit') {
      navigate('/audit-trail');
    } else {
      setTab(tabId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage users, posts, and platform moderation</p>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tabItem => (
          <button
            key={tabItem.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === tabItem.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => handleTabClick(tabItem.id)}
          >
            <span>{tabItem.icon}</span>
            <span>{tabItem.label}</span>
          </button>
        ))}
      </div>
      
      {tab === 'users' && <UsersTab />}
      {tab === 'posts' && <PostsTab />}
    </div>
  );
}

function UsersTab() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  useEffect(() => { 
    (async () => {
      setLoading(true);
      const res = await api.get(`/admin/users?page=${page}&limit=${limit}`);
      const data = await res.json();
      if (res.ok) { setItems(data.data||[]); setTotal(data.total||0); }
      setLoading(false);
    })(); 
  }, [page]);

  async function setRole(id, role) {
    const res = await api.put(`/admin/users/${id}/role`, { role });
    const data = await res.json();
    if (res.ok) setItems(lst => lst.map(u => u._id === id ? data : u));
  }

  async function setSuspended(id, suspended) {
    try {
      const res = await api.put(`/admin/users/${id}/suspend`, { suspended });
      const data = await res.json();
      if (res.ok) {
        setItems(lst => lst.map(u => u._id === id ? data : u));
        // Show success message
        alert(`User ${suspended ? 'suspended' : 'unsuspended'} successfully!`);
      } else {
        alert(`Failed to ${suspended ? 'suspend' : 'unsuspend'} user: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error toggling user suspension:', error);
      alert(`Failed to ${suspended ? 'suspend' : 'unsuspend'} user: ${error.message}`);
    }
  }

  async function deleteUser(id) {
    if (!confirm('Delete this user?')) return;
    
    try {
      const res = await api.del(`/admin/users/${id}`);
      if (res.ok) {
        setItems(lst => lst.filter(u => u._id !== id));
        // Show success message
        alert('User deleted successfully!');
      } else {
        const data = await res.json();
        alert(`Failed to delete user: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error.message}`);
    }
  }

  if (loading) {
    return <div className="text-center text-gray-500 dark:text-gray-400 py-8">Loading users...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Manage user roles, suspensions, and accounts</p>
      </div>
      
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr className="text-left">
              <th className="px-6 py-3 font-medium text-gray-900 dark:text-white">Name</th>
              <th className="px-6 py-3 font-medium text-gray-900 dark:text-white">Username</th>
              <th className="px-6 py-3 font-medium text-gray-900 dark:text-white">Email</th>
              <th className="px-6 py-3 font-medium text-gray-900 dark:text-white">Role</th>
              <th className="px-6 py-3 font-medium text-gray-900 dark:text-white">Status</th>
              <th className="px-6 py-3 font-medium text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map(u => (
              <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <Link 
                    to={`/users/${u._id}`} 
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={u.avatarUrl || `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#e5e7eb"/><text x="16" y="20" text-anchor="middle" font-family="Arial" font-size="12" fill="#6b7280">U</text></svg>')}`}
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                      {u.name}
                    </span>
                  </Link>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {u.username ? `@${u.username}` : '-'}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {u.email}
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={u.role} 
                    onChange={(e)=>setRole(u._id, e.target.value)} 
                    className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    u.suspended 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  }`}>
                    {u.suspended ? 'Suspended' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSuspended(u._id, !u.suspended);
                      }} 
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        u.suspended 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-yellow-600 text-white hover:bg-yellow-700'
                      }`}
                    >
                      {u.suspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteUser(u._id);
                      }} 
                      className="px-3 py-1 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <Pager page={page} total={total} limit={limit} onPrev={()=>setPage(p=>p-1)} onNext={()=>setPage(p=>p+1)} />
      </div>
    </div>
  );
}

function PostsTab() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 12;

  useEffect(() => { 
    (async () => {
      setLoading(true);
      const res = await api.get(`/admin/posts?page=${page}&limit=${limit}`);
      const data = await res.json();
      if (res.ok) { setItems(data.data||[]); setTotal(data.total||0); }
      setLoading(false);
    })(); 
  }, [page]);

  async function hideToggle(id, hidden) {
    try {
      const res = await api.put(`/admin/posts/${id}/hidden`, { hidden });
      const data = await res.json();
      if (res.ok) {
        setItems(lst => lst.map(p => p._id === id ? data : p));
        // Show success message
        alert(`Post ${hidden ? 'hidden' : 'unhidden'} successfully!`);
      } else {
        alert(`Failed to ${hidden ? 'hide' : 'unhide'} post: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error toggling post visibility:', error);
      alert(`Failed to ${hidden ? 'hide' : 'unhide'} post: ${error.message}`);
    }
  }

  async function deletePost(id) {
    if (!confirm('Delete this post?')) return;
    
    try {
      const res = await api.del(`/admin/posts/${id}`);
      if (res.ok) {
        setItems(lst => lst.filter(p => p._id !== id));
        // Show success message
        alert('Post deleted successfully!');
      } else {
        const data = await res.json();
        alert(`Failed to delete post: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(`Failed to delete post: ${error.message}`);
    }
  }

  if (loading) {
    return <div className="text-center text-gray-500 dark:text-gray-400 py-8">Loading posts...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Post Management</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Manage posts, hide content, and moderate posts</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(p => (
            <div key={p._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50 hover:shadow-md transition-shadow">
              <Link 
                to={`/posts/${p._id}`} 
                className="block hover:opacity-90 transition-opacity"
              >
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={p.user?.avatarUrl || `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#e5e7eb"/><text x="16" y="20" text-anchor="middle" font-family="Arial" font-size="12" fill="#6b7280">U</text></svg>')}`}
                    alt={p.user?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 hover:text-blue-600 dark:hover:text-blue-400">
                      {p.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">by {p.user?.name || 'User'}</div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                  {p.body}
                </div>
              </Link>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs">
                    <input 
                      type="checkbox" 
                      checked={!!p.hidden} 
                      onChange={e=>hideToggle(p._id, e.target.checked)} 
                      className="rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className={p.hidden ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}>
                      {p.hidden ? 'Hidden' : 'Visible'}
                    </span>
                  </label>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePost(p._id);
                  }} 
                  className="px-3 py-1 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <Pager page={page} total={total} limit={limit} onPrev={()=>setPage(p=>p-1)} onNext={()=>setPage(p=>p+1)} />
        </div>
      </div>
    </div>
  );
}

function Pager({ page, total, limit, onPrev, onNext }) {
  const hasPrev = page > 1;
  const hasNext = page * limit < total;
  const totalPages = Math.ceil(total / limit);
  
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
      </div>
      <div className="flex items-center gap-2">
        <button 
          disabled={!hasPrev} 
          onClick={onPrev} 
          className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {page} of {totalPages}
        </span>
        <button 
          disabled={!hasNext} 
          onClick={onNext} 
          className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}


