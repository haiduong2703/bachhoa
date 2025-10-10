// Test ProductImage creation
import { ProductImage } from './src/models/index.js';

async function testProductImageCreation() {
  try {
    console.log('🧪 Testing ProductImage creation...\n');

    const testData = {
      imageUrl: '/uploads/products/test-medium.jpg',
      thumbnailUrl: '/uploads/products/test-thumbnail.jpg',
      altText: 'Test image',
      isPrimary: false
    };

    console.log('📝 Creating ProductImage with data:', testData);

    const productImage = await ProductImage.create(testData);

    console.log('✅ ProductImage created successfully!');
    console.log('ID:', productImage.id);
    console.log('Image URL:', productImage.imageUrl);
    console.log('Thumbnail URL:', productImage.thumbnailUrl);
    console.log('Raw data:', productImage.toJSON());

    // Clean up
    await productImage.destroy();
    console.log('\n🗑️  Test record deleted');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    if (error.original) {
      console.error('Original DB error:', error.original.message);
      console.error('SQL:', error.original.sql);
    }
    process.exit(1);
  }
}

testProductImageCreation();
