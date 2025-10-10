// Test các query riêng lẻ để tìm lỗi
import sequelize from './src/database/config.js';
import { User, Product, Order, Inventory } from './src/models/index.js';
import { Op } from 'sequelize';

async function testQueries() {
  try {
    console.log('🧪 Testing individual queries...\n');

    // Test 1: Count users
    console.log('1️⃣ Testing User count...');
    const totalUsers = await User.count({
      where: { status: 'active' }
    });
    console.log('✅ Total Users:', totalUsers);

    // Test 2: Count products
    console.log('\n2️⃣ Testing Product count...');
    const totalProducts = await Product.count({
      where: { status: 'active' }
    });
    console.log('✅ Total Products:', totalProducts);

    // Test 3: Count orders
    console.log('\n3️⃣ Testing Order count...');
    const totalOrders = await Order.count();
    console.log('✅ Total Orders:', totalOrders);

    // Test 4: Sum revenue
    console.log('\n4️⃣ Testing Revenue sum...');
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
    console.log('✅ Total Revenue:', revenueResult);

    // Test 5: Pending orders
    console.log('\n5️⃣ Testing Pending orders...');
    const pendingOrders = await Order.count({
      where: {
        status: {
          [Op.in]: ['pending', 'confirmed', 'packing']
        }
      }
    });
    console.log('✅ Pending Orders:', pendingOrders);

    // Test 6: Low stock
    console.log('\n6️⃣ Testing Inventory...');
    try {
      const lowStockProducts = await Inventory.count({
        where: {
          quantity: {
            [Op.lte]: 10
          }
        }
      });
      console.log('✅ Low Stock Products:', lowStockProducts);
    } catch (error) {
      console.log('⚠️ Inventory query failed:', error.message);
      console.log('This might be expected if inventory table is empty or not initialized');
    }

    console.log('\n✅ All queries completed!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testQueries();
