import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Folder,
  FolderOpen,
  Image,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react'
import useProductStore from '../../store/productStore'
import { categoriesAPI } from '../../services/api'
import toast from 'react-hot-toast'

const AdminCategories = () => {
  const { categories, fetchCategories } = useProductStore()
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: null,
    image: '',
    status: 'active'
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      await fetchCategories()
    } catch (error) {
      toast.error('Không thể tải danh sách danh mục')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    try {
      await categoriesAPI.createCategory(formData)
      toast.success('Tạo danh mục thành công')
      setShowCreateModal(false)
      resetForm()
      loadCategories()
    } catch (error) {
      toast.error('Không thể tạo danh mục')
    }
  }

  const handleUpdateCategory = async (e) => {
    e.preventDefault()
    try {
      await categoriesAPI.updateCategory(editingCategory.id, formData)
      toast.success('Cập nhật danh mục thành công')
      setEditingCategory(null)
      resetForm()
      loadCategories()
    } catch (error) {
      toast.error('Không thể cập nhật danh mục')
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return

    try {
      await categoriesAPI.deleteCategory(categoryId)
      toast.success('Xóa danh mục thành công')
      loadCategories()
    } catch (error) {
      toast.error('Không thể xóa danh mục')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parentId: null,
      image: '',
      status: 'active'
    })
  }

  const openEditModal = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId,
      image: category.image || '',
      status: category.status
    })
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Build category tree
  const buildCategoryTree = (categories, parentId = null) => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .map(cat => ({
        ...cat,
        children: buildCategoryTree(categories, cat.id)
      }))
  }

  const categoryTree = buildCategoryTree(filteredCategories)

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'green', text: 'Hoạt động', icon: CheckCircle },
      inactive: { color: 'red', text: 'Tạm dừng', icon: XCircle }
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

  const CategoryRow = ({ category, level = 0 }) => (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
            {level > 0 && <ArrowRight className="w-4 h-4 text-gray-400 mr-2" />}
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10">
                {category.image ? (
                  <img
                    className="h-10 w-10 rounded-lg object-cover"
                    src={category.image}
                    alt={category.name}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Folder className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">{category.name}</div>
                <div className="text-sm text-gray-500">{category.description}</div>
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {category.parentId ?
              categories.find(c => c.id === category.parentId)?.name || 'Không tìm thấy' :
              'Danh mục gốc'
            }
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {getStatusBadge(category.status)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {new Date(category.created_at).toLocaleDateString('vi-VN')}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => openEditModal(category)}
              className="text-indigo-600 hover:text-indigo-900"
              title="Chỉnh sửa"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="text-red-600 hover:text-red-900"
              title="Xóa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
      {category.children?.map(child => (
        <CategoryRow key={child.id} category={child} level={level + 1} />
      ))}
    </>
  )

  const CategoryModal = ({ isOpen, onClose, onSubmit, title }) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <form onSubmit={onSubmit}>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {title}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên danh mục *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="input"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục cha
                    </label>
                    <select
                      value={formData.parentId || ''}
                      onChange={(e) => setFormData({...formData, parentId: e.target.value || null})}
                      className="input"
                    >
                      <option value="">Danh mục gốc</option>
                      {categories.filter(cat => cat.id !== editingCategory?.id).map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình ảnh (URL)
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="input"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="input"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm dừng</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  className="btn btn-primary sm:ml-3 sm:w-auto"
                >
                  {editingCategory ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline mt-3 sm:mt-0 sm:w-auto"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
          <p className="text-gray-600 mt-1">
            Quản lý danh mục sản phẩm trong cửa hàng
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Folder className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng danh mục</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <FolderOpen className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Danh mục gốc</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.filter(c => !c.parentId).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục cha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryTree.length > 0 ? (
                categoryTree.map(category => (
                  <CategoryRow key={category.id} category={category} />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Không tìm thấy danh mục nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <CategoryModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetForm()
        }}
        onSubmit={handleCreateCategory}
        title="Tạo danh mục mới"
      />

      {/* Edit Modal */}
      <CategoryModal
        isOpen={!!editingCategory}
        onClose={() => {
          setEditingCategory(null)
          resetForm()
        }}
        onSubmit={handleUpdateCategory}
        title="Chỉnh sửa danh mục"
      />
    </div>
  )
}

export default AdminCategories
