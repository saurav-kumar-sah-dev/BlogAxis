const Audit = require('../models/Audit');

// Get audit trail with pagination and filtering
exports.getAudits = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const action = req.query.action;
    const targetType = req.query.targetType;
    const admin = req.query.admin;
    
    const filter = {};
    if (action) filter.action = action;
    if (targetType) filter.targetType = targetType;
    if (admin) {
      // Search by admin name (case insensitive)
      filter['admin.name'] = { $regex: admin, $options: 'i' };
    }
    
    const audits = await Audit.find(filter)
      .populate('admin', 'name username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Audit.countDocuments(filter);
    
    res.json({
      audits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get audit statistics
exports.getAuditStats = async (req, res) => {
  try {
    const stats = await Audit.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const recentAudits = await Audit.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    const adminStats = await Audit.aggregate([
      {
        $group: {
          _id: '$admin',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'admin'
        }
      },
      {
        $unwind: '$admin'
      },
      {
        $project: {
          adminName: '$admin.name',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    res.json({
      actionStats: stats,
      recentAudits,
      topAdmins: adminStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
