
Page({
  /**
   * 页面的初始数据
   */
  data: {
    height: '',
    isPaly: '', //是否播放
    song: {}, //歌曲详情
    songImg: '', //歌曲图片
    scrollIntoView: '', //滚动位置 歌词高亮居中
    centerScrollView: '', //歌词高亮位置
    scrollBool: true, //是否自动滚动
    model: 0, //当前播放模式
    time: '00:00', //当前歌曲总时长
    currTime: '00:00', //当前歌曲播放时间
    value: '', //滑块数值
    isPress: false,  //是否正在滑动滑块
    iscollection:false, //当前歌曲是否被收藏
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取导航胶囊高度 让在定义组件对齐
    let {
      top,
      height
    } = wx.getMenuButtonBoundingClientRect()
    let audio = getApp().globalData.audio //获取播放器实例
    let song = getApp().globalData.song //获取播放器实例
    this.setData({
      height: top + height,
      lyric: "lyric",
      song: song,
      songImg: song.songImg,
      isPaly: getApp().globalData.isPaly,
      model: getApp().globalData.model,
    })
    //查询是否已收藏该歌曲
    wx.cloud.callFunction({
      name: 'get_collection_song',
      data: {
        id: song.songId
      },
      success: res => {
        if (res.result.data[0]&&res.result.data[0].id==song.songId) {
          this.setData({
            iscollection:true
          })
        }
        wx.hideLoading();
      },
      fail: err => {
        wx.hideLoading();
      }
    })
    //注册音频加载监听事件
    audio.onWaiting(()=>{
      if(!this.data.isPress){
        this.selectComponent('#prompt').setPrompt('正在努力加载中',1500,40)
      }
    })
    //歌词滚动监听
    let LyricLength = this.data.song.songLyric && this.data.song.songLyric.length //歌词长度
    if (LyricLength) {
      audio.onTimeUpdate(() => {
        let time = audio.currentTime
        let song = this.data.song
        let timeThan = Math.floor(time / audio.duration * 100)

        //获取当前音乐总时长
        if(this.data.time!=audio.duration){
          this.setData({
            time: this.formatTime(audio.duration)
          })
        }

        //如果滑动进度条停止自动滑动
        if (!this.data.isPress) {
          this.setData({
            currTime: this.formatTime(time),
            value: timeThan
          })
        }
        //判断歌词高亮以及滚动位置
        if (time > song.songLyric[LyricLength - 1].finishTime) {
          this.setData({
            scrollIntoView:`lyric${LyricLength-2}`,
            centerScrollView: LyricLength - 1
          })
          return
        } else if (time > song.songLyric[LyricLength - 2].finishTime && time < song.songLyric[LyricLength - 1].finishTime) {
          this.setData({
            centerScrollView: LyricLength - 2
          })
          return
        }
        for (let i = 0; i < LyricLength; i++) {
          if (time > song.songLyric[i].finishTime) {
            continue
          }
          if (i != LyricLength - 1 && song.songLyric[i].finishTime < time < song.songLyric[i + 1].finishTime) {
            if (this.data.scrollBool) {
              this.setData({
                scrollIntoView: i > 2 ? `lyric${i-2}` : 'lyric0',
                centerScrollView: i != 0 ? i - 1 : i
              })
            } else {
              this.setData({
                centerScrollView: i != 0 ? i - 1 : i
              })
            }
            return
          }
        }
      })
    }
  },
  //开始或暂停播放
  setPaly: function () {
    let audio = getApp().globalData.audio //获取播放器实例
    getApp().globalData.isPaly = !getApp().globalData.isPaly
    this.setData({
      isPaly: getApp().globalData.isPaly
    })
    if (this.data.isPaly) {
      audio.play()
    } else {
      audio.pause()
    }
  },
  //设置正在滑动滑块
  setIsPress: function () {
    this.setData({
      isPress: true
    })
  },
  //手指按下停止歌词自动滚动
  touchLyric: function () {
    this.setData({
      scrollIntoView: "",
      scrollBool: false
    })
  },
  //手指松开延迟 滚动到当前歌词高亮位置
  stopTouchLyric: function () {
    clearTimeout(this.data.timer)
    this.data.timer = setTimeout(() => {
      this.setData({
        scrollBool: true
      })
    }, 1000)
  },
  //切换播放模式
  setModel() {
    if (this.data.model == 2) {
      this.setData({
        model: 0
      })
      this.selectComponent('#prompt').setPrompt('列表循环',1500,40)
      getApp().globalData.model = 0
    } else {
      this.setData({
        model: this.data.model + 1
      })
      if(this.data.model==1){
        this.selectComponent('#prompt').setPrompt('随机循环',1500,40)
      }else{
        this.selectComponent('#prompt').setPrompt('单曲循环',1500,40)
      }
      getApp().globalData.model = this.data.model
    }
  },
  //播放下一首
  nextPaly() {
    getApp().setIsRepeat().then(() => {
      this.selectComponent('#prompt').setPrompt('正在加载下一首音乐',1500,40)
      getApp().switchMusic('next', this.data.model)
    })
  },
  //播放上一首
  prevPaly() {
    getApp().setIsRepeat().then(() => {
      this.selectComponent('#prompt').setPrompt('正在加载上一首音乐',1500,40)
      getApp().switchMusic('prev', this.data.model)
    })
  },
  //滑动滑块放开时改变歌曲进度
  sliderChange(event) {
    let value = event.detail.value
    let audio = getApp().globalData.audio
    let currTime = Math.floor(audio.duration * (value / 100))
    audio.seek(currTime)
    audio.play()
    this.setData({
      isPaly: true,
      scrollBool: true
    })
    setTimeout(() => {
      this.setData({
        isPress: false
      })
    }, 300);
    getApp().globalData.isPaly = true
  },
  //滑动滑块时改变时间
  sliderChangeing(event) {
    let value = event.detail.value
    let audio = getApp().globalData.audio
    let currTime = Math.floor(audio.duration * (value / 100))
    currTime = this.formatTime(currTime)
    this.setData({
      currTime: currTime
    })
  },
  //格式化播放时间
  formatTime(time) {
    time = Math.floor(time)
    let m = parseInt(time / 60)
    m = m < 10 ? '0' + m : m
    let s = time % 60
    s = s < 10 ? '0' + s : s
    return m + ':' + s
  },
  //收藏歌曲
  addCollection(){
    if (!getApp().globalData.isAuth) {
      wx.switchTab({
        url:'../my/my'
      })
      return
    }
    let {songId,songName,songAlia,songSinger}=this.data.song
    let data={
      id:songId,
      name:songName,
      alia:songAlia,
      singer:songSinger,
    }
    getApp().setIsRepeat().then(() => {
      if(!this.data.iscollection){
        wx.cloud.callFunction({
          name: 'add_collection',
          data,
          success: res => {
            this.setData({iscollection:true})
            this.selectComponent('#prompt').setPrompt('收藏成功',1500,40)
          },
          fail: err => {
          }
        })
      }else{
        wx.cloud.callFunction({
          name: 'remove_collection',
          data:{
            id:songId
          },
          success: res => {
            this.setData({iscollection:false})
            this.selectComponent('#prompt').setPrompt('取消成功',1500,40)
          },
          fail: err => {
          }
        })
      }
    })
    
    
  },
})