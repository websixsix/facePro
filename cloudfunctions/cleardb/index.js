// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const clearStu = await db.collection('students').where({
    _openid: event.openid
  }).remove();
  const clearTea = await db.collection('teachers').where({
    _openid: event.openid
  }).remove();
  const clearRec = await db.collection('verifyrecord').where({
    _openid: event.openid
  }).remove();
  return {
    event,
    clearStu,
    clearTea,
    clearRec
  }
}