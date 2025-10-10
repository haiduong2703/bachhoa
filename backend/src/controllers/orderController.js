import { Order, OrderItem, Product, User, Inventory, ProductImage } from '../models/index.js';
import { catchAsync, ValidationError, NotFoundError } from '../utils/errors.js';
import { Op } from 'sequelize';
import sequelize from '../database/config.js';

/**
 * Get all orders with filtering, sorting, and pagination
 */
export const getOrders = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    paymentStatus,
    userId,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const offset = (page - 1) * limit;
  const where = {};

  // Build where conditions
  if (status) {
    where.status = status;
  }

  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  // If user is customer, only show their orders
  // If user is staff/admin and userId is provided, filter by that userId
  if (req.user.role === 'customer') {
    where.userId = req.user.id;
  } else if (userId) {
    where.userId = userId;
  }

  if (search) {
    where[Op.or] = [
      { orderNumber: { [Op.like]: `%${search}%` } },
      { '$User.firstName$': { [Op.like]: `%${search}%` } },
      { '$User.lastName$': { [Op.like]: `%${search}%` } },
      { '$User.email$': { [Op.like]: `%${search}%` } }
    ];
  }

  const { count, rows: orders } = await Order.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
      },
      {
        model: OrderItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku', 'price', 'slug'],
            include: [
              {
                model: ProductImage,
                as: 'images',
                where: { isPrimary: true },
                required: false,
                limit: 1
              }
            ]
          }
        ]
      }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [[sortBy, sortOrder.toUpperCase()]],
    distinct: true
  });

  const totalPages = Math.ceil(count / limit);

  res.json({
    status: 'success',
    data: {
      orders,
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
 * Get single order by ID
 */
export const getOrder = catchAsync(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findByPk(id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
      },
      {
        model: OrderItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku', 'price', 'slug'],
            include: [
              {
                model: ProductImage,
                as: 'images',
                where: { isPrimary: true },
                required: false,
                limit: 1
              }
            ]
          }
        ]
      }
    ]
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  res.json({
    status: 'success',
    data: {
      order
    }
  });
});

/**
 * Create new order
 */
export const createOrder = catchAsync(async (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items,
    paymentMethod = 'cod',
    subtotal,
    shippingFee = 0,
    total,
    notes,
    couponCode,
    discountAmount = 0
  } = req.body;

  // Validate required fields
  if (!customerName || !customerEmail || !customerPhone) {
    throw new ValidationError('Customer information is required');
  }

  if (!shippingAddress || !shippingAddress.addressLine1) {
    throw new ValidationError('Shipping address is required');
  }

  if (!items || items.length === 0) {
    throw new ValidationError('Order items are required');
  }

  // Start transaction
  const transaction = await sequelize.transaction();

  try {
    // Find or create user (for guest orders, we might create a temporary user)
    let user;
    if (req.user) {
      // Authenticated user
      user = req.user;
    } else {
      // Guest user - find existing or create new
      user = await User.findOne({
        where: { email: customerEmail },
        transaction
      });

      if (!user) {
        // Create guest user
        const [firstName, ...lastNameParts] = customerName.split(' ');
        const lastName = lastNameParts.join(' ') || '';

        user = await User.create({
          firstName,
          lastName,
          email: customerEmail,
          phone: customerPhone,
          password: 'guest_user', // Placeholder password
          emailVerified: false,
          status: 'active'
        }, { transaction });
      }
    }

    // Validate products and check inventory
    const productIds = items.map(item => item.productId);
    const products = await Product.findAll({
      where: { id: { [Op.in]: productIds } },
      include: [
        {
          model: Inventory,
          as: 'inventory'
        }
      ],
      transaction
    });

    if (products.length !== items.length) {
      throw new ValidationError('Some products not found');
    }

    // Check inventory and calculate totals
    let calculatedSubtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new ValidationError(`Product ${item.productId} not found`);
      }

      if (product.status !== 'active') {
        throw new ValidationError(`Product ${product.name} is not available`);
      }

      const availableQuantity = product.inventory?.quantity || 0;
      if (availableQuantity < item.quantity) {
        throw new ValidationError(`Insufficient stock for ${product.name}. Available: ${availableQuantity}`);
      }

      const itemTotal = product.price * item.quantity;
      calculatedSubtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal
      });

      // Update inventory
      await Inventory.update(
        {
          quantity: availableQuantity - item.quantity,
          reservedQuantity: (product.inventory?.reservedQuantity || 0) + item.quantity
        },
        {
          where: { productId: item.productId },
          transaction
        }
      );
    }

    // Generate unique order number
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create order
    const order = await Order.create({
      orderNumber,
      userId: user.id,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod,
      subtotal: calculatedSubtotal,
      shippingAmount: shippingFee,
      discountAmount,
      totalAmount: total,
      currency: 'VND',
      notes,
      shippingAddress,
      billingAddress: shippingAddress // Use same as shipping for now
    }, { transaction });

    // Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      orderId: order.id
    }));

    await OrderItem.bulkCreate(orderItemsWithOrderId, { transaction });

    // Commit transaction
    await transaction.commit();

    // Fetch complete order with relations
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'sku', 'price']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: {
        order: completeOrder
      }
    });

  } catch (error) {
    // Rollback transaction
    await transaction.rollback();
    throw error;
  }
});

/**
 * Update order status
 */
export const updateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findByPk(id);
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Validate status transition
  const validStatuses = ['pending', 'confirmed', 'packing', 'shipping', 'delivered', 'cancelled', 'returned'];
  if (!validStatuses.includes(status)) {
    throw new ValidationError('Invalid order status');
  }

  await order.update({ status });

  res.json({
    status: 'success',
    message: 'Order status updated successfully',
    data: {
      order
    }
  });
});

/**
 * Cancel order
 */
export const cancelOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await Order.findByPk(id, {
    include: [
      {
        model: OrderItem,
        as: 'items'
      }
    ]
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (!order.canBeCancelled()) {
    throw new ValidationError('Order cannot be cancelled');
  }

  const transaction = await sequelize.transaction();

  try {
    // Update order status
    await order.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: reason
    }, { transaction });

    // Restore inventory
    for (const item of order.items) {
      await Inventory.increment(
        { quantity: item.quantity },
        {
          where: { productId: item.productId },
          transaction
        }
      );
    }

    await transaction.commit();

    res.json({
      status: 'success',
      message: 'Order cancelled successfully',
      data: {
        order
      }
    });

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * Track order by order number
 */
export const trackOrder = catchAsync(async (req, res) => {
  const { orderNumber } = req.params;

  const order = await Order.findOne({
    where: { orderNumber },
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku']
          }
        ]
      }
    ]
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  res.json({
    status: 'success',
    data: {
      order
    }
  });
});
