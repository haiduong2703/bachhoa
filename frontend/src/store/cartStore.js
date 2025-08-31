import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cartAPI, productsAPI, couponsAPI } from '../services/api'
import { useAuthStore } from './authStore'
import toast from 'react-hot-toast'

const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      isLoading: false,
      coupon: null,

      // Computed values
      getItemCount: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      },

      getSubtotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },

      getTotal: () => {
        const { getSubtotal, coupon } = get()
        const subtotal = getSubtotal()
        let discount = 0
        
        if (coupon) {
          if (coupon.type === 'percentage') {
            discount = (subtotal * coupon.value) / 100
          } else if (coupon.type === 'fixed_amount') {
            discount = coupon.value
          }
        }
        
        return Math.max(0, subtotal - discount)
      },

      // Actions
      addItem: async (productId, quantity = 1) => {
        try {
          console.log('Adding item to cart:', { productId, quantity })

          // Use local storage for all users (server-side cart not implemented yet)
          const { items } = get()

          // Fetch product details
          console.log('Fetching product details for ID:', productId)
          const productResponse = await productsAPI.getProduct(productId)
          const product = productResponse.data.data.product
          console.log('Product fetched:', product)

          if (!product) {
            toast.error('Sản phẩm không tồn tại')
            return
          }

          if (product.status !== 'active') {
            toast.error('Sản phẩm không khả dụng')
            return
          }

          const existingItem = items.find(item => item.productId === productId)

          if (existingItem) {
            const newQuantity = existingItem.quantity + quantity
            console.log('Updating existing item quantity:', newQuantity)

            set({
              items: items.map(item =>
                item.productId === productId
                  ? { ...item, quantity: newQuantity }
                  : item
              )
            })
          } else {
            console.log('Adding new item to cart')
            set({
              items: [...items, {
                productId,
                name: product.name,
                price: parseFloat(product.price), // Ensure price is number
                image: product.images?.[0]?.imageUrl,
                quantity,
                slug: product.slug
              }]
            })
          }

          toast.success('Đã thêm vào giỏ hàng')
        } catch (error) {
          console.error('Failed to add item to cart:', error)
          toast.error('Không thể thêm sản phẩm vào giỏ hàng')
        }
      },

      updateQuantity: async (productId, quantity) => {
        try {
          // Use local storage for all users
          const { items } = get()

          if (quantity <= 0) {
            get().removeItem(productId)
            return
          }

          set({
            items: items.map(item =>
              item.productId === productId
                ? { ...item, quantity }
                : item
            )
          })
        } catch (error) {
          console.error('Failed to update cart item:', error)
          toast.error('Không thể cập nhật giỏ hàng')
        }
      },

      removeItem: async (productId) => {
        try {
          // Use local storage for all users
          const { items } = get()
          set({
            items: items.filter(item => item.productId !== productId)
          })

          toast.success('Đã xóa khỏi giỏ hàng')
        } catch (error) {
          console.error('Failed to remove cart item:', error)
          toast.error('Không thể xóa sản phẩm khỏi giỏ hàng')
        }
      },

      clearCart: async () => {
        try {
          const { isAuthenticated } = useAuthStore.getState()

          if (isAuthenticated) {
            // Use server-side cart for authenticated users
            await cartAPI.clear()
            await get().fetchCart()
          } else {
            // Use local storage for guest users
            set({ items: [], coupon: null })
          }

          toast.success('Đã xóa tất cả sản phẩm')
        } catch (error) {
          console.error('Failed to clear cart:', error)
          toast.error('Không thể xóa giỏ hàng')
        }
      },

      applyCoupon: async (couponCode) => {
        try {
          const { isAuthenticated } = useAuthStore.getState()

          if (isAuthenticated) {
            // Use server-side cart for authenticated users
            await cartAPI.applyCoupon(couponCode)
            await get().fetchCart()
          } else {
            // Validate coupon for guest users
            const response = await couponsAPI.validate(couponCode)
            const coupon = response.data.coupon

            const subtotal = get().getSubtotal()

            if (subtotal < coupon.minimumOrderAmount) {
              toast.error(`Đơn hàng tối thiểu ${coupon.minimumOrderAmount.toLocaleString('vi-VN')}đ`)
              return false
            }

            set({ coupon })
          }

          toast.success('Áp dụng mã giảm giá thành công')
          return true
        } catch (error) {
          console.error('Failed to apply coupon:', error)
          toast.error(error.response?.data?.message || 'Mã giảm giá không hợp lệ')
          return false
        }
      },

      removeCoupon: async () => {
        try {
          const { isAuthenticated } = useAuthStore.getState()

          if (isAuthenticated) {
            // Use server-side cart for authenticated users
            await cartAPI.removeCoupon()
            await get().fetchCart()
          } else {
            // Use local storage for guest users
            set({ coupon: null })
          }

          toast.success('Đã hủy mã giảm giá')
        } catch (error) {
          console.error('Failed to remove coupon:', error)
          toast.error('Không thể hủy mã giảm giá')
        }
      },

      // Fetch cart from server (for authenticated users)
      fetchCart: async () => {
        try {
          const { isAuthenticated } = useAuthStore.getState()

          if (!isAuthenticated) {
            return // Use local storage for guest users
          }

          const response = await cartAPI.get()
          const cart = response.data.cart

          set({
            items: cart.items || [],
            coupon: cart.coupon || null
          })
        } catch (error) {
          console.error('Failed to fetch cart:', error)
          // Don't show error toast for cart fetch failures
        }
      },

      // Sync local cart to server when user logs in
      syncCartToServer: async () => {
        try {
          const { items } = get()

          if (items.length === 0) {
            return
          }

          // Add each item to server cart
          for (const item of items) {
            await cartAPI.add(item.productId, item.quantity)
          }

          // Clear local cart and fetch from server
          set({ items: [], coupon: null })
          await get().fetchCart()

          toast.success('Đã đồng bộ giỏ hàng')
        } catch (error) {
          console.error('Failed to sync cart:', error)
          toast.error('Không thể đồng bộ giỏ hàng')
        }
      },

      // Get item by product ID
      getItem: (productId) => {
        const { items } = get()
        return items.find(item => item.productId === productId)
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon
      })
    }
  )
)

export { useCartStore }
