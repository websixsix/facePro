const app = getApp()
const db = wx.cloud.database()
// miniprogram/pages/verifypage/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupId: '',
    studentId: '',
    name:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let obj = wx.getStorageSync('verify')
    this.setData({
      name: obj.name,
      groupId: obj.group_id,
      studentId: obj.student_id
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // this.up2Record()
    setTimeout(this.takePhoto, 5000)
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
      'group_id_list': this.data.groupId,
      'liveness_control': 'NORMAL',
      'user_id': this.data.studentId
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
            self.up2Record()
          } else {
            wx.showModal({
              title: '考勤失败',
              content: '人脸不匹配',
              showCancel: false, //不显示取消按钮
              confirmText: '确定',
              success(res) {
                self.takePhoto()
              }
            })
          }
        } else {
          wx.showModal({
            title: '考勤失败',
            content: '未知原因，请联系管理员',
            showCancel: false, //不显示取消按钮
            confirmText: '确定'
          })
        }
      },
      fail: err => {
        console.info(err, 'fail')
        wx.showModal({
          title: '考勤失败',
          content: '接口调用失败，请联系管理员',
          showCancel: false, //不显示取消按钮
          confirmText: '确定'
        })
      }
    })
  },
  //把考勤记录传入数据库verifyrecord
  up2Record: function () {
    db.collection('verifyrecord').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        group_id: this.data.groupId,
        name: this.data.name,
        student_id: this.data.studentId,
        date: new Date(),
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
              wx.navigateBack({
                delta: 1,
              })
            }, 1500)
          }
        })
      },
      fail: console.error
    })
  }
})