const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressObj: {
      signer_name: "",
      signer_mobile: "",
      province: "",
      city: "",
      district: "",
      address: "",
      is_default: true
    },
    id: '',
    showLocation: false,
    region: []
  },


  /** 输入框输入 */
  setfileds(e) {
    switch (e.currentTarget.dataset.type) {
      case "name":
        this.data.addressObj.signer_name = e.detail.value;
        break;
      case "address":
        this.data.addressObj.address = e.detail.value;
        break;
    }
  },

  /** 收货人验证 */
  valName() {
    if (this.data.addressObj.signer_name.length == 0) {
      util.failToast("请填写收货人");
      return false;
    } else if (this.data.addressObj.signer_name.length < 2 || this.data.addressObj.signer_name.length > 4) {
      util.failToast("收货人字段必须是2到4位");
      return false;
    }
    return true;
  },

  /** 验证电话号码只能输入数字 */
  mbInput(e) {
    this.data.addressObj.signer_mobile = e.detail.value.replace(/\D/g, '');
    this.setData({
      addressObj: this.data.addressObj
    })
  },

  /** 验证电话号的对错 */
  blurPhoneNum() {
    if (this.data.addressObj.signer_mobile.length == 0) {
      util.failToast("请填写电话号码")
      return false
    } else if (this.data.addressObj.signer_mobile.length != 11 || !(/^1[123456789]\d{9}$|^147\d{8}$|^176\d{8}$/.test(this.data.addressObj.signer_mobile))) {
      util.failToast("电话号码不正确")
      return false
    }
    return true;
  },

  /** 选择位置 */
  bindRegionChange(e) {
    this.data.addressObj.province = e.detail.value[0];
    this.data.addressObj.city = e.detail.value[1];
    this.data.addressObj.district = e.detail.value[2];
    this.setData({
      region: e.detail.value
    })
  },

  /** 提交 */
  submit() {
    if (this.valName() && this.blurPhoneNum()) {
      if (this.data.region.length == 0) {
        util.failToast("请选择地址");
        return;
      } else if (!this.data.addressObj.address) {
        util.failToast("请填写详细地址");
        return;
      } else {
        if (this.data.id) {
          util.WxRequest({
            url: util.api + "/address/" + this.data.id + "/",
            data: this.data.addressObj,
            method: "PUT"
          }).then(res => {
            if (res.data.status.code == 1) {
              util.failToast("修改成功");
              wx.navigateBack({
                delta: 1
              })
            }
          }).catch(err => {
            util.failToast("修改失败");
            console.log(err)
          });
        } else {
          util.WxRequest({
            url: util.api + "/address/",
            data: this.data.addressObj,
            method: "POST"
          }).then(res => {
            if (res.data.status.code == 2001) {
              util.failToast("添加成功");
              wx.navigateBack({
                delta: 1
              })
            }
          }).catch(err => {
            util.failToast("添加失败");
            console.log(err)
          });
        }
      }
    } else {
      return;
    }
  },

  /** 获取地址详情 */
  getAddress() {
    let that = this;
    util.WxRequest({
      url: util.api + "/address/" + that.data.id + "/",
      data: {},
      method: "GET"
    }).then(res => {
      if (res.data.status.code == 1) {
        that.data.region = [res.data.data.province, res.data.data.city, res.data.data.district]
        res.data.data.is_default = true;
        that.setData({
          region: that.data.region,
          addressObj: res.data.data
        })
      }
    }).catch(err => {
      util.failToast("添加失败");
      console.log(err)
    });
  },

  /** 删除地址 */
  deladdress() {
    let that = this;
    util.WxRequest({
      url: util.api + "/address/" + that.data.id + "/",
      data: {},
      method: "DELETE"
    }).then(res => {
      if (res.data.status.code == 2004) {
        util.sucToast("删除成功");
        wx.navigateBack({
          delta: 1
        })
      }
    }).catch(err => {
      util.failToast("添加失败");
      console.log(err)
    });
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.id != "undefined") {
      this.setData({
        id: options.id
      })
      this.getAddress()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})