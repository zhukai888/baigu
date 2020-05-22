const util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: [],
    confOrderFlag: false,
    loading: true
  },

  /** 确认订单返回 */
  confOrder(e) {
    if (this.data.confOrderFlag) {
      var pages = getCurrentPages(); //当前页面
      var prevPage = pages[pages.length - 2]; //上一页面
      prevPage.setData({
        addressObj: e.currentTarget.dataset.item
      });
      wx.navigateBack({
        delta: 1
      })
    }
  },

  /**添加/编辑地址 */
  addAddress(e) {
    wx.navigateTo({
      url: '/pages/addAddress/addAddress?id=' + e.currentTarget.dataset.id,
    })
  },

  /** 改变默认收货地址 */
  changeDefault(e) {
    let that = this;
    let data = e.currentTarget.dataset.item;
    data.is_default = true;
    util.WxRequest({
      url: util.api + "/address/" + data.id + "/",
      data: data,
      method: "PUT"
    }).then(res => {
      if (res.data.status.code == 1) {
        util.failToast("修改成功");
        that.getAddress();
      }
    }).catch(err => {
      util.failToast("修改失败");
      console.log(err)
    });
  },

  /** 获取地址列表 */
  getAddress() {
    let that =this;
    util.WxRequest({
      url: util.api + "/address/",
      data: {},
      method: "GET"
    }).then(res => {
      if (that.data.loading) {
        that.setData({
          loading: false
        })
      }
      if (res.data.status.code == 1) {
        that.setData({
          addressList: res.data.data
        })
      } else {
        that.setData({
          addressList: []
        })
      }
    }).catch(err => {
      util.failToast("获取地址失败");
      console.log(err)
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.addressId) {
      this.data.confOrderFlag = true;
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
    this.getAddress();
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