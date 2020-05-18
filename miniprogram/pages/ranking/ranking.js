Page({
  /**
   * 页面的初始数据
   */
  data: {
    rankingList:[], //榜单数据
    songList:[], //每个榜单前面3个歌曲
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    })
    //调用云函数获取榜单数据
    wx.cloud.callFunction({
      name: 'get_ranking_list',
      success: res => {
        wx.hideLoading()
        let data=res.result.data
        this.setData({
          rankingList: data,
          songList:[
            [...data[0].songList],
            [...data[1].songList],
            [...data[2].songList],
            [...data[3].songList]
          ]
        })
      },
      fail: err => {
        wx.hideLoading()
      }
    })
  },
  //点击榜单传递参数并转跳页面
  redirectsList:function(event){
    let data=event.currentTarget.dataset.list
    wx.navigateTo({
      url: `../rankingList/ranking-list?ident=${data.identification}&describe=${data.rankingDescribe}&img=${data.rankingImg}&name=${data.rankingName}`
    })
  },
  //转跳搜索页
  redirectsSearch:function(){
    wx.navigateTo({
      url: `../search/search`
    })
  },
})