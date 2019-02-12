// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = wx.cloud.database()
  let groupId = event.groupId;
  db.collection('aab').add({
    // data 字段表示需新增的 JSON 数据
    data: {
      _id: event.userId, // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
      group_id: event.groupId,
      name: event.name,
      student_id: event.studentId
    },
    success(res) {
      // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
      console.log(res)
    },
    fail:console.error
  })
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}