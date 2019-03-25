const app = getApp()
const db = wx.cloud.database()
// miniprogram/pages/crtevent/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    form:{
      name:'',
      limit:'',
      range:''
    },
    userInfo:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  // 事件创建完成
  formSubmit: function () {
    let self = this;
    let range = this.data.form.range.split('，');
    if (this.data.form.name && this.data.form.limit && this.data.form.range) {
      // 创建该事件的集合
      wx.cloud.callFunction({
        name: 'createEvent',
        data: {
          name: self.data.form.name
        },
        success: res => {
          console.info(res)
          if(!res.result){
            wx.showToast({
              title: '该事件已存在',
              icon: 'none'
            })
            return;
          }
          for (let i = 0; i < range.length; i++) {
            self.createStudents(range[i], self.data.form.name);
          }
          wx.showToast({
            title: '创建事件成功',
            icon: 'success',
            success(res) {
              setTimeout(() => {
                wx.navigateBack({
                  delta: 0
                })
              },2000)
            }
          })
        },
        fail: err => {
          console.info(err)
        }
      })
    } else {
      wx.showToast({
        title: '创建信息有误',
        icon: 'none',
        duration: 2000
      })
    }
  },
  inputedit: function (e) {
    let string = e.detail.value
    let dataset = e.currentTarget.dataset;
    //data-开头的是自定义属性，可以通过dataset获取到，dataset是一个json对象，有obj和item属性，可以通过这两个实现双向数据绑定，通过更改这两个值，对不同name的变量赋值
    let value = e.detail.value;
    if (dataset.name === 'secret') {
      this.data[dataset.name] = value;
      return;
    }
    this.data.form[dataset.name] = value;
  },
  //在事件集合下创建学生
  createStudents: function (range, event) {
    let self = this;
    wx.cloud.callFunction({
      name: 'createStudents',
      data: {
        college: self.data.userInfo.college,
        specialty: range,
        eventName: event
      },
      success: res => {
        if(!res.result){
          return;
        }
        res.result.forEach(e => {
          db.collection(event).add({
            data: {
              isChecked: false,
              name: e.name,
              specialty: e.specialty,
              user_id: e.user_id,
              event: event.eventName
            }
          })
        })
        self.recallInEvent();
      },
      fail: err => {
        console.info(err)
      }
    })
  },
  // 在事件集合里添加该事件
  recallInEvent:function(){
    let self = this;
    db.collection('events').add({
      data: {
        name: self.data.form.name,
        teacher: self.data.userInfo.name,
        teacher_id: self.data.userInfo.user_id,
        limit: self.data.form.limit,
        range: self.data.form.range,
        date: new Date()
      }
    })
  }
})