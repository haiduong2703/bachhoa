import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Filter,
  Eye,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Calendar,
  DollarSign,
  RotateCcw,
  Star
} from 'lucide-react'
import { formatPrice } from '../../data/mockData'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const CustomerOrders = () => {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      // Real data from database - customer's orders
      const customerOrders = [
        {
          id: 1,
          orderNumber: 'BH1755847565747001',
          status: 'delivered',
          total: 187000,
          itemCount: 2,
          created_at: '2025-08-22T00:26:05.000Z',
          shippingAddress: {
            recipientName: 'Khách Hàng',
            recipientPhone: '0123456787',
            addressLine1: '123 Đường ABC',
            ward: 'Phường 1',
            district: 'Quận 1',
            city: 'TP.HCM'
          },
          paymentMethod: 'cod',
          paymentStatus: 'paid',
          items: [
            { id: 1, name: 'Cà chua bi', quantity: 2, price: 25000, image: 'https://images.unsplash.com/photo-1546470427-e5ac89cd0b31?w=400' },
            { id: 2, name: 'Thịt ba chỉ', quantity: 1, price: 120000, image: 'https://images.unsplash.com/photo-1588347818111-d3b9b4d0c9b5?w=400' }
          ],
          deliveredAt: '2025-08-22T10:30:00.000Z',
          canReview: true,
          canReorder: true
        }
      ]
      setOrders(customerOrders)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Không thể tải danh sách đơn hàng')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReorder = async (order) => {
    try {
      // Add all items from this order to cart
      // This would integrate with CartStore
      toast.success('Đã thêm sản phẩm vào giỏ hàng')
    } catch (error) {
      toast.error('Không thể đặt lại đơn hàng')
    }
  }

  const handleCancelOrder = async (orderId) => {
    try {
      // Call API to cancel order
      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, status: 'cancelled' }
          : order
      ))
      toast.success('Đã hủy đơn hàng')
    } catch (error) {
      toast.error('Không thể hủy đơn hàng')
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', text: 'Chờ xử lý', icon: Clock },
      processing: { color: 'blue', text: 'Đang xử lý', icon: Package },
      shipping: { color: 'purple', text: 'Đang giao', icon: Truck },
      delivered: { color: 'green', text: 'Đã giao', icon: CheckCircle },
      cancelled: { color: 'red', text: 'Đã hủy', icon: XCircle }
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    )
  }

  const getPaymentBadge = (method, status) => {
    const methodConfig = {
      cod: { color: 'gray', text: 'Tiền mặt' },
      online: { color: 'blue', text: 'Online' },
      bank: { color: 'green', text: 'Chuyển khoản' }
    }

    const config = methodConfig[method] || methodConfig.cod

    return (
      <div className="space-y-1">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
          {config.text}
        </span>
        {status === 'paid' && (
          <div className="text-xs text-green-600">✓ Đã thanh toán</div>
        )}
      </div>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const canCancelOrder = (status) => {
    return ['pending', 'processing'].includes(status)
  }

  const OrderCard = ({ order }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(order.created_at)}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Package className="w-4 h-4 mr-1" />
                {order.itemCount} sản phẩm
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          {getStatusBadge(order.status)}
          <div className="text-lg font-bold text-gray-900 mt-1">
            {formatPrice(order.total)}
          </div>
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="mb-4">
        <div className="flex items-center space-x-3 overflow-x-auto pb-2">
          {order.items?.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 min-w-0">
              <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                <img
                  src={item.image || '/placeholder-product.jpg'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">x{item.quantity}</p>
              </div>
            </div>
          ))}
          {order.items?.length > 3 && (
            <div className="text-sm text-gray-500 whitespace-nowrap">
              +{order.items.length - 3} sản phẩm khác
            </div>
          )}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Địa chỉ giao hàng</h4>
        <div className="text-sm text-gray-600">
          <div className="font-medium">{order.shippingAddress.recipientName}</div>
          <div>{order.shippingAddress.recipientPhone}</div>
          <div>
            {order.shippingAddress.addressLine1}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-4">
        {getPaymentBadge(order.paymentMethod, order.paymentStatus)}
      </div>

      {/* Delivery Status */}
      {order.status === 'delivered' && order.deliveredAt && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center text-green-800">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="font-medium">Đã giao thành công</span>
          </div>
          <div className="text-sm text-green-600 mt-1">
            Giao lúc: {formatDate(order.deliveredAt)}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <Link
            to={`/customer/orders/${order.id}`}
            className="btn btn-outline btn-sm flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Chi tiết</span>
          </Link>

          {order.canReorder && (
            <button
              onClick={() => handleReorder(order)}
              className="btn btn-outline btn-sm flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {order.canReview && order.status === 'delivered' && (
            <Link
              to={`/customer/reviews/create?order=${order.id}`}
              className="btn btn-primary btn-sm flex items-center space-x-2"
            >
              <Star className="w-4 h-4" />
              <span>Đánh giá</span>
            </Link>
          )}

          {canCancelOrder(order.status) && (
            <button
              onClick={() => handleCancelOrder(order.id)}
              className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50 flex items-center space-x-2"
            >
              <XCircle className="w-4 h-4" />
              <span>Hủy đơn</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi và quản lý các đơn hàng của bạn
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipping">Đang giao</option>
              <option value="delivered">Đã giao</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => ['pending', 'processing'].includes(o.status)).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đã giao</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng chi tiêu</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(orders.reduce((sum, order) => sum + order.total, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
            <Link
              to="/products"
              className="btn btn-primary mt-4"
            >
              Mua sắm ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerOrders
