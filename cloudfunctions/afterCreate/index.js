// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  let e = event.array;
  for(let i = 0; i<e.length; i++){
    const student = await db.collection(event.eventName).add({
      data: {
        isChecked: false,
        name: e[i].name,
        specialty: e[i].specialty,
        user_id: e[i].user_id
      }
    })
  }

  let date = new Date(event.date)
  const crtEvent = await db.collection('events').add({
    data: {
      name: event.name,
      teacher: event.teacher,
      teacher_id: event.teacher_id,
      limit: event.limit,
      range: event.range,
      date: date
    }
  })

  return true;
}