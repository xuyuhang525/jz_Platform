import { get, post, post_array } from '@/utils/request'
import { param } from '@/utils'

export default {
  namespaced: true,
  state: {
    products: [],
    visible: false,
    title: '添加产品信息'
  },
  getters: {
    productSize(state) {
      return state.products.length
    },
    orderProduct: (state) => {
      return function(flag) {
        state.products.sort((a, b) => {
          if (a[flag] > b[flag]) {
            return -1
          } else {
            return 1
          }
        })
        return state.products
      }
    }
  },
  mutations: {
    showModal(state) {
      state.visible = true
    },
    closeModal(state) {
      state.visible = false
    },
    refreshProducts(state, products) {
      state.products = products
    },
    setTitle(state, title) {
      state.title = title
    }
  },
  actions: {
    async findProductById(context, id) {
      const response = await get('/product/findById', { id })
      // 将获取到的产品信息返回
      return response.data
    },
    async batchDeleteProduct(context, ids) {
      // 1. 批量删除
      const response = await post_array('/product/batchDelete', { ids })
      return response
    },
    async deleteProductById(context, id) {
      const response = await get('/product/deleteById?id=' + id)
      return response
    },
    async findAllProducts(context,param) {    // 1. ajax查询  
      const response = await post('/product/query',param)
      context.commit('refreshProducts', response.data)
    },
    // payload 产品信息
    async saveOrUpdateProduct({ commit }, payload) {
      // 保存或更新
      const response = await post('/product/saveOrUpdate', payload)
      //  关闭模态框
      commit('closeModal')
      return response
    } 
  }
}
