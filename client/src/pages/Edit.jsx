import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PostForm from '../components/PostForm';
import { api } from '../api/client';

export default function Edit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);

  // pages/Edit.jsx
useEffect(() => {
  (async () => {
    try {
      const res = await api.get(`/api/posts/${id}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load post');
      }
      const data = await res.json();
      setInitial(data);
    } catch (e) {
      console.error('Load post error:', e.message);
      toast.error(e.message);
      navigate('/');
    }
  })();
}, [id, navigate]);


  const submit = async (vals) => {
    try {
      const fd = new FormData();
      fd.append('title', vals.title);
      fd.append('body', vals.body);
      fd.append('type', vals.type || 'text');

      // Handle different file types
      if (vals.type === 'image' && vals.image?.[0]) {
        fd.append('image', vals.image[0]);
      } else if (vals.type === 'video' && vals.video?.[0]) {
        fd.append('video', vals.video[0]);
        if (typeof vals.videoStart === 'number') fd.append('videoStart', String(vals.videoStart));
        if (typeof vals.videoEnd === 'number') fd.append('videoEnd', String(vals.videoEnd));
      } else if (vals.type === 'document' && vals.document?.[0]) {
        fd.append('document', vals.document[0]);
      } else if (vals.type === 'article' && vals.articleContent) {
        fd.append('articleContent', vals.articleContent);
      }

      if (vals.tags) fd.append('tags', vals.tags);
      if (vals.categories) fd.append('categories', vals.categories);
      if (vals.status) fd.append('status', vals.status);
      if (vals.scheduledAt) fd.append('scheduledAt', vals.scheduledAt);

      const res = await api.put(`/api/posts/${id}`, fd, true);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      toast.success('Post updated');
      navigate('/');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return initial ? <PostForm initial={initial} onSubmit={submit} submitLabel="Update" /> : <div>Loading...</div>;
}