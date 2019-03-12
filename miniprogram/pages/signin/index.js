const app = getApp()
// miniprogram/pages/signin/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this
    const db = wx.cloud.database()
    db.collection('students').where({
      _openid: app.globalData.openid,
    }).get({
      success(res) {
        // res.data 包含该记录的数据
        console.info(res.data[0])
        self.setData(res.data[0],console.info(self.data))
      },
      fail:(err)=>{
        console.info(err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    setTimeout(this.takePhoto,3000)
  },
  //打开摄像头
  takePhoto: function () {
    const ctx = wx.createCameraContext('face-camera')
    let self = this;
    ctx.takePhoto({
      quality: 'high',
      success: res => {
        wx.compressImage({
          src: res.tempImagePath, // 图片路径
          quality: 80, // 压缩质量
          success(resp){
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
        if(res.data.error_code === 0){
          let score = res.data.result.user_list[0].score
          if (score >= 80) {
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              success(){
                setTimeout(()=>{
                  wx.reLaunch({
                    url: '../userinfo/index',
                  })
                },1500)
              }
            })
          } else {
            wx.showModal({
              title: '登录失败',
              content: '人脸不匹配',
              showCancel: false, //不显示取消按钮
              confirmText: '确定',
              success(res) {
                self.takePhoto()
              }
            })
          }
        }else{
          wx.showModal({
            title: '登录失败',
            content: '未检测到人脸',
            showCancel: false, //不显示取消按钮
            confirmText: '确定',
            success(res) {
              self.takePhoto()
            }
          })
        }
      },
      fail: err => {
        console.info(err, 'fail')
      }
    })
  },
})