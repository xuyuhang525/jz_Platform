<template>
  <div class="customer">
		<!-- 按钮 -->
    <div class="customerButton">
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
        <el-button @click="toAddHandler" size="small" type="primary">添加</el-button>
        <el-button @click="batchDeleteHandler"  size="small" type="danger">批量删除</el-button>
      </el-col>
		</div>
		<!-- 表格 -->
		<div v-loading="loading">
      <el-table :data="customers" size="mini"  @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="编号"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="realname" label="姓名"></el-table-column>
        <el-table-column prop="gender" label="性别"></el-table-column>
        <el-table-column prop="telephone" label="手机号"></el-table-column>
        <el-table-column prop="idCard" label="身份证" width="200"></el-table-column>
        <!-- <el-table-column proop="registerTime" label="注册时间"></el-table-column> -->
        <!-- <el-table-column prop="enabled" label="状态">

        </el-table-column> -->
        <el-table-column label="操作">
          <template #default="record">
              <i class="el-icon-delete" href="" @click.prevent="deleteHandler(record.row.id)"></i> &nbsp;
							<i class="el-icon-edit-outline" href="" @click.prevent="editHandler(record.row)"></i> &nbsp;
              <i class="el-icon-more" @click.prevent="toDetailsHandler(record.row)"></i>              
          </template>
        </el-table-column>
      </el-table>
		</div>
    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="visible" @close="dialogCloseHandler" :before-close='closeDialog'>
      <el-form :model="customer" :rules="rules" ref="customerForm">
        <el-form-item label="姓名" label-width="100px"  prop="realname">
          <el-input v-model="customer.realname" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="性别" label-width="100px" prop="gender">
          <el-radio-group v-model="customer.gender" size="medium">
            <el-radio-button label="男性"></el-radio-button>
            <el-radio-button label="女性"  class="gendr-right"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="用户名" label-width="100px" prop="username">
          <el-input v-model="customer.username" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号" label-width="100px" prop="telephone">
          <el-input v-model="customer.telephone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="身份证" label-width="100px" prop="idCard">
          <el-input v-model="customer.idCard" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="是否启动" label-width="100px" prop="enabled">
              <el-switch
                v-model="customer.enabled"
                active-color="#13ce66"
                inactive-color="#ff4949">
              </el-switch>
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
import {mapState,mapGetters,mapMutations,mapActions} from 'vuex'
export default {
  
  data(){
    var checktelephone = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('手机号不能为空'));
      } else {
        const reg = /^1[3|4|5|7|8][0-9]\d{8}$/
        console.log(reg.test(value));
        if (reg.test(value)) {
          callback();
        } else {
          return callback(new Error('请输入正确的手机号'));
        }
      }
    };

    var checkidCard = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('身份证不能为空'));
      } else {
        const reg = /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|31)|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}([0-9]|x|X)$/
        console.log(reg.test(value));
        if (reg.test(value)) {
          callback();
        } else {
          return callback(new Error('请输入18位身份证号码'));
        }
      }
    };
    return {
      customer:{},
      ids:[],
      customerForm: {
        telephone:"",
        idCard:""
      },
      rules:{
        realname: [
          { required: true, message: '姓名不能为空', trigger: 'blur' },
          { min: 2, max: 4, message: '长度为 2 到 4 个字符的姓名', trigger: 'blur' }
        ],
        username:[
            { required: true, message: '用户名不能为空', trigger: 'blur' },
            { min: 2, max: 6, message: '长度为 2 到 6 个字符用户名', trigger: 'blur' }
        ],
        gender:[
            { required: true, message: '性别不能为空', trigger: 'blur' },
        ],
        telephone: [
          { required: true, validator: checktelephone, trigger: 'blur'}
        ],
        idCard:[
          { required: true, validator: checkidCard, trigger: 'blur'}
        ],
      },
    }
  },
  computed:{
    ...mapState("customer",["customers","visible","title","loading"]),
    ...mapGetters("customer",["orderCustomer","customerSize"])
  },
  created(){
    this.findAllCustomers();
  },
  methods:{
    ...mapMutations("customer",["showModal","closeModal","setTitle"]),
    ...mapActions("customer",["findAllCustomers","saveOrUpdateCustomer","deleteCustomerById","batchDeleteCustomer"]),
    // 普通方法
    toDetailsHandler(customer){
      //跳转到详情页面
      // this.$router.push("/customerDetails")
      this.$router.push({
        path:"/customer/details",
        query:{id:customer.id}
      })
    },
    handleSelectionChange(val) {
      this.ids = val.map(item=>item.id);
    },
    toAddHandler(){
      // 1. 重置表单
      this.customer = {};
      this.setTitle("添加顾客信息");
      // 2. 显示模态框
      this.showModal();
    },
    closeDialog(){      //点击叉号图标关闭
      this.closeModal()
    },
    submitHandler(){
      // 校验
      this.$refs.customerForm.validate((valid)=>{
        // 如果校验通过
        if(valid){
          let promise = this.saveOrUpdateCustomer(this.customer)
          promise.then((response)=>{
            // promise为action函数的返回值，异步函数的返回值就是promise的then回调函数的参数
            this.$message({type:"success",message:response.statusText});
          })
        } else {
          return false;
        }
      })
    },
    dialogCloseHandler(){
      this.$refs.customerForm.resetFields();
    },
    editHandler(row){
      this.customer = row;
      this.setTitle("修改顾客信息");
      this.showModal();
    },
    deleteHandler(id){
      this.deleteCustomerById(id)
      .then((response)=>{
        this.$message({type:"success",message:response.statusText});
      })
    },
    batchDeleteHandler(){
      this.batchDeleteCustomer(this.ids)
      .then((response)=>{
        this.$message({type:"success",message:response.statusText});
      })
    }

  }

}
</script>
<style scoped>
  .gendr-right{
    margin-left: 20px;
    border-left: 1px solid #ccc;
  }
  .customerButton{
    margin:20px 0px;
  }
</style>