// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command;
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let today = new Date();
  let startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  let endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
  // 先取出集合记录总数
  const countResult = await db.collection('events').where({
    date: _.gt(startDate).and(_.lt(endDate))
  }).count()
  if (countResult.total === 0) {
    return [];
  }
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  today = today.getTime();
  for (let i = 0; i < batchTimes; i++) {
    const events = await db.collection('events').where({
      date: _.gt(startDate).and(_.lt(endDate))
    }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    events.data.forEach(e => {
      if (e.range === event.college || e.range.indexOf(event.specialty) >= 0) {
        let limit = new Date(e.date).getTime() + 60* e.limit * 1000;
        if (today < limit) {
          tasks.push(e)
        }
      }
    })
  }

  return tasks
}