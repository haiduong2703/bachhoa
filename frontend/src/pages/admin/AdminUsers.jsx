import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Users,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Phone,
  Calendar,
  MoreHorizontal
} from 'lucide-react'
import { usersAPI } from '../../services/api'
import toast from 'react-hot-toast'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      // Since backend users API is not fully implemented, use mock data for now
      // but structure it like real API response
      const mockUsers = [
        {
          id: 1,
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@bachhoa.com',
          phone: '0123456789',
          avatar: null,
          emailVerified: true,
          status: 'active',
          lastLogin: '2025-08-22T05:44:18.000Z',
          created_at: '2025-08-22T00:26:05.000Z',
          updated_at: '2025-08-22T05:44:18.000Z',
          roles: [{ id: 1, name: 'admin', description: 'Administrator' }]
        },
        {
          id: 2,
          firstName: 'Staff',
          lastName: 'Member',
          email: 'staff@bachhoa.com',
          phone: '0123456788',
          avatar: null,
          emailVerified: true,
          status: 'active',
          lastLogin: null,
          created_at: '2025-08-22T00:26:05.000Z',
          updated_at: '2025-08-22T00:26:05.000Z',
          roles: [{ id: 2, name: 'staff', description: 'Staff member' }]
        },
        {
          id: 3,
          firstName: 'Khách',
          lastName: 'Hàng',
          email: 'customer@bachhoa.com',
          phone: '0123456787',
          avatar: null,
          emailVerified: true,
          status: 'active',
          lastLogin: '2025-08-22T05:38:00.000Z',
          created_at: '2025-08-22T00:26:05.000Z',
          updated_at: '2025-08-22T05:38:00.000Z',
          roles: [{ id: 3, name: 'customer', description: 'Customer' }]
        },
        {
          id: 4,
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '0123456789',
          avatar: null,
          emailVerified: false,
          status: 'active',
          lastLogin: null,
          created_at: '2025-08-22T05:37:02.000Z',
          updated_at: '2025-08-22T05:37:02.000Z',
          roles: [{ id: 3, name: 'customer', description: 'Customer' }]
        }
      ]
      setUsers(mockUsers)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Không thể tải danh sách người dùng')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await usersAPI.updateUserStatus(userId, newStatus)
      toast.success('Cập nhật trạng thái thành công')
      fetchUsers() // Refresh data
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = !roleFilter ||
                       user.roles?.some(role => role.name === roleFilter)
    const matchesStatus = !statusFilter || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]

    if (sortBy === 'name') {
      aValue = `${a.firstName} ${a.lastName}`
      bValue = `${b.firstName} ${b.lastName}`
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'green', text: 'Hoạt động', icon: UserCheck },
      inactive: { color: 'red', text: 'Tạm khóa', icon: UserX },
      pending: { color: 'yellow', text: 'Chờ xác thực', icon: Users }
    }

    const config = statusConfig[status] || statusConfig.active
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    )
  }

  const getRoleBadge = (roles) => {
    if (!roles || roles.length === 0) return null

    const role = roles[0] // Show primary role
    const roleConfig = {
      admin: { color: 'purple', text: 'Quản trị viên' },
      staff: { color: 'blue', text: 'Nhân viên' },
      customer: { color: 'gray', text: 'Khách hàng' }
    }

    const config = roleConfig[role.name] || roleConfig.customer

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Shield className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const UserRow = ({ user }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              {user.avatar ? (
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                />
              ) : (
                <span className="text-sm font-medium text-gray-600">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </span>
              )}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              {user.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 flex items-center">
          <Phone className="w-3 h-3 mr-1" />
          {user.phone || 'Chưa cập nhật'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getRoleBadge(user.roles)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(user.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(user.created_at)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.lastLogin ? formatDate(user.lastLogin) : 'Chưa đăng nhập'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            className="text-blue-600 hover:text-blue-900"
            title="Xem chi tiết"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className="text-indigo-600 hover:text-indigo-900"
            title="Chỉnh sửa"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleStatusChange(
              user.id,
              user.status === 'active' ? 'inactive' : 'active'
            )}
            className={`${
              user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
            }`}
            title={user.status === 'active' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
          >
            {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </button>
        </div>
      </td>
    </tr>
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600 mt-1">
            Quản lý tài khoản người dùng trong hệ thống
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input"
            >
              <option value="">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="staff">Nhân viên</option>
              <option value="customer">Khách hàng</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm khóa</option>
              <option value="pending">Chờ xác thực</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <UserCheck className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Quản trị viên</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.roles?.some(r => r.name === 'admin')).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <UserX className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tạm khóa</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lần cuối đăng nhập
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedUsers.length > 0 ? (
                sortedUsers.map(user => (
                  <UserRow key={user.id} user={user} />
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Không tìm thấy người dùng nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminUsers
