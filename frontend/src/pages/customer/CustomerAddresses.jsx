import { useState, useEffect } from 'react'
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Star,
  Phone,
  User,
  Home,
  Building,
  X,
  Save
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const CustomerAddresses = () => {
  const { user } = useAuthStore()
  const [addresses, setAddresses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhone: '',
    addressLine1: '',
    addressLine2: '',
    ward: '',
    district: '',
    city: '',
    postalCode: '',
    type: 'home',
    isDefault: false
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      setIsLoading(true)
      // Mock data - in real app, fetch from API
      const mockAddresses = [
        {
          id: 1,
          recipientName: 'Khách Hàng',
          recipientPhone: '0123456787',
          addressLine1: '123 Đường ABC',
          addressLine2: '',
          ward: 'Phường 1',
          district: 'Quận 1',
          city: 'TP.HCM',
          postalCode: '70000',
          type: 'home',
          isDefault: true,
          created_at: '2025-08-22T07:26:05.000Z'
        }
      ]
      setAddresses(mockAddresses)
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
      toast.error('Không thể tải danh sách địa chỉ')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const resetForm = () => {
    setFormData({
      recipientName: '',
      recipientPhone: '',
      addressLine1: '',
      addressLine2: '',
      ward: '',
      district: '',
      city: '',
      postalCode: '',
      type: 'home',
      isDefault: false
    })
    setShowAddForm(false)
    setEditingAddress(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingAddress) {
        // Update existing address
        setAddresses(addresses.map(addr =>
          addr.id === editingAddress.id
            ? { ...addr, ...formData, updated_at: new Date().toISOString() }
            : addr
        ))
        toast.success('Cập nhật địa chỉ thành công')
      } else {
        // Add new address
        const newAddress = {
          id: Date.now(),
          ...formData,
          created_at: new Date().toISOString()
        }

        // If this is set as default, remove default from others
        if (formData.isDefault) {
          setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })))
        }

        setAddresses(prev => [...prev, newAddress])
        toast.success('Thêm địa chỉ thành công')
      }

      resetForm()
    } catch (error) {
      toast.error('Không thể lưu địa chỉ')
    }
  }

  const handleEdit = (address) => {
    setFormData({
      recipientName: address.recipientName,
      recipientPhone: address.recipientPhone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      ward: address.ward,
      district: address.district,
      city: address.city,
      postalCode: address.postalCode || '',
      type: address.type,
      isDefault: address.isDefault
    })
    setEditingAddress(address)
    setShowAddForm(true)
  }

  const handleDelete = async (addressId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return

    try {
      setAddresses(addresses.filter(addr => addr.id !== addressId))
      toast.success('Xóa địa chỉ thành công')
    } catch (error) {
      toast.error('Không thể xóa địa chỉ')
    }
  }

  const handleSetDefault = async (addressId) => {
    try {
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      })))
      toast.success('Đã đặt làm địa chỉ mặc định')
    } catch (error) {
      toast.error('Không thể đặt địa chỉ mặc định')
    }
  }

  const getAddressTypeIcon = (type) => {
    switch (type) {
      case 'home':
        return <Home className="w-4 h-4" />
      case 'office':
        return <Building className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  const getAddressTypeText = (type) => {
    switch (type) {
      case 'home':
        return 'Nhà riêng'
      case 'office':
        return 'Văn phòng'
      default:
        return 'Khác'
    }
  }

  const AddressCard = ({ address }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            {getAddressTypeIcon(address.type)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{getAddressTypeText(address.type)}</h3>
            {address.isDefault && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                <Star className="w-3 h-3 mr-1" />
                Mặc định
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(address)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(address.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-900">
          <User className="w-4 h-4 mr-2 text-gray-400" />
          <span className="font-medium">{address.recipientName}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Phone className="w-4 h-4 mr-2 text-gray-400" />
          <span>{address.recipientPhone}</span>
        </div>
        <div className="flex items-start text-gray-600">
          <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
          <div>
            <div>{address.addressLine1}</div>
            {address.addressLine2 && <div>{address.addressLine2}</div>}
            <div>{address.ward}, {address.district}, {address.city}</div>
            {address.postalCode && <div>Mã bưu điện: {address.postalCode}</div>}
          </div>
        </div>
      </div>

      {!address.isDefault && (
        <button
          onClick={() => handleSetDefault(address.id)}
          className="btn btn-outline btn-sm w-full"
        >
          Đặt làm mặc định
        </button>
      )}
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
          <h1 className="text-2xl font-bold text-gray-900">Sổ địa chỉ</h1>
          <p className="text-gray-600 mt-1">
            Quản lý địa chỉ giao hàng của bạn
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm địa chỉ</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </h2>
            <button
              onClick={resetForm}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên người nhận *
                </label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="recipientPhone"
                  value={formData.recipientPhone}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ cụ thể *
              </label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleInputChange}
                className="input"
                placeholder="Số nhà, tên đường..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ bổ sung
              </label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleInputChange}
                className="input"
                placeholder="Tòa nhà, căn hộ... (tùy chọn)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phường/Xã *
                </label>
                <input
                  type="text"
                  name="ward"
                  value={formData.ward}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quận/Huyện *
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tỉnh/Thành phố *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã bưu điện
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại địa chỉ
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="home">Nhà riêng</option>
                  <option value="office">Văn phòng</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Đặt làm địa chỉ mặc định
              </label>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                className="btn btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{editingAddress ? 'Cập nhật' : 'Thêm địa chỉ'}</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-outline"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses List */}
      <div>
        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map(address => (
              <AddressCard key={address.id} address={address} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Chưa có địa chỉ nào được lưu</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              Thêm địa chỉ đầu tiên
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerAddresses
