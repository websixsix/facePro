// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command;
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  let date = new Date(event.date)
  const student = db.collection(event.eventName).where({
    name:event.student
  }).update({
    data:{
      isChecked: true,
      date: date,
      location: event.location
    }
  })
  return student
}