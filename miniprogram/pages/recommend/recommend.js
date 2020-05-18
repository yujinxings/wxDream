Page({
  /**
   * 页面的初始数据
   */
  data: {
    recommendList: [], //每日推荐歌曲列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //调用云函数获取每日推荐数据
    this.getRecommendList()
  },
  //获取每日推荐数据
  getRecommendList: function () {
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'get_recommend_list',
      success: res => {
        wx.hideLoading()
        this.setData({
          recommendList: res.result.data
        })
      },
      fail: err => {
        wx.hideLoading()
      }
    })
  },
})