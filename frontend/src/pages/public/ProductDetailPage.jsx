import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Star, ShoppingCart, Heart, Minus, Plus, ArrowLeft, Share2, Truck, Shield, RotateCcw } from 'lucide-react'
import useProductStore from '../../store/productStore'
import { useCartStore } from '../../store/cartStore'
import { formatPrice } from '../../data/mockData'
import toast from 'react-hot-toast'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const {
    currentProduct,
    isLoading,
    error,
    fetchProductById,
    clearCurrentProduct,
    clearError
  } = useProductStore()

  const { addItem, getItem } = useCartStore()

  useEffect(() => {
    if (id) {
      fetchProductById(id)
    }

    return () => {
      clearCurrentProduct()
      clearError()
    }
  }, [id, fetchProductById, clearCurrentProduct, clearError])

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (currentProduct?.inventory?.quantity || 0)) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    if (!currentProduct) return

    try {
      await addItem(currentProduct.id, quantity)
      toast.success(`Đã thêm ${quantity} ${currentProduct.name} vào giỏ hàng`)
    } catch (error) {
      toast.error('Không thể thêm sản phẩm vào giỏ hàng')
    }
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    toast.success(isWishlisted ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentProduct?.name,
          text: currentProduct?.shortDescription,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Đã sao chép link sản phẩm')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Quay lại danh sách sản phẩm
          </button>
        </div>
      </div>
    )
  }

  if (!currentProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Không tìm thấy sản phẩm</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Quay lại danh sách sản phẩm
          </button>
        </div>
      </div>
    )
  }

  const cartItem = getItem(currentProduct.id)
  const isInStock = currentProduct.inventory?.quantity > 0
  const discountPercentage = currentProduct.comparePrice
    ? Math.round(((currentProduct.comparePrice - currentProduct.price) / currentProduct.comparePrice) * 100)
    : 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-green-600">Trang chủ</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-green-600">Sản phẩm</Link>
        <span>/</span>
        <span className="text-gray-900">{currentProduct.name}</span>
      </nav>

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-green-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={currentProduct.images?.[selectedImageIndex]?.imageUrl || '/placeholder-product.jpg'}
              alt={currentProduct.images?.[selectedImageIndex]?.altText || currentProduct.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail Images */}
          {currentProduct.images && currentProduct.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {currentProduct.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square bg-gray-100 rounded overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-green-500' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.altText}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title and Rating */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentProduct.name}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-sm text-gray-500 ml-2">(4.0) • 24 đánh giá</span>
              </div>
              <span className="text-sm text-gray-500">SKU: {currentProduct.sku}</span>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-green-600">
                {formatPrice(currentProduct.price)}
              </span>
              {currentProduct.comparePrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(currentProduct.comparePrice)}
                  </span>
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                    -{discountPercentage}%
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500">Giá đã bao gồm VAT</p>
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isInStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`font-medium ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
              {isInStock ? `Còn ${currentProduct.inventory?.quantity} sản phẩm` : 'Hết hàng'}
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Mô tả sản phẩm</h3>
            <p className="text-gray-600 leading-relaxed">
              {currentProduct.description || currentProduct.shortDescription}
            </p>
          </div>

          {/* Quantity and Add to Cart */}
          {isInStock && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-900">Số lượng:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= (currentProduct.inventory?.quantity || 0)}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {cartItem && (
                  <span className="text-sm text-gray-500">
                    (Đã có {cartItem.quantity} trong giỏ hàng)
                  </span>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Thêm vào giỏ hàng</span>
                </button>
                <button
                  onClick={handleWishlist}
                  className={`p-3 border rounded-lg hover:bg-gray-50 ${
                    isWishlisted ? 'border-red-500 text-red-500' : 'border-gray-300 text-gray-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Giao hàng nhanh</p>
                  <p className="text-sm text-gray-500">Trong 2-4 giờ</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Đảm bảo chất lượng</p>
                  <p className="text-sm text-gray-500">Tươi ngon 100%</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Đổi trả dễ dàng</p>
                  <p className="text-sm text-gray-500">Trong 24 giờ</p>
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          {currentProduct.categories && currentProduct.categories.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-2">Danh mục:</h3>
              <div className="flex flex-wrap gap-2">
                {currentProduct.categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/categories/${category.slug}`}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
