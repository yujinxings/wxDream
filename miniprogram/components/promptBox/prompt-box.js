// components/promptBox/prompt-box.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    isAccording: false,
    text: '',
    bottom: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //描述 显示时间  位置距离底部  bottom
    setPrompt: function (text, time, bottom = '') {
      this.setData({isAccording:false,bottom:20})
      setTimeout(() => {
        this.setData({
          text: text,
          bottom: bottom,
          isAccording:true
        })
      },200);
      clearTimeout(this.data.timer)
      this.data.timer=setTimeout(() => {
        this.setData({isAccording:false,bottom:0})
      }, time);

    }
  }
})