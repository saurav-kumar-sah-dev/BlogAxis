import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFollowState } from '../hooks/useFollowState';
import ReportButton from '../components/ReportButton';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser, login } = useAuth();
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
    }
  }

  async function handleRemoveAvatar() {
    setError('');
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

  if (loading) return <div className="p-4 text-gray-500 dark:text-gray-400">Loading...</div>;
  if (error) return <div className="p-4 text-red-600 dark:text-red-400">{error}</div>;
  if (!profile) return <div className="p-4 text-gray-500 dark:text-gray-400">Not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-2xl mb-8 shadow-lg">
        {/* Background gradient */}
        <div 
          className="absolute inset-0 opacity-90"
          style={{
            background: isDark 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)'
          }}
        />
        
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
            <div className="relative">
                      <img
                        src={profile.avatarUrl || `data:image/svg+xml;base64,${btoa(`
                          <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
                            <rect width="120" height="120" fill="#e5e7eb"/>
                            <text x="60" y="70" text-anchor="middle" font-family="Arial" font-size="48" fill="#6b7280">U</text>
                          </svg>
                        `)}`}
                        alt="avatar"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-lg"
                      />
              {/* Removed camera button to avoid duplicate image update entry points */}
            </div>
            
            <div className="flex-1 text-white">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{profile.name}</h1>
              {profile.username && <p className="text-white/80 mb-2 sm:mb-3">@{profile.username}</p>}
              {profile.bio && <p className="text-white/90 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{profile.bio}</p>}
              <p className="text-white/80 text-xs sm:text-sm mt-3 sm:mt-4">
                Member since {new Date(profile.createdAt).toLocaleDateString()}
                {profile.updatedAt && (
                  <>
                    {' · '}Last updated {new Date(profile.updatedAt).toLocaleDateString()}
                  </>
                )}
              </p>
              <div className="mt-4 flex gap-3">
                {shouldShowFollow && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors shadow ${isFollowing ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white text-gray-800 hover:bg-gray-100'} ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {followLoading ? '⏳' : (isFollowing ? '✔ Following' : '➕ Follow')}
                  </button>
                )}
                {!isOwn && authUser && (
                  <ReportButton 
                    targetType="user" 
                    targetId={profile._id} 
                    targetTitle={profile.name}
                    className="px-4 py-2 rounded-lg font-medium transition-colors shadow bg-white/10 text-white hover:bg-white/20 border border-white/20"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Read-only details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 sm:p-6 mb-8">
        <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Profile details</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-gray-700 dark:text-gray-300">
          <button type="button" onClick={() => openList('followers')} className="text-left rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <span className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400">Followers</span>
            <div className="font-semibold text-lg sm:text-xl">{followersCount}</div>
          </button>
          <button type="button" onClick={() => openList('following')} className="text-left rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <span className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400">Following</span>
            <div className="font-semibold text-lg sm:text-xl">{followingCount}</div>
          </button>
          {profile.name && (
            <div className="col-span-2 sm:col-span-4">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Name</span>
              <div className="font-medium text-sm sm:text-base">{profile.name}</div>
            </div>
          )}
          {username && (
            <div>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Username</span>
              <div className="font-medium text-sm sm:text-base">@{username}</div>
            </div>
          )}
          {dateOfBirth && (
            <div>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Date of birth</span>
              <div className="font-medium text-sm sm:text-base">{new Date(dateOfBirth).toLocaleDateString()}</div>
            </div>
          )}
          {place && (
            <div>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Place</span>
              <div className="font-medium text-sm sm:text-base">{place}</div>
            </div>
          )}
          {info && (
            <div className="col-span-2 sm:col-span-4">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Additional info</span>
              <div className="font-medium whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{info}</div>
            </div>
          )}
        </div>
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

      {/* Edit Form */}
      {isOwn && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6" style={{ color: isDark ? '#f7fafc' : '#2d3748' }}>
            ✏️ Edit Profile
          </h2>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#cbd5e0' : '#4a5568' }}>
                  👤 First Name
                </label>
                <input 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)} 
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" 
                  placeholder="Enter your first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#cbd5e0' : '#4a5568' }}>
                  👤 Last Name
                </label>
                <input 
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)} 
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" 
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#cbd5e0' : '#4a5568' }}>
                  🏷️ Username
                </label>
                <input 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" 
                  placeholder="Choose a unique username"
                />
                <p className="text-xs mt-1" style={{ color: isDark ? '#a0aec0' : '#718096' }}>
                  Lowercase, 2-30 characters. Must be unique.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#cbd5e0' : '#4a5568' }}>
                  📅 Date of Birth
                </label>
                <input 
                  type="date"
                  value={dateOfBirth} 
                  onChange={e => setDateOfBirth(e.target.value)} 
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#cbd5e0' : '#4a5568' }}>
                  📍 Place
                </label>
                <input 
                  value={place} 
                  onChange={e => setPlace(e.target.value)} 
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" 
                  placeholder="Where are you from?"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#cbd5e0' : '#4a5568' }}>
                📝 Bio
              </label>
              <textarea 
                value={bio} 
                onChange={e => setBio(e.target.value)} 
                rows={4} 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" 
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs mt-1" style={{ color: isDark ? '#a0aec0' : '#718096' }}>
                {bio.length}/200 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#cbd5e0' : '#4a5568' }}>
                ℹ️ Additional Info
              </label>
              <textarea 
                value={info} 
                onChange={e => setInfo(e.target.value)} 
                rows={4} 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" 
                placeholder="Share more about yourself, interests, hobbies..."
              />
              <p className="text-xs mt-1" style={{ color: isDark ? '#a0aec0' : '#718096' }}>
                {info.length}/500 characters
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#cbd5e0' : '#4a5568' }}>
                🖼️ Profile Picture
              </label>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                onChange={e => setAvatarFile(e.target.files?.[0] || null)} 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300" 
              />
              {avatarFile && (
                <p className="text-sm mt-2 text-green-600 dark:text-green-400">
                  ✅ New image selected: {avatarFile.name}
                </p>
              )}
            </div>
            
            <div className="flex gap-4">
              <button 
                type="submit" 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                💾 Save Changes
              </button>
              {profile.avatarUrl && (
                <button 
                  type="button" 
                  onClick={handleRemoveAvatar} 
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  🗑️ Remove Avatar
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


