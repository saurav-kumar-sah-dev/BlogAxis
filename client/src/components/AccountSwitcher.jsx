import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function AccountSwitcher() {
  const { user, accounts, switchAccount, removeAccount, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [switchingAccount, setSwitchingAccount] = useState(null);

  const handleSwitchAccount = async (account) => {
    setSwitchingAccount(account.user.id);
    try {
      // Validate the token before switching
      const response = await api.post('/accounts/validate-token', { token: account.token });
      
      const data = await response.json();
      
      if (data.valid) {
        switchAccount(account);
        setIsOpen(false);
        // Refresh the page to update all components
        window.location.reload();
      } else {
        alert('This account session has expired. Please log in again.');
        removeAccount(account.user.id);
      }
    } catch (error) {
      console.error('Error validating token:', error);
      alert('Error switching account. Please try again.');
    } finally {
      setSwitchingAccount(null);
    }
  };

  const handleRemoveAccount = (accountId, e) => {
    e.stopPropagation();
    if (confirm('Remove this account from your saved accounts?')) {
      removeAccount(accountId);
    }
  };

  const handleAddAccount = () => {
    setIsOpen(false);
    // Logout current user and go to login page
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300 text-sm font-medium"
        title="Manage Accounts"
      >
        <span>👥</span>
        <span className="hidden sm:inline">Accounts</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-[1000] border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Manager</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Switch between your saved accounts</p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* Current Account */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatarUrl || `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#e5e7eb"/><text x="20" y="25" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">U</text></svg>')}`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.username && `@${user.username}`}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Current Account
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Other Saved Accounts */}
            {accounts.filter(acc => acc.user.id !== user.id).map((account) => (
              <div
                key={account.user.id}
                className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer group ${switchingAccount === account.user.id ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => handleSwitchAccount(account)}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={account.user.avatarUrl || `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#e5e7eb"/><text x="20" y="25" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">U</text></svg>')}`}
                    alt={account.user.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {account.user.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {account.user.username && `@${account.user.username}`}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Added {formatDate(account.addedAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleRemoveAccount(account.user.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-all"
                      title="Remove Account"
                      disabled={switchingAccount === account.user.id}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    {switchingAccount === account.user.id ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Account Button */}
            <div className="p-3">
              <button
                onClick={handleAddAccount}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-medium">Add Another Account</span>
              </button>
            </div>

            {/* Account Stats */}
            {accounts.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {accounts.length} saved account{accounts.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[999]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
