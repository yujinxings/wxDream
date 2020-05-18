// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
 const db=cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await db.collection('rankingList').get();
  } catch (err) {
    console.log('获取榜单数据失败 err ==>' ,err);
  }
}