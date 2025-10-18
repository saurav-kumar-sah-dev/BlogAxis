import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import toast from 'react-hot-toast';

export default function AuditTrail() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    targetType: '',
    admin: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadAudits();
  }, [filters, pagination.page]);

  const loadAudits = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.action && { action: filters.action }),
        ...(filters.targetType && { targetType: filters.targetType }),
        ...(filters.admin && { admin: filters.admin })
      });

      const response = await api.get(`/api/admin/audits?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setAudits(data.audits);
        setPagination(data.pagination);
      } else {
        toast.error('Failed to load audit trail');
      }
    } catch (error) {
      toast.error('Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      report_reviewed: '👀',
      post_hidden: '🙈',
      post_unhidden: '👁️',
      post_deleted: '🗑️',
      user_warned: '⚠️',
      user_suspended: '⏸️',
      user_unsuspended: '▶️',
      user_banned: '🚫',
      user_deleted: '💀',
      comment_deleted: '🗑️',
      content_approved: '✅',
      report_dismissed: '❌'
    };
    return icons[action] || '📝';
  };

  const getActionColor = (action) => {
    const colors = {
      report_reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      post_hidden: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      post_unhidden: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      post_deleted: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      user_warned: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      user_suspended: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      user_unsuspended: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      user_banned: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      user_deleted: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      comment_deleted: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      content_approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      report_dismissed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    };
    return colors[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
        <div className="text-center text-gray-500 dark:text-gray-400">Loading audit trail...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Audit Trail</h1>
        <p className="text-gray-600 dark:text-gray-400">Track all moderation actions and admin activities</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Action</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Actions</option>
              <option value="report_reviewed">Report Reviewed</option>
              <option value="post_hidden">Post Hidden</option>
              <option value="post_unhidden">Post Unhidden</option>
              <option value="post_deleted">Post Deleted</option>
              <option value="user_warned">User Warned</option>
              <option value="user_suspended">User Suspended</option>
              <option value="user_unsuspended">User Unsuspended</option>
              <option value="user_banned">User Banned</option>
              <option value="user_deleted">User Deleted</option>
              <option value="comment_deleted">Comment Deleted</option>
              <option value="content_approved">Content Approved</option>
              <option value="report_dismissed">Report Dismissed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Type</label>
            <select
              value={filters.targetType}
              onChange={(e) => setFilters({ ...filters, targetType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="post">Posts</option>
              <option value="user">Users</option>
              <option value="comment">Comments</option>
              <option value="report">Reports</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Admin</label>
            <input
              type="text"
              value={filters.admin}
              onChange={(e) => setFilters({ ...filters, admin: e.target.value })}
              placeholder="Search by admin name..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Log</h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {audits.map((audit) => (
            <div key={audit._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-lg">{getActionIcon(audit.action)}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(audit.action)}`}>
                      {audit.action.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(audit.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-sm text-gray-900 dark:text-white mb-1">
                    <Link 
                      to={`/users/${audit.admin?._id}`} 
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {audit.admin?.name || 'Unknown Admin'}
                    </Link> performed action on{' '}
                    <span className="font-semibold">{audit.targetType}</span>
                    {audit.targetType === 'post' && (
                      <Link 
                        to={`/posts/${audit.targetId}`} 
                        className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        (View Post)
                      </Link>
                    )}
                    {audit.targetType === 'user' && (
                      <Link 
                        to={`/users/${audit.targetId}`} 
                        className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        (View User)
                      </Link>
                    )}
                    {audit.targetType === 'report' && (
                      <Link 
                        to={`/moderation`} 
                        className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        (View Reports)
                      </Link>
                    )}
                  </div>

                  {audit.reason && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Reason:</strong> {audit.reason}
                    </div>
                  )}

                  {audit.details && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Details:</strong> {audit.details}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Target ID: {audit.targetId} • IP: {audit.ipAddress}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} audits
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
