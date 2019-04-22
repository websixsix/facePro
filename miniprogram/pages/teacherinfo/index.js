const app = getApp()
const db = wx.cloud.database()
const _ = db.command
// miniprogram/pages/userinfo/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    group_id: '',
    user_id: '',
    college: '',
    allCheck:0,
    check:0,
    srcResult: [],
    allStuArr: [],
    srcName: '',
    lock:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    let self = this
    db.collection('teachers').where({
      _openid: app.globalData.openid,
    }).get({
      success(res) {
        // res.data 包含该记录的数据
        self.setData({
          name: res.data[0].name,
          group_id: res.data[0].group_id,
          user_id: res.data[0].user_id,
          college: res.data[0].college
        },()=>{
          self.checkEvent();
          self.loadAllStu();
        })
        app.globalData.userInfo = res.data[0]
      },
      fail: (err) => {
        console.info(err)
      }
    })
    app.globalData.sceen = 'teacher';
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  touchend: function () {
    if (this.data.lock) {
      //开锁
      setTimeout(() => {
        this.setData({ lock: false });
      }, 100);
    }
  },
  deleteStu:function(e) {
    this.setData({
      lock:true
    })
    let self = this
    let info = e.currentTarget.dataset.info
    let name = info.name
    wx.showModal({
      title: '提示',
      content: '是否要删除' + name + '同学',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在删除',
            mask: true
          })
          wx.cloud.callFunction({
            name: 'clearStu',
            data: info,
            success: res => {
              wx.hideLoading()
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                success(){
                  wx.redirectTo({
                    url: 'index',
                  })
                }
              })
            },
            fail: err => {
              console.info(err)
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  go2Update:function(e){
    if (this.data.lock) return;
    app.globalData.updateStuInfo = e.currentTarget.dataset.info
    wx.navigateTo({
      url: '../editinfo/index',
    })
  },
  loadAllStu:function(){
    let self = this;
    wx.cloud.callFunction({
      name: 'crtAllStudents',
      data: {
        user_id: self.data.user_id
      },
      success: res => {
        if (!res.result) {
          return;
        }
        let arr = [];
        res.result.forEach(e => {
          arr.push(e)
        })
        self.setData({
          allStuArr: arr
        },()=>{
          wx.hideLoading()
        })
      },
      fail: err => {
        console.info(err)
      }
    })
  },
  inputEdit: function (e) {
    this.setData({
      srcName: e.detail.value
    })
  },
  searchStu: function () {
    let self = this
    let name = this.data.srcName
    this.setData({
      srcResult: []
    }, () => {
      let arr = [];
      self.data.allStuArr.forEach(rec => {
        if (rec.name.indexOf(name) >= 0) {
          arr.push(rec)
        }
      })
      self.setData({
        srcResult: arr
      })
    })
  },
  go2Knowing:function(){
    wx.showLoading({
      title: '创建中',
    })
    let self = this;
    let date = new Date();
    let name = this.data.name + this.data.user_id + "查寝" + date.getFullYear()+(date.getMonth()+1)+date.getDate();
    wx.cloud.callFunction({
      name: 'createEvent',
      data: {
        name: name
      },
      success: res => {
        
        if (!res.result) {
          wx.hideLoading()
          wx.showToast({
            title: '今日已查寝',
            icon: 'none'
          })
          return;
        }
        self.createStudents(name);
      },
      fail: err => {
        console.info(err)
      }
    })
  },

  //在事件集合下创建学生
  createStudents: function (event) {
    let self = this;
    this.data.allStuArr.forEach(e => {
      wx.cloud.callFunction({
        name: 'addUserDB',
        data:{
          dbName: event,
          dbData: {
            isChecked: false,
            name: e.name,
            specialty: e.specialty,
            user_id: e.user_id,
            event: event.eventName
          }
        }
      })
    })
    self.recallInEvent(event);
  },
  // 在事件集合里添加该事件
  recallInEvent: function (event) {
    let self = this;
    // let date = new Date.getTime()
    wx.cloud.callFunction({
      name: 'addUserDB',
      data: {
        dbName: "events",
        dbData: {
          name: event,
          teacher: self.data.name,
          teacher_id: self.data.user_id,
          limit: 30,
          range: self.data.college,
          date: new Date().getTime()
        }
      },
      success(res){
        wx.hideLoading()
        wx.showToast({
          title: '创建事件成功',
          icon: 'success',
          success() {
            self.checkEvent()
          }
        })
      },
      fail(err){
        console.info(err)
      }
    })
  },
  checkEvent(){
    let self = this;
    wx.cloud.callFunction({
      name: "checkEvent",
      data: {
        name: self.data.name,
        user_id: self.data.user_id
      },
      success(res) {
        if (!res.result) {
          return;
        }
        self.setData({
          allCheck: res.result.allNum,
          check: res.result.num
        })
      },
      fail(err) {
        console.info(err)
      }
    })
  }
})