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
    groupId:'',
    limit:false,
    groupList:[],
    pageIndex:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this
    db.collection('facetest').doc(app.globalData.openid).get({
      success(res) {
        // res.data 包含该记录的数据
        self.setData({
          name: res.data.name,
          groupId: res.data.group_id,
          limit: res.data.limit
        })
        self.loadAll()
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
  //查找数据库 -> 找出自己权限组
  show2group: function (page) {
    let self = this
    db.collection('facetest').where({
      group_id: self.data.groupId,
      _id: _.neq(app.globalData.openid)
    }).skip(page * 20).limit(20)
      .get({
        success(res) {
          // res.data 是包含以上定义的两条记录的数组
          let arr = self.data.groupList
          for(let i = 0; i< res.data.length; i++){
            arr.push(res.data[i])
          }
          self.setData({
            groupList: arr
          })
          console.log(self.data.groupList)
        }
      })
  },
  //分段加载全部数据
  loadAll:function () {
    let self = this
    db.collection('facetest').where({
      group_id: self.data.groupId,
      _id: _.neq(app.globalData.openid)
    }).count({
      success(res) {
        let total = res.total
        for (let j = 0; j < total / 20; j++) {
          self.show2group(j)
        }
      }
    })
  },
  go2verify: function (e) {
    let self = this
    console.info(e.currentTarget.dataset)
    wx.navigateTo({
      url: '../verifypage/index',
      success() {
        wx.setStorageSync('verify', e.currentTarget.dataset.info)
      },
      fail(err){
        console.info(err)
      }
    })
  }
})