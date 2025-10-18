const xss = require('xss');
const isPlainObject = (v) => Object.prototype.toString.call(v) === '[object Object]';

function stripMongoKeys(obj) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) return obj.forEach(stripMongoKeys);
  Object.keys(obj).forEach((k) => {
    if (k.startsWith('$') || k.includes('.')) {
      delete obj[k];
      return;
    }
    const v = obj[k];
    if (isPlainObject(v) || Array.isArray(v)) stripMongoKeys(v);
  });
}

function sanitizeValues(val) {
  if (typeof val === 'string') return xss(val);
  if (Array.isArray(val)) {
    for (let i = 0; i < val.length; i++) val[i] = sanitizeValues(val[i]);
    return val;
  }
  if (isPlainObject(val)) {
    Object.keys(val).forEach((k) => { val[k] = sanitizeValues(val[k]); });
    return val;
  }
  return val;
}

module.exports = function sanitizeRequest(req, res, next) {
  try {
    if (req.body) { stripMongoKeys(req.body); sanitizeValues(req.body); }
    if (req.query) { stripMongoKeys(req.query); sanitizeValues(req.query); }
    // IMPORTANT: do not touch req.params
  } catch (e) {
    console.error('sanitize error:', e.message);
  }
  next();
};