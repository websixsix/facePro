const app = getApp()
const db = wx.cloud.database()
// miniprogram/pages/verifypage/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    group_id: '',
    user_id: '',
    name:'',
    teacher_id:'',
    address: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;
    this.setData({
      name: app.globalData.userInfo.name,
      group_id: app.globalData.userInfo.group_id,
      user_id: app.globalData.userInfo.user_id,
      teacher_id: app.globalData.userInfo.teacher_id
    },()=>{
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // this.up2Record()
    setTimeout(this.takePhoto, 3000)
  },
  //打开摄像头
  takePhoto: function () {
    const ctx = wx.createCameraContext()
    let self = this;
    ctx.takePhoto({
      quality: 'high',
      success: res => {
        wx.compressImage({
          src: res.tempImagePath, // 图片路径
          quality: 80, // 压缩质量
          success(resp) {
            console.info(res)
            let base = wx.getFileSystemManager().readFileSync(resp.tempFilePath, "base64")
            console.info(base.length)
            self.faceTest(base)
          }
        })
      },
      fail: err => {
        console.info(err)
      }
    })
  },
  //人脸检测 -> 是否符合标准
  faceTest: function (img) {
    let self = this
    const token = app.globalData.facetoken
    let url = 'https://aip.baidubce.com/rest/2.0/face/v3/detect?access_token=' + token;
    let data = {
      'image': img,
      'image_type': 'BASE64',
    }
    wx.request({
      url: url,
      method: 'POST',
      data: JSON.stringify(data),
      success: res => {
        console.info(res, 'success')
        if (res.data.error_code === 0 && res.data.result.face_list[0].face_probability > 0.50) {
          //创造透明加载提示
          wx.showLoading({
            title: '验证中，请稍等',
            mask: true
          })
          let faceToken = res.data.result.face_list[0].face_token
          self.faceRec(faceToken)
        } else {
          self.takePhoto()
        }
      },
      fail: err => {
        console.info(err, 'fail')
      }
    })
  },
  //人脸识别/搜索
  faceRec: function (faceToken) {
    let self = this
    let token = app.globalData.facetoken
    let url = 'https://aip.baidubce.com/rest/2.0/face/v3/search?access_token=' + token;
    let data = {
      'image': faceToken,
      'image_type': 'FACE_TOKEN',
      'group_id_list': this.data.group_id,
      'liveness_control': 'NORMAL',
      'user_id': this.data.user_id
    }
    wx.request({
      url: url,
      method: 'POST',
      data: JSON.stringify(data),
      success: res => {
        wx.hideLoading()
        console.info(res, 'success')
        if (res.data.error_code === 0) {
          let score = res.data.result.user_list[0].score
          if (score >= 80) {
            self.getLocation()
          } else {
            wx.showModal({
              title: '考勤失败',
              content: '人脸不匹配,请重试',
              confirmText: '重试',
              success(res) {
                if (res.confirm) {
                  self.takePhoto()
                } else if (res.cancel){
                  wx.navigateBack({
                    delta: 1,
                  })
                }
              }
            })
          }
        } else {
          wx.showModal({
            title: '考勤失败',
            content: '未知原因，请联系管理员',
            showCancel: false, //不显示取消按钮
            confirmText: '确定',
            success(res) {
              wx.navigateBack({
                delta: 1,
              })
            }
          })
        }
      },
      fail: err => {
        console.info(err, 'fail')
        wx.showModal({
          title: '考勤失败',
          content: '接口调用失败，请联系管理员',
          showCancel: false, //不显示取消按钮
          confirmText: '确定',
          success(res) {
            wx.navigateBack({
              delta: 1,
            })
          }
        })
      }
    })
  },
  //把考勤记录传入数据库verifyrecord
  up2Record: function () {
    let self = this;
    let now = new Date().getTime();
    wx.cloud.callFunction({
      name:"addUserDB",
      data: {
        dbName: 'verifyrecord',
        dbData: {
          name: self.data.name,
          user_id: self.data.user_id,
          date: now,
          location: self.data.address,
          eventName: app.globalData.event.name,
          eventMaster: app.globalData.event.teacher
        }
      },
      success(res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log(res)
        //跳转至最初页面
        wx.showToast({
          title: '考勤成功',
          icon: 'success',
          success() {
            setTimeout(() => {
              wx.reLaunch({
                url: '../userinfo/index',
              })
            }, 1500)
          }
        })
      },
      fail(err){
        console.error(err)
      }
    })

    wx.cloud.callFunction({
      name: "upStuInEvent",
      data: {
        eventName: app.globalData.event.name,
        student: self.data.name,
        date: now,
        location: self.data.address
      },
      success(res) {
        console.info(res, self.data.address)
      },
      fail(err) {
        console.error(err)
      }
    })
  },
  // map test:ok
  getLocation: function () {
    let self = this;
    wx.getLocation({
      success: function (res) {
        type: 'wgs84',
        wx.request({
          url: 'https://apis.map.qq.com/ws/coord/v1/translate?locations=' + res.latitude + ',' + res.longitude + '&type=1&key=QBSBZ-QREK3-JMW3N-3PIV4-Y5QNE-DCB4O',
          success(res1) {
            let location = res1.data.locations[0];
            var getAddressUrl = "https://apis.map.qq.com/ws/geocoder/v1/?location=" + location.lat + "," + location.lng + "&key=QBSBZ-QREK3-JMW3N-3PIV4-Y5QNE-DCB4O&get_poi=1";
            wx.request({
              url: getAddressUrl,
              success: function (res2) {
                console.info(res2)
                self.setData({
                  address: res2.data.result.address
                },()=>{
                  self.up2Record()
                })
              }
            })
          }
        })
      },
    })
  }
})