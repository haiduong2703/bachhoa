import { useState } from 'react'
import { Star, Upload, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const ReviewForm = ({ productId, orderId, onReviewSubmitted, onCancel }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    images: []
  })
  const [hoveredRating, setHoveredRating] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, rating })
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Validate
    if (formData.images.length + files.length > 5) {
      toast.error('Tối đa 5 ảnh')
      return
    }

    setUploading(true)
    try {
      const uploadedImages = []
      for (const file of files) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)
        formDataUpload.append('type', 'review')

        const response = await api.post('/uploads/image', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        if (response.data.status === 'success') {
          uploadedImages.push(response.data.data.url)
        }
      }

      setFormData({
        ...formData,
        images: [...formData.images, ...uploadedImages]
      })
      toast.success('Upload ảnh thành công')
    } catch (error) {
      toast.error('Upload ảnh thất bại')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/reviews', {
        productId,
        orderId,
        ...formData
      })

      toast.success('Đánh giá thành công!')
      onReviewSubmitted()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đánh giá thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Viết đánh giá của bạn
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Stars */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đánh giá của bạn *
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleRatingClick(rating)}
                onMouseEnter={() => setHoveredRating(rating)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    rating <= (hoveredRating || formData.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {formData.rating > 0 && (
              <span className="text-sm text-gray-600 ml-2">
                {formData.rating === 5 && 'Tuyệt vời'}
                {formData.rating === 4 && 'Tốt'}
                {formData.rating === 3 && 'Bình thường'}
                {formData.rating === 2 && 'Tệ'}
                {formData.rating === 1 && 'Rất tệ'}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề đánh giá
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Tóm tắt đánh giá của bạn"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung đánh giá
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hình ảnh (Tối đa 5 ảnh)
          </label>
          
          {/* Preview Images */}
          {formData.images.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {formData.images.length < 5 && (
            <div>
              <input
                type="file"
                id="review-images"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="review-images"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm">
                  {uploading ? 'Đang upload...' : 'Chọn ảnh'}
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting || formData.rating === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default ReviewForm
