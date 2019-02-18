// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const stuUpdate = await db.collection('students').where({
    teacher_id: event.teacher_id,
    group_id: event.group_id
  }).update({
    data: {
      limit: false
    },
    success(res){
      console.info(res)
    }
  });
  const setStu = await db.collection('students').where({
    user_id: event.user_id,
    group_id: event.group_id
  }).update({
    data: {
      limit: true
    },
    success(res) {
      console.info(res)
    }
  })
  return {
    event,
    stuUpdate,
    setStu
  }
}