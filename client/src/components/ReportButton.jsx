import { useState } from 'react';
import { api } from '../api/client';
import toast from 'react-hot-toast';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam', icon: '🚫' },
  { value: 'harassment', label: 'Harassment', icon: '😡' },
  { value: 'hate_speech', label: 'Hate Speech', icon: '💢' },
  { value: 'inappropriate_content', label: 'Inappropriate Content', icon: '⚠️' },
  { value: 'fake_news', label: 'Fake News', icon: '📰' },
  { value: 'copyright_violation', label: 'Copyright Violation', icon: '©️' },
  { value: 'violence', label: 'Violence', icon: '👊' },
  { value: 'nudity', label: 'Nudity', icon: '🔞' },
  { value: 'other', label: 'Other', icon: '❓' }
];

export default function ReportButton({ targetType, targetId, targetTitle, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/reports', {
        reason: selectedReason,
        description: description.trim(),
        targetType,
        targetId
      });

      if (response.ok) {
        toast.success('Report submitted successfully');
        setIsOpen(false);
        setSelectedReason('');
        setDescription('');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to submit report');
      }
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${className}`}
        title={`Report ${targetType}`}
      >
        <span>🚩</span>
        <span className="hidden sm:inline">Report</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Report {targetType}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {targetTitle && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Reporting:</strong> {targetTitle}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for reporting *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {REPORT_REASONS.map((reason) => (
                    <button
                      key={reason.value}
                      type="button"
                      onClick={() => setSelectedReason(reason.value)}
                      className={`p-2 rounded-lg border text-left transition-colors ${
                        selectedReason === reason.value
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{reason.icon}</span>
                        <span className="text-xs font-medium">{reason.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide more details about why you're reporting this content..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  maxLength={1000}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {description.length}/1000 characters
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedReason || isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Reports are reviewed by our moderation team. 
                False reports may result in action against your account.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
