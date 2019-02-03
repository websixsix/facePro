//index.js
const app = getApp()
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    src:'',
    token:''
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    // 获取token信息
    this.getFaceToken();
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
  // 获取人脸识别api的token
  getFaceToken: function(){
    wx.request({
      url: 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=2g1hYrTKeiAXAl9NItSzVYZn&client_secret=AkIR7SP9oK4Cn0fNK3Z2BzGtB6TKjeif',
      success: res => {
        this.setData({
          token:res.data.access_token
        })
      },
      fail: err => {
        console.info(err,'face')
      }
    })
  },
  //打开摄像头
  takePhoto:function(){
    const ctx = wx.createCameraContext()
    let self = this;
    console.info('click', this.data.token)
    ctx.takePhoto({
      quality:'low',
      success: res =>{
        self.setData({
          src: res.tempImagePath
        })
        const img = wx.getFileSystemManager().readFileSync(res.tempImagePath, "base64");
        this.aliveTest(img)
      },
      fail: err =>{
        console.info(err)
      }
    })
  },
  // 活体检测https://aip.baidubce.com/rest/2.0/face/v3/faceverify
  aliveTest: function(base64){
    let url ='https://aip.baidubce.com/rest/2.0/face/v3/faceverify?access_token=' + this.data.token;
    let data = [{ 'image': base64,'image_type' : 'BASE64'}]
    wx.request({
      url: url,
      method: 'POST',
      data: JSON.stringify(data),
      success: res => {
        console.info(res,'success')
      },
      fail: err => {
        console.info(err,'fail')
      }
    })
  }
})
