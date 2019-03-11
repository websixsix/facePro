const app = getApp()
const db = wx.cloud.database()
// miniprogram/pages/signupface/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    form:{},
    shouCamera:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let obj = wx.getStorageSync('sign')
    this.setData({
      form: obj
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    setTimeout(this.takePhoto,2000)
  },
  // 采集图像并将图像转码为base64
  takePhoto(){
    const ctx = wx.createCameraContext('face-camera')
    let self = this;
    ctx.takePhoto({
      quality: 'high',
      success: res => {
        wx.compressImage({
          src: res.tempImagePath, // 图片路径
          quality: 80, // 压缩质量
          success(resp) {
            console.info(res)
            let img = wx.getFileSystemManager().readFileSync(resp.tempFilePath, "base64")
            // self.signUpFace(img)
            self.faceTest(img)
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
            title: '注册中，请稍等',
            mask: true
          })
          let faceToken = res.data.result.face_list[0].face_token
          self.signUpFace(faceToken)
        } else {
          self.takePhoto()
        }
      },
      fail: err => {
        console.info(err, 'fail')
      }
    })
  },
  //注册人脸
  signUpFace: function (img) {
    let self = this
    const token = app.globalData.facetoken
    let url = 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/add?access_token=' + token;
    let data = {
      'image': img,
      'image_type': 'FACE_TOKEN',
      'group_id': this.data.form.group_id,
      'user_id': this.data.form.user_id
    }
    wx.request({
      url: url,
      method: 'POST',
      data: JSON.stringify(data),
      success: res => {
        console.info(res, 'success')
        wx.hideLoading()
        //注册人脸成功
        if (res.data['error_code'] != 0) {
          wx.showModal({
            title: '注册失败',
            content: '请重新注册',
            showCancel: false, //不显示取消按钮
            confirmText: '确定',
            success(res) {
              self.takePhoto()
            }
          })
          return
        }
        this.up2Info();
      },
      fail: err => {
        console.info(err, 'fail')
      }
    })
  },
  //上传至数据库
  up2Info:function(){
    let dbName = this.data.form.character
    let dbData
    if (dbName === 'students') {
      dbData = {
        group_id: this.data.form.group_id,
        name: this.data.form.name,
        user_id: this.data.form.user_id,
        teacher_id: this.data.form.teacher_id,
        character: this.data.form.character,
        limit: false
      }
    }else{
      dbData = {
        // _id: app.globalData.openid, // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
        group_id: this.data.form.group_id,
        name: this.data.form.name,
        user_id: this.data.form.user_id,
        character: this.data.form.character
      }
    }
    db.collection(dbName).add({
      // data 字段表示需新增的 JSON 数据
      data: dbData,
      success(res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log(res)
        //跳转至最初页面
        wx.showToast({
          title: '注册人脸成功',
          icon: 'success',
          success() {
            setTimeout(() => {
              wx.reLaunch({
                url: '../index/index',
              })
            }, 1500)
          }
        })
      },
      fail: console.error
    })
  }
})