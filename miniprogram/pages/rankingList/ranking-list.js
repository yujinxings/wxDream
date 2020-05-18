Page({
  /**
   * 页面的初始数据
   */
  data: {
    top: '',
    ranking: {}, //榜单信息
    songList: [], //榜单歌曲列表
    offset: 0, //榜单分页查询当前页数
    isMoreData:true, //是否还有数据
    isLoading:true, //是否显示加载组件
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取路由传递过来的参数
    let {
      ident,
      describe,
      img,
      name
    } = options;
    //获取导航胶囊高度 让在定义组件对齐
    let {
      top
    } = wx.getMenuButtonBoundingClientRect()
    this.setData({
      ranking: {
        ident,
        describe,
        img,
        name
      },
      top
    })
    //调用云函数获取当前榜单歌曲
    this.getSongList().then(res=>{
      this.setData({
        songList: res.result.data,
        isLoading:false,
      })
    })
  },
  //获取榜单歌曲
  getSongList: function () {
    let promise = new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'get_ranking_announ_list',
        data: {
          offset: this.data.offset,
          ident: this.data.ranking.ident
        },
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject()
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
})