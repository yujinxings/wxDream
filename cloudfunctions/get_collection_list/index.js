// 云函数入口文件
const cloud = require('wx-server-sdk')
const MAX_LIMIT=15
cloud.init()
//获取数据库引用
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await db.collection('collectionList').where({
      userInfo: event.userInfo
    }).skip(event.offset*MAX_LIMIT).limit(MAX_LIMIT).get();
  } catch (err) {
    console.log('云函数调用失败 err ==> ', err);
  }
}