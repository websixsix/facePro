const app = getApp()
const db = wx.cloud.database()
const _ = db.command
// miniprogram/pages/userinfo/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name:'',
    group_id:'',
    pageIndex:0,
    user_id:'',
    teacher_id:'',
    specialty:'',
    college: '',
    eventNum: 0,
    recordList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    let self = this
    db.collection('students').where({
      _openid: app.globalData.openid,
    }).get({
      success(res) {
        // res.data 包含该记录的数据
        self.setData({
          name: res.data[0].name,
          group_id: res.data[0].group_id,
          teacher_id: res.data[0].teacher_id,
          user_id: res.data[0].user_id,
          specialty: res.data[0].specialty,
          college: res.data[0].college
        })
        app.globalData.userInfo = res.data[0]
        self.loadAll()
      },
      fail: (err) => {
        console.info(err)
      }
    })
    app.globalData.sceen = 'student'
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //分段加载全部数据
  loadAll:function () {
    let self = this
    wx.cloud.callFunction({
      name:"getTodayEvent",
      data:{
        specialty: self.data.specialty,
        college: self.data.college
      },
      success(res){
        self.setData({
          eventNum: res.result.length
        })
        app.globalData.todayEvent = res.result
      },
      fail(err){
        console.info(err)
      }
    })

    let today = new Date();
    let start = new Date(today.getFullYear(),today.getMonth(),today.getDate());
    let end = new Date(start.getTime() + 24 * 60 * 60* 1000);
    console.info(start)
    db.collection('verifyrecord').where({
      user_id:self.data.user_id,
      date: _.gte(start).and(_.lt(end))
    }).limit(5).get().then(res => {
      let arr = [];
      console.info(res)
      if (res.data) {
        res.data.forEach(e => {
          e.date = e.date.toLocaleString();
          arr.push(e)
        })
      }
      self.setData({
        recordList: arr
      },()=>{
        wx.hideLoading()
      })
    })
  },
})