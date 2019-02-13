// miniprogram/pages/signup/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    form:{
      name:'',
      studentId:'',
      groupId:'',
      openId: ''
    },
    secret:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      form:{
        openId: app.globalData.openid
      }
    })
    const db = wx.cloud.database()
    db.collection('facetest').doc(app.globalData.openid).get({
      success(res) {
        // res.data 包含该记录的数据
        wx.showToast({
          title: '该微信号已注册',
          icon:'none',
          duration:2000,
          success: res =>{
            setTimeout(function(){
              wx.navigateTo({
                url: '../index/index',
              })
            }, 2000)
          }
        })
      },
      fail: (err) => {
        console.info('可以注册')
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},
  // 跳转到人脸注册页面
  formSubmit:function () {
    if(this.data.form.name&&
      this.data.form.studentId&&
      this.data.form.groupId&&
      this.data.form.openId&&
      this.data.secret === '1022') {
      wx.setStorageSync('sign',this.data.form)
      wx.navigateTo({
        url: '../signupface/index',
      })
    } else {
      wx.showToast({
        title: '注册信息有误',
        icon: 'none',
        duration: 2000
      })
    }
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