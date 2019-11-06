<template>
  <div class="category">
    		<!-- 按钮 -->
    <div class="categorButton">
      <!-- 左侧搜索 -->
      <el-col :span="20">
        <el-form :inline="true">
          <el-form-item>
            <el-input  placeholder="请输入关键字" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small">搜索</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <!-- 右侧按钮 -->
      <el-col :span="4">
        <el-button size="small" type="primary" @click="toAddHandler">添加</el-button>
        <el-button size="small" type="danger" @click="batchDeleteHandler">批量删除</el-button>
      </el-col>
		</div>
    <!-- /按钮 -->
    <!-- 表格 -->
    <div>
      <el-table :data="categories" size="mini" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="编号" />
        <el-table-column prop="name" label="栏目名称" />
        <el-table-column prop="num" label="序号" />
        <el-table-column prop="parentId" label="父栏目" />
        <el-table-column label="操作" width="60" align="center">
          <template #default="record">
            <i class="el-icon-delete" href="" @click.prevent="deleteHandler(record.row.id)" /> &nbsp;
            <i class="el-icon-edit-outline" href="" @click.prevent="editHandler(record.row)" />
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="visible" @close="dialogCloseHandler">
      <el-form ref="categoryForm" :model="category" :rules="rules">
        <el-form-item label="栏目名称" label-width="100px" prop="name">
          <el-input v-model="category.name" auto-complete="off" />
        </el-form-item>
        <el-form-item label="序号" label-width="100px" prop="num">
          <el-input v-model="category.num" auto-complete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="closeModal">取 消</el-button>
        <el-button size="small" type="primary" @click="submitHandler">确 定</el-button>
      </div>
    </el-dialog>
    <!-- /模态框 -->
  </div>
</template>
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
export default {
  data() {
    return {
      category: {},
      ids: [],
      rules: {
        name: [
          { required: true, message: '请输入栏目名称', trigger: 'blur' }
        ],
        num: [
          { required: true, message: '请输入序号', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState('category', ['categories', 'visible', 'title']),
    ...mapGetters('category', ['orderCategory', 'categorySize'])
  },
  created() {
    this.findAllCategories()
  },
  methods: {
    ...mapMutations('category', ['showModal', 'closeModal', 'setTitle']),
    ...mapActions('category', ['findAllCategories', 'saveOrUpdateCategory', 'deleteCategoryById', 'batchDeleteCategory']),
    // 普通方法
    handleSelectionChange(val) {
      this.ids = val.map(item => item.id)
    },
    toAddHandler() {
      // 1. 重置表单
      this.category = {}
      this.setTitle('添加栏目信息')
      // 2. 显示模态框
      this.showModal()
    },
    submitHandler() {
      // 校验
      this.$refs.categoryForm.validate((valid) => {
        // 如果校验通过
        if (valid) {
          const promise = this.saveOrUpdateCategory(this.category)
          promise.then((response) => {
            // promise为action函数的返回值，异步函数的返回值就是promise的then回调函数的参数
            this.$message({ type: 'success', message: response.statusText })
          })
        } else {
          return false
        }
      })
    },
    dialogCloseHandler() {
      this.$refs.categoryForm.resetFields()
    },
    editHandler(row) {
      this.category = row
      this.setTitle('修改栏目信息')
      this.showModal()
    },


    deleteHandler(id){      //删除数据
        this.$confirm('此操作将永久删除数据否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(() => {
            this.deleteCategoryById(id)
            .then((response)=>{
              this.$message({type:"success",message:response.statusText});
            })
        })
        .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });          
        });
    },
    batchDeleteHandler() {      //批量删除数据
      this.$confirm('此操作将永久删除数据否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      .then(() => {
        this.batchDeleteCategory(this.ids)
        .then((response) => {
          this.$message({ type: 'success', message: response.statusText })
        })
      })
      .catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    },

  }

}
</script>
<style scoped>
  .categorButton{
    margin:20px 0px;
  }
</style>