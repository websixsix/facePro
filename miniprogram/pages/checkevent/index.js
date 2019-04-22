const app = getApp()
const db = wx.cloud.database()
const _ = db.command
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
    year: '',
    pageIndex:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let now = new Date();
    let mon = now.getMonth();
    let mStr = mon + 1;
    if (mStr < 10) mStr = "0" + mStr;
    this.setData({
      month: now.getMonth(),
      date: now.getDate(),
      year: now.getFullYear(),
      dateSet: now.getFullYear() + '-' + mStr + '-' + now.getDate(),
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
    this.search();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let self = this;
    let srcDate = new Date(this.data.year, this.data.month, this.data.date);
    let endDate = new Date(srcDate.getTime() + 24 * 60 * 60 * 1000);
    db.collection('events').where({
      teacher: app.globalData.userInfo.name,
      teacher_id: app.globalData.userInfo.user_id,
      date: _.gt(srcDate).and(_.lt(endDate))
    }).skip(self.data.pageIndex * 20).get({
      success(res) {
        let arr = self.data.recordList;
        res.data.forEach(e => {
          e.date = e.date.toLocaleString()
          arr.push(e);
        })
        self.setData({
          recordList: arr,
          pageIndex: self.data.pageIndex + 1
        }, () => { })
      },
      fail(err) {
        console.info(err);
      }
    })
  },
  go2Record: function(e){
    app.globalData.pickEventName = e.currentTarget.dataset.name
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
      dateSet: arr[0] + '-' + arr[1] + '-' + arr[2]
    })
  },
  search:function(){
    let self = this;
    let srcDate = new Date(this.data.year, this.data.month, this.data.date);
    let endDate = new Date(srcDate.getTime() + 24 * 60 * 60 * 1000);
    db.collection('events').where({
      teacher: app.globalData.userInfo.name,
      teacher_id: app.globalData.userInfo.user_id,
      date: _.gt(srcDate).and(_.lt(endDate))
    }).get({
      success(res){
        let arr = [];
        res.data.forEach(e => {
          e.date = e.date.toLocaleString()
          arr.push(e);
        })
        self.setData({
          recordList: arr,
          pageIndex: 1
        },()=>{})
      },
      fail(err){
        console.info(err);
      }
    })
  }
})