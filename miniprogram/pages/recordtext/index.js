const app = getApp()
const db = wx.cloud.database()
const _ = db.command
// miniprogram/pages/recordtext/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateSet:'2019-03-17',
    start:'',
    end:'',
    recordList:[],
    month:'',
    date:'',
    year:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let now = new Date()
    let mon = now.getMonth();
    let mStr = mon + 1;
    if(mStr<10) mStr = "0" + mStr;
    this.setData({
      month: now.getMonth(),
      date: now.getDate(),
      year: now.getFullYear(),
      dateSet: now.getFullYear() + '-' + mStr + '-' + (now.getDate() < 10 ? ("0" + now.getDate()) : now.getDate()),
      start: (now.getFullYear()-1) + '-' + (now.getMonth() + 1) + '-' + now.getDate(),
      end: now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate(),
    }, () => {
      this.loadAll()
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  //分段加载全部数据
  loadAll: function () {
    wx.showLoading({
      title: '加载中',
    })
    let self = this
    wx.cloud.callFunction({
      name: "loadStuRecord",
      data: {
        user_id: app.globalData.userInfo.user_id,
        date: self.data.dateSet
      },
      success(res){
        console.info(res);
        let arr = [];
        if (res.result) {
          res.result.forEach(e => {
            let date = new Date(e.date)
            e.date = date.toLocaleString();
            arr.push(e)
          })
        }
        self.setData({
          recordList: arr
        },()=>{
          wx.hideLoading()
        })
      },
      fail(err){
        console.error(err)
      }
    })
  },

  bindDateChange(e) {
    console.log('picker发送选择改变，携带值为', e)
    let date = e.detail.value;
    let arr = date.split('-');
    this.setData({
      year: arr[0],
      month: arr[1]-1,
      date:arr[2],
      dateSet: date
    })
  },
})