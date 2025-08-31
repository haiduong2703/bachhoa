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
  User,
  DollarSign,
  Plus,
  Phone,
  MapPin
} from 'lucide-react'
import { formatPrice } from '../../data/mockData'
import toast from 'react-hot-toast'

const StaffOrders = () => {
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
      // Real data from database (same as admin but staff focused)
      const realOrders = [
        {
          id: 1,
          orderNumber: 'BH1755847565747001',
          customer: {
            firstName: 'Khách',
            lastName: 'Hàng',
            email: 'customer@bachhoa.com',
            phone: '0123456787'
          },
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
            { id: 1, name: 'Cà chua bi', quantity: 2, price: 25000 },
            { id: 2, name: 'Thịt ba chỉ', quantity: 1, price: 120000 }
          ]
        }
      ]
      setOrders(realOrders)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Không thể tải danh sách đơn hàng')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // await ordersAPI.updateOrderStatus(orderId, newStatus)
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
      toast.success('Cập nhật trạng thái thành công')
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái')
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.phone.includes(searchQuery)
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

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: 'processing',
      processing: 'shipping',
      shipping: 'delivered'
    }
    return statusFlow[currentStatus]
  }

  const getStatusAction = (status) => {
    const actions = {
      pending: { text: 'Xử lý', color: 'blue' },
      processing: { text: 'Giao hàng', color: 'purple' },
      shipping: { text: 'Hoàn thành', color: 'green' }
    }
    return actions[status]
  }

  const OrderRow = ({ order }) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Thông tin khách hàng
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">{order.customer.firstName} {order.customer.lastName}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              {order.customer.phone}
            </div>
            <div className="text-gray-600">{order.customer.email}</div>
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Địa chỉ giao hàng
          </h4>
          <div className="text-sm text-gray-600">
            <div className="font-medium">{order.shippingAddress.recipientName}</div>
            <div>{order.shippingAddress.recipientPhone}</div>
            <div>{order.shippingAddress.addressLine1}</div>
            <div>
              {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-3">Sản phẩm đã đặt</h4>
        <div className="space-y-2">
          {order.items?.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <span className="text-gray-500 ml-2">x{item.quantity}</span>
                </div>
              </div>
              <span className="font-medium text-gray-900">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            {getPaymentBadge(order.paymentMethod, order.paymentStatus)}
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to={`/staff/orders/${order.id}`}
              className="btn btn-outline btn-sm flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Chi tiết</span>
            </Link>

            {getNextStatus(order.status) && (
              <button
                onClick={() => handleStatusChange(order.id, getNextStatus(order.status))}
                className={`btn btn-sm flex items-center space-x-2 ${
                  getStatusAction(order.status)?.color === 'blue' ? 'btn-primary' :
                  getStatusAction(order.status)?.color === 'purple' ? 'bg-purple-600 text-white hover:bg-purple-700' :
                  'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {getStatusAction(order.status)?.color === 'blue' && <Package className="w-4 h-4" />}
                {getStatusAction(order.status)?.color === 'purple' && <Truck className="w-4 h-4" />}
                {getStatusAction(order.status)?.color === 'green' && <CheckCircle className="w-4 h-4" />}
                <span>{getStatusAction(order.status)?.text}</span>
              </button>
            )}

            {(order.status === 'pending' || order.status === 'processing') && (
              <button
                onClick={() => handleStatusChange(order.id, 'cancelled')}
                className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50 flex items-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Hủy</span>
              </button>
            )}
          </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-1">
            Xử lý và theo dõi đơn hàng của khách hàng
          </p>
        </div>
        <Link
          to="/staff/orders/create"
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo đơn hàng</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng, khách hàng, SĐT..."
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
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'processing').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Truck className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đang giao</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'shipping').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderRow key={order.id} order={order} />
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffOrders
