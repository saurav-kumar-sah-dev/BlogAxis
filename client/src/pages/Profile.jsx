import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFollowState } from '../hooks/useFollowState';
import ReportButton from '../components/ReportButton';

// Password strength indicator component
function PasswordStrengthIndicator({ password }) {
  const getStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    if (score <= 2) return { score, label: 'Weak', color: 'text-red-500' };
    if (score <= 3) return { score, label: 'Fair', color: 'text-yellow-500' };
    if (score <= 4) return { score, label: 'Good', color: 'text-blue-500' };
    return { score, label: 'Strong', color: 'text-green-500' };
  };

  const strength = getStrength(password);
  
  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1 w-8 rounded ${
                i <= strength.score
                  ? strength.score <= 2
                    ? 'bg-red-500'
                    : strength.score <= 3
                    ? 'bg-yellow-500'
                    : strength.score <= 4
                    ? 'bg-blue-500'
                    : 'bg-green-500'
                  : 'bg-gray-200 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${strength.color}`}>
          {strength.label}
        </span>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Password must contain: uppercase, lowercase, number, and special character (@$!%*?&)
      </div>
    </div>
  );
}

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser, login, logout } = useAuth();
  const { isDark } = useTheme();

  const isOwn = useMemo(() => {
    if (!id) return true; // /profile route
    return authUser ? id === authUser.id : false;
  }, [id, authUser]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  
  // Use global follow state
  const { isFollowing, loading: followLoading, shouldShowFollow, toggleFollow } = useFollowState(id);
  const [listOpen, setListOpen] = useState(false);
  const [listType, setListType] = useState('followers'); // 'followers' | 'following'
  const [listItems, setListItems] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [place, setPlace] = useState('');
  const [info, setInfo] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);
  
  // Password update state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Account deletion state
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);

  // Fetch profile
  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(isOwn ? '/users/me' : `/users/${id}`);
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        const p = data.user || data; // server returns {user} for /me and raw for public
        if (mounted) {
          setProfile(p);
          if (data.user) {
            setFollowersCount(p.followersCount || (p.followers?.length || 0));
            setFollowingCount(p.followingCount || (p.following?.length || 0));
          } else {
            setFollowersCount(data.followersCount || (data.followers?.length || 0));
            setFollowingCount(data.followingCount || (data.following?.length || 0));
          }
          const nameParts = (p.name || '').trim().split(/\s+/);
          const derivedFirst = p.firstName || (nameParts[0] || '');
          const derivedLast = p.lastName || (nameParts.slice(1).join(' ') || '');
          setFirstName(derivedFirst);
          setLastName(derivedLast);
          // For own profile, allow fallback to auth user; for public profiles, use only the profile data
          const prefer = (val, ownVal) => (isOwn ? (val ?? ownVal ?? '') : (val ?? ''));
          setUsername(prefer(p.username, authUser?.username));
          setBio(prefer(p.bio, authUser?.bio));
          setPlace(prefer(p.place, authUser?.place));
          setInfo(prefer(p.info, authUser?.info));
          const dobSource = isOwn ? (p.dateOfBirth || authUser?.dateOfBirth || '') : (p.dateOfBirth || '');
          setDateOfBirth(dobSource ? new Date(dobSource).toISOString().split('T')[0] : '');
        }
      } catch (e) {
        if (mounted) setError(e.message || 'Error');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, [id, isOwn]);

  // Fallback: if own profile and DoB still missing after first load, try /api/auth/me once
  useEffect(() => {
    let cancelled = false;
    async function backfillFromAuthMe() {
      try {
        if (!isOwn) return;
        if (dateOfBirth) return; // already have it
        const res = await api.get('/auth/me');
        if (!res.ok) return;
        const me = await res.json();
        const u = me?.user;
        if (!cancelled && u?.dateOfBirth && !dateOfBirth) {
          setDateOfBirth(new Date(u.dateOfBirth).toISOString().split('T')[0]);
        }
        if (!cancelled && u && !place && u.place) setPlace(u.place);
        if (!cancelled && u && !info && u.info) setInfo(u.info);
      } catch {}
    }
    backfillFromAuthMe();
    return () => { cancelled = true; };
  }, [isOwn, dateOfBirth, place, info]);

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const form = new FormData();
      if (firstName) form.append('firstName', firstName);
      if (lastName) form.append('lastName', lastName);
      const computedFullName = `${firstName} ${lastName}`.trim();
      if (computedFullName) form.append('name', computedFullName);
      if (username) form.append('username', username);
      form.append('bio', bio || '');
      form.append('place', place || '');
      form.append('info', info || '');
      if (dateOfBirth) form.append('dateOfBirth', dateOfBirth);
      if (avatarFile) form.append('avatar', avatarFile);
      const res = await api.put('/users/me', form, true);
      const updated = await res.json();
      if (!res.ok) throw new Error(updated?.error || 'Update failed');
      setProfile(updated);
      // also update auth context user
      login(localStorage.getItem('token') || '', {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        username: updated.username,
        avatarUrl: updated.avatarUrl,
        firstName: updated.firstName,
        lastName: updated.lastName,
        dateOfBirth: updated.dateOfBirth,
        place: updated.place,
        info: updated.info,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      });
      setAvatarFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      setError(e.message || 'Update failed');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemoveAvatar() {
    setError('');
    setIsRemovingAvatar(true);
    try {
      const form = new FormData();
      form.append('removeAvatar', 'true');
      const res = await api.put('/users/me', form, true);
      const updated = await res.json();
      if (!res.ok) throw new Error(updated?.error || 'Update failed');
      setProfile(updated);
      login(localStorage.getItem('token') || '', {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        username: updated.username,
        avatarUrl: updated.avatarUrl,
      });
    } catch (e) {
      setError(e.message || 'Failed');
    } finally {
      setIsRemovingAvatar(false);
    }
  }

  async function handleFollowToggle() {
    if (!authUser) {
      navigate('/login');
      return;
    }
    try {
      const result = await toggleFollow();
      if (result.success) {
        if (typeof result.followersCount === 'number') setFollowersCount(result.followersCount);
        if (typeof result.followingCount === 'number' && isOwn) setFollowingCount(result.followingCount);
      }
    } catch (e) {
      setError(e.message || 'Failed');
    }
  }

  async function openList(type) {
    setListType(type);
    setListOpen(true);
    setListLoading(true);
    setListItems([]);
    try {
      const res = await api.get(`/users/${id || authUser?.id}/${type}`);
      if (!res.ok) throw new Error('Failed to load list');
      const items = await res.json();
      setListItems(Array.isArray(items) ? items : []);
    } catch (e) {
      setError(e.message || 'Failed');
    } finally {
      setListLoading(false);
    }
  }

  async function toggleFollowFromList(userId, currentlyFollowing) {
    try {
      const path = currentlyFollowing ? `/users/${userId}/unfollow` : `/users/${userId}/follow`;
      const res = await api.post(path, {});
      await res.json().catch(() => ({}));
      if (!res.ok) throw new Error('Action failed');
      setListItems(items => items.map(u => u._id === userId ? { ...u, isFollowing: !currentlyFollowing } : u));
      if (listType === 'followers') {
        setFollowersCount(c => c); // unchanged here; server returns counts but we don't need to block on it
      } else if (listType === 'following' && (id || authUser?.id) === authUser?.id) {
        // If viewing own following list, adjust followingCount locally
        setFollowingCount(c => c + (currentlyFollowing ? -1 : 1));
      }
    } catch (e) {
      setError(e.message || 'Failed');
    }
  }

  async function handlePasswordUpdate(e) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setIsUpdatingPassword(true);
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setIsUpdatingPassword(false);
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      setIsUpdatingPassword(false);
      return;
    }
    
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(newPassword)) {
      setPasswordError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      setIsUpdatingPassword(false);
      return;
    }
    
    try {
      const res = await api.put('/auth/password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Password update failed');
      }
      
      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (e) {
      setPasswordError(e.message || 'Password update failed');
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  async function handleAccountDeletion(e) {
    e.preventDefault();
    setDeleteError('');
    setIsDeletingAccount(true);
    
    if (!acceptTerms) {
      setDeleteError('You must accept the terms and conditions to delete your account');
      setIsDeletingAccount(false);
      return;
    }
    
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm account deletion');
      setIsDeletingAccount(false);
      return;
    }
    
    try {
      const res = await api.del('/auth/account', {
        password: deletePassword,
        confirmText: deleteConfirmText,
        acceptTerms: acceptTerms.toString()
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Account deletion failed');
      }
      
      // Account deleted successfully - clear everything and redirect
      logout();
      
      // Clear all local storage to ensure complete logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('accounts');
      
      // Force redirect to login page since user is now logged out
      window.location.href = '/login';
      
    } catch (e) {
      setDeleteError(e.message || 'Account deletion failed');
    } finally {
      setIsDeletingAccount(false);
    }
  }

  if (loading) return <div className="p-4 text-gray-500 dark:text-gray-400">Loading...</div>;
  if (error) return <div className="p-4 text-red-600 dark:text-red-400">{error}</div>;
  if (!profile) return <div className="p-4 text-gray-500 dark:text-gray-400">Not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Profile Header */}
        <div className="relative overflow-hidden rounded-3xl mb-8 shadow-2xl">
          {/* Enhanced Background with multiple gradients */}
          <div 
            className="absolute inset-0"
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 25%, #7c3aed 50%, #c026d3 75%, #db2777 100%)'
                : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #f59e0b 75%, #10b981 100%)'
            }}
          />
          
          {/* Animated decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-4 left-4 w-16 h-16 rounded-full opacity-30 animate-pulse" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <div className="absolute top-8 right-8 w-12 h-12 rounded-full opacity-25 animate-bounce" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <div className="absolute bottom-8 left-8 w-20 h-20 rounded-full opacity-20 animate-pulse" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="absolute bottom-4 right-4 w-14 h-14 rounded-full opacity-30 animate-bounce" style={{ background: 'rgba(255,255,255,0.2)' }} />
            
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
          
          <div className="relative z-10 p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
              {/* Enhanced Avatar Section */}
              <div className="relative group">
                <div className="relative">
                  <img
                    src={profile.avatarUrl || `data:image/svg+xml;base64,${btoa(`
                      <svg width="160" height="160" xmlns="http://www.w3.org/2000/svg">
                        <rect width="160" height="160" fill="#e5e7eb"/>
                        <text x="80" y="90" text-anchor="middle" font-family="Arial" font-size="64" fill="#6b7280">U</text>
                      </svg>
                    `)}`}
                    alt="avatar"
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white/30 shadow-2xl group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Online indicator */}
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-lg animate-pulse"></div>
                </div>
              </div>
              
              {/* Enhanced Profile Info */}
              <div className="flex-1 text-white">
                <div className="mb-4">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    {profile.name}
                  </h1>
                  {profile.username && (
                    <p className="text-white/80 text-lg sm:text-xl mb-3 font-medium">
                      @{profile.username}
                    </p>
                  )}
                  {profile.bio && (
                    <p className="text-white/90 whitespace-pre-wrap leading-relaxed text-base sm:text-lg mb-4 max-w-2xl">
                      {profile.bio}
                    </p>
                  )}
                </div>
                
                {/* Enhanced Member Info */}
                <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm sm:text-base mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    <span>Member since {new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>
                  {profile.updatedAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔄</span>
                      <span>Updated {new Date(profile.updatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                {/* Enhanced Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {shouldShowFollow && (
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                        isFollowing 
                          ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30 hover:scale-105' 
                          : 'bg-white text-gray-800 hover:bg-gray-100 hover:scale-105'
                      } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {followLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          Loading...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {isFollowing ? '✅' : '➕'} {isFollowing ? 'Following' : 'Follow'}
                        </span>
                      )}
                    </button>
                  )}
                  {!isOwn && authUser && (
                    <ReportButton 
                      targetType="user" 
                      targetId={profile._id} 
                      targetTitle={profile.name}
                      className="px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl bg-white/10 text-white hover:bg-white/20 border border-white/30 hover:scale-105"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Profile Details */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">👤</span>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Profile Details</h3>
          </div>
          
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <button 
              type="button" 
              onClick={() => openList('followers')} 
              className="group text-left rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 transition-all duration-300 border border-blue-200/50 dark:border-blue-700/50 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">👥</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Followers</span>
              </div>
              <div className="font-bold text-2xl sm:text-3xl text-blue-700 dark:text-blue-300">{followersCount}</div>
            </button>
            
            <button 
              type="button" 
              onClick={() => openList('following')} 
              className="group text-left rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-800/30 transition-all duration-300 border border-green-200/50 dark:border-green-700/50 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🔄</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Following</span>
              </div>
              <div className="font-bold text-2xl sm:text-3xl text-green-700 dark:text-green-300">{followingCount}</div>
            </button>
            
            {username && (
              <div className="rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200/50 dark:border-purple-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🏷️</span>
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Username</span>
                </div>
                <div className="font-bold text-lg sm:text-xl text-purple-700 dark:text-purple-300">@{username}</div>
              </div>
            )}
            
            {dateOfBirth && (
              <div className="rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200/50 dark:border-orange-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎂</span>
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Birthday</span>
                </div>
                <div className="font-bold text-lg sm:text-xl text-orange-700 dark:text-orange-300">{new Date(dateOfBirth).toLocaleDateString()}</div>
              </div>
            )}
          </div>
          
          {/* Enhanced Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {profile.name && (
              <div className="rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/20 dark:to-gray-600/20 border border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📝</span>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Full Name</span>
                </div>
                <div className="font-bold text-lg sm:text-xl text-gray-800 dark:text-gray-200">{profile.name}</div>
              </div>
            )}
            
            {place && (
              <div className="rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border border-indigo-200/50 dark:border-indigo-700/50">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📍</span>
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Location</span>
                </div>
                <div className="font-bold text-lg sm:text-xl text-indigo-700 dark:text-indigo-300">{place}</div>
              </div>
            )}
          </div>
          
          {info && (
            <div className="mt-6 rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border border-teal-200/50 dark:border-teal-700/50">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">ℹ️</span>
                <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">Additional Information</span>
              </div>
              <div className="font-medium whitespace-pre-wrap text-base sm:text-lg leading-relaxed text-teal-700 dark:text-teal-300">{info}</div>
            </div>
          )}
        </div>

      {/* Followers/Following Modal */}
      <Modal
        open={listOpen}
        onClose={() => setListOpen(false)}
        title={listType === 'followers' ? 'Followers' : 'Following'}
      >
        {listLoading ? (
          <div className="p-4 text-gray-600 dark:text-gray-300">Loading...</div>
        ) : listItems.length === 0 ? (
          <div className="p-4 text-gray-600 dark:text-gray-300">No users to show</div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[65vh] overflow-y-auto pr-1">
            {listItems.map(u => (
              <div key={u._id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Link to={`/users/${u._id}`} onClick={() => setListOpen(false)}>
                    <img src={u.avatarUrl || `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\"><rect width=\"28\" height=\"28\" fill=\"#e5e7eb\"/><text x=\"14\" y=\"18\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"11\" fill=\"#6b7280\">U</text></svg>')}`} alt="" className="w-8 h-8 rounded-full object-cover border" />
                  </Link>
                  <div className="min-w-0">
                    <Link to={`/users/${u._id}`} onClick={() => setListOpen(false)} className="block">
                      <div className="text-sm text-gray-900 dark:text-gray-100 truncate">{u.name}</div>
                    </Link>
                    <div className="text-xs text-gray-500 truncate">
                      {u.username && (
                        <Link to={`/users/${u._id}`} onClick={() => setListOpen(false)} className="hover:underline">
                          @{u.username}
                        </Link>
                      )}
                      {u.place ? ` · ${u.place}` : ''}
                    </div>
                  </div>
                </div>
                {authUser && authUser.id !== u._id && (
                  <button
                    onClick={() => toggleFollowFromList(u._id, u.isFollowing)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${u.isFollowing ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                  >
                    {u.isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

        {/* Enhanced Edit Form */}
        {isOwn && (
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 sm:p-8 mb-8">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-3xl">✏️</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
            </div>
          
            <form onSubmit={handleSave} className="space-y-8">
              {/* Personal Information Section */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">👤</span>
                  <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-blue-700 dark:text-blue-300">
                      👤 First Name
                    </label>
                    <input 
                      value={firstName} 
                      onChange={e => setFirstName(e.target.value)} 
                      className="w-full border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm" 
                      placeholder="Enter your first name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-blue-700 dark:text-blue-300">
                      👤 Last Name
                    </label>
                    <input 
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)} 
                      className="w-full border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm" 
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
              </div>

              {/* Account Information Section */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">🏷️</span>
                  <h3 className="text-lg font-bold text-purple-800 dark:text-purple-200">Account Information</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-3 text-purple-700 dark:text-purple-300">
                    🏷️ Username
                  </label>
                  <input 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    className="w-full border-2 border-purple-200 dark:border-purple-700 rounded-xl p-4 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 backdrop-blur-sm" 
                    placeholder="Choose a unique username"
                  />
                  <p className="text-xs mt-2 text-purple-600 dark:text-purple-400">
                    Lowercase, 2-30 characters. Must be unique.
                  </p>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/50">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">📍</span>
                  <h3 className="text-lg font-bold text-green-800 dark:text-green-200">Additional Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-green-700 dark:text-green-300">
                      📅 Date of Birth
                    </label>
                    <input 
                      type="date"
                      value={dateOfBirth} 
                      onChange={e => setDateOfBirth(e.target.value)} 
                      className="w-full border-2 border-green-200 dark:border-green-700 rounded-xl p-4 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 backdrop-blur-sm" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-green-700 dark:text-green-300">
                      📍 Place
                </label>
                    <input 
                      value={place} 
                      onChange={e => setPlace(e.target.value)} 
                      className="w-full border-2 border-green-200 dark:border-green-700 rounded-xl p-4 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 backdrop-blur-sm" 
                      placeholder="Where are you from?"
                    />
                  </div>
                </div>
              </div>
            
              {/* Bio and Info Section */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-6 border border-orange-200/50 dark:border-orange-700/50">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">📝</span>
                  <h3 className="text-lg font-bold text-orange-800 dark:text-orange-200">About You</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-orange-700 dark:text-orange-300">
                      📝 Bio
                    </label>
                    <textarea 
                      value={bio} 
                      onChange={e => setBio(e.target.value)} 
                      rows={4} 
                      className="w-full border-2 border-orange-200 dark:border-orange-700 rounded-xl p-4 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 backdrop-blur-sm resize-none" 
                      placeholder="Tell us about yourself..."
                    />
                    <p className="text-xs mt-2 text-orange-600 dark:text-orange-400">
                      {bio.length}/200 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3 text-orange-700 dark:text-orange-300">
                      ℹ️ Additional Info
                    </label>
                    <textarea 
                      value={info} 
                      onChange={e => setInfo(e.target.value)} 
                      rows={4} 
                      className="w-full border-2 border-orange-200 dark:border-orange-700 rounded-xl p-4 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 backdrop-blur-sm resize-none" 
                      placeholder="Share more about yourself, interests, hobbies..."
                    />
                    <p className="text-xs mt-2 text-orange-600 dark:text-orange-400">
                      {info.length}/500 characters
                    </p>
                  </div>
                </div>
              </div>
            
              {/* Avatar Upload Section */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-2xl p-6 border border-indigo-200/50 dark:border-indigo-700/50">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">🖼️</span>
                  <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-200">Profile Picture</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-3 text-indigo-700 dark:text-indigo-300">
                    🖼️ Upload New Picture
                  </label>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/*" 
                    onChange={e => setAvatarFile(e.target.files?.[0] || null)} 
                    className="w-full border-2 border-indigo-200 dark:border-indigo-700 rounded-xl p-4 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 backdrop-blur-sm" 
                  />
                  {avatarFile && (
                    <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl">
                      <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                        <span className="text-lg">✅</span>
                        New image selected: <span className="font-semibold">{avatarFile.name}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className={`flex-1 px-8 py-4 text-white rounded-2xl transition-all duration-300 font-semibold shadow-lg flex items-center justify-center gap-3 ${
                    isSaving 
                      ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-75' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">💾</span>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                {profile.avatarUrl && (
                  <button 
                    type="button" 
                    onClick={handleRemoveAvatar}
                    disabled={isRemovingAvatar}
                    className={`px-8 py-4 text-white rounded-2xl transition-all duration-300 font-semibold shadow-lg flex items-center justify-center gap-3 ${
                      isRemovingAvatar 
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-75' 
                        : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:scale-105'
                    }`}
                  >
                    {isRemovingAvatar ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Removing...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl">🗑️</span>
                        <span>Remove Avatar</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </form>
        </div>
      )}

        {/* Enhanced Password Update Section */}
        {isOwn && (
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔒</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Password Security</h2>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
                  showPasswordForm 
                    ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                }`}
              >
                {showPasswordForm ? '❌ Cancel' : '🔑 Change Password'}
              </button>
            </div>
          
          {passwordSuccess && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-6">
              <p className="text-green-600 dark:text-green-400">{passwordSuccess}</p>
            </div>
          )}
          
            {showPasswordForm && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-blue-700 dark:text-blue-300">
                      🔑 Current Password
                    </label>
                    <input 
                      type="password"
                      value={currentPassword} 
                      onChange={e => setCurrentPassword(e.target.value)} 
                      className="w-full border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm" 
                      placeholder="Enter your current password"
                      required
                    />
                  </div>
              
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-blue-700 dark:text-blue-300">
                      🔐 New Password
                    </label>
                    <input 
                      type="password"
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      className="w-full border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm" 
                      placeholder="Enter your new password"
                      required
                    />
                    <PasswordStrengthIndicator password={newPassword} />
                  </div>
              
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-blue-700 dark:text-blue-300">
                      🔐 Confirm New Password
                    </label>
                    <input 
                      type="password"
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      className="w-full border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm" 
                      placeholder="Confirm your new password"
                      required
                    />
                  </div>
                  
                  {passwordError && (
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl">
                      <p className="text-red-700 dark:text-red-300 flex items-center gap-2">
                        <span className="text-lg">⚠️</span>
                        {passwordError}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      type="submit" 
                      disabled={isUpdatingPassword}
                      className={`flex-1 px-6 py-4 text-white rounded-2xl transition-all duration-300 font-semibold shadow-lg flex items-center justify-center gap-3 ${
                        isUpdatingPassword 
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-75' 
                          : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-xl hover:scale-105'
                      }`}
                    >
                      {isUpdatingPassword ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">🔐</span>
                          <span>Update Password</span>
                        </>
                      )}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowPasswordForm(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setPasswordError('');
                        setPasswordSuccess('');
                      }}
                      className="px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3"
                    >
                      <span className="text-xl">❌</span>
                      <span>Cancel</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
        </div>
      )}

        {/* Enhanced Account Deletion Section */}
        {isOwn && (
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800 rounded-3xl shadow-2xl p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚠️</span>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
                    Danger Zone
                  </h2>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteForm(!showDeleteForm)}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
                  showDeleteForm 
                    ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700' 
                    : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
                }`}
              >
                {showDeleteForm ? '❌ Cancel' : '🗑️ Delete Account'}
              </button>
            </div>
          
            {showDeleteForm && (
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl p-6 border border-red-200 dark:border-red-700">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    Are you absolutely sure?
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                  </p>
                </div>
              
              <form onSubmit={handleAccountDeletion} className="space-y-4">
                {!profile.isGoogleUser && (
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-red-700 dark:text-red-300">
                      🔑 Enter your password to confirm
                    </label>
                    <input 
                      type="password"
                      value={deletePassword} 
                      onChange={e => setDeletePassword(e.target.value)} 
                      className="w-full border-2 border-red-200 dark:border-red-700 rounded-xl p-4 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 backdrop-blur-sm" 
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold mb-3 text-red-700 dark:text-red-300">
                    Type <span className="font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">DELETE</span> to confirm
                  </label>
                  <input 
                    type="text"
                    value={deleteConfirmText} 
                    onChange={e => setDeleteConfirmText(e.target.value)} 
                    className="w-full border-2 border-red-200 dark:border-red-700 rounded-xl p-4 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 backdrop-blur-sm" 
                    placeholder="Type DELETE"
                    required
                  />
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-2 border-yellow-300 dark:border-yellow-600 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptTerms}
                      onChange={e => setAcceptTerms(e.target.checked)}
                      className="mt-1 h-6 w-6 text-red-600 focus:ring-red-500 border-gray-300 rounded-lg"
                      required
                    />
                    <div className="flex-1">
                      <label htmlFor="acceptTerms" className="text-base font-semibold text-gray-800 dark:text-gray-200 cursor-pointer block">
                        ✅ I understand and accept the consequences of account deletion
                      </label>
                      <div className="text-sm text-gray-700 dark:text-gray-300 mt-3">
                        <strong className="text-yellow-700 dark:text-yellow-300">By checking this box, I acknowledge that:</strong>
                        <ul className="list-disc list-inside mt-3 space-y-2 text-gray-600 dark:text-gray-400">
                          <li>My account and all associated data will be permanently deleted</li>
                          <li>This action cannot be undone or reversed</li>
                          <li>All my posts, comments, and profile information will be removed</li>
                          <li>I will lose access to all my content and account features</li>
                          <li>I will need to create a new account if I want to use the platform again</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    type="submit" 
                    className={`flex-1 px-8 py-4 text-white rounded-2xl transition-all duration-300 font-semibold shadow-lg flex items-center justify-center gap-3 ${
                      isDeletingAccount || !acceptTerms || deleteConfirmText !== 'DELETE' || (!profile.isGoogleUser && !deletePassword)
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-75' 
                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-xl hover:scale-105'
                    }`}
                    disabled={isDeletingAccount || !acceptTerms || deleteConfirmText !== 'DELETE' || (!profile.isGoogleUser && !deletePassword)}
                  >
                    {isDeletingAccount ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl">🗑️</span>
                        <span>Delete My Account</span>
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowDeleteForm(false);
                      setDeletePassword('');
                      setDeleteConfirmText('');
                      setDeleteError('');
                      setAcceptTerms(false);
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3"
                  >
                    <span className="text-xl">❌</span>
                    <span>Cancel</span>
                  </button>
                </div>
                
                {deleteError && (
                  <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl">
                    <p className="text-red-700 dark:text-red-300 flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      {deleteError}
                    </p>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

// Simple modal
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h4>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✖</button>
        </div>
        {children}
      </div>
    </div>
  );
}


