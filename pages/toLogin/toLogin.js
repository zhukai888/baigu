const util = require('../../utils/util.js')
const app = getApp();
Page({

  data: {
    nick_name: "",
    user_font: ""
  },

  /** 登录，获取token */
  login() {
    let that = this;
    wx.login({
      success(res) {
        if (res) {
          wx.request({
            url: 'https://api.zbaigu.com/openid/?code=' + res.code,
            method: "GET",
            success(respone) {
              that.loginRequest(respone.data.data[0].openid)
            },
            fail(err) {
              console.log(err)
            }
          })
        }
        else {
          console.log('登录失败！' + res.errMsg)
        }
      },
      fail(res) {
        console.log("登录出现错误");
      }
    })
  },

  loginRequest(openId) {
    let that = this;
    wx.request({
      url: util.api + '/login/?',
      data: {
        username: openId,
        password: openId
      },
      method: "post",
      success(res) {
        if (res.data.status.code == 1) {
          wx.setStorageSync("utoken", res.data.data.token);
          wx.setStorageSync("nick_name", res.data.data.nick_name);
          wx.setStorageSync("mobile", res.data.data.mobile);
          wx.setStorageSync("user_font", res.data.data.user_font);
          wx.setStorageSync("utype", res.data.data.utype);
          that.updatUseInfo();
        } else {
          that.register(openId);
        }
        console.log(res)
      },
      fail(res) {
        console.log("登录失败!")
      }
    })

  },

  register(openId) {
    let that = this;
    wx.request({
      url: util.api + '/wxreg/?=',
      data: {
        username: openId,
        password: openId
      },
      method: "post",
      success(res) {
        console.log(res);
        if (res.data.status.code == 2001) {
          wx.setStorageSync("utoken", res.data.data.token);
          wx.setStorageSync("nick_name", res.data.data.nick_name);
          wx.setStorageSync("mobile", res.data.data.mobile);
          wx.setStorageSync("user_font", res.data.data.user_font);
          wx.setStorageSync("utype", res.data.data.utype);
          that.updatUseInfo();
        }
      },
      fail(err) {
        console.log("注册失败!" + err)
      }
    })
  },

  /** 更新用户信息 */
  updatUseInfo() {
    let that = this;
    util.WxRequest({
      url: util.api + "/uinfo/",
      data: {
        "nick_name": that.data.nick_name,
        "user_font": that.data.user_font
      },
      method: "POST"
    }).then(res => {
      if (res.data.status.code == 2001) {
        wx.setStorageSync("nick_name", res.data.data.nick_name);
        wx.setStorageSync("user_font", res.data.data.user_font);
        let pages = getCurrentPages();
        let revert = 0;
        for (let i = pages.length - 1; i > 0; i--) {
          if (pages[i].route != "/pages/toLogin/toLogin" || pages[i].route != "/pages/confOrder/confOrder") {
            revert = i;
            break;
          }
        }
        wx.navigateBack({
          delta: revert
        })
      }
    }).catch(err => {
      util.failToast("更新用户信息失败");
      console.log(err)
    });
  },

  /** 点击获取用户信息 */
  bindGetUserInfo: function(res) {
    let that = this;
    if (res.detail.userInfo) {
      that.setData({
        nick_name: res.detail.userInfo.nickName,
        user_font: res.detail.userInfo.avatarUrl
      })
      that.login();
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideLoading()
  },

  onUnload: function() {
    app.globalData.loginFlag = false;
  }

})