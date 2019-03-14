// miniprogram/pages/checkevent/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateSet: '2019-03-17',
    start: '',
    end: '',
    recordList: [],
    month: '',
    date: '',
    year: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let now = new Date()
    let mon = now.getMonth();
    let mStr = mon + 1;
    if (mStr < 10) mStr = "0" + mStr;
    this.setData({
      month: now.getMonth(),
      date: now.getDate(),
      year: now.getFullYear(),
      dateSet: now.getFullYear() + '年' + mStr + '月' + now.getDate() + '日',
      start: (now.getFullYear() - 1) + '-' + (now.getMonth() + 1) + '-' + now.getDate(),
      end: now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate(),
    }, () => {
      // this.loadAll()
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
  go2Record: function(){
    wx.navigateTo({
      url: '../allrecord/index',
    })
  },
  bindDateChange(e) {
    console.log('picker发送选择改变，携带值为', e)
    let date = e.detail.value;
    let arr = date.split('-');
    this.setData({
      year: arr[0],
      month: arr[1] - 1,
      date: arr[2],
      dateSet: arr[0] + '年' + arr[1] + '月' + arr[2] + '日'
    })
  },
})