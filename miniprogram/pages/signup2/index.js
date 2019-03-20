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
      college:'',
      group_id: 'teachers',
      character: 'teachers'
    },
    array: ['test1', 'test2', 'test3', 'test4'],
    index: 0,
    secret: '',
    openId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      openId: app.globalData.openid
    })
    // this.diffWxOpen('teachers')
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
        if (res.data.length <= 0) return;
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
  formSubmit: function () {
    if (this.data.form.name &&
      this.data.form.user_id &&
      this.data.form.group_id &&
      this.data.openId &&
      this.data.secret === '1204' &&
      this.data.form.character === "teachers") {
      wx.setStorageSync('sign', this.data.form)
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
    if (dataset.name === 'secret') {
      this.data[dataset.name] = value;
      return;
    }
    this.data.form[dataset.name] = value;
  },
  // 匹配专业对应的字符串
  //picker 选择group
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    }, function () {
      this.data.form.group_id = this.data.array[this.data.index]
    })
  }
})