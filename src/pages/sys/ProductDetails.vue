<template>
  <div class="product_details">
    <el-button type="text" @click="backHandler">返回</el-button>
    <p>产品名称：{{ product.name }}</p>
    <p>产品价格：{{ product.price }}</p>
    <p>产品介绍：{{ product.description }}</p>
    <p>产品主图：<img :src="product.photo" alt=""></p>
  </div>
</template>
<script>
import { mapActions } from 'vuex'
export default {
  data() {
    return {
      product: {}
    }
  },
  created() {
    // 获取产品id
    const id = this.$route.query.id
    // 根据产品id查询产品的详情
    this.findProductById(id)
      .then((product) => {
        this.product = product
      })
      console.log(id)
  },
  methods: {
    ...mapActions('product',['findProductById']),
    backHandler() {
      this.$router.go(-1)
    }
  }
}
</script>
