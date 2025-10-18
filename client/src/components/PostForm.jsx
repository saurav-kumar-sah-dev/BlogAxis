import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(140),
  body: z.string().min(1, 'Body is required').max(5000),
  type: z.enum(['text', 'image', 'video', 'document', 'article']).default('text'),
  image: z.any().optional(),
  video: z.any().optional(),
  document: z.any().optional(),
  articleContent: z.string().optional(),
  videoStart: z.number().int().min(0).max(150).optional(),
  videoEnd: z.number().int().min(0).max(150).optional(),
  tags: z.string().optional(),
  categories: z.string().optional(),
  status: z.enum(['draft','scheduled','published']).default('published'),
  scheduledAt: z.string().optional(),
});

export default function PostForm({ initial, onSubmit, submitLabel }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { title: '', body: '', type: 'text', image: undefined, video: undefined, document: undefined, articleContent: '', videoStart: 0, videoEnd: 150, tags: '', categories: '', status: 'published', scheduledAt: '' },
    resolver: zodResolver(postSchema),
  });
  const [active, setActive] = useState('text');
  const type = watch('type');

  useEffect(() => {
    if (initial) {
      setValue('title', initial.title || '');
      setValue('body', initial.body || '');
      if (initial.type) { setValue('type', initial.type); setActive(initial.type); }
      if (initial.articleContent) setValue('articleContent', initial.articleContent);
    }
  }, [initial, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'text', label: 'Text 📝' },
          { key: 'image', label: 'Image 🖼️' },
          { key: 'video', label: 'Video 🎬' },
          { key: 'document', label: 'Document 📄' },
          { key: 'article', label: 'Article ✍️' },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => { setActive(tab.key); setValue('type', tab.key); }}
            className={`px-3 py-1.5 rounded-full text-sm border ${active === tab.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <input 
        className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
        placeholder="Post title" 
        {...register('title')} 
      />
      {errors.title && <p className="text-red-600 dark:text-red-400 text-sm">{errors.title.message}</p>}
      <textarea 
        className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 min-h-[120px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
        placeholder="Write something..." 
        {...register('body')} 
      />
      {errors.body && <p className="text-red-600 dark:text-red-400 text-sm">{errors.body.message}</p>}
      {type === 'image' && (
        <div className="space-y-2">
          <label className="block text-sm text-gray-700 dark:text-gray-300">Upload image</label>
          <input type="file" accept="image/*" className="text-gray-700 dark:text-gray-300" {...register('image')} />
        </div>
      )}

      {type === 'video' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300">Upload video (max 2m30s)</label>
            <input type="file" accept="video/*" className="text-gray-700 dark:text-gray-300" {...register('video')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400">Start (seconds)</label>
              <input type="number" min="0" max="150" className="w-full border rounded p-2 bg-white dark:bg-gray-700" {...register('videoStart', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400">End (seconds)</label>
              <input type="number" min="0" max="150" className="w-full border rounded p-2 bg-white dark:bg-gray-700" {...register('videoEnd', { valueAsNumber: true })} />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">If the video is longer, it will be trimmed to the selected range (max 150s).</p>
        </div>
      )}

      {type === 'document' && (
        <div className="space-y-3">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Document</label>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.ppt,.pptx,.xls,.xlsx,.csv,.zip,.rar"
                  className="hidden" 
                  id="document-upload"
                  {...register('document')} 
                />
                <label 
                  htmlFor="document-upload" 
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Choose File
                </label>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Supported formats: PDF, DOC, DOCX, TXT, RTF, ODT, PPT, PPTX, XLS, XLSX, CSV, ZIP, RAR
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Maximum file size: 50MB
            </p>
          </div>
        </div>
      )}


      {type === 'article' && (
        <div className="space-y-2">
          <label className="block text-sm text-gray-700 dark:text-gray-300">Article content</label>
          <textarea className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 min-h-[200px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Write your article..." {...register('articleContent')} />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">Tags (comma-separated)</label>
          <input className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="e.g. travel, food" {...register('tags')} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">Categories (comma-separated)</label>
          <input className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="e.g. Lifestyle, Tutorials" {...register('categories')} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">Status</label>
          <select className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" {...register('status')}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-700 dark:text-gray-300">Scheduled at</label>
          <input type="datetime-local" className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" {...register('scheduledAt')} />
        </div>
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">{submitLabel}</button>
    </form>
  );
}