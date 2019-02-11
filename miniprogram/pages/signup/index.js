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
      openId:''
    },
    secret:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!wx.cloud) {
      wx.showToast({
        title: 'openID获取失败',
        icon: 'none',
        duration: 2000
      })
      return
    }
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.showToast({
          title: 'openID获取成功',
          icon: 'success',
          duration: 2000
        })
        this.setData({
          form:{
            openId: res.result.openid
          }
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
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