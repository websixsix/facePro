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
    limit:false,
    groupList:[],
    pageIndex:0,
    user_id:'',
    teacher_id:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this
    db.collection('students').where({
      _openid: app.globalData.openid,
    }).get({
      success(res) {
        // res.data 包含该记录的数据
        self.setData({
          name: res.data[0].name,
          group_id: res.data[0].group_id,
          limit: res.data[0].limit,
          teacher_id: res.data[0].teacher_id,
          user_id: res.data[0].user_id
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
    db.collection('students').where({
      group_id: self.data.group_id,
      user_id: _.neq(self.data.user_id),
      teacher_id: self.data.teacher_id
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
          console.log(self.data.groupList,'11')
        }
      })
  },
  //分段加载全部数据
  loadAll:function () {
    let self = this
    db.collection('students').where({
      group_id: self.data.group_id,
      user_id: _.neq(self.data.user_id),
      teacher_id: self.data.teacher_id
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