// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  if(event.dbData.date){
    event.dbData.date = new Date(event.dbData.date)
  }
  const college = await db.collection(event.dbName).add({
    // data 字段表示需新增的 JSON 数据
    data: event.dbData
  })
  return college
}