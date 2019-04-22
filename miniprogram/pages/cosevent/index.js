const app = getApp()
// miniprogram/pages/cosevent/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    todayEvent:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let today = new Date().getTime();
    let arr = app.globalData.todayEvent;
    let result = []
    arr.forEach(e => {
      let date = new Date(e.date);
      if (today < (date.getTime() + e.limit * 60 * 1000)) {
        e.date = date.toLocaleString()
        result.push(e)
      }
    })
    this.setData({
      todayEvent: result
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  go2Verify:function(e){
    app.globalData.event = e.currentTarget.dataset.event;
    console.info(e)
    wx.navigateTo({
      url:'../verifypage/index'
    })
  }
})