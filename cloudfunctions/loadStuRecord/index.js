// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command;
const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async (event, context) => {
  let startDate = new Date(event.date);
  let endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
  const wxContext = cloud.getWXContext()
  // 先取出集合记录总数
  const countResult = await db.collection('verifyrecord').where({
    user_id: event.user_id,
    date: _.gte(startDate).and(_.lt(endDate))
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
    const record = await db.collection('verifyrecord').where({
      user_id: event.user_id,
      date: _.gte(startDate).and(_.lt(endDate))
    }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()

    record.data.forEach(e => {
      tasks.push(e)
    })
  }
  return tasks;
}