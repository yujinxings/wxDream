//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'account-ef15y',
        traceUser: true,
      })
    }

    this.globalData = {
      song: "", //当前播放的音乐
      songList: "", //当前播放的音乐列表
      audio: wx.getBackgroundAudioManager(), //背景音频
      isPaly: false, //是否正在播放
      model: 0, //当前播放模式
      isRepeat: false, //是否快速重复点击
      movePalyX: '1000', //浮窗初始X
      movePalyY: '80', //浮窗初始Y
      movePalyDirection: 'right' //浮窗初始方向
    }
    //用户是否已经授权
    wx.getSetting({
      success: res => {
        this.globalData.isAuth = res.authSetting['scope.userInfo'];
      }
    })
    let {
      audio
    } = this.globalData
    //注册音频播放监听事件
    audio.onPlay(() => {
      this.globalData.isPaly=true
    })
    //注册音频暂停监听事件
    audio.onPause(() => {
      this.globalData.isPaly = false
    })
    //注册音频播放错误监听事件
    audio.onError((res) => {
      this.globalData.isPaly = false
    })
    //注册音频自然播放结束监听事件
    audio.onEnded(() => {
      this.switchMusic('next', this.globalData.model, true)
    })
    //注册系统窗口下一首监听事件
    audio.onNext(() => {
      this.setIsRepeat().then(() => {
        this.switchMusic('next', this.globalData.model)
      })
    })
    //注册系统窗口上一首监听事件
    audio.onPrev(() => {
      this.setIsRepeat().then(() => {
        this.switchMusic('prev', this.globalData.model)
      })
    })
    //注册音频停止监听事件
    audio.onStop(() => {
      this.globalData.isPaly = false
      this.globalData.song = ''
      let pagesLength = getCurrentPages().length - 1
      let currPages = getCurrentPages()[pagesLength].route.split('/')[1]
      if (currPages == 'paly') {
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },
  //函数防抖
  setIsRepeat: function () {
    let promise = new Promise((resolve, reject) => {
      if (!this.globalData.isRepeat) {
        this.globalData.isRepeat = true
        setTimeout(() => {
          this.globalData.isRepeat = false
        }, 1000);
        resolve()
      } else {
        reject('正在加载中...')
      }
    })
    return promise
  },
  //获取歌曲详情封装
  getSong: function (urls) {
    var promise = new Promise((resolve, reject) => {
      wx.request({
        url: `https://api.imjad.cn/cloudmusic/?` + urls,
        success: function (res) {
          resolve(res)
        },
        fail: function (err) {
          reject(err)
        }
      })
    })
    return promise
  },
  //获取歌曲  //歌曲id 歌曲index 歌曲列表 转跳方式true保留/false关闭  是否通过点击歌曲转跳
  palyMusic: function (songId, index, songList, isClick = false) {
    let pagesLength = getCurrentPages().length - 1
    let currPages = getCurrentPages()[pagesLength].route.split('/')[1]
    let currSongId, currSongUrl, currSongLyric, currSongName, currSongAlia, currSongSinger, currSongImg = null
    let {
      audio
    } = this.globalData //获取音乐播放器实例
    if (songId == this.globalData.song.songId) {
      wx.navigateTo({
        url: '../../pages/paly/paly',
      })
      return
    }
    if (currPages == 'paly' || isClick) {
      wx.showLoading({
        title: '加载中',
      })
    }
    this.getSong(`type=song&id=${songId}&br=320000`).then(res => {
      currSongUrl = res.data.data[0].url
      currSongId = songId
      return this.getSong(`type=detail&id=${songId}&br=320000`)
    }).then(res => {
      let {
        songs
      } = res.data
      currSongName = songs[0].name
      currSongSinger = songs[0].ar[0].name
      currSongImg = songs[0].al.picUrl

      if (songs[0].alia) {
        currSongAlia = songs[0].alia[0]
      }
      return this.getSong(`type=lyric&id=${songId}`)
    }).then(res => {
      //歌词解析
      let arrlyr = res.data.lrc.lyric.split('\n')
      arrlyr = arrlyr.map((i, index) => {
        let currenindex = i.indexOf(']')
        let text = i.slice(currenindex + 1)
        text = text == "" ? "~" : text
        text = text == "\n" ? "~" : text
        let min = parseInt(i.slice(1, currenindex).slice(0, 2))
        let s = i.slice(1, currenindex).slice(3, 5) - 0
        let m = i.slice(1, currenindex).slice(6) - 0
        let finishTime = min * 60 + s + "." + m - 0
        finishTime = currenindex == -1 ? "" : finishTime
        return {
          finishTime,
          text,
          index
        }
      })
      currSongLyric = arrlyr.slice(0, arrlyr.length - 1)
      this.globalData.song = {
        songIndex: index,
        songId: currSongId,
        songUrl: currSongUrl,
        songLyric: currSongLyric,
        songName: currSongName,
        songAlia: currSongAlia,
        songSinger: currSongSinger,
        songImg: currSongImg
      }
      this.globalData.songList = songList
      audio.title = currSongName
      audio.epname = currSongAlia
      audio.singer = currSongSinger
      audio.src = currSongUrl
      this.globalData.isPaly = true
      wx.hideLoading()
      //停止页面转跳
      if (currPages != 'paly' && !isClick) {
        return
      }
      if (currPages != 'paly') {
        //保留当前页面进行转跳
        wx.navigateTo({
          url: '../../pages/paly/paly',
        })
      } else {
        //关闭当前页面进行转跳
        wx.redirectTo({
          url: '../../pages/paly/paly'
        })
      }
    }).catch((err) => {
      wx.hideLoading()
    })
  },
  //下一首 operation=next 下一首 prev 上一首    model=0 列表播放  1 随机播放  2 单曲循环  natural=false 不是自然播放结束
  switchMusic: function (operation = "next", model = 0, natural = false) {
    let {
      song,
      songList
    } = this.globalData
    let length = songList.length - 1

    if (model == 1) {
      let index = this.random(0, length, song.songId)
      this.palyMusic(songList[index].id, index, songList)
      return
    }
    if (model == 2 && natural) {
      let {
        audio,
        song
      } = this.globalData
      audio.title = song.songName
      audio.epname = song.songAlia
      audio.singer = song.songSinger
      audio.src = song.songUrl
      return
    }
    songList.find((i, index) => {
      if (i.id == song.songId) {
        if (operation == "next") {
          if (index + 1 > length) {
            this.palyMusic(songList[0].id, 0, songList)
          } else {
            this.palyMusic(songList[index + 1].id, index + 1, songList)
          }
        } else if (operation == "prev") {
          if (index - 1 < 0) {
            this.palyMusic(songList[length].id, length, songList)
          } else {
            this.palyMusic(songList[index - 1].id, index - 1, songList)
          }
        }

      }
    })
  },
  //随机数
  random: function (min, max, num) {
    let randomNum = Math.floor(Math.random() * (max - min) + min);
    if (randomNum == num) {
      this.random(min, max, num)
    } else {
      return randomNum
    }
  }
})