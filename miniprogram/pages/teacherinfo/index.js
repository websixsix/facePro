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
    groupList: [],
    pageIndex: 0,
    user_id: '',
    groupObj : {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this
    db.collection('teachers').where({
      _openid: app.globalData.openid,
    }).get({
      success(res) {
        // res.data 包含该记录的数据
        self.setData({
          name: res.data[0].name,
          group_id: res.data[0].group_id,
          user_id: res.data[0].user_id
        })
        self.loadAll()
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
  //查找数据库 -> 找出自己权限组
  show2group: function (page) {
    let self = this
    db.collection('students').where({
      teacher_id: self.data.user_id
    }).skip(page * 20).limit(20)
      .get({
        success(res) {
          // res.data 是包含以上定义的两条记录的数组
          let arr = self.data.groupList
          let obj = self.data.groupObj
          for (let i = 0; i < res.data.length; i++) {
            let group = res.data[i]
            if (!obj[group.group_id]) {
              obj[group.group_id] = []
              arr.push(group.group_id)
              obj[group.group_id].push(group)
            } else {
              obj[group.group_id].push(group)
            }
          }
          for(let o in obj){
            console.info(o)
          }
          self.setData({
            groupList: arr,
            groupObj:obj
          })
          console.log(self.data.groupList)
        }
      })
  },
  //分段加载全部数据
  loadAll: function () {
    let self = this
    db.collection('students').where({
      teacher_id: self.data.user_id
    }).count({
      success(res) {
        let total = res.total
        for (let j = 0; j < total / 20; j++) {
          self.show2group(j)
        }
      }
    })
  },
  // 把不同分组的人分开显示
  devStudent: function() {
    let obj1 = {}
    let group = self.data.groupList
    for (let i = 0; i < self.data.groupList.length; i++) {
      if (!obj[group[i]]) {
        obj[group[i].group_id] = []
        obj[group[i].group_id].push(group)
      } else {
        obj[group[i].group_id].push(group)
      }
    }
    console.info(obj)
  },
  setLimit: function (e) {
    let self = this
    let info = e.currentTarget.dataset.info
    let name = info.name
    wx.showModal({
      title: '提示',
      content: '将'+name+'设置为组长',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '修改中',
            mask: true
          })
          wx.cloud.callFunction({  
            name: 'changeLimit', 
            data: info,
            success: res => {
              wx.hideLoading()
              wx.showToast({
                title: '修改成功',
                icon: 'success'
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
  deleteStu:function(e) {
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
})