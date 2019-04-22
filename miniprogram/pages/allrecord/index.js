const app = getApp()
const db = wx.cloud.database()
const _ = db.command
// miniprogram/pages/recordtext/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recordList: [],
    eventName:'',
    srcName:'',
    srcResult:[],
    checkCount:0,
    checkedCount:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this
    self.setData({
      eventName: app.globalData.pickEventName
    }, () => {
      wx.cloud.callFunction({
        name:"searchEvent",
        data:{
          name:self.data.eventName
        },
        success(res){
          console.info(res)
          let arr = [];
          let num = 0;
          res.result.forEach(e => {
            if (e.isChecked) {
              num+=1;
              let dateObj = new Date(e.date)
              e.date = dateObj.toLocaleString();
              arr.push(e);
            } else {
              arr.unshift(e);
            }
          })
          self.setData({
            recordList: arr,
            checkCount: res.result.length,
            checkedCount: num
          },()=>{
            self.searchRecord()
          })
        },
        fail(err){
          console.info(err)
        }
      })
    })
  },
  onReachBottom: function () {},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },
  inputedit(e) {
    this.setData({
      srcName:e.detail.value
    })
  },
  searchRecord: function () {
    let self = this
    let name = this.data.srcName
    this.setData({
      srcResult:[]
    },()=>{
      let arr = [];
      self.data.recordList.forEach( rec => {
        console.info(rec.name.indexOf(name))
        if(rec.name.indexOf(name)>=0){
          arr.push(rec)
        }
      })
      self.setData({
        srcResult:arr
      })
    })
  }
})