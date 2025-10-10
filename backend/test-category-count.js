const BASE_URL = 'http://localhost:5000/api/v1';

async function testCategoryProductCount() {
  console.log('🧪 Testing Category Product Count API...\n');

  try {
    // Test 1: Get all categories with product count
    console.log('📋 Test 1: GET /categories - Should return productCount');
    const response = await fetch(`${BASE_URL}/categories?status=active`);
    const data = await response.json();

    if (data.status === 'success') {
      const categories = data.data.categories;
      console.log('✅ Success! Found', categories.length, 'categories\n');

      // Display first 5 categories with product count
      console.log('📊 Category Product Counts:');
      console.log('─'.repeat(60));
      categories.slice(0, 5).forEach(cat => {
        const count = cat.productCount || 0;
        console.log(`${cat.id.toString().padStart(3)} | ${cat.name.padEnd(30)} | ${count} sản phẩm`);
      });
      console.log('─'.repeat(60));

      // Check if productCount exists
      const hasProductCount = categories.some(cat => 'productCount' in cat);
      if (hasProductCount) {
        console.log('\n✅ productCount field exists in response');
      } else {
        console.log('\n❌ productCount field is MISSING in response');
        console.log('Sample category:', JSON.stringify(categories[0], null, 2));
      }
    }

    // Test 2: Get single category
    console.log('\n\n📋 Test 2: GET /categories/:id - Category detail');
    const detailResponse = await fetch(`${BASE_URL}/categories/1`);
    const detailData = await detailResponse.json();
    
    if (detailData.status === 'success') {
      const category = detailData.data.category;
      console.log('✅ Category detail:', {
        id: category.id,
        name: category.name,
        productCount: category.productCount || 0
      });
    }

    // Test 3: Get products by category
    console.log('\n\n📋 Test 3: GET /products?category=1 - Products in category');
    const productsResponse = await fetch(`${BASE_URL}/products?category=1&status=active`);
    const productsData = await productsResponse.json();

    if (productsData.status === 'success') {
      const products = productsData.data.products;
      console.log(`✅ Found ${products.length} products in category ID=1`);
      
      if (products.length > 0) {
        console.log('\nSample products:');
        products.slice(0, 3).forEach(p => {
          console.log(`  - ${p.name} (${p.price}đ)`);
        });
      }
    }

    console.log('\n\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run tests
testCategoryProductCount();
