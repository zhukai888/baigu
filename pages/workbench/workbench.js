const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pay_pay: 0,
    pay_send: 0,
    pay_back: 0,
    tod_amount: 0,
    tod_order: 0,
    new_user: 0,
    all_user: 0,
    yes_amount: 0,
    yes_order: 0,
    chatnum: 0
  },
  /** 获取数量 */
  getCount() {
    let that = this;
    util.WxRequest({
      url: util.api + "/xadmin/index/",
      data: {},
      method: "GET"
    }).then(res => {
      if (res.data.status.code == 1) {
        that.setData({
          pay_pay: res.data.data[0].pay_pay,
          pay_send: res.data.data[0].pay_send,
          pay_back: res.data.data[0].pay_back,
          tod_amount: res.data.data[0].tod_amount,
          tod_order: res.data.data[0].tod_order,
          new_user: res.data.data[0].new_user,
          all_user: res.data.data[0].all_user,
          yes_amount: res.data.data[0].yes_amount,
          yes_order: res.data.data[0].yes_amount,
          chatnum: res.data.data[0].chatnum
        })
      }
    }).catch(err => {
      util.failToast("获取数目失败");
      console.log(err)
    });
  },

  /** 跳转 */
  navTo(e) {
    let url = '';
    switch (e.currentTarget.dataset.index) {
      case "1":
        url = "/pages/b_goods/b_goods"
        break;
      case "2":
        url = "/pages/finance/finance"
        break;
      case "3":
        url = "/pages/invitation/invitation"
        break;
    }
    wx.navigateTo({
      url: url
    })
  },

  /** 店铺数据跳转 */
  navtrun(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url
    })
  },

  // 跳转订单
  goOrderState(e) {
    wx.navigateTo({
      url: '/pages/backOrder/backOrder?navIndex=' + e.currentTarget.dataset.index,
    })
  },

  /** 跳转设置 */
  navToSet() {
    wx.navigateTo({
      url: '/pages/setting/setting'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getCount();
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