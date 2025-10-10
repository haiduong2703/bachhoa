// Test dashboard API after fix
import { Order, User, Product, Inventory } from './src/models/index.js';
import { Op } from 'sequelize';
import sequelize from './src/database/config.js';

async function testDashboardQueries() {
  try {
    console.log('🧪 Testing all Dashboard queries...\n');

    // 1. Total Users
    console.log('1️⃣ Total Users:');
    const totalUsers = await User.count({
      where: { status: 'active' }
    });
    console.log('✅ Result:', totalUsers);

    // 2. Total Products
    console.log('\n2️⃣ Total Products:');
    const totalProducts = await Product.count({
      where: { status: 'active' }
    });
    console.log('✅ Result:', totalProducts);

    // 3. Total Orders
    console.log('\n3️⃣ Total Orders:');
    const totalOrders = await Order.count();
    console.log('✅ Result:', totalOrders);

    // 4. Total Revenue
    console.log('\n4️⃣ Total Revenue:');
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
    console.log('✅ Result:', revenueResult);

    // 5. Pending Orders
    console.log('\n5️⃣ Pending Orders:');
    const pendingOrders = await Order.count({
      where: {
        status: {
          [Op.in]: ['pending', 'confirmed', 'packing']
        }
      }
    });
    console.log('✅ Result:', pendingOrders);

    // 6. Low Stock Products
    console.log('\n6️⃣ Low Stock Products:');
    const lowStockProducts = await Inventory.count({
      where: {
        quantity: {
          [Op.lte]: 10
        }
      }
    });
    console.log('✅ Result:', lowStockProducts);

    // 7. Recent Orders (30 days) - FIXED
    console.log('\n7️⃣ Recent Orders (30 days) - USING created_at:');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = await Order.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    console.log('✅ Result:', recentOrders);

    // 8. Recent Revenue - FIXED
    console.log('\n8️⃣ Recent Revenue (30 days) - USING created_at:');
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
    console.log('✅ Result:', recentRevenue);

    // 9. Previous Month Revenue - FIXED
    console.log('\n9️⃣ Previous Month Revenue - USING created_at:');
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
    console.log('✅ Result:', previousMonthRevenue);

    console.log('\n✅✅✅ ALL QUERIES PASSED! Dashboard API should work now!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDashboardQueries();
