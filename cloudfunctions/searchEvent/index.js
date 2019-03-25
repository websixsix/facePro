// 云函数入口文件 考勤事件中 搜索某一天的考勤事件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  // 先取出集合记录总数
  const countResult = await db.collection('event').where({
    teacher: event.teacher,
    teacher_id: event.teacher_id,
    date:_.gt(event.start)&&_.lt(event.end)
  }).count()
  if (countResult.total === 0) {
    return false;
  }
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []

  for (let i = 0; i < batchTimes; i++) {
    const students = await db.collection('students').where({
      college: event.college,
      specialty: event.specialty
    }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(students)
  }
  return tasks[0].data;
}