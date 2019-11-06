<template>
  <div class="product">
    		<!-- 按钮 -->
    <div class="productsButton">
      <!-- 左侧搜索 -->
      <el-col :span="20">
        <el-form :inline="true">
          <el-form-item>
            <el-input v-model="params.name" placeholder="请输入关键字" size="small" ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="searchName">搜索</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <!-- 右侧按钮 -->
      <el-col :span="4">
        <el-button @click="toAddHandler" size="small" type="primary">添加</el-button>
        <el-button @click="batchDeleteHandler"  size="small" type="danger">批量删除</el-button>
      </el-col>
		</div>
    <!-- 按钮 -->
    <!-- 表格 -->
    <div>
      <el-table :data="products.list" size="mini" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="编号" />
        <el-table-column prop="name" label="产品名称" />
        <el-table-column prop="price" label="价格" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="categoryId" label="所属产品" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="record">
            <i class="el-icon-delete" href="" @click.prevent="deleteHandler(record.row.id)" /> &nbsp;
            <i class="el-icon-edit-outline" href="" @click.prevent="editHandler(record.row)" /> &nbsp;
            <i class="el-icon-more" @click.prevent="toDetailsHandler(record.row)"></i>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="visible" @close="dialogCloseHandler">
      <el-form ref="productForm" :model="product" :rules="rules">
        <el-form-item label="名称" label-width="100px" prop="name">
          <el-input v-model="product.name" auto-complete="off" />
        </el-form-item>
        <el-form-item label="价格" label-width="100px" prop="price">
          <el-input v-model="product.price" auto-complete="off" />
        </el-form-item>
        <el-form-item label="所属栏目" label-width="100px" prop="categoryId">
          <el-select v-model="product.categoryId">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="介绍" label-width="100px">
          <el-input v-model="product.description" type="textarea" auto-complete="off" />
        </el-form-item>
        <el-form-item label="产品主图" label-width="100px">
          <!-- 上传插件 -->
          <el-upload
            class="upload-demo"
            action="http://134.175.154.93:6677/file/upload"
            :file-list="fileList"
            :on-success="uploadSuccessHandler"
            :limit="1"
            list-type="picture"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
          <!-- /上传插件 -->
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="closeModal">取 消</el-button>
        <el-button size="small" type="primary" @click="submitHandler">确 定</el-button>
      </div>
    </el-dialog>
    <!-- /模态框 -->

            <!--分页开始  -->
        <el-pagination
            class="productParams"
            background          
            hide-on-single-page
            layout="prev, pager, next"
            @current-change="productChang"
            :current-page="params.page+1"
            :page-size="products.pageSize"
            :total="products.total">
        </el-pagination>
        <!-- 分页结束 -->
  </div>
</template>
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
export default {
  data() {
    return {
      params:{
        page:0,         //当前页面
        pageSize:6,     //每页显示数量
        name:''         //模糊搜索名字查询
      },
      fileList: [],
      product: {},
      ids: [],
      rules: {
        name: [
          { required: true, message: '请输入产品名称', trigger: 'blur' }
        ],
        price: [
          { required: true, message: '请输入价格', trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '请选择所属栏目', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState('product', ['products', 'visible', 'title']),
    ...mapState('category', ['categories']),
    ...mapGetters('product', ['orderProduct', 'productSize'])
  },
  created() {
    // 查询所有产品
    this.findAllProducts(this.params)
    // 查询所有栏目
    this.findAllCategories()
  },
  methods: {
    ...mapMutations('product', ['showModal', 'closeModal', 'setTitle']),
    ...mapActions('product', ['findAllProducts', 'saveOrUpdateProduct', 'deleteProductById', 'batchDeleteProduct']),
    ...mapActions('category', ['findAllCategories']),

    //普通代码开始
    productChang(currentPage){      //分页
      this.params.page = currentPage-1;  
      this.findAllProducts(this.params)
    },
    uploadSuccessHandler(response, file, fileList) {
      // 获取上传图片的id
      if (response.status === 200) {
        const id = response.data.id
        const groupname = response.data.groupname
        // 把图片上传到服务器中
        const photo = 'http://134.175.154.93:8888/' + groupname + '/' + id
        // 将图片绑定到双向数据绑定的那个对象中
        this.product.photo = photo
        // 强制改变product引用地址，引起监听器注意
        this.product = Object.assign({}, this.product)
      } else {
        this.$message.error('上传接口异常')
      }
    },
    toDetailsHandler(id) {    //点击查看详情
      this.$router.push({
        path: '/sys/product_details',
        query: { id }
      })
    },
    handleSelectionChange(val) {
      this.ids = val.map(item => item.id)
    },
    toAddHandler() {
      // 1. 重置表单
      this.product = {}
      this.fileList = []
      this.setTitle('添加产品信息')
      // 2. 显示模态框
      this.showModal()
    },
    submitHandler() {
      // 校验
      this.$refs.productForm.validate((valid) => {
        // 如果校验通过
        if (valid) {
          const promise = this.saveOrUpdateProduct(this.product)
          promise.then((response) => {
            // promise为action函数的返回值，异步函数的返回值就是promise的then回调函数的参数
            this.$message({ type: 'success', message: response.statusText })
            this.findAllProducts(this.params)
          })
        } else {
          return false
        }
      })
    },
    dialogCloseHandler() {
      this.$refs.productForm.resetFields()
    },
    editHandler(row) {
      // 绑定基本信息
      this.product = row
      this.fileList = []
      this.fileList.push({
        name: '原图',
        url: row.photo
      })
      this.setTitle('修改产品信息')
      this.showModal()
    },
    deleteHandler(id) {
      this.deleteProductById(id)
        .then((response) => {
          this.$message({ type: 'success', message: response.statusText })
          this.findAllProducts(this.params)
        })
    },
    batchDeleteHandler() {
      this.batchDeleteProduct(this.ids)
        .then((response) => {
          this.$message({ type: 'success', message: response.statusText })
          this.findAllProducts(this.params)
        })
    },
    searchName(){
      this.findAllProducts(this.params);
    }

  }

}
</script>
<style scoped>
  .productsButton{
    margin:20px 0px;
  }
  .productParams{
    margin-top:25px;
    float:right;
  }
</style>
