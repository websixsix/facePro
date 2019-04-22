// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command;
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  let resultObj = {};
  let arr = event.allEvent;
  const tasks = []
  for (let i = 0; i < arr.length; i++){
    // 先取出集合记录总数
    const countResult = await db.collection(arr[i].name).count()
    if (countResult.total === 0) {
      return false;
    }
    const total = countResult.total
    // 计算需分几次取
    const batchTimes = Math.ceil(total / 100)
    // 承载所有读操作的 promise 的数组

    for (let j = 0; j < batchTimes; j++) {
      const students = await db.collection(arr[i].name).skip(j * MAX_LIMIT).limit(MAX_LIMIT).get()
      students.data.forEach(e => {
        tasks.push(e)
      })
    }
  }
  for(let i = 0; i < tasks.length; i++ ){
    if(!resultObj[tasks[i].name]){
      resultObj[tasks[i].name] = {
        check:0,
        count:0,
        specialty: tasks[i].specialty
      }
    }
    if(!tasks[i].isChecked){
      resultObj[tasks[i].name].check += 1
    }
    resultObj[tasks[i].name].count += 1
  }
  return resultObj
}