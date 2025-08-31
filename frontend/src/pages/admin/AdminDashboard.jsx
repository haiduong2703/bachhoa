import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
  BarChart3,
  Settings
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const AdminDashboard = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0
  })

  // Mock data - in real app, fetch from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalUsers: 1247,
        totalProducts: 156,
        totalOrders: 892,
        totalRevenue: 45678900,
        pendingOrders: 23,
        lowStockProducts: 8
      })
    }, 1000)
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue', link }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
      {link && (
        <div className="mt-4">
          <Link
            to={link}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Xem chi tiết →
          </Link>
        </div>
      )}
    </div>
  )

  const QuickAction = ({ title, description, icon: Icon, link, color = 'blue' }) => (
    <Link
      to={link}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 mr-4`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chào mừng, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Tổng quan hệ thống Bach Hoa Store
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/admin/reports"
            className="btn btn-outline flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Báo cáo</span>
          </Link>
          <Link
            to="/admin/settings"
            className="btn btn-outline flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Cài đặt</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng người dùng"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend="up"
          trendValue="+12% so với tháng trước"
          color="blue"
          link="/admin/users"
        />
        <StatCard
          title="Tổng sản phẩm"
          value={stats.totalProducts.toLocaleString()}
          icon={Package}
          trend="up"
          trendValue="+5 sản phẩm mới"
          color="green"
          link="/admin/products"
        />
        <StatCard
          title="Tổng đơn hàng"
          value={stats.totalOrders.toLocaleString()}
          icon={ShoppingCart}
          trend="up"
          trendValue="+8% so với tuần trước"
          color="purple"
          link="/admin/orders"
        />
        <StatCard
          title="Doanh thu"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          trend="up"
          trendValue="+15% so với tháng trước"
          color="yellow"
          link="/admin/reports"
        />
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-full mr-4">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-900">
                Đơn hàng chờ xử lý
              </h3>
              <p className="text-orange-700">
                {stats.pendingOrders} đơn hàng cần được xử lý
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/admin/orders?status=pending"
              className="text-sm text-orange-600 hover:text-orange-800 font-medium"
            >
              Xem đơn hàng →
            </Link>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-full mr-4">
              <Package className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900">
                Sản phẩm sắp hết hàng
              </h3>
              <p className="text-red-700">
                {stats.lowStockProducts} sản phẩm cần nhập thêm
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/admin/products?filter=low-stock"
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Xem sản phẩm →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickAction
            title="Thêm sản phẩm mới"
            description="Tạo sản phẩm mới cho cửa hàng"
            icon={Plus}
            link="/admin/products/new"
            color="green"
          />
          <QuickAction
            title="Quản lý đơn hàng"
            description="Xem và xử lý đơn hàng"
            icon={ShoppingCart}
            link="/admin/orders"
            color="blue"
          />
          <QuickAction
            title="Quản lý người dùng"
            description="Xem danh sách người dùng"
            icon={Users}
            link="/admin/users"
            color="purple"
          />
          <QuickAction
            title="Quản lý danh mục"
            description="Tổ chức danh mục sản phẩm"
            icon={Package}
            link="/admin/categories"
            color="indigo"
          />
          <QuickAction
            title="Xem báo cáo"
            description="Phân tích doanh thu và hiệu suất"
            icon={BarChart3}
            link="/admin/reports"
            color="yellow"
          />
          <QuickAction
            title="Cài đặt hệ thống"
            description="Cấu hình và tùy chỉnh"
            icon={Settings}
            link="/admin/settings"
            color="gray"
          />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
