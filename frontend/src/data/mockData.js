// Mock data for development
export const mockCategories = [
  {
    id: 1,
    name: 'Thực phẩm tươi sống',
    slug: 'thuc-pham-tuoi-song',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    children: [
      {
        id: 2,
        name: 'Rau củ quả',
        slug: 'rau-cu-qua',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'
      },
      {
        id: 3,
        name: 'Thịt cá',
        slug: 'thit-ca',
        image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400'
      }
    ]
  },
  {
    id: 4,
    name: 'Đồ uống',
    slug: 'do-uong',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400'
  },
  {
    id: 5,
    name: 'Gia vị',
    slug: 'gia-vi',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400'
  }
]

export const mockProducts = [
  {
    id: 1,
    name: 'Cà chua bi',
    slug: 'ca-chua-bi',
    description: 'Cà chua bi tươi ngon, giàu vitamin C, thích hợp cho salad và nấu ăn',
    shortDescription: 'Cà chua bi tươi ngon',
    price: 25000,
    comparePrice: 30000,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1546470427-e5ac89cd0b31?w=400',
        alt: 'Cà chua bi tươi'
      }
    ],
    category: 'Rau củ quả',
    status: 'active',
    featured: true,
    inventory: {
      quantity: 100,
      inStock: true
    },
    rating: 4.5,
    reviewCount: 23
  },
  {
    id: 2,
    name: 'Thịt ba chỉ',
    slug: 'thit-ba-chi',
    description: 'Thịt ba chỉ tươi ngon, thích hợp nướng BBQ, kho braised',
    shortDescription: 'Thịt ba chỉ tươi',
    price: 120000,
    comparePrice: null,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
        alt: 'Thịt ba chỉ tươi'
      }
    ],
    category: 'Thịt cá',
    status: 'active',
    featured: true,
    inventory: {
      quantity: 50,
      inStock: true
    },
    rating: 4.8,
    reviewCount: 45
  },
  {
    id: 3,
    name: 'Coca Cola',
    slug: 'coca-cola',
    description: 'Nước ngọt Coca Cola 330ml, thương hiệu nổi tiếng thế giới',
    shortDescription: 'Coca Cola 330ml',
    price: 12000,
    comparePrice: 15000,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
        alt: 'Coca Cola 330ml'
      }
    ],
    category: 'Đồ uống',
    status: 'active',
    featured: false,
    inventory: {
      quantity: 200,
      inStock: true
    },
    rating: 4.2,
    reviewCount: 67
  },
  {
    id: 4,
    name: 'Muối tinh',
    slug: 'muoi-tinh',
    description: 'Muối tinh khiết 500g, không chứa tạp chất',
    shortDescription: 'Muối tinh 500g',
    price: 8000,
    comparePrice: null,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
        alt: 'Muối tinh 500g'
      }
    ],
    category: 'Gia vị',
    status: 'active',
    featured: false,
    inventory: {
      quantity: 80,
      inStock: true
    },
    rating: 4.0,
    reviewCount: 12
  },
  {
    id: 5,
    name: 'Cá hồi Na Uy',
    slug: 'ca-hoi-na-uy',
    description: 'Cá hồi Na Uy tươi ngon, giàu omega-3, thích hợp làm sashimi',
    shortDescription: 'Cá hồi Na Uy tươi',
    price: 350000,
    comparePrice: null,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400',
        alt: 'Cá hồi Na Uy tươi'
      }
    ],
    category: 'Thịt cá',
    status: 'active',
    featured: true,
    inventory: {
      quantity: 30,
      inStock: true
    },
    rating: 4.9,
    reviewCount: 89
  },
  {
    id: 6,
    name: 'Rau cải xanh',
    slug: 'rau-cai-xanh',
    description: 'Rau cải xanh tươi ngon, giàu vitamin và khoáng chất',
    shortDescription: 'Rau cải xanh tươi',
    price: 15000,
    comparePrice: 18000,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
        alt: 'Rau cải xanh tươi'
      }
    ],
    category: 'Rau củ quả',
    status: 'active',
    featured: false,
    inventory: {
      quantity: 150,
      inStock: true
    },
    rating: 4.3,
    reviewCount: 34
  }
]

export const mockOrders = [
  {
    id: 1,
    orderNumber: 'BH202412010001',
    status: 'delivered',
    paymentStatus: 'paid',
    totalAmount: 187000,
    createdAt: '2024-12-01T10:30:00Z',
    items: [
      {
        id: 1,
        product: mockProducts[0],
        quantity: 2,
        unitPrice: 25000,
        totalPrice: 50000
      },
      {
        id: 2,
        product: mockProducts[1],
        quantity: 1,
        unitPrice: 120000,
        totalPrice: 120000
      }
    ],
    shippingAddress: {
      recipientName: 'Nguyễn Văn A',
      recipientPhone: '0123456789',
      addressLine1: '123 Đường ABC',
      ward: 'Phường 1',
      district: 'Quận 1',
      city: 'TP.HCM'
    }
  },
  {
    id: 2,
    orderNumber: 'BH202412020002',
    status: 'shipping',
    paymentStatus: 'paid',
    totalAmount: 362000,
    createdAt: '2024-12-02T14:15:00Z',
    items: [
      {
        id: 3,
        product: mockProducts[4],
        quantity: 1,
        unitPrice: 350000,
        totalPrice: 350000
      }
    ],
    shippingAddress: {
      recipientName: 'Trần Thị B',
      recipientPhone: '0987654321',
      addressLine1: '456 Đường XYZ',
      ward: 'Phường 2',
      district: 'Quận 3',
      city: 'TP.HCM'
    }
  }
]

export const mockUser = {
  id: 1,
  email: 'customer@bachhoa.com',
  firstName: 'Khách',
  lastName: 'Hàng',
  phone: '0123456787',
  avatar: null,
  emailVerified: true,
  roles: [{ name: 'customer' }]
}

export const mockReviews = [
  {
    id: 1,
    productId: 1,
    user: {
      firstName: 'Nguyễn',
      lastName: 'Văn A'
    },
    rating: 5,
    title: 'Sản phẩm tuyệt vời',
    comment: 'Cà chua bi rất tươi ngon, giao hàng nhanh chóng. Sẽ mua lại!',
    createdAt: '2024-11-28T09:00:00Z',
    helpful: 12
  },
  {
    id: 2,
    productId: 1,
    user: {
      firstName: 'Trần',
      lastName: 'Thị B'
    },
    rating: 4,
    title: 'Chất lượng tốt',
    comment: 'Cà chua tươi, ngọt nước. Giá cả hợp lý.',
    createdAt: '2024-11-25T16:30:00Z',
    helpful: 8
  }
]

export const mockCoupons = [
  {
    id: 1,
    code: 'WELCOME10',
    name: 'Chào mừng khách hàng mới',
    description: 'Giảm 10% cho đơn hàng đầu tiên',
    type: 'percentage',
    value: 10,
    minimumOrderAmount: 100000,
    expiresAt: '2024-12-31T23:59:59Z'
  },
  {
    id: 2,
    code: 'FREESHIP',
    name: 'Miễn phí vận chuyển',
    description: 'Miễn phí vận chuyển cho đơn hàng từ 200k',
    type: 'fixed_amount',
    value: 30000,
    minimumOrderAmount: 200000,
    expiresAt: '2024-12-15T23:59:59Z'
  }
]

// Helper functions
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

export const getDiscountPercentage = (price, comparePrice) => {
  if (!comparePrice || comparePrice <= price) return 0
  return Math.round(((comparePrice - price) / comparePrice) * 100)
}

export const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    confirmed: 'info',
    packing: 'info',
    shipping: 'primary',
    delivered: 'success',
    cancelled: 'error',
    returned: 'error'
  }
  return colors[status] || 'default'
}

export const getStatusText = (status) => {
  const texts = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    packing: 'Đang đóng gói',
    shipping: 'Đang giao hàng',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
    returned: 'Đã trả hàng'
  }
  return texts[status] || status
}
