const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mobile: "",
    code: "",
    type: "",
    user_font: wx.getStorageSync("user_font"),
    cdn_url: util.cdn_url,
    nick_name: wx.getStorageSync("nick_name"),
    codeFlag: false
  },

  /** 只能输入数字 */
  mbInput(e) {
    this.data.mobile = e.detail.value.replace(/\D/g, '');
    this.setData({
      mobile: this.data.mobile
    })
  },

  /** 验证手机号 **/
  blurPhoneNum() {
    if (this.data.mobile.length == 0) {
      util.sucToast("请填写手机号")
      return false
    } else if (this.data.mobile.length != 11 || !(/^1[7358]\d{9}$|^147\d{8}$|^176\d{8}$/.test(this.data.mobile))) {
      util.sucToast("请输入正确的手机号")
      return false
    }
    return true;
  },

  /** 发送验证码 */
  sendVail(e) {
    let that = this;
    if (!that.blurPhoneNum()) {
      return;
    } else if (that.data.codeFlag) {
      return;
    }
    util.WxRequest({
      url: util.api + "/code/",
      data: {
        mobile: that.data.mobile
      },
      method: "POST"
    }).then(res => {
      if (res.data.status.code == 2001) {
        util.sucToast("发送成功")
        that.setData({
          codeFlag:true
        })
      } else {
        util.sucToast("发送失败")
      }
    }).catch(err => {
      console.log(err)
    });
  },

  /** 绑定code */
  blurCode(e) {
    this.data.code = e.detail.value.replace(/\D/g, '');
    this.setData({
      code: this.data.code
    })
  },

  /** 提交 */
  submit() {
    let that = this;
    if (!that.blurPhoneNum()) {
      return;
    } else if (!that.data.codeFlag) {
      util.sucToast("请获取验证码")
      return;
    } else if (!that.data.code) {
      util.sucToast("请输入验证码")
      return;
    } else if (that.data.code.length != 4) {
      util.sucToast("验证码须输入四位数字")
      return;
    }
    util.WxRequest({
      url: util.api + "/mobile/",
      data: {
        code: that.data.code,
        mobile: that.data.mobile
      },
      method: "POST"
    }).then(res => {
      if (res.data.status.code == 2001) {
        if (that.data.type == 2) {
          wx.redirectTo({
            url: "/pages/release/release"
          })
        } else {
          wx.switchTab({
            url: '/pages/village/village'
          })
        }
      } else if (res.data.status.code = 1001) {
        util.failToast(res.data.status.msg.code);
      }
    }).catch(err => {
      console.log(err)
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.type) {
      this.data.type = options.type;
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})