// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
//获取数据库引用
const db = cloud.database();
//获取查询指令
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await db.collection('collectionList').where({
      id: _.eq(event.id),
      userInfo: event.userInfo
    }).get();
  } catch (err) {
    console.log('云函数调用失败 err ==> ', err);
  }
}