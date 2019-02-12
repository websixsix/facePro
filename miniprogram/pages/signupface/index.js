// miniprogram/pages/signupface/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupId:'',
    userId:'',
    name:'',
    studentId:'',
    token:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getFaceToken()
    let obj = wx.getStorageSync('sign')
    this.setData({
      name: obj.name,
      groupId:obj.groupId,
      userId: obj.openId,
      studentId: obj.studentId
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},
  //注册人脸
  signUpFace: function () {
    const ctx = wx.createCameraContext()
    let self = this;
    ctx.takePhoto({
      quality: 'low',
      success: res => {
        self.setData({
          src: res.tempImagePath
        })
        const img = wx.getFileSystemManager().readFileSync(res.tempImagePath, "base64");
        console.info('token=',this.data.token)
        let url = 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/add?access_token=' + this.data.token;
        let data = { 
          'image': img, 
          'image_type': 'BASE64', 
          'group_id': this.data.groupId, 
          'user_id': this.data.studentId
        }
        wx.request({
          url: url,
          method: 'POST',
          data: JSON.stringify(data),
          success: res => {
            console.info(res, 'success')
            //注册人脸成功
            if(res.data['error_code']!=0){
              console.info('api error')
              return
            }
            wx.showToast({
              title: '注册人脸成功',
              icon: 'success',
              duration: 1000
            })
            this.up2Info();
          },
          fail: err => {
            console.info(err, 'fail')
          }
        })
      },
      fail: err => {
        console.info(err)
      }
    })
  },
  //上传至数据库
  up2Info:function(){
    const db = wx.cloud.database()
    db.collection('facetest').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        _id: this.data.userId, // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
        group_id: this.data.groupId,
        name: this.data.name,
        student_id: this.data.studentId
      },
      success(res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log(res)
      },
      fail: console.error
    })
  },
  // 获取人脸识别api的token
  getFaceToken: function () {
    wx.request({
      url: 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=2g1hYrTKeiAXAl9NItSzVYZn&client_secret=AkIR7SP9oK4Cn0fNK3Z2BzGtB6TKjeif',
      success: res => {
        this.setData({
          token: res.data.access_token
        })
      },
      fail: err => {
        console.info(err, 'face')
      }
    })
  },
})