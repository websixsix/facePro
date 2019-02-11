// miniprogram/pages/signupface/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupId:'',
    userId:'',
    name:'',
    studentId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
        let url = 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/add?access_token=' + this.data.token;
        let data = { 
          'image': img, 
          'image_type': 'BASE64', 
          'group_id': this.data.groupId, 
          'user_id': this.data.userId, 
          'user_info': this.data.name+'-'+this.data.studentId
        }
        wx.request({
          url: url,
          method: 'POST',
          data: JSON.stringify(data),
          success: res => {
            console.info(res, 'success')
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
})