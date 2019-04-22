const app = getApp()
// miniprogram/pages/pageone/pageone.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    token:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this
    this.getFaceToken()
    if(app.globalData.openid){
      console.info(app.globalData.openid)
      return
    }
    if (!wx.cloud) {
      wx.showToast({
        title: 'openID获取失败',
        icon: 'none',
        duration: 2000
      })
      return
    }
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.showToast({
          title: 'openID获取成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
    app.globalData.sceen = 'index';
    this.getLocation();
  },
  onShareAppMessage:function(res){
    console.info(res);
    return {
      title:'aab'
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  // 获取人脸识别api的token
  getFaceToken: function () {
    wx.request({
      url: 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=2g1hYrTKeiAXAl9NItSzVYZn&client_secret=AkIR7SP9oK4Cn0fNK3Z2BzGtB6TKjeif',
      success: res => {
        app.globalData.facetoken = res.data.access_token
      },
      fail: err => {
        console.info(err, 'face')
      }
    })
  },
  //清空数据库
  resetDb: function () {
    console.info(app.globalData.openid)
    // 删除的逻辑
    wx.cloud.callFunction({
      name: 'cleardb',
      data: {
        openid: app.globalData.openid
      },
      success: res => {
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          success(res){}
        })
      },
      fail: err => {
        console.info(err)
      }
    })
  },
  // map test:ok
  getLocation: function(){
    wx.getLocation({
      success: function (res) {
        type: 'wgs84',
        console.info(res)
        wx.request({
          url: 'https://apis.map.qq.com/ws/coord/v1/translate?locations='+res.latitude+','+res.longitude+'&type=1&key=QBSBZ-QREK3-JMW3N-3PIV4-Y5QNE-DCB4O',
          success(res1){
            console.info(res1);
            let location = res1.data.locations[0];
            var getAddressUrl = "https://apis.map.qq.com/ws/geocoder/v1/?location=" + location.lat + "," + location.lng + "&key=QBSBZ-QREK3-JMW3N-3PIV4-Y5QNE-DCB4O&get_poi=1";
            wx.request({
              url: getAddressUrl,
              success: function (res2) {
                console.info(res2)
              }
            })
          }
        })
      },
    })
  }
})