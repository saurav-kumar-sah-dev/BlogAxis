import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Authentication failed. Please try again.');
      navigate('/login');
      return;
    }

    if (token) {
      // Store token and redirect to home
      localStorage.setItem('token', token);
      
      // Fetch user data
      api.get('/auth/me')
              .then(async res => res.json())
              .then(async data => {
                if (data.user) {
                  // Save token + user, then ensure we have all fields by fetching /auth/me
                  login(token, data.user);
                  try {
                    const meRes = await api.get('/auth/me');
                    const meData = await meRes.json();
                    if (meRes.ok && meData?.user) {
                      login(token, meData.user);
                    }
                  } catch {}
          toast.success('Successfully logged in with Google!');
          navigate('/');
        } else {
          throw new Error('Failed to fetch user data');
        }
      })
      .catch(err => {
        console.error('Auth callback error:', err);
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      });
    } else {
      toast.error('No authentication token received.');
      navigate('/login');
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="max-w-md mx-auto py-6 text-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Completing authentication...</p>
      </div>
    </div>
  );
}
