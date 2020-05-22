const util = require('../../utils/util.js')

Page({
  data: {
    oneLink: [{
        pic: "../../images/payRecord.png",
        title: "购买记录",
        link: "/pages/payRecord/payRecord"
      },
      {
        pic: "../../images/bigCoupon.png",
        title: "优惠券",
        link: "/pages/coupon/coupon"
      },
      {
        pic: "../../images/group.png",
        title: "社群会员",
        link: "/pages/release/release"
      }
    ],
    single: {
      pic: "../../images/shop.png",
      title: "店铺管理",
      link: "/pages/workbench/workbench"
    },
    twoLink: [{
        pic: "../../images/h_address.png",
        title: "收货地址",
        link: "/pages/address/address"
      },
      {
        pic: "../../images/friend.png",
        title: "申请合伙人",
        link: "/pages/friend/friend"
      }
    ],
    replayCount: 0, //需要回复的数量
    cdn_url: util.cdn_url,
    user_font: '',
    nick_name: '',
    utoken: '',
    utype: '',
    mobile:''
  },

  /** 跳转 */
  navTo(e) {
    if (e.currentTarget.dataset.link == '/pages/friend/friend' && !wx.getStorageSync("utoken")){
      wx.navigateTo({
        url: "/pages/toLogin/toLogin",
      })
    }else{
      wx.navigateTo({
        url: e.currentTarget.dataset.link,
      })
    }
  },

  /** 获取回复的数量 */
  getReplayCount() {
    if (!this.data.utoken || !this.data.mobile) {
      return;
    }
    util.WxRequest({
      url: util.api + "/chat/?num=1",
      data: {},
      method: "GET"
    }).then(res => {
      if (res.data.status.code == 1) {
        this.setData({
          replayCount: res.data.data[0].nums
        })
      }
    }).catch(err => {
      util.failToast("获取回复数量失败");
      console.log(err)
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
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
    this.setData({
      user_font: wx.getStorageSync("user_font"),
      nick_name: wx.getStorageSync("nick_name"),
      utoken: wx.getStorageSync("utoken"),
      utype: wx.getStorageSync("utype"),
      mobile: wx.getStorageSync("mobile")
    })
    this.getReplayCount();
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