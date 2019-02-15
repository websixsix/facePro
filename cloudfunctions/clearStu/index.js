// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const clearStu = await db.collection('students').where({
    user_id: event.user_id
  }).remove();
  return {
    event,
    clearStu
  }
}