const util = require('../../utils/util.js')

Page({
  data: {
    couponList: [],
    couponShadow: false,
    couponObj: {},
    loading:true
  },

  /** 挑选商品 */
  goodsTo() {
    wx.switchTab({
      url: '/pages/goods/goods'
    })
  },

  /**遮罩层打开 */
  changeShadow(e) {
    this.setData({
      couponShadow: true,
      couponObj: this.data.couponList[e.currentTarget.dataset.index]
    })
  },

  /**遮罩层打开 */
  closeShadow() {
    this.setData({
      couponShadow: false,
    })
  },

  /** 获取优惠券 */
  getCopon() {
    let that = this;
    util.WxRequest({
      url: util.api + "/coupons/",
      data: {},
      method: "GET"
    }).then(res => {
      if(res.data.status.code == 1){
        if (that.data.loading) {
          that.setData({
            loading: false
          })
        }
        res.data.data.forEach(e => {
          e.st_time = e.st_time.replace(/-/g, ".");
          e.en_time = e.en_time.replace(/-/g, ".");
        })
        that.setData({
          couponList: res.data.data
        })
      }
    }).catch(err => {
      util.failToast("获取优惠券失败");
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
    this.getCopon();
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