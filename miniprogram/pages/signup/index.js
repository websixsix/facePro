// miniprogram/pages/signup/index.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    form: {
      name: '',
      user_id: '',
      group_id: '',
      teacher_id: '',
      college: '',
      specialty: '',
      character: 'students'
    },
    index:0,
    secret:'',
    openId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      openId: app.globalData.openid
    })
    // this.diffWxOpen('students')
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  // 校验该微信号是否已注册
  diffWxOpen: function (dbName) {
    // 搜索学生库
    db.collection(dbName).where({
      _openid: this.data.openId
    }).get({
      success(res) {
        if (res.data.length <= 0) {
          return;
        }
        // res.data 包含该记录的数据
        wx.showToast({
          title: '该微信号已注册',
          icon: 'none',
          duration: 2000,
          success: res => {
            setTimeout(function () {
              wx.navigateTo({
                url: '../index/index',
              })
            }, 2000)
          }
        })
      }
    })
  },
  // 跳转到人脸注册页面
  formSubmit:function () {
    let self = this;
    if(this.data.form.name&&
      this.data.form.user_id&&
      this.data.form.college&&
      this.data.form.specialty&&
      this.data.openId&&
      this.data.secret === '1022'&&
      this.data.form.character === "students"&&
      this.data.form.teacher_id) {

        //判断user_id是否唯一

        db.collection('college').where({
          name: self.data.form.college
        }).get({
          success(res){
            console.info(res)
            if(res.data.length === 0){
              self.createColl().then((res)=>{
                console.info('创建成功',res);
                self.data.form.group_id = res._id;
                wx.setStorageSync('sign', self.data.form)
                wx.navigateTo({
                  url: '../signupface/index',
                })
              })
            } else {
              self.data.form.group_id = res.data[0]._id;
              wx.setStorageSync('sign', self.data.form)
              wx.navigateTo({
                url: '../signupface/index',
              })
            }
          },
          fail(err){
            console.info(err)
          }
        })
    } else {
      wx.showToast({
        title: '注册信息有误',
        icon: 'none',
        duration: 2000
      })
    }
  },
  // 创建新的学院
  createColl:function(){
    let self = this;
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name:"addCollege",
        data: {
          college: this.data.form.college
        },
        success(res) {
          resolve(res);
        }
      })
    })
  },
  inputedit: function (e) {
    let string = e.detail.value
    let dataset = e.currentTarget.dataset;
    //data-开头的是自定义属性，可以通过dataset获取到，dataset是一个json对象，有obj和item属性，可以通过这两个实现双向数据绑定，通过更改这两个值，对不同name的变量赋值
    let value = e.detail.value;
    if(dataset.name === 'secret'){
      this.data[dataset.name] = value;
      return;
    }
    this.data.form[dataset.name] = value;
  }
})