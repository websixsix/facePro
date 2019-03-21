// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command;
const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  // 先取出集合记录总数
  const countResult = await db.collection('students').where({
    college: event.college,
    specialty: event.specialty
  }).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []

  for (let i = 0; i < batchTimes; i++) {
    const students = db.collection('students').where({
      college: event.college,
      specialty: event.specialty
    }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(students)
  }
  return await Promise.all(tasks)
}