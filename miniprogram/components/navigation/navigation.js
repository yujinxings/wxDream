Component({
  properties: {
    bgImg: {
      type: String
    },
    pageName:{
      type:String
    },
    title:{
      type:String,
    }
  },
  /**
   * 页面的初始数据
   */
  data: {
    top: ''
  },
  pageLifetimes: {
    show: function () {
      this.setData({
        top: wx.getMenuButtonBoundingClientRect().top
      })
    }
  },
  methods: {
    clickBack: function () {
      wx.navigateBack({
        delta: 1
      })
    },
    jumpsHome: function () {
      wx.switchTab({
        url:"/pages/recommend/recommend"
      })
    }
  }

})