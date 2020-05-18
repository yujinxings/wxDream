// miniprogram/components/movePaly/move-paly.js
Component({
  /**
   * 页面的初始数据
   */
  properties: {

  },
  data: {
    isPress: false, //是否按下悬浮音频
    pageWidth: wx.getSystemInfoSync().windowWidth, //当前屏幕宽度
    isDirection: 'right', //当前悬浮音频靠哪一边
    isPaly: false, //是否启动悬浮音频动画
    isDirection: '', //悬浮音频靠边位置
    x: '', //悬浮窗口x轴位置
    y: '', //悬浮窗口y轴位置
    song: '', //当前播放的歌曲
    isCurrSong: false,
  },
  pageLifetimes: {
    show: function () {
      let app = getApp().globalData
      this.setData({
        isDirection: app.movePalyDirection,
        x: app.movePalyX,
        y: app.movePalyY,
        song: app.song,
        isPaly: app.isPaly,
        isCurrSong: false
      })
    },
  },
  methods: {
    //设置页面不能滚动
    stopScroll: function () {
      return false
    },
    //显示当前播放的歌曲
    showCurrSong: function () {
      this.setData({
        isCurrSong: true,
        song:getApp().globalData.song
      })
    },
    //隐藏当前播放的歌曲
    hideCurrSong: function () {
      this.setData({
        isCurrSong: false
      })
    },
    //点击歌曲名转跳详情页
    redirectsPaly: function () {
      wx.navigateTo({
        url: '../../pages/paly/paly',
      })
    },
    // 暂停或播放歌曲
    setPaly: function () {
      let isPaly = this.data.isPaly
      let audio = getApp().globalData.audio
      this.setData({
        isPaly: !isPaly
      })
      getApp().globalData.isPaly = !isPaly
      if (isPaly) {
        audio.pause()
      } else {
        audio.play()
      }
    },
    //手指按下
    areaStart: function () {
      this.setData({
        isPress: true
      })
    },
    //鼠标松开悬浮音频 设置靠边位置
    areaEnd: function (event) {
      if (this.data.isPress) {
        let app = getApp().globalData
        if (event.changedTouches[0].clientX >= this.data.pageWidth / 2) {
          app.movePalyX = this.data.pageWidth
          app.movePalyY = event.changedTouches[0].clientY
          app.movePalyDirection = 'right'
          this.setData({
            x: this.data.pageWidth,
            y: event.changedTouches[0].clientY - 20,
            isDirection: 'right'
          })
        } else {
          app.movePalyX = 0
          app.movePalyY = event.changedTouches[0].clientY
          app.movePalyDirection = 'left'
          this.setData({
            x: 0,
            y: event.changedTouches[0].clientY,
            isDirection: 'left'
          })
        }
      }
      this.data.timer = setTimeout(() => {
        this.setData({
          isPress: false,
        })
      }, 100)
    },
  }
})