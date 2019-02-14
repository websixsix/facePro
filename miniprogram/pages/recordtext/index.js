const app = getApp()
const db = wx.cloud.database()
const _ = db.command
// miniprogram/pages/recordtext/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
    this.setData({
      month: now.getMonth(),
      date: now.getDate(),
      year: now.getFullYear()
    }, () => {
      this.loadAll()
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  //查找数据库 -> 找出自己权限组
  show2group: function (page) {
    let self = this
    let nowDate = new Date(this.data.year, this.data.month, this.data.date);
    db.collection('verifyrecord').where({
      _openid: app.globalData.openid,
      date: _.gt(nowDate)
    }).skip(page * 20).limit(20)
      .get({
        success(res) {
          // res.data 是包含以上定义的两条记录的数组
          let arr = self.data.recordList
          for (let i = 0; i < res.data.length; i++) {
            res.data[i].date = res.data[i].date.toLocaleString()
            arr.push(res.data[i])
          }
          self.setData({
            recordList: arr
          })
          console.log(typeof self.data.recordList[0].date)
        }
      })
  },
  //分段加载全部数据
  loadAll: function () {
    let self = this
    let nowDate = new Date(this.data.year, this.data.month, this.data.date);
    db.collection('verifyrecord').where({
      _openid: app.globalData.openid,
      date: _.gt(nowDate)
    }).count({
      success(res) {
        let total = res.total
        for (let j = 0; j < total / 20; j++) {
          self.show2group(j)
        }
      }
    })
  },
})