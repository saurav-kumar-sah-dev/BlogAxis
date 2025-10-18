const express = require('express');
const { cloudinary } = require('../utils/cloudinary');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'media-routes',
    cloudinary: !!cloudinary 
  });
});

// GET /api/media/raw/<any path>
// Handle document downloads with proper filename and content type
router.get(/^\/raw\/(.+)/, async (req, res) => {
  try {
    // Sanitize: remove leading slashes, decode, and strip query/hash completely
    const rawPath = decodeURIComponent(String(req.params[0] || ''));
    const noLead = rawPath.replace(/^\/+/, '');
    const noHash = noLead.split('#')[0];
    const noQuery = noHash.split('?')[0];
    const publicIdPath = noQuery;
    
    if (!publicIdPath) {
      return res.status(400).json({ error: 'Missing publicId' });
    }


    // Determine extension and base public id
    const matchExt = publicIdPath.match(/\.([a-zA-Z0-9]{2,10})$/);
    const requestedExt = (matchExt ? matchExt[1] : '').toLowerCase();
    const idWithoutExt = publicIdPath.replace(/\.[^/.]+$/, '');

    // Try to generate a signed URL for document download
    const ext = (requestedExt || 'pdf').toLowerCase();
    const baseId = (idWithoutExt || publicIdPath).replace(/\.[^/.]+$/, '');


    let url = '';
    let filename = `${baseId}.${ext}`;
    
    // Generate signed URL for document download
    try {
      url = cloudinary.utils.private_download_url(baseId, ext, {
        resource_type: 'raw',
        expires_at: Math.floor(Date.now() / 1000) + 60 * 10, // 10 minutes
        attachment: true, // Force download
      });
    } catch (error) {
      console.error('Failed to generate signed download URL:', error);
      // Fallback to public URL if available
      url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${baseId}.${ext}`;
    }

    if (!url) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Only return JSON if explicitly requested
    if (req.query.format === 'json') {
      return res.json({ 
        url, 
        filename,
        publicId: baseId,
        extension: ext,
        downloadUrl: url
      });
    }

    // Instead of redirecting, proxy the file content
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Set appropriate headers for download
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const contentLength = response.headers.get('content-length');
      
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      if (contentLength) res.setHeader('Content-Length', contentLength);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Stream the file content
      response.body.pipe(res);
    } catch (fetchError) {
      console.error('Failed to fetch document from Cloudinary:', fetchError);
      // Fallback to redirect
      return res.redirect(302, url);
    }
  } catch (error) {
    console.error('Media route error:', error);
    return res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// GET /api/media/preview/<any path>
// Generate preview URLs for documents (especially PDFs)
router.get(/^\/preview\/(.+)/, async (req, res) => {
  try {
    const rawPath = decodeURIComponent(String(req.params[0] || ''));
    const noLead = rawPath.replace(/^\/+/, '');
    const noHash = noLead.split('#')[0];
    const noQuery = noHash.split('?')[0];
    const publicIdPath = noQuery;
    
    if (!publicIdPath) {
      return res.status(400).json({ error: 'Missing publicId' });
    }


    const matchExt = publicIdPath.match(/\.([a-zA-Z0-9]{2,10})$/);
    const requestedExt = (matchExt ? matchExt[1] : '').toLowerCase();
    const idWithoutExt = publicIdPath.replace(/\.[^/.]+$/, '');
    const ext = (requestedExt || 'pdf').toLowerCase();
    const baseId = (idWithoutExt || publicIdPath).replace(/\.[^/.]+$/, '');


    let url = '';
    
    // For PDFs, try to generate a preview URL
    if (ext === 'pdf') {
      try {
        url = cloudinary.url(baseId, {
          resource_type: 'raw',
          type: 'authenticated',
          sign_url: true,
          expires_at: Math.floor(Date.now() / 1000) + 60 * 30, // 30 minutes
          secure: true,
          format: 'pdf',
        });
      } catch (error) {
        console.error('Failed to generate preview URL:', error);
        // Fallback to public URL
        url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${baseId}.${ext}`;
      }
    } else {
      // For non-PDF files, use the same logic as download
      try {
        url = cloudinary.utils.private_download_url(baseId, ext, {
          resource_type: 'raw',
          expires_at: Math.floor(Date.now() / 1000) + 60 * 30, // 30 minutes
          attachment: false, // Don't force download for preview
        });
      } catch (error) {
        console.error('Failed to generate preview URL for non-PDF:', error);
        url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${baseId}.${ext}`;
      }
    }

    if (!url) {
      return res.status(404).json({ error: 'Preview not available' });
    }

    // Only return JSON if explicitly requested
    if (req.query.format === 'json') {
      return res.json({ 
        previewUrl: url,
        publicId: baseId,
        extension: ext
      });
    }

    // Proxy the file content for preview
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Set appropriate headers for preview
      const contentType = response.headers.get('content-type') || 'application/pdf';
      const contentLength = response.headers.get('content-length');
      
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', 'inline'); // Inline for preview
      if (contentLength) res.setHeader('Content-Length', contentLength);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Stream the file content
      response.body.pipe(res);
    } catch (fetchError) {
      console.error('Failed to fetch preview from Cloudinary:', fetchError);
      // Fallback to redirect
      return res.redirect(302, url);
    }
  } catch (error) {
    console.error('Preview route error:', error);
    return res.status(500).json({ error: 'Failed to generate preview' });
  }
});

module.exports = router;
