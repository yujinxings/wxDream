Page({
  /**
   * 页面的初始数据
   */
  data: {
    top: '', //搜索框距离顶部的值top
    searchTop: '', //搜索结果距离顶部的top值
    text: '', //搜索的内容
    searchList: [], //搜索提示
    songList: [], //搜索结果
    topSearchList: [], //热搜榜
    offset: 0, //上拉加载索引值
    isLoading: false, //是否显示加载loading
    isload: 'true', //当前是否正在上拉加载
    isSearchList: false, //是否显示搜索推荐结果
    isSongList: false, //是否显示搜索歌曲
    isTopSearchList: true, //是否显示热搜推荐
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取导航胶囊的top以及height值
    let {
      top,
      height
    } = wx.getMenuButtonBoundingClientRect()
    this.setData({
      top: top + height + 20
    })
    //获取热搜榜推荐
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'get_top_search_list',
      success: res => {
        wx.hideLoading()
        this.setData({
          topSearchList: res.result.data
        })
      },
      fail: err => {
        wx.hideLoading()
      }
    })
  },
  //封装网络请求搜索的歌曲
  getSearchList: function (text, offset = 0, limit = 20) {
    let promise = new Promise((resolve, reject) => {
      wx.request({
        url: `https://v1.alapi.cn/api/music/search/?keyword=${text}&offset=${offset}&limit=${limit}`,
        success: function (res) {
          resolve(res.data.data.songs)
        },
        fail: function (err) {
          reject(err)
        }
      })
    })
    return promise
  },
  //获取搜索提示
  setSearchList: function (event) {
    this.setData({
      searchList: [],
      songList: [],
      offset: 0,
      isSongList: false,
      isTopSearchList: false,
      isSearchList: true,
    })
    if(event.detail.value == ''){
      this.setData({
        isSongList: false,
        isTopSearchList: true,
        isSearchList: false,
      })
    }
    clearTimeout(this.data.timer)
    this.data.timer = setTimeout(() => {
      if (!event.detail.value == '') {
        this.getSearchList(event.detail.value, 0, 8).then(res => {
          this.setData({
            searchList: res,
          })
        }).catch(err => {
        })
      }
    }, 500)
  },
  //点击搜索提示获取搜索的歌曲
  setInputText: function (event) {
    this.setData({
      isLoading: true,
      text: event.currentTarget.dataset.text,
      isSongList: true,
      isTopSearchList: false,
      isSearchList: false,
    })
    this.getSearchList(this.data.text, this.data.offset).then(res => {
      this.setData({
        isLoading: false,
        searchList: [],
        songList: this.disposeSongList(res)
      })
    }).catch(err => {
      this.setData({
        isLoading: false
      })
    })
  },
  //上拉加载更多搜索结果
  getPushSongList: function () {
    if (this.data.isload) {
      this.setData({
        isload: false,
        offset: this.data.offset + 1,
        isLoading: true
      })
      this.data.timer = setTimeout(() => {
        this.setData({
          isload: true
        })
      }, 1000)
      this.getSearchList(this.data.text, this.data.offset).then(res => {
        this.setData({
          songList: [...this.data.songList, ...this.disposeSongList(res)],
          isLoading: false
        })
      })
    }
  },
  //封装拼接每个歌曲演唱者
  disposeSongList: function (arr) {
    return arr.map(i => {
      return {
        ...i,
        artists: i.artists.map(i => {
          return i.name
        }).join(' - ')
      }
    })
  },
  //点击热搜榜的内容搜索歌曲
  setInputSong: function (event) {
    this.setData({
      isLoading: true,
      text: event.currentTarget.dataset.text,
      isSongList: true,
      isTopSearchList: false,
      isSearchList: false,
    })
    this.getSearchList(this.data.text, this.data.offset).then(res => {
      this.setData({
        isLoading: false,
        searchList: [],
        songList: this.disposeSongList(res)
      })
    }).catch(err => {
      this.setData({
        isLoading: false
      })
    })
  },
  //清空搜索内容
  setInputEmpty:function(){
      this.setData({
        text:'',
        isSongList:false,
        isTopSearchList:true,
        isSearchList:false,
      })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //获取搜索框的top值以及高度
    wx.createSelectorQuery().select('#search-box').boundingClientRect(rect => {
      this.setData({
        searchTop: rect.top + rect.height + 20
      })
    }).exec()
  },
})