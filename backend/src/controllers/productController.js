import { Product, Category, ProductImage, Inventory, ProductCategory } from '../models/index.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { catchAsync } from '../utils/errors.js';
import { Op } from 'sequelize';

/**
 * Get all products with filtering, sorting, and pagination
 */
export const getProducts = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    q,
    search,
    category,
    minPrice,
    maxPrice,
    status = 'active',
    featured,
    sort = 'created_at',
    order = 'desc'
  } = req.query;

  const offset = (page - 1) * limit;
  const where = {};
  const include = [
    {
      model: ProductImage,
      as: 'images',
      where: { isPrimary: true },
      required: false,
      limit: 1
    },
    {
      model: Category,
      as: 'categories',
      through: { attributes: [] }
    },
    {
      model: Inventory,
      as: 'inventory'
    }
  ];

  // Build where conditions
  if (status) {
    where.status = status;
  }

  if (featured !== undefined) {
    where.featured = featured === 'true';
  }

  // Handle search query (support both 'q' and 'search' parameters for backward compatibility)
  const searchQuery = search || q;
  if (searchQuery) {
    where[Op.or] = [
      { name: { [Op.like]: `%${searchQuery}%` } },
      { description: { [Op.like]: `%${searchQuery}%` } },
      { sku: { [Op.like]: `%${searchQuery}%` } }
    ];
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[Op.gte] = minPrice;
    if (maxPrice) where.price[Op.lte] = maxPrice;
  }

  // Filter by category
  if (category) {
    include.push({
      model: Category,
      as: 'categories',
      where: { id: category },
      through: { attributes: [] },
      required: true
    });
  }

  // Build order clause
  const orderClause = [];
  if (sort === 'price') {
    orderClause.push(['price', order.toUpperCase()]);
  } else if (sort === 'name') {
    orderClause.push(['name', order.toUpperCase()]);
  } else if (sort === 'featured') {
    orderClause.push(['featured', 'DESC'], ['created_at', 'DESC']);
  } else {
    orderClause.push(['created_at', order.toUpperCase()]);
  }

  const { count, rows: products } = await Product.findAndCountAll({
    where,
    include,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: orderClause,
    distinct: true
  });

  const totalPages = Math.ceil(count / limit);

  res.json({
    status: 'success',
    data: {
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * Get featured products
 */
export const getFeaturedProducts = catchAsync(async (req, res) => {
  const { limit = 8 } = req.query;

  const products = await Product.findAll({
    where: {
      status: 'active',
      featured: true
    },
    include: [
      {
        model: ProductImage,
        as: 'images',
        where: { isPrimary: true },
        required: false,
        limit: 1
      },
      {
        model: Category,
        as: 'categories',
        through: { attributes: [] }
      },
      {
        model: Inventory,
        as: 'inventory'
      }
    ],
    limit: parseInt(limit),
    order: [['created_at', 'DESC']]
  });

  res.json({
    status: 'success',
    data: {
      products
    }
  });
});

/**
 * Get product by ID or slug
 */
export const getProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const isNumeric = /^\d+$/.test(id);

  const where = isNumeric ? { id } : { slug: id };

  const product = await Product.findOne({
    where,
    include: [
      {
        model: ProductImage,
        as: 'images',
        order: [['sortOrder', 'ASC'], ['isPrimary', 'DESC']]
      },
      {
        model: Category,
        as: 'categories',
        through: { attributes: [] }
      },
      {
        model: Inventory,
        as: 'inventory'
      }
    ]
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  res.json({
    status: 'success',
    data: {
      product
    }
  });
});

/**
 * Create new product (Admin only)
 */
export const createProduct = catchAsync(async (req, res) => {
  const {
    name,
    description,
    shortDescription,
    sku,
    price,
    comparePrice,
    costPrice,
    weight,
    dimensions,
    status,
    featured,
    metaTitle,
    metaDescription,
    categoryIds,
    inventory
  } = req.body;

  // Check if SKU already exists
  const existingProduct = await Product.findBySku(sku);
  if (existingProduct) {
    throw new ValidationError('SKU already exists');
  }

  // Create product
  const product = await Product.create({
    name,
    description,
    shortDescription,
    sku,
    price,
    comparePrice,
    costPrice,
    weight,
    dimensions,
    status,
    featured,
    metaTitle,
    metaDescription
  });

  // Add categories
  if (categoryIds && categoryIds.length > 0) {
    const categories = await Category.findAll({
      where: { id: categoryIds }
    });
    await product.setCategories(categories);
  }

  // Create inventory record
  if (inventory) {
    await Inventory.create({
      productId: product.id,
      quantity: inventory.quantity || 0,
      lowStockThreshold: inventory.lowStockThreshold || 10,
      trackQuantity: inventory.trackQuantity !== false
    });
  }

  // Load product with associations
  await product.reload({
    include: [
      {
        model: Category,
        as: 'categories',
        through: { attributes: [] }
      },
      {
        model: Inventory,
        as: 'inventory'
      }
    ]
  });

  res.status(201).json({
    status: 'success',
    message: 'Product created successfully',
    data: {
      product
    }
  });
});

/**
 * Update product (Admin only)
 */
export const updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const product = await Product.findByPk(id);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Check SKU uniqueness if being updated
  if (updateData.sku && updateData.sku !== product.sku) {
    const existingProduct = await Product.findBySku(updateData.sku);
    if (existingProduct) {
      throw new ValidationError('SKU already exists');
    }
  }

  // Update product
  await product.update(updateData);

  // Update categories if provided
  if (updateData.categoryIds) {
    const categories = await Category.findAll({
      where: { id: updateData.categoryIds }
    });
    await product.setCategories(categories);
  }

  // Update inventory if provided
  if (updateData.inventory) {
    const inventory = await Inventory.findOne({
      where: { productId: product.id }
    });

    if (inventory) {
      await inventory.update(updateData.inventory);
    } else {
      await Inventory.create({
        productId: product.id,
        ...updateData.inventory
      });
    }
  }

  // Load updated product with associations
  await product.reload({
    include: [
      {
        model: ProductImage,
        as: 'images',
        order: [['sortOrder', 'ASC']]
      },
      {
        model: Category,
        as: 'categories',
        through: { attributes: [] }
      },
      {
        model: Inventory,
        as: 'inventory'
      }
    ]
  });

  res.json({
    status: 'success',
    message: 'Product updated successfully',
    data: {
      product
    }
  });
});

/**
 * Delete product (Admin only)
 */
export const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByPk(id);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  await product.destroy();

  res.json({
    status: 'success',
    message: 'Product deleted successfully'
  });
});

/**
 * Update product status (Staff/Admin)
 */
export const updateProductStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const product = await Product.findByPk(id);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  await product.update({ status });

  res.json({
    status: 'success',
    message: 'Product status updated successfully',
    data: {
      product: {
        id: product.id,
        name: product.name,
        status: product.status
      }
    }
  });
});

/**
 * Get products by category
 */
export const getProductsByCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const { page = 1, limit = 12, sort = 'created_at', order = 'desc' } = req.query;

  const offset = (page - 1) * limit;

  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw new NotFoundError('Category not found');
  }

  const { count, rows: products } = await Product.findAndCountAll({
    include: [
      {
        model: Category,
        as: 'categories',
        where: { id: categoryId },
        through: { attributes: [] },
        required: true
      },
      {
        model: ProductImage,
        as: 'images',
        where: { isPrimary: true },
        required: false,
        limit: 1
      },
      {
        model: Inventory,
        as: 'inventory'
      }
    ],
    where: { status: 'active' },
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [[sort, order.toUpperCase()]],
    distinct: true
  });

  const totalPages = Math.ceil(count / limit);

  res.json({
    status: 'success',
    data: {
      category,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});
