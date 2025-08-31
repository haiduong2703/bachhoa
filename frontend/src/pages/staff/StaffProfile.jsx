import { useState, useEffect } from 'react'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Key
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const StaffProfile = () => {
  const { user, updateProfile } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      })
    }
  }, [user])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      })
    }
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      // await updateProfile(formData)
      toast.success('Cập nhật thông tin thành công')
      setIsEditing(false)
    } catch (error) {
      toast.error('Không thể cập nhật thông tin')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRoleBadge = (roles) => {
    if (!roles || roles.length === 0) return null

    const role = roles[0]
    const roleConfig = {
      admin: { color: 'purple', text: 'Quản trị viên' },
      staff: { color: 'blue', text: 'Nhân viên' },
      customer: { color: 'gray', text: 'Khách hàng' }
    }

    const config = roleConfig[role.name] || roleConfig.customer

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Shield className="w-4 h-4 mr-1" />
        {config.text}
      </span>
    )
  }

  if (!user) {
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
          <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
          <p className="text-gray-600 mt-1">
            Quản lý thông tin tài khoản của bạn
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Chỉnh sửa</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-600">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </span>
                  )}
                </div>
                <button className="absolute bottom-4 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600 mb-4">{user.email}</p>

              <div className="mb-4">
                {getRoleBadge(user.roles)}
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Tham gia: {formatDate(user.created_at)}</span>
                </div>
                {user.lastLogin && (
                  <div className="flex items-center justify-center">
                    <span>Đăng nhập cuối: {formatDate(user.lastLogin)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Đơn hàng đã xử lý</span>
                <span className="font-semibold text-gray-900">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Khách hàng đã phục vụ</span>
                <span className="font-semibold text-gray-900">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Đánh giá trung bình</span>
                <span className="font-semibold text-gray-900">5.0 ⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Thông tin chi tiết</h3>
              {isEditing && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCancel}
                    className="btn btn-outline btn-sm flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Hủy</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="btn btn-primary btn-sm flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Lưu</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input"
                  />
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">{user.firstName || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input"
                  />
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">{user.lastName || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-900">{user.email}</span>
                  {user.emailVerified && (
                    <span className="ml-2 text-green-600 text-sm">✓ Đã xác thực</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input"
                  />
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">{user.phone || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="input resize-none"
                  />
                ) : (
                  <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-400 mr-3 mt-0.5" />
                    <span className="text-gray-900">{user.address || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bảo mật</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <Key className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Mật khẩu</p>
                    <p className="text-sm text-gray-500">Cập nhật lần cuối: {formatDate(user.updated_at)}</p>
                  </div>
                </div>
                <button className="btn btn-outline btn-sm">
                  Đổi mật khẩu
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Xác thực 2 bước</p>
                    <p className="text-sm text-gray-500">Tăng cường bảo mật tài khoản</p>
                  </div>
                </div>
                <button className="btn btn-outline btn-sm">
                  Kích hoạt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffProfile
