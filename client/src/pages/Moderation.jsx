import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import toast from 'react-hot-toast';

export default function Moderation() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    reason: '',
    targetType: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const [moderationNotes, setModerationNotes] = useState('');
  const [actionTaken, setActionTaken] = useState('none');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadReports();
    loadStats();
  }, [filters, pagination.page]);

  const loadReports = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.reason && { reason: filters.reason }),
        ...(filters.targetType && { targetType: filters.targetType })
      });

      const response = await api.get(`/api/reports?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setReports(data.reports);
        setPagination(data.pagination);
      } else {
        toast.error('Failed to load reports');
      }
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/api/reports/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleUpdateReport = async () => {
    if (!selectedReport) return;

    setIsUpdating(true);
    try {
      const response = await api.put(`/api/reports/${selectedReport._id}`, {
        status: 'resolved',
        moderationNotes,
        actionTaken
      });

      if (response.ok) {
        // If hiding content, also call the admin endpoint to ensure it's hidden
        if (actionTaken === 'hide_content' && selectedReport.reportedPost) {
          try {
            await api.put(`/api/admin/posts/${selectedReport.reportedPost._id}/hidden`, {
              hidden: true,
              reason: moderationNotes || 'Content hidden due to report'
            });
          } catch (error) {
            console.error('Error hiding post:', error);
          }
        }
        
        toast.success('Report updated successfully');
        setSelectedReport(null);
        setModerationNotes('');
        setActionTaken('none');
        loadReports();
        loadStats();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update report');
      }
    } catch (error) {
      toast.error('Failed to update report');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDismissReport = async (reportId) => {
    try {
      const response = await api.put(`/api/reports/${reportId}`, {
        status: 'dismissed',
        moderationNotes: 'Report dismissed as invalid',
        actionTaken: 'none'
      });

      if (response.ok) {
        toast.success('Report dismissed');
        loadReports();
        loadStats();
      } else {
        toast.error('Failed to dismiss report');
      }
    } catch (error) {
      toast.error('Failed to dismiss report');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'reviewing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'dismissed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getReasonIcon = (reason) => {
    const icons = {
      spam: '🚫',
      harassment: '😡',
      hate_speech: '💢',
      inappropriate_content: '⚠️',
      fake_news: '📰',
      copyright_violation: '©️',
      violence: '👊',
      nudity: '🔞',
      other: '❓'
    };
    return icons[reason] || '❓';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
        <div className="text-center text-gray-500 dark:text-gray-400">Loading moderation dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Moderation Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage reports and moderate content</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.statusStats.find(s => s._id === 'pending')?.count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <span className="text-2xl">👀</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reviewing</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.statusStats.find(s => s._id === 'reviewing')?.count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.statusStats.find(s => s._id === 'resolved')?.count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.recentReports}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason</label>
            <select
              value={filters.reason}
              onChange={(e) => setFilters({ ...filters, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Reasons</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="hate_speech">Hate Speech</option>
              <option value="inappropriate_content">Inappropriate Content</option>
              <option value="fake_news">Fake News</option>
              <option value="copyright_violation">Copyright Violation</option>
              <option value="violence">Violence</option>
              <option value="nudity">Nudity</option>
              <option value="other">Other</option>
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
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reports</h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {reports.map((report) => (
            <div key={report._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getReasonIcon(report.reason)}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {report.reason.replace('_', ' ').toUpperCase()}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Reported by {report.reporter?.name} • {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>

                  {report.description && (
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{report.description}</p>
                  )}

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {report.reportedPost && (
                      <p>
                        <strong>Post:</strong> 
                        <Link 
                          to={`/posts/${report.reportedPost._id}`} 
                          className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {report.reportedPost.title}
                        </Link>
                      </p>
                    )}
                    {report.reportedUser && (
                      <p>
                        <strong>User:</strong> 
                        <Link 
                          to={`/users/${report.reportedUser._id}`} 
                          className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {report.reportedUser.name}
                        </Link>
                      </p>
                    )}
                    {report.reportedComment && (
                      <p>
                        <strong>Comment:</strong> 
                        <Link 
                          to={`/posts/${report.reportedComment.post}`} 
                          className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {report.reportedComment.body.substring(0, 100)}...
                        </Link>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Review
                  </button>
                  {report.reportedPost && (
                    <button
                      onClick={async () => {
                        try {
                          await api.put(`/api/admin/posts/${report.reportedPost._id}/hidden`, {
                            hidden: true,
                            reason: 'Quick hide from moderation dashboard'
                          });
                          toast.success('Post hidden successfully');
                          loadReports();
                        } catch (error) {
                          toast.error('Failed to hide post');
                        }
                      }}
                      className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                    >
                      Hide Post
                    </button>
                  )}
                  <button
                    onClick={() => handleDismissReport(report._id)}
                    className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                  >
                    Dismiss
                  </button>
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
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reports
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

      {/* Report Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedReport(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Review Report</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Report Details */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Report Details</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Reason:</strong> {selectedReport.reason.replace('_', ' ').toUpperCase()}</p>
                  <p><strong>Reporter:</strong> {selectedReport.reporter?.name}</p>
                  <p><strong>Date:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
                  {selectedReport.description && (
                    <p><strong>Description:</strong> {selectedReport.description}</p>
                  )}
                </div>
              </div>

              {/* Reported Content */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Reported Content</h4>
                {selectedReport.reportedPost && (
                  <div>
                    <p><strong>Post:</strong> {selectedReport.reportedPost.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedReport.reportedPost.body.substring(0, 200)}...
                    </p>
                  </div>
                )}
                {selectedReport.reportedUser && (
                  <div>
                    <p><strong>User:</strong> {selectedReport.reportedUser.name}</p>
                    {selectedReport.reportedUser.bio && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {selectedReport.reportedUser.bio}
                      </p>
                    )}
                  </div>
                )}
                {selectedReport.reportedComment && (
                  <div>
                    <p><strong>Comment:</strong></p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedReport.reportedComment.body}
                    </p>
                  </div>
                )}
              </div>

              {/* Moderation Actions */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Action to Take
                  </label>
                  <select
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="none">No Action</option>
                    <option value="warning">Send Warning</option>
                    <option value="hide_content">Hide Content</option>
                    <option value="delete_content">Delete Content</option>
                    <option value="suspend_user">Suspend User</option>
                    <option value="ban_user">Ban User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Moderation Notes
                  </label>
                  <textarea
                    value={moderationNotes}
                    onChange={(e) => setModerationNotes(e.target.value)}
                    placeholder="Add notes about the moderation decision..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateReport}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Processing...' : 'Resolve Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
