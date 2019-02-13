const app = getApp()
// miniprogram/pages/userinfo/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this
    const db = wx.cloud.database()
    db.collection('facetest').doc(app.globalData.openid).get({
      success(res) {
        // res.data 包含该记录的数据
        self.setData({
          name: res.data.name
        })
      },
      fail: (err) => {
        console.info(err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
})