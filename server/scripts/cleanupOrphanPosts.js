// server/scripts/cleanupOrphanPosts.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

// Import from server/models and server/utils
const Post = require(path.join(__dirname, '..', 'models', 'Post'));
let destroy;
try {
  ({ destroy } = require(path.join(__dirname, '..', 'utils', 'cloudinary')));
} catch {
  // If no Cloudinary configured, skip image deletion
  destroy = async () => null;
}

const DRY_RUN = process.argv.includes('--dry-run');

(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('MONGO_URI missing. Set it in server/.env');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Find posts whose user no longer exists
    const orphans = await Post.aggregate([
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'u' } },
      { $match: { 'u.0': { $exists: false } } },
      { $project: { _id: 1, imagePublicId: 1 } },
    ]);

    console.log(`Orphan posts found: ${orphans.length}`);
    if (!orphans.length) {
      await mongoose.disconnect();
      console.log('Nothing to do');
      process.exit(0);
    }

    if (DRY_RUN) {
      console.log('Dry run, will NOT delete. Sample IDs:', orphans.slice(0, 5).map(o => o._id.toString()));
      await mongoose.disconnect();
      process.exit(0);
    }

    // Best-effort: delete images (if Cloudinary configured)
    let imageDeletes = 0;
    await Promise.all(
      orphans.map(async (p) => {
        if (p.imagePublicId) {
          try {
            await destroy(p.imagePublicId);
            imageDeletes++;
          } catch (e) {
            // ignore Cloudinary failures
          }
        }
      })
    );

    const ids = orphans.map((o) => o._id);
    const result = await Post.deleteMany({ _id: { $in: ids } });
    console.log(`Deleted posts: ${result.deletedCount}, images removed: ${imageDeletes}`);

    await mongoose.disconnect();
    console.log('Done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();