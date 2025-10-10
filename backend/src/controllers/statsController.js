import { catchAsync } from '../utils/errors.js';
import { 
  User, 
  Product, 
  Order, 
  OrderItem, 
  Inventory 
} from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../database/config.js';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/v1/stats/dashboard
 * @access  Private/Admin
 */
export const getDashboardStats = catchAsync(async (req, res) => {
  console.log('📊 Fetching dashboard statistics...');

  // 1. Total Users (all users in the system)
  const totalUsers = await User.count({
    where: {
      status: 'active'
    }
  });

  // 2. Total Products
  const totalProducts = await Product.count({
    where: { status: 'active' }
  });

  // 3. Total Orders
  const totalOrders = await Order.count();

  // 4. Total Revenue (from completed orders)
  const revenueResult = await Order.findOne({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalRevenue']
    ],
    where: {
      status: {
        [Op.in]: ['completed', 'delivered']
      }
    },
    raw: true
  });
  const totalRevenue = parseFloat(revenueResult?.totalRevenue || 0);

  // 5. Pending Orders
  const pendingOrders = await Order.count({
    where: {
      status: {
        [Op.in]: ['pending', 'confirmed', 'packing']
      }
    }
  });

  // 6. Low Stock Products (quantity <= 10)
  const lowStockProducts = await Inventory.count({
    where: {
      quantity: {
        [Op.lte]: 10
      }
    }
  });

  // 7. Recent stats for trends (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentOrders = await Order.count({
    where: {
      created_at: {
        [Op.gte]: thirtyDaysAgo
      }
    }
  });

  const recentRevenue = await Order.findOne({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
    ],
    where: {
      status: {
        [Op.in]: ['completed', 'delivered']
      },
      created_at: {
        [Op.gte]: thirtyDaysAgo
      }
    },
    raw: true
  });

  // 8. Previous month stats for comparison
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const previousMonthRevenue = await Order.findOne({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
    ],
    where: {
      status: {
        [Op.in]: ['completed', 'delivered']
      },
      created_at: {
        [Op.between]: [sixtyDaysAgo, thirtyDaysAgo]
      }
    },
    raw: true
  });

  // Calculate trends
  const currentMonthRevenue = parseFloat(recentRevenue?.revenue || 0);
  const prevMonthRevenue = parseFloat(previousMonthRevenue?.revenue || 0);
  
  const revenueTrend = prevMonthRevenue > 0 
    ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(1)
    : 0;

  console.log('✅ Dashboard stats calculated:', {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    pendingOrders,
    lowStockProducts,
    revenueTrend
  });

  res.json({
    status: 'success',
    data: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      trends: {
        revenue: {
          current: currentMonthRevenue,
          previous: prevMonthRevenue,
          percentage: parseFloat(revenueTrend)
        },
        orders: {
          recent: recentOrders
        }
      }
    }
  });
});

/**
 * @desc    Get sales report by date range
 * @route   GET /api/v1/stats/sales
 * @access  Private/Admin
 */
export const getSalesStats = catchAsync(async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;

  const whereClause = {
    status: {
      [Op.in]: ['completed', 'delivered']
    }
  };

  if (startDate && endDate) {
    whereClause.created_at = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
  }

  const orders = await Order.findAll({
    where: whereClause,
    attributes: [
      [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
      [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
    ],
    group: [sequelize.fn('DATE', sequelize.col('created_at'))],
    order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'DESC']],
    raw: true
  });

  res.json({
    status: 'success',
    data: {
      sales: orders
    }
  });
});

/**
 * @desc    Get top selling products
 * @route   GET /api/v1/stats/top-products
 * @access  Private/Admin
 */
export const getTopProducts = catchAsync(async (req, res) => {
  const { limit = 10 } = req.query;

  const topProducts = await OrderItem.findAll({
    attributes: [
      'productId',
      [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold'],
      [sequelize.fn('SUM', sequelize.col('total_price')), 'totalRevenue']
    ],
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'imageUrl']
      }
    ],
    group: ['OrderItem.product_id', 'product.id'],
    order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
    limit: parseInt(limit),
    raw: false
  });

  res.json({
    status: 'success',
    data: {
      topProducts
    }
  });
});
