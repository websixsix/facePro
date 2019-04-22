const app = getApp()
const db = wx.cloud.database()
const _ = db.command
// miniprogram/pages/recordtext/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateSet1: '2019-02-17',
    dateSet2: '2019-03-17',
    start: '',
    end: '',
    recordList: [],
    month: '',
    date: '',
    year: '',
    unCheckCount:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let now = new Date()
    let mon = now.getMonth();
    let mStr = mon + 1;
    if (mStr < 10) {
      mStr = "0" + mStr;
      if (mon === 0) {
        mon = 12;
      }else{
        mon = "0" + mon;
      }
    }
    this.setData({
      month: now.getMonth(),
      date: now.getDate(),
      year: now.getFullYear(),
      dateSet1: now.getFullYear() + '-' + mon + '-' + (now.getDate()<10? ("0"+now.getDate()):now.getDate()),
      dateSet2: now.getFullYear() + '-' + mStr + '-' + (now.getDate() < 10 ? ("0" + now.getDate()) : now.getDate()),
      start: (now.getFullYear() - 1) + '-' + (now.getMonth() + 1) + '-' + now.getDate(),
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

    let self = this;
    let nowDate = new Date(this.data.year, this.data.month, this.data.date);
    wx.cloud.callFunction({
      name: "getAllEvent",
      data: {
        teacher_id: app.globalData.userInfo.user_id,
        start: self.data.dateSet1,
        end: self.data.dateSet2
      },
      success(res) {
        let eventArr = res.result;
        wx.cloud.callFunction({
          name: "eventCount",
          data: {
            allEvent: eventArr
          },
          success(r){
            let arr = [];
            let count = 0;
            for(let n in r.result){
              let checked = r.result[n].count - r.result[n].check
              count += r.result[n].check
              arr.push({
                name: n,
                check: r.result[n].check,
                checked: checked,
                specialty: r.result[n].specialty
              })
            }
            self.setData({
              recordList: arr,
              unCheckCount: count
            })
            wx.hideLoading();
          },
          fail(e){
            console.info(e)
          }
        })
      },
      fail(err) {
        console.info(err)
      }
    })
  },

  bindDate1Change(e) {
    let date = e.detail.value;
    let arr = date.split('-');
    this.setData({
      year: arr[0],
      month: arr[1] - 1,
      date: arr[2],
      dateSet1: arr[0] + '-' + arr[1] + '-' + arr[2]
    })
  },

  bindDate2Change(e) {
    let date = e.detail.value;
    let arr = date.split('-');
    this.setData({
      year: arr[0],
      month: arr[1] - 1,
      date: arr[2],
      dateSet2: arr[0] + '-' + arr[1] + '-' + arr[2]
    })
  },
})