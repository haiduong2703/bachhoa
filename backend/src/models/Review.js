import { DataTypes } from 'sequelize';
import sequelize from '../database/config.js';

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'product_id'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'order_id'
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  helpfulCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'helpful_count'
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Instance methods
Review.prototype.approve = function() {
  this.status = 'approved';
  return this.save();
};

Review.prototype.reject = function() {
  this.status = 'rejected';
  return this.save();
};

Review.prototype.incrementHelpful = function() {
  this.helpfulCount += 1;
  return this.save();
};

// Static methods
Review.getAverageRating = async function(productId) {
  const result = await this.findOne({
    where: { 
      productId,
      status: 'approved'
    },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews']
    ],
    raw: true
  });
  
  return {
    averageRating: parseFloat(result.averageRating) || 0,
    totalReviews: parseInt(result.totalReviews) || 0
  };
};

Review.getRatingDistribution = async function(productId) {
  const distribution = await this.findAll({
    where: { 
      productId,
      status: 'approved'
    },
    attributes: [
      'rating',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['rating'],
    raw: true
  });
  
  // Convert to object: { 5: 10, 4: 5, 3: 2, 2: 1, 1: 0 }
  const result = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  distribution.forEach(item => {
    result[item.rating] = parseInt(item.count);
  });
  
  return result;
};

export default Review;
