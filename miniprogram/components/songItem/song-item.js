Component({
  properties: {
    songId: {
      type: String,
    },
    songName: {
      type: String,
    },
    songAlia: {
      type: String
    },
    songSinger: {
      type: String
    },
    index: {
      type: Number
    },
    songList: {
      type: Array
    },
  },
  data: {
  },
  methods: {
    palyMusic: function () {
      getApp().setIsRepeat().then(() => {
        getApp().palyMusic(this.properties.songId, this.properties.index, this.properties.songList, true)
      })
    }
  },
  
})