// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const eventCount = await db.collection('events').where({
    name: event.name
  }).count()
  if(eventCount.total === 1){
    return false
  }
  else if(eventCount.total === 0){
    return await db.createCollection(event.name)
  }
}