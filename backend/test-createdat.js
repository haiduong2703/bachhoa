// Test createdAt query issue
import { Order } from './src/models/index.js';
import { Op } from 'sequelize';

async function testQuery() {
  try {
    console.log('🧪 Testing Order.count with createdAt...\n');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    console.log('Date filter:', thirtyDaysAgo);

    // Test 1: Using createdAt (camelCase)
    console.log('\n1️⃣ Test with createdAt (camelCase):');
    try {
      const count1 = await Order.count({
        where: {
          createdAt: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      });
      console.log('✅ Result:', count1);
    } catch (error) {
      console.log('❌ Error:', error.message);
      console.log('Original error:', error.original?.message);
    }

    // Test 2: Using created_at (snake_case)
    console.log('\n2️⃣ Test with created_at (snake_case):');
    try {
      const count2 = await Order.count({
        where: {
          created_at: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      });
      console.log('✅ Result:', count2);
    } catch (error) {
      console.log('❌ Error:', error.message);
    }

    // Test 3: Using Sequelize.col
    console.log('\n3️⃣ Test with Sequelize.col:');
    try {
      const sequelize = Order.sequelize;
      const count3 = await Order.count({
        where: sequelize.where(
          sequelize.col('created_at'),
          Op.gte,
          thirtyDaysAgo
        )
      });
      console.log('✅ Result:', count3);
    } catch (error) {
      console.log('❌ Error:', error.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

testQuery();
