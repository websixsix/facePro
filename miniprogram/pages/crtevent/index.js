const app = getApp()
const db = wx.cloud.database()
// miniprogram/pages/crtevent/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    form:{
      name:'',
      limit:'',
      range:''
    },
    userInfo:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  // 事件创建完成
  formSubmit: function () {
    let self = this;
    let range = this.data.form.range.split('，');
    if (this.data.form.name && this.data.form.limit && this.data.form.range) {
      wx.cloud.callFunction({
        name: 'createEvent',
        data: {
          name: self.data.form.name
        },
        success: res => {
          console.info(res, 'event')
          wx.showToast({
            title: '创建事件成功',
            icon: 'success',
            success(res) {
              for (let i = 0; i < range.length; i++) {
                self.createStudents(range[i], 'aa');
              }
            }
          })
        },
        fail: err => {
          console.info(err)
        }
      })
    } else {
      wx.showToast({
        title: '创建信息有误',
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
    if (dataset.name === 'secret') {
      this.data[dataset.name] = value;
      return;
    }
    this.data.form[dataset.name] = value;
  },
  //在事件集合下创建学生
  createStudents: function (range, event) {
    let self = this;
    console.info(range)
    wx.cloud.callFunction({
      name: 'createStudents',
      data: {
        college: self.data.userInfo.college,
        specialty: range
      },
      success: res => {
        console.info(res.result[0], "成功")
      },
      fail: err => {
        console.info(err)
      }
    })
  }
})