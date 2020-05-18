// miniprogram/pages/my/my.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAuth: '', //是否授权
    userInfo: {}, //头像 用户名
    songList: '', //收藏歌曲
    offset: 0, //当前分页查询数据页数
    isLoading: true, //是否显示loading组件
    isMoreData: true, //是否有更多数据可以查询
  },
  //获取授权认证
  getUserAuth: function (res) {
    if (res.detail && res.detail.userInfo) {
      getApp().globalData.isAuth = true;
      this.setData({
        isAuth: true
      })
    }
  },
  //获取收藏歌曲
  getSongList: function () {
    let promise = new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'get_collection_list',
        data: {
          offset: this.data.offset,
        },
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
    return promise
  },
  //上拉加载剩下的歌曲
  getPushSongList: function () {
    if (this.data.isMoreData) {
      getApp().setIsRepeat().then(() => {
        this.setData({
          offset: this.data.offset + 1,
          isLoading: true
        })
        this.getSongList().then(res => {
          this.setData({
            songList: [...this.data.songList, ...res.result.data],
            isMoreData: res.result.data[0] ? true : false,
            isLoading: false
          })
        })
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      isAuth: getApp().globalData.isAuth,
      offset: 0
    })
    if (this.data.isAuth) {
      wx.getUserInfo({
        success: res => {
          this.setData({
            userInfo: {
              url: res.userInfo.avatarUrl,
              nickName: res.userInfo.nickName
            }
          })
        }
      })
    }
    this.getSongList().then(res => {
      this.setData({
        isLoading: false,
        songList: res.result.data
      })
    })
  },
})