const util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: "",
    mobile: "",
    suggest: "",
    city: "",
    region: []
  },

  /** 输入框输入 */
  setfileds(e) {
    switch (e.currentTarget.dataset.type) {
      case "name":
        this.data.name = e.detail.value;
        break;
      case "suggest":
        this.data.suggest = e.detail.value;
        break;
    }
  },

  /** 姓名验证 */
  valName() {
    if (this.data.name.length == 0) {
      util.failToast("请填写名称");
      return false;
    } else if (this.data.name.length < 2 || this.data.name.length > 4) {
      util.failToast("名称必须是2到4位");
      return false;
    }
    return true;
  },

  /** 验证电话号码只能输入数字 */
  mbInput(e) {
    this.data.mobile = e.detail.value.replace(/\D/g, '');
    this.setData({
      mobile: this.data.mobile
    })
  },

  /** 验证电话号的对错 */
  blurPhoneNum() {
    if (this.data.mobile.length == 0) {
      util.failToast("请填写电话号码")
      return false
    } else if (this.data.mobile.length != 11 || !(/^1[123456789]\d{9}$|^147\d{8}$|^176\d{8}$/.test(this.data.mobile))) {
      util.failToast("电话号码不正确")
      return false
    }
    return true;
  },

  /** 选择位置 */
  bindRegionChange(e) {
    this.data.city = e.detail.value[0] == e.detail.value[1] ? e.detail.value[1] + e.detail.value[2] : e.detail.value[0] + e.detail.value[1] + e.detail.value[2];
    this.setData({
      region: e.detail.value
    })
  },

  /** 提交 */
  submit() {
    let that = this;
    if (that.valName() && that.blurPhoneNum()) {
      if (that.data.region.length == 0) {
        util.failToast("请选择城市");
        return;
      } else if (!that.data.suggest) {
        util.failToast("请填写个人介绍");
        return;
      } else {
        util.WxRequest({
          url: util.api + "/partner/",
          data: {
            name: that.data.name,
            phone: that.data.mobile,
            address: that.data.city,
            desc: that.data.suggest
          },
          method: "POST"
        }).then(res => {
          if (res.data.status.code == 2001) {
            util.sucToast("申请成功");
            setTimeout(function() {
              wx.navigateBack({
                delta: 1
              })
            }, 1500);
          }
        }).catch(err => {
          util.failToast("申请失败");
          console.log(err)
        });
      }
    } else {
      return;
    }
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